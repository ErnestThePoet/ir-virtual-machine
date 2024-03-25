import { i32, i32Add, i32Sub, i32Mul, i32Div } from "./alu";
import { load32, store32, MmuLoadStatus, MmuStoreStatus } from "./mmu";
import {
    BinaryMathOp,
    BinaryRelOp,
    CondValue,
    Decoder,
    LValueType,
    RValueType,
    SingularType
} from "./decoder";
import type {
    Singular,
    LValue,
    RValue,
    DecodedFunction,
    DecodedAssign,
    DecodedDec,
    DecodedGlobalDec,
    DecodedLabel,
    DecodedGoto,
    DecodedIf,
    DecodedArg,
    DecodedCall,
    DecodedAssignCall,
    DecodedParam,
    DecodedReturn,
    DecodedRead,
    DecodedWrite,
    DecodedExecutableInstruction
} from "./decoder";

import { InstructionType, ExecutableInstructionType } from "./decoder";

import type { FormattableMessage } from "@/locales";
import _ from "lodash";

// VM Table element types
interface VmLabel {
    // Equals actual address-1 because EIP increases after the address is set
    // Contract: truncated
    addressBefore: number;
}

interface VmFunction {
    // Equals actual address-1 because EIP increases after the address is set
    // Contract: truncated
    addressBefore: number;
}

interface VmVariable {
    // Contract: truncated
    address: number;
    // Contract: truncated
    size: number;
}

type VmText = DecodedExecutableInstruction & {
    lineNumber: number; // instruction line nubmer in original input instructions
    instructionLength: number; // instruction string length in original input instructions
};

// VM Component types
interface VmMemory {
    instructions: string[];
    text: VmText[];
    memory: Uint8Array;
}

// Contract: All truncated
interface VmRegisters {
    eax: number;
    ebx: number;
    ecx: number;
    edx: number;
    ebp: number;
    esp: number;
    eip: number;
}

interface VmVariableTable {
    [id: string]: VmVariable;
}

// VmVariableDetail, VmLocalVariableDetail and VmMemoryUsage are for external display.
export interface VmVariableDetail {
    id: string;
    address: number;
    size: number;
    values: number[];
}

export interface VmLocalVariableDetail {
    functionName: string;
    stackDepth: number;
    details: VmVariableDetail[];
}

export interface VmMemoryUsage {
    total: number;
    used: number;

    stackTotal: number;
    stackUsed: number;

    globalVariableTotal: number;
    globalVariableUsed: number;
}

export interface VmPeakMemoryUsage {
    total: number;
    stack: number;
    globalVariable: number;
}

interface VmTables {
    labelTable: { [id: string]: VmLabel };
    functionTable: { [id: string]: VmFunction };
    globalVariableTable: VmVariableTable;
    variableTableStack: VmVariableTable[];
    assignCallLValueStack: (LValue | null)[];
}

export enum VmExecutionState {
    INITIAL,
    BUSY,
    WAIT_INPUT,
    FREE,
    STATIC_CHECK_FAILED,
    RUNTIME_ERROR,
    MAX_STEP_REACHED,
    EXITED_NORMALLY,
    EXITED_ABNORMALLY
}

export interface VmErrorItem {
    startLineNumber: number;
    endLineNumber: number;
    startColumn: number;
    endColumn: number;
    message: FormattableMessage;
}

interface VmExecutionStatus {
    stepCount: number;
    state: VmExecutionState;
    callStack: string[];
    // Used to index which line contains static/runtime error and should be marked
    staticErrors: VmErrorItem[];
    runtimeErrors: VmErrorItem[];
}

const initialMemory: VmMemory = {
    instructions: [],
    text: [],
    memory: new Uint8Array()
};

const initialPeakMemoryUsage: VmPeakMemoryUsage = {
    total: 0,
    stack: 0,
    globalVariable: 0
};

const initialTables: VmTables = {
    labelTable: {},
    functionTable: {},
    globalVariableTable: {},
    variableTableStack: [],
    assignCallLValueStack: []
};

const initialExecutionStatus: VmExecutionStatus = {
    stepCount: 0,
    state: VmExecutionState.INITIAL,
    callStack: [],
    staticErrors: [],
    runtimeErrors: []
};

// Console message type
export enum ConsoleMessageType {
    SUCCESS,
    ERROR,
    WARNING,
    INPUT,
    OUTPUT,
    PROMPT,
    ARROW
}

export type ConsoleMessagePart = FormattableMessage & {
    type: ConsoleMessageType;
};

type ReadConsoleFn = (prompt: FormattableMessage[]) => Promise<string>;

// VM Options type
export interface VmOptions {
    maxExecutionStepCount: number;
    memorySize: number;
    stackSize: number;
}

export type VmOptionsPartial = Partial<VmOptions>;

type VmNumberOptionKeys = {
    [K in keyof VmOptions]: VmOptions[K] extends number ? K : never;
}[keyof VmOptions];

export const vmOptionLimits: {
    [K in VmNumberOptionKeys]: { min: number; max: number };
} = {
    maxExecutionStepCount: {
        min: 0,
        max: 999_999_999
    },
    memorySize: {
        min: 1024,
        max: 16 * 1024 * 1024
    },
    stackSize: {
        min: 512,
        max: 16 * 1024 * 1024 - 1024
    }
};

const defaultOptions: VmOptions = {
    maxExecutionStepCount: 1_000_000,
    memorySize: 16 * 1024,
    stackSize: 8 * 1024
};

