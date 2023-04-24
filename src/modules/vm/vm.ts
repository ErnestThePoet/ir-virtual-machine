import { Int32, Uint32 } from "./data_types";
import { Alu } from "./alu";
import { Mmu } from "./mmu";
import { CondValue, Decoder } from "./decoder";
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
import type { FormattableMessage } from "@/locales";
import { toHex } from "../utils";
import { cloneDeep } from "lodash";

// VM Table element types
interface VmLabel {
    // Equals actual address-1 because EIP increases after the address is set
    addressBefore: Int32;
}

interface VmFunction {
    // Equals actual address-1 because EIP increases after the address is set
    addressBefore: Int32;
}

interface VmVariable {
    address: Int32;
    size: Int32;
}

// VM Component types
interface VmMemory {
    instructions: string[];
    text: DecodedExecutableInstruction[];
    memory: Uint8Array;
}

interface VmRegisters {
    eax: Int32;
    ebx: Int32;
    ecx: Int32;
    edx: Int32;
    ebp: Int32;
    esp: Int32;
    eip: Int32;
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

interface VmTables {
    labelTable: { [id: string]: VmLabel };
    functionTable: { [id: string]: VmFunction };
    globalVariableTable: VmVariableTable;
    variableTableStack: VmVariableTable[];
    assignCallLValueStack: (LValue | null)[];
}

export type VmExecutionState =
    | "INITIAL"
    | "BUSY"
    | "WAIT_INPUT"
    | "FREE" // 2023.04.18-22:20 就在刚才，我收到她的消息了。我的心情复杂而又幸福。我感到圆满了。一切都值了。请允许我把此时此刻的感受永远记录在这里——与本项目无关。
    | "STATIC_CHECK_FAILED"
    | "RUNTIME_ERROR"
    | "MAX_STEP_REACHED"
    | "EXITED_NORMALLY"
    | "EXITED_ABNORMALLY";

export interface VmErrorTable {
    [lineNumber: string | number]: FormattableMessage;
}

interface VmExecutionStatus {
    stepCount: number;
    state: VmExecutionState;
    callStack: string[];
    // Used to index which line contains static/runtime error and should be marked
    staticErrorTable: VmErrorTable;
    runtimeErrorTable: VmErrorTable;
}

const initialMemory: VmMemory = {
    instructions: [],
    text: [],
    memory: new Uint8Array()
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
    state: "INITIAL",
    callStack: [],
    staticErrorTable: {},
    runtimeErrorTable: {}
};

// Console message type
export type ConsoleMessageType =
    | "SUCCESS"
    | "ERROR"
    | "WARNING"
    | "NORMAL"
    | "PROMPT"
    | "ARROW";
export type ConsoleMessagePart = FormattableMessage & {
    type: ConsoleMessageType;
};
type WriteConsoleFn = (message: ConsoleMessagePart[]) => void;
type ReadConsoleFn = (prompt: FormattableMessage[]) => Promise<string>;

// VM Options type
export interface VmOptions {
    maxExecutionStepCount: number;
    memorySize: number;
    stackSize: number;
}

type VmOptionsPartial = Partial<VmOptions>;

type VmNumberOptionKeys = {
    [K in keyof VmOptions]: VmOptions[K] extends number ? K : never;
}[keyof VmOptions];

export const vmOptionLimits: {
    [K in VmNumberOptionKeys]: { min: number; max: number };
} = {
    maxExecutionStepCount: {
        min: 100,
        max: 100000
    },
    memorySize: {
        min: 1024,
        max: 2 * 1024 * 1024
    },
    stackSize: {
        min: 512,
        max: 1024 * 1024
    }
};

const defaultOptions: VmOptions = {
    maxExecutionStepCount: 3000,
    memorySize: 4 * 1024,
    stackSize: 2 * 1024
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
 * IrVm uses a slightly modified cdecl calling convention.
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
        eax: new Int32(0),
        ebx: new Int32(0),
        ecx: new Int32(0),
        edx: new Int32(0),
        ebp: new Int32(0),
        esp: new Int32(defaultOptions.memorySize),
        eip: new Int32(0)
    };

