import { Aint32, Int32, Uint32 } from "./data_types";
import { Alu } from "./alu";
import { Mmu } from "./mmu";
import { Decoder } from "./decoder";
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

    /**
     * Get the Int32 or Uint32 value of given singular. If the singular
     * contains an `ID` which can't be found, or memory reading caused an MMU
     * `OUT_OF_BOUND` error, `null` is returned and error info will be set.
     * @param singular - The Singular object.
     * @returns An `Aint32` value or `null`
     * @public
     */
    private getSingularValue(singular: Singular): Aint32 | null {
        switch (singular.type) {
            case "IMM":
                return singular.imm!;
            default: {
                let variable: VmVariable;
                if (
                    this.tables.variableTableStack.length > 0 &&
                    singular.id! in
                        this.tables.variableTableStack[
                            this.tables.variableTableStack.length - 1
                        ]
                ) {
                    variable =
                        this.tables.variableTableStack[
                            this.tables.variableTableStack.length - 1
                        ][singular.id!];
                } else if (singular.id! in this.tables.globalVariableTable) {
                    variable = this.tables.globalVariableTable[singular.id!];
                } else {
                    this.recordRuntimeError({
                        key: "VARIABLE_NOT_FOUND",
                        values: {
                            id: singular.id!
                        }
                    });

                    return null;
                }

                if (singular.type === "ADDRESS_ID") {
                    return variable.address;
                }

                const value = this.mmu.load32(
                    variable.address,
                    this.memory.memory
                );
                if (value.status === "OUT_OF_BOUND") {
                    this.recordRuntimeError({
                        key: "MEMORY_READ_OUT_OF_BOUND",
                        values: {
                            address: toHex(variable.address)
                        }
                    });

                    return null;
                }

                if (singular.type === "ID") {
                    return value.value!;
                }

                const derefValue = this.mmu.load32(
                    value.value!,
                    this.memory.memory
                );
                if (derefValue.status === "OUT_OF_BOUND") {
                    this.recordRuntimeError({
                        key: "MEMORY_READ_OUT_OF_BOUND",
                        values: {
                            address: toHex(value.value!)
                        }
                    });

                    return null;
                }

                return derefValue.value!;
            }
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
                    const value = <DecodedArg>ir.value;
                }
            }
        }
    }
}

export default new Vm();