/**
 * An IR Virtual Machine instance.
 *
 * Registers:
 * eax - return value
 * ebx - indicates current function param address
 * ecx - counts total function arg size
 * edx - indicates (top address + 1) of global variable segment
 * ebp
 * esp
 * eip
 *
 * Note that all fields remarked with 'Contract: truncated' are
 * guaranteed to have been truncated with `i32()`, so there's
 * no need to truncate them again when reading their values.
 * However, when using them to calculate new values, another
 * truncation on the result is required.
 *
 * Memory layout(memory.memory) of a running IR VM:
 * ----------------------------------
 * |                                | <- options.memorySize-1
 * |             Stack              |
 * |                                |
 * |           Grows down           |
 * |         v     v     v          | <- esp
 * |--------------------------------|
 * |
 * |
 * |
 * |                                  <- edx
 * |--------------------------------|
 * |                                |
 * |    Global variable segment     |
 * |                                | <- 0
 * |--------------------------------|
 *
 * IrVm uses cdecl calling convention.
 * The stack layout when calling a new function is like below.
 * |--------------------------------|
 * |             Arg n              | <- ebx at last PARAM in current function
 * |--------------------------------|
 * |              ...               |
 * |--------------------------------|
 * |             Arg 0              | <- ebx at first PARAM in current function
 * |--------------------------------|
 * |          Saved ecx             |
 * |--------------------------------|
 * |         Return address         | <- This and above are caller saved
 * |--------------------------------|
 * |          Saved ebp             | <- This and below are callee saved <- new ebp
 * |--------------------------------|
 * |                                |
 * |          Local vars            |
 * |                                |
 * |              ...               |
 */
export class Vm {
    // Initial esp varies with Vm's memory size. So
    // each VM has its own initialRegisters.
    private initialRegisters: VmRegisters = {
        eax: 0,
        ebx: 0,
        ecx: 0,
        edx: 0,
        ebp: 0,
        esp: defaultOptions.memorySize,
        eip: 0
    };

    private decoder: Decoder = new Decoder();

    private memory: VmMemory = _.cloneDeep(initialMemory);
    private registers: VmRegisters = _.cloneDeep(this.initialRegisters);
    private tables: VmTables = _.cloneDeep(initialTables);
    private executionStatus: VmExecutionStatus = _.cloneDeep(
        initialExecutionStatus
    );

    private peakMemoryUsage: VmPeakMemoryUsage = _.cloneDeep(
        initialPeakMemoryUsage
    );

    // VM Options does not belong to its state
    private options: VmOptions = _.cloneDeep(defaultOptions);

    private executionStartTime: Date = new Date();

    private writeBuffer: Array<ConsoleMessagePart[]> = [];
    private readConsole: ReadConsoleFn = _ => Promise.resolve("");

    private entryFunctionName = "main";

    setReadConsoleFn(readConsole: ReadConsoleFn) {
        this.readConsole = readConsole;
    }

    private getSingleVariableValues(variable: VmVariable): number[] {
        const values: number[] = [];

        for (
            let i = variable.address;
            i < i32Add(variable.address, variable.size);
            i = i32Add(i, 4)
        ) {
            // Bypass VM's encapsulated loadMemory32 because we do not want to
            // record runtime error here
            const loadResult = load32(i, this.memory.memory);
            if (loadResult.status === MmuLoadStatus.OUT_OF_BOUND) {
                values.push(NaN);
            } else {
                values.push(loadResult.value!);
            }
        }

        return values;
    }

    private getSingleTableVariableDetails(
        table: VmVariableTable
    ): VmVariableDetail[] {
        const details: VmVariableDetail[] = [];
        for (const id in table) {
            details.push({
                id,
                address: table[id].address,
                size: table[id].size,
                values: this.getSingleVariableValues(table[id])
            });
        }

        return details;
    }

    get canContinueExecution(): boolean {
        return (
            this.executionStatus.state === VmExecutionState.INITIAL ||
            this.executionStatus.state === VmExecutionState.FREE ||
            this.executionStatus.state === VmExecutionState.EXITED_NORMALLY ||
            this.executionStatus.state === VmExecutionState.EXITED_ABNORMALLY
        );
    }

    get currentLineNumber(): number {
        if (
            this.registers.eip < 0 ||
            this.registers.eip >= this.memory.text.length
        ) {
            return -1;
        }
        return this.memory.text[this.registers.eip].lineNumber;
    }

    get instructions(): string[] {
        return this.memory.instructions;
    }

    get globalVariableDetails(): VmVariableDetail[] {
        return this.getSingleTableVariableDetails(
            this.tables.globalVariableTable
        );
    }

    get localVariableDetailsStack(): VmLocalVariableDetail[] {
        const detailsStack: VmLocalVariableDetail[] = [];
        for (let i = 0; i < this.tables.variableTableStack.length; i++) {
            detailsStack.push({
                functionName: this.executionStatus.callStack[i],
                stackDepth: i,
                details: this.getSingleTableVariableDetails(
                    this.tables.variableTableStack[i]
                )
            });
        }
        return detailsStack;
    }

    get state(): VmExecutionState {
        return this.executionStatus.state;
    }

    get staticErrors(): VmErrorItem[] {
        return _.cloneDeep(this.executionStatus.staticErrors);
    }

    get runtimeErrors(): VmErrorItem[] {
        return _.cloneDeep(this.executionStatus.runtimeErrors);
    }

    get currentOptions(): VmOptions {
        return _.cloneDeep(this.options);
    }