    private alu: Alu = new Alu();
    private mmu: Mmu = new Mmu();
    private decoder: Decoder = new Decoder();

    private memory: VmMemory = cloneDeep(initialMemory);
    private registers: VmRegisters = cloneDeep(this.initialRegisters);
    private tables: VmTables = cloneDeep(initialTables);
    private executionStatus: VmExecutionStatus = cloneDeep(
        initialExecutionStatus
    );

    // VM Options does not belong to its state
    private options: VmOptions = cloneDeep(defaultOptions);

    private writeConsole: WriteConsoleFn = _ => {};
    private readConsole: ReadConsoleFn = _ => Promise.resolve("");

    private entryFunctionName = "main";

    setIoFns(writeConsole: WriteConsoleFn, readConsole: ReadConsoleFn) {
        this.writeConsole = writeConsole;
        this.readConsole = readConsole;
    }

    private getSingleVariableValues(variable: VmVariable): number[] {
        const values: number[] = [];

        for (
            let i = variable.address;
            this.alu.ltInt32(
                i,
                this.alu.addInt32(variable.address, variable.size)
            );
            i = this.alu.addInt32(i, new Int32(4))
        ) {
            // Bypass VM's encapsulated loadMemory32 because we do not want to
            // record runtime error here
            const loadResult = this.mmu.load32(
                new Uint32(i.value),
                this.memory.memory
            );
            if (loadResult.status === "OUT_OF_BOUND") {
                values.push(NaN);
            } else {
                values.push(new Int32(loadResult.value!.value).value);
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
                address: table[id].address.value,
                size: table[id].size.value,
                values: this.getSingleVariableValues(table[id])
            });
        }

