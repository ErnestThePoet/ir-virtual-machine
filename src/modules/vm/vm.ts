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

// VM Table element types
interface VmLabel {
    address: Uint32;
}

interface VmFunction {
    address: Uint32;
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
    ebp: Uint32;
    esp: Uint32;
    eip: Uint32;
}

interface VmTables {
    labelTable: { [name: string]: VmLabel };
    functionTable: { [name: string]: VmFunction };
    globalVariableTable: { [name: string]: VmVariable };
    variableTableStack: { [name: string]: VmVariable }[];
}

type VmExecutionState =
    | "INITIAL"
    | "BUSY"
    | "FREE" // 2023.04.18-22:20 就在刚才，我收到她的消息了。我的心情复杂而又幸福。我感到圆满了。一切都值了。请允许我把此时此刻的感受永远记录在这里——与本项目无关。
    | "STATIC_CHECK_FAILED"
    | "RUNTIME_ERROR"
    | "EXITED_NORMALLY"
    | "EXITED_ABNORMALLY";

interface VmExecutionStatus {
    stepCount: number;
    state: VmExecutionState;
    messages: FormattableMessage[];
    staticErrors: { [lineNumber: string | number]: AppLocaleKey };
}

const initialMemory: VmMemory = {
    instructions: [],
    text: [],
    memory: new Uint8Array([])
};

const initialRegisters: VmRegisters = {
    eax: new Uint32(0),
    ebx: new Uint32(0),
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
    messages: [],
    staticErrors: {}
};

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
 * eax - pass return values
 * ebx - indicate top address of global variable segment
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
 * |                                | <- ebx
 * |    Global variable segment     |
 * |                                | <- 0
 * |--------------------------------|
 *
 * IrVm uses cdecl calling convention.
 * The stack layout when calling a new function is like below.
 * |--------------------------------|
 * |           Saved eax            |
 * |--------------------------------|
 * |             Arg n              |
 * |--------------------------------|
 * |              ...               |
 * |--------------------------------|
 * |             Arg 0              |
 * |--------------------------------|
 * |         Return address         |
 * |--------------------------------|
 * |          Saved ebp             |
 * |--------------------------------|
 * |                                |
 * |          Local vars            |
 * |                                |
 * |              ...               |
 */
class Vm {
    private alu: Alu = new Alu();
    private mmu: Mmu = new Mmu();
    private decoder: Decoder = new Decoder();

    private memory: VmMemory = initialMemory;
    private registers: VmRegisters = initialRegisters;
    private tables: VmTables = initialTables;
    private executionStatus: VmExecutionStatus = initialExecutionStatus;

    // VM Options does not belong to its state
    private options: VmOptions = defaultOptions;

    /**
     * Configure the VM with given options.
     * @param options - The new VM options.
     * @public
     */
    configure(options: VmOptionsPartial) {
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
        Object.assign(this.memory.text, initialMemory.text);
        Object.assign(this.memory.memory, initialMemory.memory);
        Object.assign(this.registers, initialRegisters);
        Object.assign(this.tables, initialTables);
        Object.assign(this.executionStatus, initialExecutionStatus);
    }

    /**
     * Reset rest of the VM to initial state and load new instructions into memory.
     * @param instructions - The new IR instructions.
     * @public
     */
    loadNewInstructions(instructions: string[]) {
        this.reset();
        Object.assign(this.memory.instructions, instructions);
    }

    /**
     * Decode each instruction loaded into the VM and do the following:
     * - Fill text section of VM memory(`DecodedInstruction.type` in text
     * is guaranteed to be none of `"LABEL", "FUNCTION", "ERROR", "EMPTY"`)
     * - Construct label table
     * - Construct function table
     * - Check the existence of main function
     *
     * If an error is detected, `this.executionStatus.state` will be set to
     * `"STATIC_CHECK_FAILED"` with error message(s) set.
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

                this.executionStatus.messages.push({
                    key: "DECODE_ERROR_PREFIX",
                    values: {
                        lineNumber: i + 1
                    }
                });

                this.executionStatus.messages.push({
                    key: decoded.messageKey!
                });

                this.executionStatus.staticErrors[i] = decoded.messageKey!;

                continue;
            }

            const currentAddress = new Uint32(this.memory.text.length - 1);

            switch (decoded.type) {
                case "FUNCTION":
                    this.tables.functionTable[
                        (<DecodedFunction>decoded.value!).id
                    ] = {
                        address: currentAddress
                    };
                    break;
                case "LABEL":
                    this.tables.labelTable[(<DecodedLabel>decoded.value!).id] =
                        {
                            address: currentAddress
                        };
                    break;
                default:
                    this.memory.text.push(
                        decoded as DecodedExecutableInstruction
                    );
                    break;
            }
        }

        if (!("main" in this.tables.functionTable)) {
            this.executionStatus.state = "STATIC_CHECK_FAILED";

            this.executionStatus.messages.push({
                key: "NO_MAIN_FUNCTION"
            });

            return;
        }
    }

    /**
     * Initialize register eip and ebp to program entry;
     * allocate, initialize global variables and construct global variable table.
     */
    private initializeMemoryRegister() {
        this.registers.ebp = this.alu.addUint32(
            this.tables.functionTable["main"].address,
            new Uint32(1)
        );
        this.registers.eip = this.alu.addUint32(
            this.tables.functionTable["main"].address,
            new Uint32(1)
        );

        // Fill memory with a random number
        this.memory.memory = new Uint8Array(this.options.memorySize).fill(
            Math.random() * 256
        );

        // esp initially points to one byte outside
        this.registers.esp = new Uint32(this.options.memorySize);

        for (const i of this.memory.text) {
            if (i.type === "GLOBAL_DEC") {
                const decodedGlobalDec = <DecodedGlobalDec>i.value;

                if (
                    !this.checkGlobalVariableSegmentSize(decodedGlobalDec.size)
                ) {
                    this.recordRuntimeError({
                        key: "GLOBAL_VARIABLE_SEGMENT_OVERFLOW"
                    });
                    return;
                }

                this.memory.memory
                    .subarray(
                        this.registers.ebx.value,
                        this.registers.ebx.value + decodedGlobalDec.size.value
                    )
                    .fill(0);

                this.tables.globalVariableTable[decodedGlobalDec.id] = {
                    size: decodedGlobalDec.size,
                    address: this.registers.ebx
                };

                this.registers.ebx = this.alu.addUint32(
                    this.registers.ebx,
                    decodedGlobalDec.size
                );
            }
        }
    }