    get stepCount(): number {
        return this.executionStatus.stepCount;
    }

    get memoryUsage(): VmMemoryUsage {
        return {
            total: this.options.memorySize,
            used:
                this.registers.edx +
                this.options.memorySize -
                this.registers.esp,

            stackTotal: this.options.stackSize,
            stackUsed: this.options.memorySize - this.registers.esp,

            globalVariableTotal:
                this.options.memorySize - this.options.stackSize,
            globalVariableUsed: this.registers.edx
        };
    }

    get currentPeakMemoryUsage(): VmPeakMemoryUsage {
        return this.peakMemoryUsage;
    }

    get returnValue(): number {
        return this.registers.eax;
    }

    updatePeakMemoryUsage() {
        const memoryUsage = this.memoryUsage;
        this.peakMemoryUsage = {
            total: Math.max(this.peakMemoryUsage.total, memoryUsage.used),
            stack: Math.max(this.peakMemoryUsage.stack, memoryUsage.stackUsed),
            globalVariable: Math.max(
                this.peakMemoryUsage.globalVariable,
                memoryUsage.globalVariableUsed
            )
        };
    }

    /**
     * Flush current write buffer content.
     * User is asked to provide an action on current write buffer because
     * we want to avoid a copy of the buffer which can be expensive.
     * @param action Action that accepts the current write buffer content.
     * @public
     */
    flushWriteBuffer(action?: (_: Array<ConsoleMessagePart[]>) => void) {
        if (action !== undefined) {
            action(this.writeBuffer);
        }
        this.writeBuffer = [];
    }

    /**
     * Configure the VM with given options.
     * @param options - The new VM options.
     * @public
     */
    configure(options: VmOptionsPartial) {
        if (this.executionStatus.state !== VmExecutionState.INITIAL) {
            return;
        }

        const limitRange = (x: number, limit: { min: number; max: number }) => {
            x = Math.max(x, limit.min);
            x = Math.min(x, limit.max);
            return x;
        };

        if (options.maxExecutionStepCount !== undefined) {
            options.maxExecutionStepCount = limitRange(
                options.maxExecutionStepCount,
                vmOptionLimits.maxExecutionStepCount
            );

            this.options.maxExecutionStepCount = options.maxExecutionStepCount;
        }

        if (options.memorySize !== undefined) {
            options.memorySize = limitRange(
                options.memorySize,
                vmOptionLimits.memorySize
            );

            options.memorySize = limitRange(options.memorySize, {
                min: this.options.stackSize,
                max: vmOptionLimits.memorySize.max
            });

            this.options.memorySize = options.memorySize;

            this.initialRegisters.esp = i32(options.memorySize);
            this.registers.esp = i32(options.memorySize);

            this.updatePeakMemoryUsage();
        }

        if (options.stackSize !== undefined) {
            options.stackSize = limitRange(
                options.stackSize,
                vmOptionLimits.stackSize
            );

            options.stackSize = limitRange(options.stackSize, {
                min: vmOptionLimits.stackSize.min,
                max: this.options.memorySize
            });

            this.options.stackSize = options.stackSize;
        }
    }

    /**
     * Keeps current instructions in memory and reset rest of the VM to initial state.
     * @public
     */
    reset() {
        this.memory.text = [];
        this.memory.memory = new Uint8Array();
        this.registers = _.cloneDeep(this.initialRegisters);
        this.tables = _.cloneDeep(initialTables);
        this.executionStatus = _.cloneDeep(initialExecutionStatus);
        this.peakMemoryUsage = _.cloneDeep(initialPeakMemoryUsage);
        this.writeBuffer = [];
    }

    /**
     * Reset rest of the VM to initial state and load new instructions into memory.
     * @param instructions - The new IR instructions.
     * @public
     */
    loadNewInstructions(instructions: string[]) {
        this.reset();
        this.memory.instructions = instructions;
    }

    /**
     * Reset rest of the VM to initial state, load new instructions into memory and
     * decode them.
     * @param instructions - The new IR instructions.
     * @public
     */
    loadAndDecodeNewInstructions(instructions: string[]) {
        this.loadNewInstructions(instructions);
        this.decodeInstructions(true);
    }