        return details;
    }

    get canContinueExecution(): boolean {
        return (
            this.executionStatus.state === "INITIAL" ||
            this.executionStatus.state === "FREE" ||
            this.executionStatus.state === "EXITED_NORMALLY" ||
            this.executionStatus.state === "EXITED_ABNORMALLY"
        );
    }

    get currentLineNumber(): number {
        if (
            this.registers.eip.value < 0 ||
            this.registers.eip.value >= this.memory.text.length
        ) {
            return -1;
        }
        return this.memory.text[this.registers.eip.value].lineNumber;
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

    get staticErrorTable(): VmErrorTable {
        return cloneDeep(this.executionStatus.staticErrorTable);
    }

    get runtimeErrorTable(): VmErrorTable {
        return cloneDeep(this.executionStatus.runtimeErrorTable);
    }

    get currentOptions(): VmOptions {
        return cloneDeep(this.options);
    }

    get stepCount(): number {
        return this.executionStatus.stepCount;
    }

    get memoryUsage(): VmMemoryUsage {
        return {
            total: this.options.memorySize,
            used:
                this.registers.edx.value +
                this.options.memorySize -
                this.registers.esp.value,

            stackTotal: this.options.stackSize,
            stackUsed: this.options.memorySize - this.registers.esp.value,

            globalVariableTotal:
                this.options.memorySize - this.options.stackSize,
            globalVariableUsed: this.registers.edx.value
        };
    }

    /**
     * Configure the VM with given options.
     * @param options - The new VM options.
     * @public
     */
    configure(options: VmOptionsPartial) {
        if (this.executionStatus.state !== "INITIAL") {
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

            this.initialRegisters.esp = new Int32(options.memorySize);
            this.registers.esp = new Int32(options.memorySize);
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
        this.registers = cloneDeep(this.initialRegisters);
        this.tables = cloneDeep(initialTables);
        this.executionStatus = cloneDeep(initialExecutionStatus);
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
     * Decode each instruction loaded into the VM and do the following:
     * - Fill text section of VM memory
     * - Construct label table
     * - Construct function table
     * - Check the existence of main function
     *
     * If an error is detected, `this.executionStatus.state` will be set to
     * `"STATIC_CHECK_FAILED"` with error message(s) written to console.
     *
     * Note that runtime errors are not examined here.
     * @public
     */
    decodeInstructions() {
        // Go through each line of IR code
        for (let i = 0; i < this.memory.instructions.length; i++) {
            const decoded = this.decoder.decode(
                this.memory.instructions[i],
                i + 1
            );

            if (decoded.type === "EMPTY") {
                continue;
            }

            if (decoded.type === "ERROR") {
                this.executionStatus.state = "STATIC_CHECK_FAILED";

                this.writeConsole([
                    // {
                    //     key: "STATIC_ERROR_PREFIX",
                    //     type: "ERROR"
                    // },
                    {
                        key: "DECODE_ERROR_PREFIX",
                        values: {
                            lineNumber: i + 1
                        },
                        type: "ERROR"
                    },
                    {
                        key: decoded.messageKey!,
                        type: "ERROR"
                    }
                ]);

                this.executionStatus.staticErrorTable[i + 1] = {
                    key: decoded.messageKey!
                };

                continue;
            }

            const currentAddress = new Int32(this.memory.text.length - 1);

            switch (decoded.type) {
                case "LABEL":
                    this.tables.labelTable[(<DecodedLabel>decoded.value!).id] =
                        {
                            addressBefore: currentAddress
                        };
                    break;
                case "FUNCTION":
                    this.tables.functionTable[
                        (<DecodedFunction>decoded.value!).id
                    ] = {
                        addressBefore: currentAddress
                    };
                // FUNCTION is also added to text
                default:
                    this.memory.text.push(
                        decoded as DecodedExecutableInstruction
                    );
                    break;
            }
        }

        if (!(this.entryFunctionName in this.tables.functionTable)) {
            this.executionStatus.state = "STATIC_CHECK_FAILED";

            this.writeConsole([
                {
                    key: "STATIC_ERROR_PREFIX",
                    type: "ERROR"
                },
                {
                    key: "NO_MAIN_FUNCTION",
                    type: "ERROR"
                }
            ]);

            return;
        }
    }

    /**
     * Initialize registers and stack as if there's an outer caller to main function;
     * randomize memory
     */
    private initializeMemoryRegister() {
        this.registers.eip = this.alu.addInt32(
            this.tables.functionTable[this.entryFunctionName].addressBefore,
            new Int32(1)
        );

        // Fill memory with a random number
        this.memory.memory = new Uint8Array(this.options.memorySize).fill(
            Math.random() * 256
        );

        // esp initially points to one byte up outside
        this.registers.esp = new Int32(this.options.memorySize);

        // edx initially points to 0
        this.registers.edx = new Int32(0);

        // push ecx
        if (!this.pushl(this.registers.ecx)) {
            return;
        }

        // push this.memory.text.length as main's special return address
        if (!this.pushl(new Int32(this.memory.text.length))) {
            return;
        }

        // Push AssignCall LValue stack
        this.tables.assignCallLValueStack.push(null);
        // Push new variable table
        this.tables.variableTableStack.push({});
        // Push call stack
        this.executionStatus.callStack.push(this.entryFunctionName);

        for (const i of this.memory.text) {
            if (i.type === "GLOBAL_DEC") {
                const decodedGlobalDec = <DecodedGlobalDec>i.value;

                if (
                    !this.checkGlobalVariableSegmentSize(decodedGlobalDec.size)
                ) {
                    this.writeRuntimeError(
                        {
                            key: "GLOBAL_VARIABLE_SEGMENT_OVERFLOW"
                        },
                        i.lineNumber
                    );
                    return;
                }

                this.memory.memory
                    .subarray(
                        this.registers.edx.value,
                        this.registers.edx.value + decodedGlobalDec.size.value
                    )
                    .fill(0);

                this.tables.globalVariableTable[decodedGlobalDec.id] = {
                    size: decodedGlobalDec.size,
                    address: this.registers.edx
                };

                this.registers.edx = this.alu.addInt32(
                    this.registers.edx,
                    decodedGlobalDec.size
                );

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
     * will be written to console.
     */
    private prepareExcution() {
        this.decodeInstructions();

        if (this.executionStatus.state !== "INITIAL") {
            return;
        }

        this.initializeMemoryRegister();

        if (this.executionStatus.state !== "INITIAL") {
            return;
        }

        this.executionStatus.state = "FREE";
    }

    /**
     * Finalize the VM when main function returns.
     */
    private finalizeExcution() {
        // Cleanup global variable
        this.registers.edx = new Int32(0);

        if (this.alu.eq(this.registers.eax, new Int32(0))) {
            this.executionStatus.state = "EXITED_NORMALLY";
            this.writeConsole([
                {
                    key: "EXITED_NORMALLY",
                    values: {
                        stepCount: this.executionStatus.stepCount
                    },
                    type: "SUCCESS"
                }
            ]);
        } else {
            this.executionStatus.state = "EXITED_ABNORMALLY";
            this.writeConsole([
                {
                    key: "EXITED_ABNORMALLY",
                    values: {
                        returnValue: this.registers.eax.value,
                        stepCount: this.executionStatus.stepCount
                    },
                    type: "WARNING"
                }
            ]);
        }
    }

    /**
     * Set `this.executionStatus.messages` to `"RUNTIME_ERROR"`
     * and write runtime error prefix(with line number) and given
     * runtime error message to console.
     * @param message - The `FormattableMessage` object.
     * @param lineNumber - The optional line number which will replace eip's line number.
     */
    private writeRuntimeError(
        message: FormattableMessage,
        lineNumber?: number
    ) {
        this.executionStatus.state = "RUNTIME_ERROR";

        this.executionStatus.runtimeErrorTable[
            lineNumber ?? this.memory.text[this.registers.eip.value].lineNumber
        ] = message;

        this.writeConsole([
            {
                key: "RUNTIME_ERROR_PREFIX",
                values: {
                    lineNumber:
                        lineNumber ??
                        this.memory.text[this.registers.eip.value].lineNumber
                },
                type: "ERROR"
            },
            Object.assign(message, { type: "ERROR" as ConsoleMessageType })
        ]);
    }

    private checkStackSize(size: Int32): boolean {
        if (
            this.alu.gtInt32(
                this.alu.subInt32(
                    new Int32(this.options.memorySize),
                    this.alu.subInt32(this.registers.esp, size)
                ),
                new Int32(this.options.stackSize)
            )
        ) {
            return false;
        }

        return true;
    }

    private checkGlobalVariableSegmentSize(size: Int32) {
        if (
            this.alu.gtInt32(
                this.alu.addInt32(this.registers.edx, size),
                new Int32(this.options.memorySize - this.options.stackSize)
            )
        ) {
            return false;
        }

        return true;
    }

    /**
     * Read an `Int32` from memory at given address. If memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param address - The memory read address.
     * @returns An `Int32` value or `null`
     */
    private loadMemory32(address: Int32): Int32 | null {
        const uint32address = new Uint32(address.value);

        const loadResult = this.mmu.load32(uint32address, this.memory.memory);
        if (loadResult.status === "OUT_OF_BOUND") {
            this.writeRuntimeError({
                key: "MEMORY_READ_OUT_OF_BOUND",
                values: {
                    address: toHex(uint32address)
                }
            });

            return null;
        }

        return new Int32(loadResult.value!.value);
    }

    /**
     * Store an `Int32` to memory at given address. If memory writing caused an MMU
     * `OUT_OF_BOUND` error, `false` is returned and error will be written to console.
     * @param value - The `Int32` value to be stored.
     * @param address - The memory write address.
     * @returns A `boolean` value indicating whether memory write is successful.
     */
    private storeMemory32(value: Int32, address: Int32): boolean {
        const uint32address = new Uint32(address.value);
        const storeResult = this.mmu.store32(
            new Uint32(value.value),
            uint32address,
            this.memory.memory
        );
        if (storeResult.status === "OUT_OF_BOUND") {
            this.writeRuntimeError({
                key: "MEMORY_WRITE_OUT_OF_BOUND",
                values: {
                    address: toHex(uint32address)
                }
            });

            return false;
        }

        return true;
    }

    /**
     * Sub `esp` by 4 and store the given `Int32` value on top of stack.
     * If memory writing caused an MMU `OUT_OF_BOUND` error, `false` is
     * returned and error will be written to console.
     * @param value - The `Int32` value to be pushed onto stack.
     * @returns A `boolean` value indicating whether push is successful.
     */
    private pushl(value: Int32): boolean {
        if (!this.checkStackSize(new Int32(4))) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return false;
        }

        this.registers.esp = this.alu.subInt32(
            this.registers.esp,
            new Int32(4)
        );
        if (!this.storeMemory32(value, this.registers.esp)) {
            return false;
        }

        return true;
    }

    /**
     * Return the top `Int32` on stack and add `esp` by `4`. If memory reading
     * caused an MMU `OUT_OF_BOUND` error, `null` is returned and error will
     * be written to console.
     * @returns An `Int32` value or `null`
     */
    private popl(): Int32 | null {
        const value = this.loadMemory32(this.registers.esp);
        if (value === null) {
            return null;
        }

        this.registers.esp = this.alu.addInt32(
            this.registers.esp,
            new Int32(4)
        );

        return value;
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
     * Get the `Int32` or `Int32` value of given singular. If the singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param singular - The Singular object.
     * @returns An `Int32` value or `null`
     */
    private getSingularValue(singular: Singular): Int32 | null {
        switch (singular.type) {
            case "IMM":
                return singular.imm!;
            default: {
                const variable = this.getVariableById(singular.id!, true);
                if (variable === null) {
                    return null;
                }

                if (singular.type === "ADDRESS_ID") {
                    return variable.address;
                }

                const value = this.loadMemory32(variable.address);
                if (value === null) {
                    return null;
                }

                if (singular.type === "ID") {
                    return value;
                }

                const derefValue = this.loadMemory32(value);
                if (derefValue === null) {
                    return null;
                }

                return derefValue;
            }
        }
    }

    // Legacy functions when Uint32 is still used
    // private aint32BinaryMathOp(
    //     a: Int32,
    //     b: Int32,
    //     int32Op: (_a: Int32, _b: Int32) => Int32,
    //     uint32Op: (_a: Int32, _b: Int32) => Int32
    // ): Int32 {
    //     if (a.type === "UINT32" || b.type === "UINT32") {
    //         return uint32Op.bind(this.alu)(
    //             new Int32(a.value),
    //             new Int32(b.value)
    //         );
    //     }

    //     return int32Op.bind(this.alu)(a as Int32, b as Int32);
    // }

    // private aint32BinaryRelOp(
    //     a: Int32,
    //     b: Int32,
    //     int32Op: (_a: Int32, _b: Int32) => boolean,
    //     uint32Op: (_a: Int32, _b: Int32) => boolean
    // ): boolean {
    //     if (a.type === "UINT32" || b.type === "UINT32") {
    //         return uint32Op.bind(this.alu)(
    //             new Int32(a.value),
    //             new Int32(b.value)
    //         );
    //     }

    //     return int32Op.bind(this.alu)(a as Int32, b as Int32);
    // }

    /**
     * Get the `Int32` or `Int32` value of given `RValue`. If its singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param rValue - The `RValue` object.
     * @returns An `Int32` value or `null`
     */
    private getRValue(rValue: RValue): Int32 | null {
        switch (rValue.type) {
            case "SINGULAR":
                return this.getSingularValue(rValue.singular!);
            case "BINARY_MATH_OP": {
                const singularLValue = this.getSingularValue(rValue.singularL!);
                if (singularLValue === null) {
                    return null;
                }

                const singularRValue = this.getSingularValue(rValue.singularR!);
                if (singularRValue === null) {
                    return null;
                }

                switch (rValue.binaryMathOp!) {
                    case "+":
                        return this.alu.addInt32(
                            singularLValue,
                            singularRValue
                        );
                    case "-":
                        return this.alu.subInt32(
                            singularLValue,
                            singularRValue
                        );
                    case "*":
                        return this.alu.mulInt32(
                            singularLValue,
                            singularRValue
                        );
                    case "/":
                        return this.alu.divInt32(
                            singularLValue,
                            singularRValue
                        );
                }
            }
        }
    }

    /**
     * Create a variable on the stack and insert to current variable table.
     * If stackoverflow occurs, error will be written to console.
     * @param id - The variable id.
     * @param size - The variable size.
     * @returns A `VmVariable` value or `null`
     */
    private createStackVariable(id: string, size: Int32): VmVariable | null {
        if (!this.checkStackSize(size)) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return null;
        }

        this.registers.esp = this.alu.subInt32(this.registers.esp, size);

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
     * created. If an error is caused, it will be written to console.
     * @param lValue - The `LValue` object.
     * @returns An `Int32` value or `null`
     */
    private getLValueAddress(lValue: LValue): Int32 | null {
        let variable = this.getVariableById(
            lValue.id,
            lValue.type === "DEREF_ID"
        );
        if (variable === null) {
            if (lValue.type === "ID") {
                variable = this.createStackVariable(lValue.id, new Int32(4));
                if (variable === null) {
                    return null;
                }
            } else {
                return null;
            }
        }

        let storeAddress = variable.address;

        if (lValue.type === "DEREF_ID") {
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
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
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
            case "==":
                return this.alu.eq(singularLValue, singularRValue);
            case "!=":
                return this.alu.ne(singularLValue, singularRValue);
            case "<":
                return this.alu.ltInt32(singularLValue, singularRValue);
            case "<=":
                return this.alu.leInt32(singularLValue, singularRValue);
            case ">":
                return this.alu.gtInt32(singularLValue, singularRValue);
            case ">=":
                return this.alu.geInt32(singularLValue, singularRValue);
        }
    }

    /**
     * Execute single step.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to console.
     * @public
     */
    async executeSingleStep() {
        // Allow immediate rerun after exit
        if (
            this.executionStatus.state === "EXITED_NORMALLY" ||
            this.executionStatus.state === "EXITED_ABNORMALLY"
        ) {
            this.executionStatus.state = "INITIAL";
        }

        if (this.executionStatus.state === "INITIAL") {
            this.prepareExcution();
        }

        if (this.executionStatus.state !== "FREE") {
            return;
        }

        this.executionStatus.state = "BUSY";

        // Check step limit
        if (
            this.executionStatus.stepCount >= this.options.maxExecutionStepCount
        ) {
            this.executionStatus.state = "MAX_STEP_REACHED";
            this.writeConsole([
                {
                    key: "MAX_STEP_REACHED",
                    values: {
                        maxExecutionStepCount:
                            this.options.maxExecutionStepCount
                    },
                    type: "ERROR"
                }
            ]);
            return;
        }

        // Check text index
        if (
            this.alu.geInt32(
                this.registers.eip,
                new Int32(this.memory.text.length) ||
                    this.alu.ltInt32(this.registers.eip, new Int32(0))
            )
        ) {
            // Here we don't call writeRuntimeError because we can't get line number.
            this.executionStatus.state = "RUNTIME_ERROR";

            this.writeConsole([
                {
                    key: "RUNTIME_ERROR_PREFIX_NO_LN",
                    type: "ERROR"
                },
                {
                    key: "INSTRUCTION_READ_OUT_OF_BOUND",
                    values: {
                        address: toHex(new Uint32(this.registers.eip.value))
                    },
                    type: "ERROR"
                }
            ]);

            return;
        }

        // Step count increase
        // We do not increase after thw switch because main's RETURN will
        // exit this function directly
        this.executionStatus.stepCount++;

        const ir = this.memory.text[this.registers.eip.value];
        switch (ir.type) {
            case "ARG": {
                const value = this.getSingularValue(
                    (<DecodedArg>ir.value).value
                );
                if (value === null || !this.pushl(value)) {
                    return;
                }

                break;
            }
            case "ASSIGN": {
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
            case "ASSIGN_CALL":
            case "CALL": {
                const functionId =
                    ir.type === "CALL"
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

                // Push return address
                if (!this.pushl(this.registers.eip)) {
                    return;
                }

                if (ir.type === "ASSIGN_CALL") {
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

            case "DEC": {
                const variable = this.createStackVariable(
                    (<DecodedDec>ir.value).id,
                    (<DecodedDec>ir.value).size
                );
                if (variable === null) {
                    return;
                }

                break;
            }

            case "FUNCTION": {
                // pushl ebp
                if (!this.pushl(this.registers.ebp)) {
                    return;
                }

                // movl esp ebp
                this.registers.ebp = this.registers.esp;

                break;
            }

            case "GOTO": {
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
            case "IF": {
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

            case "PARAM": {
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

                this.tables.variableTableStack[
                    this.tables.variableTableStack.length - 1
                ][paramId] = {
                    address: this.registers.ebx,
                    size: new Int32(4)
                };

                this.registers.ebx = this.alu.addInt32(
                    this.registers.ebx,
                    new Int32(4)
                );

                break;
            }

            case "RETURN": {
                const returnValue = this.getSingularValue(
                    (<DecodedReturn>ir.value).value
                );
                if (returnValue === null) {
                    return;
                }

                this.registers.eax = returnValue;

                // movl ebp,esp
                this.registers.esp = this.registers.ebp;

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

                this.registers.ecx = savedEcx;

                // addl esp, ecx
                this.registers.esp = this.alu.addInt32(
                    this.registers.esp,
                    this.registers.ecx
                );

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
                if (
                    this.alu.eq(
                        this.registers.eip,
                        new Int32(this.memory.text.length)
                    )
                ) {
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

            case "READ": {
                const decodedRead = <DecodedRead>ir.value;

                const lValueAddress = this.getLValueAddress(decodedRead.lValue);
                if (lValueAddress === null) {
                    return;
                }

                const lValueName =
                    decodedRead.lValue.type === "ID"
                        ? decodedRead.lValue.id
                        : "*" + decodedRead.lValue.id;

                this.executionStatus.state = "WAIT_INPUT";

                const valueString = await this.readConsole([
                    {
                        key: "READ_PROMPT",
                        values: {
                            name: lValueName
                        }
                    }
                ]);

                this.executionStatus.state = "BUSY";

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

                if (!this.storeMemory32(new Int32(value), lValueAddress)) {
                    return;
                }

                break;
            }

            case "WRITE": {
                const value = this.getSingularValue(
                    (<DecodedWrite>ir.value).value
                );
                if (value === null) {
                    return;
                }

                this.writeConsole([
                    {
                        key: "WRITE_OUTPUT",
                        values: {
                            value: value.value
                        },
                        type: "NORMAL"
                    }
                ]);

                break;
            }

            default:
                break;
        }

        // inc eip
        this.registers.eip = this.alu.addInt32(
            this.registers.eip,
            new Int32(1)
        );

        this.executionStatus.state = "FREE";
    }

    /**
     * Execute continuously.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to console.
     * @public
     */
    async execute() {
        while (true) {
            await this.executeSingleStep();
            if (this.executionStatus.state !== "FREE") {
                break;
            }
        }
    }
}
