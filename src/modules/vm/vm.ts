import { Aint32, Uint32 } from "./data_types";
import { Alu } from "./alu";
import { Mmu } from "./mmu";
import { DecodedGlobalDec, DecodedLabel, Decoder } from "./decoder";
import type { DecodedFunction } from "./decoder";
import type { DecodedInstruction } from "./decoder";
import type { AppLocaleKey, FormattableMessage } from "@/locales";

// VM Table element types
interface VmLabel {
    address: Uint32;
}

interface VmFunction {
    address: Uint32;
}

type VmVariableLocation = "BSS" | "STACK";

interface VmVariable {
    address: Uint32;
    size: Uint32;
    location: VmVariableLocation;
}

// VM Component types
interface VmMemory {
    instructions: string[];
    text: DecodedInstruction[];
    bss: Uint8Array;
    stack: Uint8Array;
}

interface VmRegisters {
    eax: Uint32;
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

// IrVm uses a custom calling convention called "irdecl".
// Description:
// instructions is the storage area for raw string IR instructions
// text is the storage area for decoded IR instructions
// bss is the storage area for (uninitialized) global variables
// stack is what we know as stack

const initialMemory: VmMemory = {
    instructions: [],
    text: [],
    bss: new Uint8Array([]),
    stack: new Uint8Array([])
};

const initialRegisters: VmRegisters = {
    eax: new Uint32(0),
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
    checkDuplicateVariableName: boolean;
    maxExecutionStepCount: number;
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
    stackSize: {
        min: 1024,
        max: 1024 * 1024
    }
};

const defaultOptions: VmOptions = {
    checkDuplicateVariableName: true,
    maxExecutionStepCount: 3000,
    stackSize: 1024
};

/**
 * An IR Virtual Machine instance.
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
        if (options.maxExecutionStepCount !== undefined) {
            options.maxExecutionStepCount = Math.max(
                options.maxExecutionStepCount,
                vmOptionLimits.maxExecutionStepCount.min
            );

            options.maxExecutionStepCount = Math.min(
                options.maxExecutionStepCount,
                vmOptionLimits.maxExecutionStepCount.max
            );
        }

        Object.assign(this.options, options);
    }

    /**
     * Keeps current instructions in memory and reset rest of the VM to initial state.
     * @public
     */
    reset() {
        Object.assign(this.memory.text, initialMemory.text);
        Object.assign(this.memory.bss, initialMemory.bss);
        Object.assign(this.memory.stack, initialMemory.stack);
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
     * Read instructions when the VM is in `"INITIAL"` state and do the following:
     * - Decode instructions into text, reporting errors
     * - Construct label table
     * - Construct function table
     * - Construct global variable table
     * - Check the existence of main function
     *
     * If successful, `this.executionStatus.state` will be set to `"FREE"`;
     * If an error is detected, `this.executionStatus.state` will be set to
     * `"STATIC_CHECK_FAILED"` with error message(s) set.
     *
     * Note that runtime errors are not examined here.
     * @public
     */
    decodeInstructions() {
        if (this.executionStatus.state != "INITIAL") {
            return;
        }
        // Go through each line of IR code
        for (let i = 0; i < this.memory.instructions.length; i++) {
            const decoded = this.decoder.decode(this.memory.instructions[i], i);
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

            this.memory.text.push(decoded);
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
                case "GLOBAL_DEC":
                    this.tables.globalVariableTable[
                        (<DecodedGlobalDec>decoded.value!).id
                    ] = {
                        address: currentAddress,
                        size: (<DecodedGlobalDec>decoded.value!).size,
                        location: "BSS"
                    };
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

        if (this.executionStatus.state === "INITIAL") {
            this.executionStatus.state = "FREE";
        }
    }
}

export default new Vm();