    /**
     * Decode each instruction loaded into the VM and do the following:
     * - Fill text section of VM memory
     * - Construct label table
     * - Construct function table
     * - Check the existence of main function
     *
     * If an error is detected, `this.executionStatus.state` will be set to
     * `"STATIC_CHECK_FAILED"` with error message(s) written to buffer.
     *
     * Note that runtime errors are not examined here.
     * @param writeErrorItemsOnly - Write error items to `staticErrors` only,
     * won't set decoded result, set VM execution state or write error messages.
     * @public
     */
    decodeInstructions(writeErrorItemsOnly?: boolean) {
        // Go through each line of IR code
        for (let i = 0; i < this.memory.instructions.length; i++) {
            const decoded = this.decoder.decode(this.memory.instructions[i]);

            if (
                decoded.type === InstructionType.EMPTY ||
                decoded.type === InstructionType.COMMENT
            ) {
                continue;
            }

            if (decoded.type === InstructionType.ERROR) {
                if (!writeErrorItemsOnly) {
                    this.executionStatus.state =
                        VmExecutionState.STATIC_CHECK_FAILED;

                    this.writeBuffer.push([
                        // {
                        //     key: "STATIC_ERROR_PREFIX",
                        //     type: ConsoleMessageType.ERROR
                        // },
                        {
                            key: "DECODE_ERROR_PREFIX",
                            values: {
                                lineNumber: i + 1
                            },
                            type: ConsoleMessageType.ERROR
                        },
                        {
                            key: decoded.messageKey!,
                            type: ConsoleMessageType.ERROR
                        }
                    ]);
                }

                this.executionStatus.staticErrors.push({
                    startLineNumber: i + 1,
                    endLineNumber: i + 1,
                    startColumn: 1, // starts from 1
                    endColumn: this.memory.instructions[i].length,
                    message: { key: decoded.messageKey! }
                });

                continue;
            }

            if (!writeErrorItemsOnly) {
                switch (decoded.type) {
                    case InstructionType.LABEL:
                        this.tables.labelTable[
                            (<DecodedLabel>decoded.value!).id
                        ] = {
                            addressBefore: i32(this.memory.text.length - 1)
                        };
                        break;
                    case InstructionType.FUNCTION:
                        this.tables.functionTable[
                            (<DecodedFunction>decoded.value!).id
                        ] = {
                            addressBefore: i32(this.memory.text.length - 1)
                        };
                        break;
                    default:
                        this.memory.text.push({
                            ...(decoded as unknown as DecodedExecutableInstruction),
                            lineNumber: i + 1,
                            instructionLength:
                                this.memory.instructions[i].length
                        });
                        break;
                }
            }
        }

        if (
            !(this.entryFunctionName in this.tables.functionTable) &&
            !writeErrorItemsOnly
        ) {
            this.executionStatus.state = VmExecutionState.STATIC_CHECK_FAILED;

            this.writeBuffer.push([
                {
                    key: "STATIC_ERROR_PREFIX",
                    type: ConsoleMessageType.ERROR
                },
                {
                    key: "NO_MAIN_FUNCTION",
                    type: ConsoleMessageType.ERROR
                }
            ]);
        }
    }

    /**
     * Initialize registers and stack as if there's an outer caller to main function;
     * randomize memory; allocate space for global variables and remove GLOBAL_DEC text.
     */
    private initializeMemoryRegister() {
        this.registers.eip = i32Add(
            this.tables.functionTable[this.entryFunctionName].addressBefore,
            1
        );

        // Fill memory with a random number
        this.memory.memory = new Uint8Array(this.options.memorySize).fill(
            Math.random() * 256
        );

        // esp initially points to one byte up outside
        this.registers.esp = i32(this.options.memorySize);

        this.updatePeakMemoryUsage();

        // push ecx
        if (!this.pushl(this.registers.ecx)) {
            return;
        }

        // push this.memory.text.length as main's special return address
        if (!this.pushl(i32(this.memory.text.length))) {
            return;
        }

        // As if callee does the following
        // pushl ebp
        if (!this.pushl(this.registers.ebp)) {
            return;
        }

        // movl esp ebp
        this.registers.ebp = this.registers.esp;

        // Push AssignCall LValue stack
        this.tables.assignCallLValueStack.push(null);
        // Push new variable table
        this.tables.variableTableStack.push({});
        // Push call stack
        this.executionStatus.callStack.push(this.entryFunctionName);

        for (const text of this.memory.text) {
            if (text.type === ExecutableInstructionType.GLOBAL_DEC) {
                const decodedGlobalDec = <DecodedGlobalDec>text.value;

                if (
                    !this.checkGlobalVariableSegmentSize(decodedGlobalDec.size)
                ) {
                    this.writeRuntimeError(
                        {
                            key: "GLOBAL_VARIABLE_SEGMENT_OVERFLOW"
                        },
                        text.lineNumber
                    );
                    return;
                }

                if (decodedGlobalDec.id in this.tables.globalVariableTable) {
                    this.writeRuntimeError(
                        {
                            key: "DUPLICATE_GLOBAL_DEC_ID"
                        },
                        text.lineNumber
                    );
                    return;
                }

                this.memory.memory
                    .subarray(
                        this.registers.edx,
                        i32Add(this.registers.edx, decodedGlobalDec.size)
                    )
                    .fill(0);

                this.tables.globalVariableTable[decodedGlobalDec.id] = {
                    size: decodedGlobalDec.size,
                    address: this.registers.edx
                };

                this.registers.edx = i32Add(
                    this.registers.edx,
                    decodedGlobalDec.size
                );

                this.updatePeakMemoryUsage();

                // GLOBAL_DEC also counts for one step.
                this.executionStatus.stepCount++;
            }
        }
    }

    /**
     * Prepare the VM to execute first instruction.
     *
     * If successful, `this.executionStatus.state` will be set to `"FREE"`;
     * If an error is detected, `this.executionStatus.state` and error message(s)
     * will be written to buffer.
     */
    private prepareExcution() {
        this.decodeInstructions();

        if (this.executionStatus.state !== VmExecutionState.INITIAL) {
            return;
        }

        this.initializeMemoryRegister();

        if (this.executionStatus.state !== VmExecutionState.INITIAL) {
            return;
        }

        this.executionStatus.state = VmExecutionState.FREE;

        this.executionStartTime = new Date();
    }

