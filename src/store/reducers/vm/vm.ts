import type { FormattableMessage } from "@/locales";
import type {
    ConsoleMessagePart,
    VmExecutionState,
    VmLocalVariableDetail,
    VmMemoryUsage,
    VmErrorItem,
    VmVariableDetail,
    VmOptions,
    VmPeakMemoryUsage
} from "@/modules/vm/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { AppDispatch } from "@/store/store";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const MAX_CONSOLE_OUTPUT_COUNT = 1500;

export interface SingleVmPageState {
    // ID is used to definitely identify a VM
    id: string;
    name: string;
    irPath: string;
    isIrChanged: boolean;
    irString: string;

    state: VmExecutionState;
    globalVariableDetails: VmVariableDetail[];
    localVariableDetailsStack: VmLocalVariableDetail[];
    stepCount: number;
    memoryUsage: VmMemoryUsage;
    peakMemoryUsage: VmPeakMemoryUsage;

    consoleOutputs: Array<ConsoleMessagePart[]>;
    consoleInputPrompt: FormattableMessage[];
    consoleInput: string;

    options: VmOptions;
    staticErrors: VmErrorItem[];
    runtimeErrors: VmErrorItem[];
    currentLineNumber: number;
    shouldIndicateCurrentLineNumber: boolean;

    localVariableTablePageIndex: number;
}

interface VmState {
    vmPageStates: SingleVmPageState[];
    activeVmIndex: number;
}

const initialState: VmState = {
    vmPageStates: [],
    activeVmIndex: -1 // This enables auto-focus of IR editor when user creates/imports first VM
};

const vmIdIndexTable: { [id: string]: number | undefined } = {};

export const vmSlice = createSlice({
    name: "vm",
    initialState,
    reducers: {
        setActiveVmIndex: (state, action: PayloadAction<number>) => {
            state.activeVmIndex = action.payload;
        },
        setName: (
            state,
            action: PayloadAction<{ index: number; newName: string }>
        ) => {
            state.vmPageStates[action.payload.index].name =
                action.payload.newName;
        },
        addVmPageState: (
            state,
            action: PayloadAction<Omit<SingleVmPageState, "id">>
        ) => {
            const id = uuidv4();
            state.vmPageStates.push({ ...action.payload, id });
            state.activeVmIndex = state.vmPageStates.length - 1;
            vmIdIndexTable[id] = state.vmPageStates.length - 1;
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

            vmIdIndexTable[state.vmPageStates[action.payload].id] = undefined;
            for (
                let i = action.payload + 1;
                i < state.vmPageStates.length;
                i++
            ) {
                vmIdIndexTable[state.vmPageStates[i].id]!--;
            }

            state.vmPageStates.splice(action.payload, 1);
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
        setPeakMemoryUsage: (
            state,
            action: PayloadAction<VmPeakMemoryUsage>
        ) => {
            state.vmPageStates[state.activeVmIndex].peakMemoryUsage =
                action.payload;
        },
        addConsoleOutputs: (
            state,
            action: PayloadAction<Array<ConsoleMessagePart[]>>
        ) => {
            const currentCount =
                state.vmPageStates[state.activeVmIndex].consoleOutputs.length;
            const addCount = action.payload.length;

            if (addCount >= MAX_CONSOLE_OUTPUT_COUNT) {
                state.vmPageStates[state.activeVmIndex].consoleOutputs =
                    action.payload.slice(addCount - MAX_CONSOLE_OUTPUT_COUNT);
            } else {
                if (currentCount + addCount > MAX_CONSOLE_OUTPUT_COUNT) {
                    state.vmPageStates[state.activeVmIndex].consoleOutputs =
                        state.vmPageStates[
                            state.activeVmIndex
                        ].consoleOutputs.slice(
                            currentCount + addCount - MAX_CONSOLE_OUTPUT_COUNT
                        );
                }

                state.vmPageStates[state.activeVmIndex].consoleOutputs.push(
                    ...action.payload
                );
            }
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
        setStaticErrors: (state, action: PayloadAction<VmErrorItem[]>) => {
            state.vmPageStates[state.activeVmIndex].staticErrors =
                action.payload;
        },
        setRuntimeErrors: (state, action: PayloadAction<VmErrorItem[]>) => {
            state.vmPageStates[state.activeVmIndex].runtimeErrors =
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
        },
        setLocalVariableTablePageIndex: (
            state,
            action: PayloadAction<number>
        ) => {
            state.vmPageStates[
                state.activeVmIndex
            ].localVariableTablePageIndex = action.payload;
        }
    }
});

export const {
    setActiveVmIndex,
    setName,
    addVmPageState,
    deleteVmPageState,
    setIsIrChanged,
    setIrString,
    setState,
    setGlobalVariableDetails,
    setLocalVariableDetailsStack,
    setOptions,
    setStepCount,
    setMemoryUsage,
    setPeakMemoryUsage,
    addConsoleOutputs,
    clearConsoleOutputs,
    setConsoleInputPrompt,
    setConsoleInput,
    setStaticErrors,
    setRuntimeErrors,
    setCurrentLineNumber,
    setShouldIndicateCurrentLineNumber,
    setLocalVariableTablePageIndex
} = vmSlice.actions;

export const syncVmState = (dispatch: AppDispatch, vmId: string) => {
    const vmIndex = vmIdIndexTable[vmId];

    if (vmIndex === undefined) {
        return;
    }

    dispatch(setState(vmContainer.at(vmIndex).state));
    dispatch(
        setGlobalVariableDetails(vmContainer.at(vmIndex).globalVariableDetails)
    );
    dispatch(
        setLocalVariableDetailsStack(
            vmContainer.at(vmIndex).localVariableDetailsStack
        )
    );
    dispatch(setOptions(vmContainer.at(vmIndex).currentOptions));
    dispatch(setStepCount(vmContainer.at(vmIndex).stepCount));
    dispatch(setMemoryUsage(vmContainer.at(vmIndex).memoryUsage));
    dispatch(
        setPeakMemoryUsage(vmContainer.at(vmIndex).currentPeakMemoryUsage)
    );
    dispatch(setStaticErrors(vmContainer.at(vmIndex).staticErrors));
    dispatch(setRuntimeErrors(vmContainer.at(vmIndex).runtimeErrors));
    dispatch(setCurrentLineNumber(vmContainer.at(vmIndex).currentLineNumber));
    vmContainer
        .at(vmIndex)
        .flushWriteBuffer(writeBuffer =>
            dispatch(addConsoleOutputs(writeBuffer))
        );
};

export default vmSlice.reducer;
