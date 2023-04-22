import { Aint32, Int32, Uint32 } from "./data_types";
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
import type { AppLocaleKey, FormattableMessage } from "@/locales";
import { toHex } from "../utils";
import { cloneDeep } from "lodash";

// VM Table element types
interface VmLabel {
    // Equals actual address-1 because EIP increases after the address is set
    addressBefore: Uint32;
}

interface VmFunction {
    // Equals actual address-1 because EIP increases after the address is set
    addressBefore: Uint32;
}

interface VmVariable {
    address: Uint32;
    size: Uint32;
}

// VM Component types
interface VmMemory {
    instructions: string[];
    text: DecodedExecutableInstruction[];
    memory: Uint8Array;
}

interface VmRegisters {
    eax: Uint32;
    ebx: Uint32;
    ecx: Uint32;
    edi: Uint32;
    ebp: Uint32;
    esp: Uint32;
    eip: Uint32;
}

interface VmVariableTable {
    [name: string]: VmVariable;
}

interface VmTables {
    labelTable: { [name: string]: VmLabel };
    functionTable: { [name: string]: VmFunction };
    globalVariableTable: VmVariableTable;
    variableTableStack: VmVariableTable[];
}

type VmExecutionState =
    | "INITIAL"
    | "BUSY"
    | "FREE" // 2023.04.18-22:20 就在刚才，我收到她的消息了。我的心情复杂而又幸福。我感到圆满了。一切都值了。请允许我把此时此刻的感受永远记录在这里——与本项目无关。
    | "STATIC_CHECK_FAILED"
    | "RUNTIME_ERROR"
    | "MAX_STEP_REACHED"
    | "EXITED_NORMALLY"
    | "EXITED_ABNORMALLY";

interface VmStaticErrorTable {
    [lineNumber: string | number]: AppLocaleKey;
}

interface VmExecutionStatus {
    stepCount: number;
    state: VmExecutionState;
    callStack: string[];
    // Used to index which line contains static error and should be marked
    staticErrorTable: VmStaticErrorTable;
}

const initialMemory: VmMemory = {
    instructions: [],
    text: [],
    memory: new Uint8Array([])
};

const initialRegisters: VmRegisters = {
    eax: new Uint32(0),
    ebx: new Uint32(0),
    ecx: new Uint32(0),
    edi: new Uint32(0),
    ebp: new Uint32(0),
    esp: new Uint32(0),
    eip: new Uint32(0)
};

const initialTables: VmTables = {
    labelTable: {},
    functionTable: {},
    globalVariableTable: {},
    variableTableStack: []
};

const initialExecutionStatus: VmExecutionStatus = {
    stepCount: 0,
    state: "INITIAL",
    callStack: [],
    staticErrorTable: {}
};

// Write console message type
type WriteConsoleMessageType = "SUCCESS" | "ERROR" | "WARNING" | "OUT";
type WriteConsoleFn = (
    message: FormattableMessage[],
    type: WriteConsoleMessageType
) => void;
type ReadConsoleFn = (prompt: FormattableMessage[]) => Promise<string>;

// VM Options type
interface VmOptions {
    maxExecutionStepCount: number;
    memorySize: number;
    stackSize: number;
}

type VmOptionsPartial = Partial<VmOptions>;

type VmNumberOptionKeys = {
    [K in keyof VmOptions]: VmOptions[K] extends number ? K : never;
}[keyof VmOptions];