    /**
     * Finalize the VM when main function returns.
     */
    private finalizeExcution() {
        const executionEndTime = new Date();

        // Cleanup global variable
        this.registers.edx = 0;
        this.updatePeakMemoryUsage();
        this.tables.globalVariableTable = {};

        this.executionStatus.state =
            this.registers.eax === 0
                ? VmExecutionState.EXITED_NORMALLY
                : VmExecutionState.EXITED_ABNORMALLY;
        this.writeBuffer.push([
            {
                key: "PROGRAM_EXITED",
                values: {
                    returnValue: this.registers.eax
                },
                type:
                    this.registers.eax === 0
                        ? ConsoleMessageType.SUCCESS
                        : ConsoleMessageType.WARNING
            }
        ]);
        this.writeBuffer.push([
            {
                key: "EXECUTION_STEP_COUNT_TIME",
                values: {
                    stepCount: this.executionStatus.stepCount,
                    time:
                        executionEndTime.getTime() -
                        this.executionStartTime.getTime()
                },
                type:
                    this.registers.eax === 0
                        ? ConsoleMessageType.SUCCESS
                        : ConsoleMessageType.WARNING
            }
        ]);
    }

    /**
     * Set `this.executionStatus.messages` to `"RUNTIME_ERROR"`
     * and write runtime error prefix(with line number) and given
     * runtime error message to buffer.
     * @param message - The `FormattableMessage` object.
     * @param lineNumber - The optional line number which will replace eip's line number.
     */
    private writeRuntimeError(
        message: FormattableMessage,
        lineNumber?: number
    ) {
        this.executionStatus.state = VmExecutionState.RUNTIME_ERROR;

        this.executionStatus.runtimeErrors.push({
            startLineNumber:
                lineNumber ?? this.memory.text[this.registers.eip].lineNumber,
            endLineNumber:
                lineNumber ?? this.memory.text[this.registers.eip].lineNumber,
            startColumn: 1,
            endColumn: this.memory.text[this.registers.eip].instructionLength,
            message
        });

        this.writeBuffer.push([
            {
                key: "RUNTIME_ERROR_PREFIX",
                values: {
                    lineNumber:
                        lineNumber ??
                        this.memory.text[this.registers.eip].lineNumber
                },
                type: ConsoleMessageType.ERROR
            },
            Object.assign(message, { type: ConsoleMessageType.ERROR })
        ]);
    }

    private checkStackSize(size: number): boolean {
        return (
            this.options.memorySize - i32Sub(this.registers.esp, size) <=
            this.options.stackSize
        );
    }

    private checkGlobalVariableSegmentSize(size: number): boolean {
        return (
            i32Add(this.registers.edx, size) <=
            this.options.memorySize - this.options.stackSize
        );
    }

    /**
     * Read an int32 from memory at given address. If memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to buffer.
     * @param address - The truncated memory read address.
     * @returns The truncated value read from memory or `null`.
     */
    private loadMemory32(address: number): number | null {
        const loadResult = load32(address, this.memory.memory);
        if (loadResult.status === MmuLoadStatus.OUT_OF_BOUND) {
            this.writeRuntimeError({
                key: "MEMORY_READ_OUT_OF_BOUND",
                values: {
                    address: address
                }
            });

            return null;
        }

        return loadResult.value;
    }

    /**
     * Store an `number` to memory at given address. If memory writing caused an MMU
     * `OUT_OF_BOUND` error, `false` is returned and error will be written to buffer.
     * @param value - The truncated `number` value to be stored.
     * @param address - The memory write address.
     * @returns A `boolean` value indicating whether memory write is successful.
     */
    private storeMemory32(value: number, address: number): boolean {
        const storeResult = store32(value, address, this.memory.memory);
        if (storeResult === MmuStoreStatus.OUT_OF_BOUND) {
            this.writeRuntimeError({
                key: "MEMORY_WRITE_OUT_OF_BOUND",
                values: {
                    address: address
                }
            });

            return false;
        }

        return true;
    }

    /**
     * Sub `esp` by 4 and store the given `number` value on top of stack.
     * If memory writing caused an MMU `OUT_OF_BOUND` error, `false` is
     * returned and error will be written to buffer.
     * @param value - The truncated `number` value to be pushed onto stack.
     * @returns A `boolean` value indicating whether push is successful.
     */
    private pushl(value: number): boolean {
        if (!this.checkStackSize(4)) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return false;
        }

        this.registers.esp = i32Sub(this.registers.esp, 4);

        this.updatePeakMemoryUsage();
        if (!this.storeMemory32(value, this.registers.esp)) {
            return false;
        }

