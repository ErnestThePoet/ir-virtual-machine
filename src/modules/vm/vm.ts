type VmExecutionState =
    | "INITIAL"
    | "BUSY"
    | "FREE" // 2023.04.18-22:20 就在刚才，我收到她的消息了。我的心情复杂而又幸福。我感到圆满了。一切都值了。请允许我把此时此刻的感受永远记录在这里——与本项目无关。
    | "EXITED_NORMALLY"
    | "EXITED_ABNORMALLY";

// VM Table element types
interface VmLabel {
    address: number;
}

interface VmFunction {
    address: number;
}

interface VmVariable {
    address: number;
    size: number;
}

// VM Component types
interface VmMemory {
    instructions: string[];
    stack: string[];
}

interface VmRegisters {
    eax: number;
    ebp: number;
    esp: number;
    eip: number;
}

interface VmTables {
    labelTable: { [name: string]: VmLabel };
    functionTable: { [name: string]: VmFunction };
    globalVariableTable: { [name: string]: VmVariable };
    variableTableStack: { [name: string]: VmVariable }[];
}

interface VmExecutionStatus {
    stepCount: number;
    state: VmExecutionState;
    message: string;
}

// IrVm uses a custom calling convention called "irdecl".
// Description:
// All variables are global variable

const initialMemory: VmMemory = {
    instructions: [],
    stack: []
};

const initialRegisters: VmRegisters = {
    eax: 0,
    ebp: 0,
    esp: 0,
    eip: 0
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
    message: ""
};

// VM Options type
interface VmOptions {
    checkDuplicateVariableName: boolean;
    maxExecutionStepCount: number;
}

type VmOptionsOptional = Partial<VmOptions>;

export const VM_DEFAULT_MAX_EXECUTION_STEP_COUNT = 3000;
export const VM_MIN_MAX_EXECUTION_STEP_COUNT = 100;
export const VM_MAX_MAX_EXECUTION_STEP_COUNT = 100000;

const defaultOptions: VmOptions = {
    checkDuplicateVariableName: true,
    maxExecutionStepCount: VM_DEFAULT_MAX_EXECUTION_STEP_COUNT
};

/**
 * An IR Virtual Machine instance.
 */
class Vm {
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
    configure(options: VmOptionsOptional) {
        if (options.maxExecutionStepCount !== undefined) {
            options.maxExecutionStepCount = Math.max(
                options.maxExecutionStepCount,
                VM_MIN_MAX_EXECUTION_STEP_COUNT
            );

            options.maxExecutionStepCount = Math.min(
                options.maxExecutionStepCount,
                VM_MAX_MAX_EXECUTION_STEP_COUNT
            );
        }

        Object.assign(this.options, options);
    }

    /**
     * Keeps current instructions in memory and reset rest of the VM to initial state.
     * @public
     */
    reset() {
        this.memory.stack = initialMemory.stack;
        this.registers = initialRegisters;
        this.tables = initialTables;
        this.executionStatus = initialExecutionStatus;
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
     * Read instructions when the VM is in `"INITIAL"` state and do the following:
     * - Construct label table
     * - Construct function table
     * - Construct global variable table
     * - Check the existence of main function
     *
     * If successful, `this.executionStatus.state` will be set to `"FREE"`;
     * If an error is detected, `this.executionStatus.state` will be set to
     * `"EXITED_ABNORMALLY"` with an message in `this.executionStatus.message`.
     *
     * Note that syntax error in IR code is examined at runtime, not here.
     * @public
     */
    preprocessInstructions() {
        if (this.executionStatus.state != "INITIAL") {
            return;
        }
        // Go through each line of IR code
        for (const i of this.memory.instructions) {
        }
    }
}

export default new Vm();
