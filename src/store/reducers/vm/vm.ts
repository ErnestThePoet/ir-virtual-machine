import type { FormattableMessage } from "@/locales";
import type {
    ConsoleMessagePart,
    VmExecutionState,
    VmLocalVariableDetail,
    VmMemoryUsage,
    VmErrorTable,
    VmVariableDetail,
    VmOptions
} from "@/modules/vm/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { AppDispatch } from "@/store/store";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SingleVmPageState {
    name: string;
    irPath: string;
    isIrChanged: boolean;
    irString: string;

    state: VmExecutionState;
    globalVariableDetails: VmVariableDetail[];
    localVariableDetailsStack: VmLocalVariableDetail[];
    stepCount: number;
    memoryUsage: VmMemoryUsage;

    consoleOutputs: Array<ConsoleMessagePart[]>;
    consoleInputPrompt: FormattableMessage[];
    consoleInput: string;

    options: VmOptions;
    staticErrorTable: VmErrorTable;
    runtimeErrorTable: VmErrorTable;
    currentLineNumber: number;
    shouldIndicateCurrentLineNumber: boolean;
}

interface VmState {
    vmPageStates: SingleVmPageState[];
    activeVmIndex: number;
}

const initialState: VmState = {
    vmPageStates: [],
    activeVmIndex: 0
};

export const vmSlice = createSlice({
    name: "vm",
    initialState,
    reducers: {
        setActiveVmIndex: (state, action: PayloadAction<number>) => {
            state.activeVmIndex = action.payload;
        },
        addVmPageState: (state, action: PayloadAction<SingleVmPageState>) => {
            state.vmPageStates.push(action.payload);
            state.activeVmIndex = state.vmPageStates.length - 1;
        },
        deleteVmPageState: (state, action: PayloadAction<number>) => {
            // If active VM is left to the closed one, do nothing.
            // If active VM is the closed one, and is the right most
            // VM, make its left VM active. Otherwise make its right
            // VM active.
            // If active VM is right to the closed one, keep it active
            // by decreasing activeVmIndex.
            if (state.activeVmIndex > action.payload) {
                state.activeVmIndex--;
            } else if (state.activeVmIndex === action.payload) {
                if (state.activeVmIndex === state.vmPageStates.length - 1) {
                    state.activeVmIndex--;
                }
            }

            state.vmPageStates.splice(action.payload, 1);
        },
        setVmPageState: (state, action: PayloadAction<SingleVmPageState>) => {
            state.vmPageStates[state.activeVmIndex] = action.payload;
        },
        setIsIrChanged: (state, action: PayloadAction<boolean>) => {
            state.vmPageStates[state.activeVmIndex].isIrChanged =
                action.payload;
        },
        setIrString: (state, action: PayloadAction<string>) => {
            state.vmPageStates[state.activeVmIndex].irString = action.payload;
        },
        setState: (state, action: PayloadAction<VmExecutionState>) => {
            state.vmPageStates[state.activeVmIndex].state = action.payload;
        },
        setGlobalVariableDetails: (
            state,
            action: PayloadAction<VmVariableDetail[]>
        ) => {
            state.vmPageStates[state.activeVmIndex].globalVariableDetails =
                action.payload;
        },
        setLocalVariableDetailsStack: (
            state,
            action: PayloadAction<VmLocalVariableDetail[]>
        ) => {
            state.vmPageStates[state.activeVmIndex].localVariableDetailsStack =
                action.payload;
        },
        setOptions: (state, action: PayloadAction<VmOptions>) => {
            state.vmPageStates[state.activeVmIndex].options = action.payload;
        },
        setStepCount: (state, action: PayloadAction<number>) => {
            state.vmPageStates[state.activeVmIndex].stepCount = action.payload;
        },
        setMemoryUsage: (state, action: PayloadAction<VmMemoryUsage>) => {
            state.vmPageStates[state.activeVmIndex].memoryUsage =
                action.payload;
        },
        addConsoleOutput: (
            state,
            action: PayloadAction<ConsoleMessagePart[]>
        ) => {
            state.vmPageStates[state.activeVmIndex].consoleOutputs.push(
                action.payload
            );
        },
        clearConsoleOutputs: state => {
            state.vmPageStates[state.activeVmIndex].consoleOutputs = [];
        },
        setConsoleInputPrompt: (
            state,
            action: PayloadAction<FormattableMessage[]>
        ) => {
            state.vmPageStates[state.activeVmIndex].consoleInputPrompt =
                action.payload;
        },
        setConsoleInput: (state, action: PayloadAction<string>) => {
            state.vmPageStates[state.activeVmIndex].consoleInput =
                action.payload;
        },
        setStaticErrorTable: (state, action: PayloadAction<VmErrorTable>) => {
            state.vmPageStates[state.activeVmIndex].staticErrorTable =
                action.payload;
        },
        setRuntimeErrorTable: (state, action: PayloadAction<VmErrorTable>) => {
            state.vmPageStates[state.activeVmIndex].runtimeErrorTable =
                action.payload;
        },
        setCurrentLineNumber: (state, action: PayloadAction<number>) => {
            state.vmPageStates[state.activeVmIndex].currentLineNumber =
                action.payload;
        },
        setShouldIndicateCurrentLineNumber: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.vmPageStates[
                state.activeVmIndex
            ].shouldIndicateCurrentLineNumber = action.payload;
        }
    }
});

export const {
    setActiveVmIndex,
    addVmPageState,
    deleteVmPageState,
    setVmPageState,
    setIsIrChanged,
    setIrString,
    setState,
    setGlobalVariableDetails,
    setLocalVariableDetailsStack,
    setOptions,
    setStepCount,
    setMemoryUsage,
    addConsoleOutput,
    clearConsoleOutputs,
    setConsoleInputPrompt,
    setConsoleInput,
    setStaticErrorTable,
    setRuntimeErrorTable,
    setCurrentLineNumber,
    setShouldIndicateCurrentLineNumber
} = vmSlice.actions;

export const syncVmState = (dispatch: AppDispatch, vm: VmState) => {
    dispatch(setState(vmContainer.at(vm.activeVmIndex).state));
    dispatch(
        setGlobalVariableDetails(
            vmContainer.at(vm.activeVmIndex).globalVariableDetails
        )
    );
    dispatch(
        setLocalVariableDetailsStack(
            vmContainer.at(vm.activeVmIndex).localVariableDetailsStack
        )
    );
    dispatch(setStepCount(vmContainer.at(vm.activeVmIndex).stepCount));
    dispatch(setMemoryUsage(vmContainer.at(vm.activeVmIndex).memoryUsage));
    dispatch(
        setStaticErrorTable(vmContainer.at(vm.activeVmIndex).staticErrorTable)
    );
    dispatch(
        setRuntimeErrorTable(vmContainer.at(vm.activeVmIndex).runtimeErrorTable)
    );
    dispatch(
        setCurrentLineNumber(vmContainer.at(vm.activeVmIndex).currentLineNumber)
    );
};

export default vmSlice.reducer;