    /**
     * Prepare the VM to execute first instruction.
     *
     * If successful, `this.executionStatus.state` will be set to `"FREE"`;
     * If an error is detected, `this.executionStatus.state` and error message(s) will be set.
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
     * Push runtime error prefix(with line number) and given
     * runtime error message to `this.executionStatus.messages`
     * and set `this.executionStatus.messages` to `"RUNTIME_ERROR"`
     * @param message - The `FormattableMessage` object.
     */
    private recordRuntimeError(message: FormattableMessage) {
        this.executionStatus.messages.push(
            {
                key: "RUNTIME_ERROR_PREFIX",
                values: {
                    lineNumber:
                        this.memory.text[this.registers.eip.value].lineNumber
                }
            },
            message
        );

        this.executionStatus.state = "RUNTIME_ERROR";
    }

    private checkStackSize(size: Uint32): boolean {
        if (this.alu.ltUint32(this.registers.esp, size)) {
            return false;
        }

        if (
            this.alu.leUint32(
                this.alu.subUint32(this.registers.esp, size),
                this.registers.ebx
            )
        ) {
            return false;
        }

        return true;
    }

    private checkGlobalVariableSegmentSize(size: Uint32) {
        const newEbx = this.alu.addUint32(this.registers.ebx, size);
        if (this.alu.geUint32(newEbx, this.registers.esp)) {
            return false;
        }

        if (this.alu.geUint32(newEbx, new Uint32(this.options.memorySize))) {
            return false;
        }

        return true;
    }

    private pushl(value: Aint32): boolean {
        if (!this.checkStackSize(new Uint32(4))) {
            this.recordRuntimeError({
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
     * Read an `Uint32` from memory at given address. If memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error info will be set.
     * @param address - The memory read address.
     * @returns An `Uint32` value or `null`
     */
    private loadMemory32(address: Uint32): Uint32 | null {
        const value = this.mmu.load32(address, this.memory.memory);
        if (value.status === "OUT_OF_BOUND") {
            this.recordRuntimeError({
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
     * `OUT_OF_BOUND` error, `false` is returned and error info will be set.
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
            this.recordRuntimeError({
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
     * Search the given variable id in current local variable table and global variable table.
     * and return it. If the id can't be found, `null` is returned and error info will be set.
     * @param id - The variable id.
     * @returns A `VmVariable` value or `null`
     */
    private getVariableById(id: string): VmVariable | null {
        if (
            this.tables.variableTableStack.length > 0 &&
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
            this.recordRuntimeError({
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
     * `OUT_OF_BOUND` error, `null` is returned and error info will be set.
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
     * `OUT_OF_BOUND` error, `null` is returned and error info will be set.
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
     * Store the given `Aint32` value to the given `LValue`. If its singular
     * contains an `ID` which can't be found, or memory writing caused an MMU
     * `OUT_OF_BOUND` error, `false` is returned and error info will be set.
     * @param lValue - The `LValue` object representing assignment target.
     * @param value - The `Aint32` object.
     * @returns A `boolean` value indicating whether assignment is successful
     */
    private assignLValue(lValue: LValue, value: Aint32): boolean {
        const variable = this.getVariableById(lValue.id);
        if (variable === null) {
            return false;
        }

        let storeAddress = variable.address;

        if (lValue.type === "DEREF_ID") {
            const derefAddress = this.loadMemory32(variable.address);
            if (derefAddress === null) {
                return false;
            }

            storeAddress = derefAddress;
        }

        const storeResult = this.storeMemory32(
            new Uint32(value.value),
            storeAddress
        );
        if (!storeResult) {
            return false;
        }

        return true;
    }

    /**
     * Get the `boolean` result of given `CondValue`. If its singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error info will be set.
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
     * `"RUNTIME_ERROR"` with error message set.
     * @public
     */
    executeSingleStep() {
        if (this.executionStatus.state === "INITIAL") {
            this.prepareExcution();
        }

        if (this.executionStatus.state !== "FREE") {
            return;
        }

        for (let i = 0; i < this.memory.text.length; i++) {
            const ir = this.memory.text[i];
            switch (ir.type) {
                case "ARG": {
                    const value = this.getSingularValue(
                        (<DecodedArg>ir.value).value
                    );
                    if (value === null) {
                        return;
                    }
                }
            }
        }
    }
}

export default new Vm();