        return true;
    }

    /**
     * Return the top int32 on stack and add `esp` by `4`. If memory reading
     * caused an MMU `OUT_OF_BOUND` error, `null` is returned and error will
     * be written to buffer.
     * @returns The truncated result value or `null`.
     */
    private popl(): number | null {
        const loadResult = this.loadMemory32(this.registers.esp);
        if (loadResult === null) {
            return null;
        }

        this.registers.esp = i32Add(this.registers.esp, 4);

        this.updatePeakMemoryUsage();

        return loadResult;
    }

    /**
     * Search the given variable id in current local variable table and
     * global variable table, then return it. If the id can't be found,
     * `null` is returned and if `check_not_found_error` is `true`,
     * error will be checked.
     * @param id - The variable id.
     * @param check_not_found_error - Whether VARIABLE_NOT_FOUND error
     * should be checked.
     * @returns A `VmVariable` object or `null`
     */
    private getVariableById(
        id: string,
        check_not_found_error: boolean
    ): VmVariable | null {
        if (this.tables.variableTableStack.length === 0) {
            this.writeRuntimeError({
                key: "EMPTY_VARIABLE_TABLE_STACK"
            });

            return null;
        }

        if (
            id in
            this.tables.variableTableStack[
                this.tables.variableTableStack.length - 1
            ]
        ) {
            return this.tables.variableTableStack[
                this.tables.variableTableStack.length - 1
            ][id];
        } else if (id in this.tables.globalVariableTable) {
            return this.tables.globalVariableTable[id];
        } else {
            if (check_not_found_error) {
                this.writeRuntimeError({
                    key: "VARIABLE_NOT_FOUND",
                    values: {
                        id
                    }
                });
            }

            return null;
        }
    }

    /**
     * Get the truncated value of given singular. If the singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to buffer.
     * @param singular - The Singular object.
     * @returns The truncated value obtained or `null`.
     */
    private getSingularValue(singular: Singular): number | null {
        switch (singular.type) {
            case SingularType.IMM:
                return singular.imm!;
            default: {
                const variable = this.getVariableById(singular.id!, true);
                if (variable === null) {
                    return null;
                }

                if (singular.type === SingularType.ADDRESS_ID) {
                    return variable.address;
                }

                const loadResult = this.loadMemory32(variable.address);
                if (loadResult === null) {
                    return null;
                }

                if (singular.type === SingularType.ID) {
                    return loadResult;
                }

                const valueReadResult = this.loadMemory32(loadResult);
                if (valueReadResult === null) {
                    return null;
                }

                return valueReadResult;
            }
        }
    }

    /**
     * Get the truncated value of given `RValue`. If its singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to buffer.
     * @param out - The output buffer.
     * @param rValue - The `RValue` object.
     * @returns The truncated value obtained or `null`.
     */
    private getRValue(rValue: RValue): number | null {
        switch (rValue.type) {
            case RValueType.SINGULAR:
                return this.getSingularValue(rValue.singular!);
            case RValueType.BINARY_MATH_OP: {
                const singularLValue = this.getSingularValue(rValue.singularL!);
                if (singularLValue === null) {
                    return null;
                }

                const singularRValue = this.getSingularValue(rValue.singularR!);
                if (singularRValue === null) {
                    return null;
                }

                switch (rValue.binaryMathOp!) {
                    case BinaryMathOp.ADD:
                        return i32Add(singularLValue, singularRValue);
                    case BinaryMathOp.SUB:
                        return i32Sub(singularLValue, singularRValue);
                    case BinaryMathOp.MUL:
                        return i32Mul(singularLValue, singularRValue);
                    case BinaryMathOp.DIV:
                        if (singularRValue === 0) {
                            this.writeRuntimeError({
                                key: "DIVIDE_BY_ZERO"
                            });
                            return null;
                        }
                        return i32Div(singularLValue, singularRValue);
                }
            }
        }
    }

    /**
     * Create a variable on the stack and insert to current variable table.
     * If stackoverflow occurs, error will be written to buffer.
     * @param id - The variable id.
     * @param size - The variable size.
     * @returns A `VmVariable` value or `null`
     */
    private createStackVariable(id: string, size: number): VmVariable | null {
        if (!this.checkStackSize(size)) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return null;
        }

        this.registers.esp = i32Sub(this.registers.esp, size);
        this.updatePeakMemoryUsage();

        const variable: VmVariable = {
            address: this.registers.esp,
            size
        };

        if (this.tables.variableTableStack.length === 0) {
            this.writeRuntimeError({
                key: "EMPTY_VARIABLE_TABLE_STACK"
            });
            return null;
        }

        if (
            id in
            this.tables.variableTableStack[
                this.tables.variableTableStack.length - 1
            ]
        ) {
            this.writeRuntimeError({
                key: "DUPLICATE_DEC_ID",
                values: {
                    id
                }
            });

            return null;
        }

        this.tables.variableTableStack[
            this.tables.variableTableStack.length - 1
        ][id] = variable;

        return variable;
    }

    /**
     * Get memory address of the given `LValue`. If its singular
     * is an `ID` which can't be found, the variable will be immediately
     * created. If an error is caused, it will be written to buffer.
     * @param lValue - The `LValue` object.
     * @returns An `number` value or `null`
     */
    private getLValueAddress(lValue: LValue): number | null {
        let variable = this.getVariableById(
            lValue.id,
            lValue.type === LValueType.DEREF_ID
        );
        if (variable === null) {
            if (lValue.type === LValueType.ID) {
                variable = this.createStackVariable(lValue.id, 4);
                if (variable === null) {
                    return null;
                }
            } else {
                return null;
            }
        }

        let storeAddress = variable.address;

        if (lValue.type === LValueType.DEREF_ID) {
            const derefAddress = this.loadMemory32(variable.address);
            if (derefAddress === null) {
                return null;
            }

            storeAddress = derefAddress;
        }

        return storeAddress;
    }

    /**
     * Get the `boolean` result of given `CondValue`. If its singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to buffer.
     * @param condValue - The `CondValue` object.
     * @returns A `boolean` result or `null`
     */
    private getCondValue(condValue: CondValue): boolean | null {
        const singularLValue = this.getSingularValue(condValue.singularL);
        if (singularLValue === null) {
            return null;
        }

        const singularRValue = this.getSingularValue(condValue.singularR);
        if (singularRValue === null) {
            return null;
        }

        switch (condValue.binaryRelOp) {
            case BinaryRelOp.EQ:
                return singularLValue === singularRValue;
            case BinaryRelOp.NE:
                return singularLValue !== singularRValue;
            case BinaryRelOp.LT:
                return singularLValue < singularRValue;
            case BinaryRelOp.LE:
                return singularLValue <= singularRValue;
            case BinaryRelOp.GT:
                return singularLValue > singularRValue;
            case BinaryRelOp.GE:
                return singularLValue >= singularRValue;
        }
    }

    /**
     * Execute single step.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to buffer.
     * @async
     * @public
     */
    async executeSingleStep() {
        // Allow immediate rerun after exit
        if (
            this.executionStatus.state === VmExecutionState.EXITED_NORMALLY ||
            this.executionStatus.state === VmExecutionState.EXITED_ABNORMALLY
        ) {
            this.reset();
        }

        if (this.executionStatus.state === VmExecutionState.INITIAL) {
            // Clear error items generated during editor static check
            this.reset();
            this.prepareExcution();
        }

        if (this.executionStatus.state !== VmExecutionState.FREE) {
            return;
        }

        this.executionStatus.state = VmExecutionState.BUSY;

        // Check step limit
        if (
            this.options.maxExecutionStepCount > 0 &&
            this.executionStatus.stepCount >= this.options.maxExecutionStepCount
        ) {
            this.executionStatus.state = VmExecutionState.MAX_STEP_REACHED;
            this.writeBuffer.push([
                {
                    key: "MAX_STEP_REACHED",
                    values: {
                        maxExecutionStepCount:
                            this.options.maxExecutionStepCount
                    },
                    type: ConsoleMessageType.ERROR
                }
            ]);
            return;
        }

        // Check text index
        if (
            this.registers.eip >= this.memory.text.length ||
            this.registers.eip < 0
        ) {
            // Here we don't call writeRuntimeError because we can't get line number.
            this.executionStatus.state = VmExecutionState.RUNTIME_ERROR;

            this.writeBuffer.push([
                {
                    key: "RUNTIME_ERROR_PREFIX_NO_LN",
                    type: ConsoleMessageType.ERROR
                },
                {
                    key: "INSTRUCTION_READ_OUT_OF_BOUND",
                    values: {
                        address: this.registers.eip
                    },
                    type: ConsoleMessageType.ERROR
                }
            ]);

            return;
        }

        // Step count increase
        // We do not increase after the switch because main's RETURN will
        // exit this function directly
        this.executionStatus.stepCount++;

        const ir = this.memory.text[this.registers.eip];
        switch (ir.type) {
            case ExecutableInstructionType.ARG: {
                const value = this.getSingularValue(
                    (<DecodedArg>ir.value).value
                );
                if (value === null || !this.pushl(value)) {
                    return;
                }

                this.registers.ecx = i32Add(this.registers.ecx, 4);

                break;
            }
            case ExecutableInstructionType.ASSIGN: {
                const rValue = this.getRValue((<DecodedAssign>ir.value).rValue);
                if (rValue === null) {
                    return;
                }

                const lValueAddress = this.getLValueAddress(
                    (<DecodedAssign>ir.value).lValue
                );
                if (lValueAddress === null) {
                    return;
                }

                if (!this.storeMemory32(rValue, lValueAddress)) {
                    return;
                }

                break;
            }
            case ExecutableInstructionType.ASSIGN_CALL:
            case ExecutableInstructionType.CALL: {
                const functionId =
                    ir.type === ExecutableInstructionType.CALL
                        ? (<DecodedCall>ir.value).id
                        : (<DecodedAssignCall>ir.value).functionId;
                if (!(functionId in this.tables.functionTable)) {
                    this.writeRuntimeError({
                        key: "FUNCTION_NOT_FOUND",
                        values: {
                            id: functionId
                        }
                    });

                    return;
                }

                // Set first arg address
                this.registers.ebx = this.registers.esp;

                // Push ecx
                if (!this.pushl(this.registers.ecx)) {
                    return;
                }

                this.registers.ecx = 0;

                // Push return address
                if (!this.pushl(this.registers.eip)) {
                    return;
                }

                // As if callee does the following
                // pushl ebp
                if (!this.pushl(this.registers.ebp)) {
                    return;
                }

                // movl esp ebp
                this.registers.ebp = this.registers.esp;

                if (ir.type === ExecutableInstructionType.ASSIGN_CALL) {
                    this.tables.assignCallLValueStack.push(
                        (<DecodedAssignCall>ir.value).lValue
                    );
                } else {
                    this.tables.assignCallLValueStack.push(null);
                }

                // Push new variable table
                this.tables.variableTableStack.push({});
                // Push call stack
                this.executionStatus.callStack.push(functionId);

                this.registers.eip =
                    this.tables.functionTable[functionId].addressBefore;

                break;
            }

            case ExecutableInstructionType.DEC: {
                const variable = this.createStackVariable(
                    (<DecodedDec>ir.value).id,
                    (<DecodedDec>ir.value).size
                );
                if (variable === null) {
                    return;
                }

                break;
            }

            case ExecutableInstructionType.GOTO: {
                const labelId = (<DecodedGoto>ir.value).id;
                if (!(labelId in this.tables.labelTable)) {
                    this.writeRuntimeError({
                        key: "LABEL_NOT_FOUND",
                        values: {
                            id: labelId
                        }
                    });

                    return;
                }

                this.registers.eip =
                    this.tables.labelTable[labelId].addressBefore;

                break;
            }
            case ExecutableInstructionType.IF: {
                const condValue = this.getCondValue(
                    (<DecodedIf>ir.value).condition
                );
                if (condValue === null) {
                    return;
                }

                const gotoLabelId = (<DecodedIf>ir.value).gotoId;
                if (!(gotoLabelId in this.tables.labelTable)) {
                    this.writeRuntimeError({
                        key: "LABEL_NOT_FOUND",
                        values: {
                            id: gotoLabelId
                        }
                    });

                    return;
                }

                if (condValue) {
                    this.registers.eip =
                        this.tables.labelTable[gotoLabelId].addressBefore;
                }

                break;
            }

            case ExecutableInstructionType.PARAM: {
                const paramId = (<DecodedParam>ir.value).id;
                if (
                    paramId in
                    this.tables.variableTableStack[
                        this.tables.variableTableStack.length - 1
                    ]
                ) {
                    this.writeRuntimeError({
                        key: "DUPLICATE_PARAM_ID",
                        values: {
                            id: paramId
                        }
                    });

                    return;
                }

                // Try load memory to detect out of bound error
                if (this.loadMemory32(this.registers.ebx) === null) {
                    return;
                }

                this.tables.variableTableStack[
                    this.tables.variableTableStack.length - 1
                ][paramId] = {
                    address: this.registers.ebx,
                    size: 4
                };

                this.registers.ebx = i32Add(this.registers.ebx, 4);

                break;
            }

            case ExecutableInstructionType.RETURN: {
                const returnValue = this.getSingularValue(
                    (<DecodedReturn>ir.value).value
                );
                if (returnValue === null) {
                    return;
                }

                this.registers.eax = returnValue;

                // movl ebp,esp
                this.registers.esp = this.registers.ebp;
                this.updatePeakMemoryUsage();

                // popl ebp
                const savedEbp = this.popl();
                if (savedEbp === null) {
                    return;
                }

                this.registers.ebp = savedEbp;

                // ret
                const returnAddress = this.popl();
                if (returnAddress === null) {
                    return;
                }

                this.registers.eip = returnAddress;

                // popl ecx
                const savedEcx = this.popl();
                if (savedEcx === null) {
                    return;
                }

                // addl esp, ecx
                this.registers.esp = i32Add(this.registers.esp, savedEcx);
                this.updatePeakMemoryUsage();

                // If s sub function uses ARG without CALL, this will avoid
                // incorrect ecx value when next ARGs are executed after
                // control returns to parent function.
                this.registers.ecx = 0;

                // Pop local variable table
                if (this.tables.variableTableStack.length === 0) {
                    this.writeRuntimeError({
                        key: "EMPTY_VARIABLE_TABLE_STACK"
                    });

                    return;
                }

                // Pop call stack
                this.executionStatus.callStack.pop();

                this.tables.variableTableStack.pop();

                // Whether main function returns
                if (this.registers.eip === this.memory.text.length) {
                    this.finalizeExcution();
                    return;
                }

                // Store return value
                const assignCallLValue =
                    this.tables.assignCallLValueStack.pop();
                if (assignCallLValue !== null) {
                    const lValueAddress = this.getLValueAddress(
                        assignCallLValue!
                    );
                    if (lValueAddress === null) {
                        return;
                    }
                    if (
                        !this.storeMemory32(this.registers.eax, lValueAddress)
                    ) {
                        return;
                    }
                }

                break;
            }

            case ExecutableInstructionType.READ: {
                const decodedRead = <DecodedRead>ir.value;

                const lValueAddress = this.getLValueAddress(decodedRead.lValue);
                if (lValueAddress === null) {
                    return;
                }

                const lValueName =
                    decodedRead.lValue.type === LValueType.ID
                        ? decodedRead.lValue.id
                        : "*" + decodedRead.lValue.id;

                this.executionStatus.state = VmExecutionState.WAIT_INPUT;

                const valueString = await this.readConsole([
                    {
                        key: "READ_PROMPT",
                        values: {
                            name: lValueName
                        }
                    }
                ]);

                this.executionStatus.state = VmExecutionState.BUSY;

                const value = parseInt(valueString);
                if (isNaN(value)) {
                    this.writeRuntimeError({
                        key: "INPUT_INT_ILLEGAL"
                    });

                    return;
                }

                if (!Number.isSafeInteger(value)) {
                    this.writeRuntimeError({
                        key: "INPUT_INT_ABS_TOO_LARGE"
                    });

                    return;
                }

                if (!this.storeMemory32(i32(value), lValueAddress)) {
                    return;
                }

                break;
            }

            case ExecutableInstructionType.WRITE: {
                const value = this.getSingularValue(
                    (<DecodedWrite>ir.value).value
                );
                if (value === null) {
                    return;
                }

                this.writeBuffer.push([
                    {
                        key: "WRITE_OUTPUT",
                        values: {
                            value: value
                        },
                        type: ConsoleMessageType.OUTPUT
                    }
                ]);

                break;
            }

            default:
                break;
        }

        // inc eip
        this.registers.eip = i32Add(this.registers.eip, 1);

        // Skip GLOBAL_DEC
        while (
            this.registers.eip < this.memory.text.length &&
            this.registers.eip >= 0 &&
            this.memory.text[this.registers.eip].type ===
                ExecutableInstructionType.GLOBAL_DEC
        ) {
            this.registers.eip = i32Add(this.registers.eip, 1);
        }

        this.executionStatus.state = VmExecutionState.FREE;
    }

    /**
     * Execute continuously.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to buffer.
     * @async
     * @public
     */
    async execute() {
        while (true) {
            await this.executeSingleStep();
            if (this.executionStatus.state !== VmExecutionState.FREE) {
                break;
            }
        }
    }
}