const vmOptionLimits: {
    [K in VmNumberOptionKeys]: { min: number; max: number };
} = {
    maxExecutionStepCount: {
        min: 100,
        max: 100000
    },
    memorySize: {
        min: 2 * 1024,
        max: 2 * 1024 * 1024
    },
    stackSize: {
        min: 1024,
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
 * eax - counts total function arg size
 * ebx - indicates current function param address
 * ecx - indicates top address of global variable segment
 * edi - return value store address, or this.memory.length if not to store
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
 * |
 * |--------------------------------|
 * |                                | <- ecx
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
 * |          Saved eax             |
 * |--------------------------------|
 * |         Return address         |
 * |--------------------------------|
 * |          Saved ebp             |
 * |--------------------------------|
 * |          Saved edi             | <- new ebp
 * |--------------------------------|
 * |                                |
 * |          Local vars            |
 * |                                |
 * |              ...               |
 */
export class Vm {
    private alu: Alu = new Alu();
    private mmu: Mmu = new Mmu();
    private decoder: Decoder = new Decoder();

    private memory: VmMemory = initialMemory;
    private registers: VmRegisters = initialRegisters;
    private tables: VmTables = initialTables;
    private executionStatus: VmExecutionStatus = initialExecutionStatus;

    // VM Options does not belong to its state
    private options: VmOptions = defaultOptions;

    private writeConsole: WriteConsoleFn;
    private readConsole: ReadConsoleFn;

    private entryFunctionName = "main";

    constructor(writeConsole: WriteConsoleFn, readConsole: ReadConsoleFn) {
        this.writeConsole = writeConsole;
        this.readConsole = readConsole;
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

    get globalVariableTable(): VmVariableTable {
        return cloneDeep(this.tables.globalVariableTable);
    }

    get variableTableStack(): VmVariableTable[] {
        return cloneDeep(this.tables.variableTableStack);
    }

    get callStack(): string[] {
        return cloneDeep(this.executionStatus.callStack);
    }

    get state(): VmExecutionState {
        return this.executionStatus.state;
    }

    get staticErrorTable(): VmStaticErrorTable {
        return cloneDeep(this.executionStatus.staticErrorTable);
    }

    get executionStepCount(): number {
        return this.executionStatus.stepCount;
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

            this.options.memorySize = options.memorySize;
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
        this.memory.text = cloneDeep(initialMemory.text);
        this.memory.memory = cloneDeep(initialMemory.memory);
        this.registers = cloneDeep(initialRegisters);
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
        this.memory.instructions = cloneDeep(instructions);
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
     */
    private decodeInstructions() {
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

                this.writeConsole(
                    [
                        {
                            key: "DECODE_ERROR_PREFIX",
                            values: {
                                lineNumber: i + 1
                            }
                        },
                        {
                            key: decoded.messageKey!
                        }
                    ],
                    "ERROR"
                );

                this.executionStatus.staticErrorTable[i + 1] =
                    decoded.messageKey!;

                continue;
            }

            const currentAddress = new Uint32(this.memory.text.length - 1);

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

            this.writeConsole(
                [
                    {
                        key: "NO_MAIN_FUNCTION"
                    }
                ],
                "ERROR"
            );

            return;
        }
    }

    /**
     * Initialize registers as if there's an outer caller to main function;
     * allocate, initialize global variables and construct global variable table;
     * push main function's special return address to stack
     */
    private initializeMemoryRegister() {
        this.registers.ebp = this.alu.addUint32(
            this.tables.functionTable[this.entryFunctionName].addressBefore,
            new Uint32(1)
        );
        this.registers.eip = this.alu.addUint32(
            this.tables.functionTable[this.entryFunctionName].addressBefore,
            new Uint32(1)
        );

        // do not store return value
        this.registers.edi = new Uint32(this.memory.memory.length);

        // Fill memory with a random number
        this.memory.memory = new Uint8Array(this.options.memorySize).fill(
            Math.random() * 256
        );

        // esp initially points to one byte outside
        this.registers.esp = new Uint32(this.options.memorySize);

        // push this.memory.text.length as main's special return address
        if (!this.pushl(new Uint32(this.memory.text.length))) {
            return;
        }

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
                    this.writeRuntimeError({
                        key: "GLOBAL_VARIABLE_SEGMENT_OVERFLOW"
                    });
                    return;
                }

                this.memory.memory
                    .subarray(
                        this.registers.ecx.value,
                        this.registers.ecx.value + decodedGlobalDec.size.value
                    )
                    .fill(0);

                this.tables.globalVariableTable[decodedGlobalDec.id] = {
                    size: decodedGlobalDec.size,
                    address: this.registers.ecx
                };

                this.registers.ecx = this.alu.addUint32(
                    this.registers.ecx,
                    decodedGlobalDec.size
                );
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
     * @param returnValue - The return value of main function.
     */
    private finalizeExcution(returnValue: Aint32) {
        if (this.alu.eq(returnValue, new Int32(0))) {
            this.executionStatus.state = "EXITED_NORMALLY";
            this.writeConsole(
                [
                    {
                        key: "EXITED_NORMALLY",
                        values: {
                            executionStepCount: this.executionStatus.stepCount
                        }
                    }
                ],
                "SUCCESS"
            );
        } else {
            this.executionStatus.state = "EXITED_ABNORMALLY";
            this.writeConsole(
                [
                    {
                        key: "EXITED_ABNORMALLY",
                        values: {
                            returnValue: returnValue.value,
                            executionStepCount: this.executionStatus.stepCount
                        }
                    }
                ],
                "WARNING"
            );
        }
    }

    /**
     * Set `this.executionStatus.messages` to `"RUNTIME_ERROR"`
     * and write runtime error prefix(with line number) and given
     * runtime error message to console.
     * @param message - The `FormattableMessage` object.
     */
    private writeRuntimeError(message: FormattableMessage) {
        this.executionStatus.state = "RUNTIME_ERROR";

        this.writeConsole(
            [
                {
                    key: "RUNTIME_ERROR_PREFIX",
                    values: {
                        lineNumber:
                            this.memory.text[this.registers.eip.value]
                                .lineNumber
                    }
                },
                message
            ],
            "ERROR"
        );
    }

    private checkStackSize(size: Uint32): boolean {
        if (this.alu.ltUint32(this.registers.esp, size)) {
            return false;
        }

        if (
            this.alu.leUint32(
                this.alu.subUint32(this.registers.esp, size),
                this.registers.ecx
            )
        ) {
            return false;
        }

        return true;
    }

    private checkGlobalVariableSegmentSize(size: Uint32) {
        const newEbx = this.alu.addUint32(this.registers.ecx, size);
        if (this.alu.geUint32(newEbx, this.registers.esp)) {
            return false;
        }

        if (this.alu.geUint32(newEbx, new Uint32(this.options.memorySize))) {
            return false;
        }

        return true;
    }

    /**
     * Read an `Uint32` from memory at given address. If memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param address - The memory read address.
     * @returns An `Uint32` value or `null`
     */
    private loadMemory32(address: Uint32): Uint32 | null {
        const value = this.mmu.load32(address, this.memory.memory);
        if (value.status === "OUT_OF_BOUND") {
            this.writeRuntimeError({
                key: "MEMORY_READ_OUT_OF_BOUND",
                values: {
                    address: toHex(address)
                }
            });

            return null;
        }

        return value.value!;
    }

    /**
     * Store an `Aint32` to memory at given address. If memory writing caused an MMU
     * `OUT_OF_BOUND` error, `false` is returned and error will be written to console.
     * @param value - The `Aint32` value to be stored.
     * @param address - The memory write address.
     * @returns A `boolean` value indicating whether memory write is successful.
     */
    private storeMemory32(value: Aint32, address: Uint32): boolean {
        const storeResult = this.mmu.store32(
            new Uint32(value.value),
            address,
            this.memory.memory
        );
        if (storeResult.status === "OUT_OF_BOUND") {
            this.writeRuntimeError({
                key: "MEMORY_WRITE_OUT_OF_BOUND",
                values: {
                    address: toHex(address)
                }
            });

            return false;
        }

        return true;
    }

    /**
     * Sub `esp` by 4 and store the given `Aint32` value on top of stack.
     * If memory writing caused an MMU `OUT_OF_BOUND` error, `false` is
     * returned and error will be written to console.
     * @param value - The `Aint32` value to be pushed onto stack.
     * @returns A `boolean` value indicating whether push is successful.
     */
    private pushl(value: Aint32): boolean {
        if (!this.checkStackSize(new Uint32(4))) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return false;
        }

        this.registers.esp = this.alu.subUint32(
            this.registers.esp,
            new Uint32(4)
        );
        if (!this.storeMemory32(value, this.registers.esp)) {
            return false;
        }

        return true;
    }

    /**
     * Return the top `Uint32` on stack and add `esp` by `4`. If memory reading
     * caused an MMU `OUT_OF_BOUND` error, `null` is returned and error will
     * be written to console.
     * @returns An `Uint32` value or `null`
     */
    private popl(): Uint32 | null {
        const value = this.loadMemory32(this.registers.esp);
        if (value === null) {
            return null;
        }

        this.registers.esp = this.alu.addUint32(
            this.registers.esp,
            new Uint32(4)
        );

        return value;
    }

    /**
     * Search the given variable id in current local variable table and
     * global variable table, then return it. If the id can't be found,
     * `null` is returned and error will be written to console.
     * @param id - The variable id.
     * @returns A `VmVariable` object or `null`
     */
    private getVariableById(id: string): VmVariable | null {
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
            this.writeRuntimeError({
                key: "VARIABLE_NOT_FOUND",
                values: {
                    id
                }
            });

            return null;
        }
    }

    /**
     * Get the `Int32` or `Uint32` value of given singular. If the singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param singular - The Singular object.
     * @returns An `Aint32` value or `null`
     */
    private getSingularValue(singular: Singular): Aint32 | null {
        switch (singular.type) {
            case "IMM":
                return singular.imm!;
            default: {
                const variable = this.getVariableById(singular.id!);
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

    private aint32BinaryMathOp(
        a: Aint32,
        b: Aint32,
        int32Op: (_a: Int32, _b: Int32) => Int32,
        uint32Op: (_a: Uint32, _b: Uint32) => Uint32
    ): Aint32 {
        if (a.type === "UINT32" || b.type === "UINT32") {
            return uint32Op(new Uint32(a.value), new Uint32(b.value));
        }

        return int32Op(a as Int32, b as Int32);
    }

    private aint32BinaryRelOp(
        a: Aint32,
        b: Aint32,
        int32Op: (_a: Int32, _b: Int32) => boolean,
        uint32Op: (_a: Uint32, _b: Uint32) => boolean
    ): boolean {
        if (a.type === "UINT32" || b.type === "UINT32") {
            return uint32Op(new Uint32(a.value), new Uint32(b.value));
        }

        return int32Op(a as Int32, b as Int32);
    }

    /**
     * Get the `Int32` or `Uint32` value of given `RValue`. If its singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error will be written to console.
     * @param rValue - The `RValue` object.
     * @returns An `Aint32` value or `null`
     */
    private getRValue(rValue: RValue): Aint32 | null {
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
                        return this.aint32BinaryMathOp(
                            singularLValue,
                            singularRValue,
                            this.alu.addInt32,
                            this.alu.addUint32
                        );
                    case "-":
                        return this.aint32BinaryMathOp(
                            singularLValue,
                            singularRValue,
                            this.alu.subInt32,
                            this.alu.subUint32
                        );
                    case "*":
                        return this.aint32BinaryMathOp(
                            singularLValue,
                            singularRValue,
                            this.alu.mulInt32,
                            this.alu.mulUint32
                        );
                    case "/":
                        return this.aint32BinaryMathOp(
                            singularLValue,
                            singularRValue,
                            this.alu.divInt32,
                            this.alu.divUint32
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
    private createStackVariable(id: string, size: Uint32): VmVariable | null {
        if (!this.checkStackSize(size)) {
            this.writeRuntimeError({
                key: "STACK_OVERFLOW"
            });
            return null;
        }

        this.registers.esp = this.alu.subUint32(this.registers.esp, size);

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
     * @returns An `Uint32` value or `null`
     */
    private getLValueAddress(lValue: LValue): Uint32 | null {
        let variable = this.getVariableById(lValue.id);
        if (variable === null) {
            if (lValue.type === "ID") {
                variable = this.createStackVariable(lValue.id, new Uint32(4));
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
                return this.aint32BinaryRelOp(
                    singularLValue,
                    singularRValue,
                    this.alu.ltInt32,
                    this.alu.ltUint32
                );
            case "<=":
                return this.aint32BinaryRelOp(
                    singularLValue,
                    singularRValue,
                    this.alu.leInt32,
                    this.alu.leUint32
                );
            case ">":
                return this.aint32BinaryRelOp(
                    singularLValue,
                    singularRValue,
                    this.alu.gtInt32,
                    this.alu.gtUint32
                );
            case ">=":
                return this.aint32BinaryRelOp(
                    singularLValue,
                    singularRValue,
                    this.alu.geInt32,
                    this.alu.geUint32
                );
        }
    }

    /**
     * Execute single step.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to console.
     * @public
     */
    async executeSingleStep() {
        if (this.executionStatus.state === "INITIAL") {
            this.prepareExcution();
        }

        if (this.executionStatus.state !== "FREE") {
            return;
        }

        // Check step limit
        if (
            this.executionStatus.stepCount >= this.options.maxExecutionStepCount
        ) {
            this.executionStatus.state = "MAX_STEP_REACHED";
            this.writeConsole(
                [
                    {
                        key: "MAX_STEP_REACHED",
                        values: {
                            maxExecutionStepCount:
                                this.options.maxExecutionStepCount
                        }
                    }
                ],
                "ERROR"
            );
            return;
        }

        // Check text index
        if (
            this.alu.geUint32(
                this.registers.eip,
                new Uint32(this.memory.text.length)
            )
        ) {
            this.writeRuntimeError({
                key: "INSTRUCTION_READ_OUT_OF_BOUND"
            });
            return;
        }

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

                // Push eax
                if (!this.pushl(this.registers.eax)) {
                    return;
                }

                // Push return address
                if (!this.pushl(this.registers.eip)) {
                    return;
                }

                if (ir.type === "ASSIGN_CALL") {
                    const lValueAddress = this.getLValueAddress(
                        (<DecodedAssignCall>ir.value).lValue
                    );
                    if (lValueAddress === null) {
                        return;
                    }

                    // Set return value store address
                    this.registers.edi = lValueAddress;
                } else {
                    this.registers.edi = new Uint32(this.memory.memory.length);
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

                // pushl edi
                if (!this.pushl(this.registers.edi)) {
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

                if (condValue) {
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
                    size: new Uint32(4)
                };

                this.registers.ebx = this.alu.addUint32(
                    this.registers.ebx,
                    new Uint32(4)
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

                // movl ebp,esp
                this.registers.esp = this.registers.ebp;

                // popl edi
                const savedEdi = this.popl();
                if (savedEdi === null) {
                    return;
                }

                this.registers.edi = savedEdi;

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

                // popl eax
                const savedEax = this.popl();
                if (savedEax === null) {
                    return;
                }

                this.registers.eax = savedEax;

                // addl esp, eax
                this.registers.esp = this.alu.addUint32(
                    this.registers.esp,
                    this.registers.eax
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

                // store return value
                if (
                    this.alu.ne(
                        this.registers.edi,
                        new Uint32(this.memory.memory.length)
                    )
                ) {
                    if (!this.storeMemory32(returnValue, this.registers.edi)) {
                        return;
                    }
                }

                // Whether main function returns
                if (
                    this.alu.eq(
                        this.registers.eip,
                        new Uint32(this.memory.text.length)
                    )
                ) {
                    this.finalizeExcution(returnValue);
                    return;
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

                const valueString = await this.readConsole([
                    {
                        key: "READ_PROMPT",
                        values: {
                            name: lValueName
                        }
                    }
                ]);

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

                this.writeConsole(
                    [
                        {
                            key: "WRITE_OUTPUT",
                            values: {
                                value: value.value
                            }
                        }
                    ],
                    "OUT"
                );

                break;
            }

            default:
                break;
        }

        // inc eip
        this.registers.eip = this.alu.addUint32(
            this.registers.eip,
            new Uint32(1)
        );
    }

    /**
     * Execute continuously.
     * If a runtime error is detected, `this.executionStatus.state` will be set to
     * `"RUNTIME_ERROR"` with error message written to console.
     * @public
     */
    async execute() {
        while (
            this.executionStatus.state === "INITIAL" ||
            this.executionStatus.state === "FREE"
        ) {
            await this.executeSingleStep();
        }
    }
}
