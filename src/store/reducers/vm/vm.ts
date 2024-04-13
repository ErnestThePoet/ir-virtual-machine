import type { FormattableMessage } from "@/locales";
import { MAX_CONSOLE_OUTPUT_COUNT } from "@/modules/constants";
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
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

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

    localVariableTablesPagination: {
        size: number;
        currentIndex: number;
    };
}

interface VmState {
    vmPageStates: SingleVmPageState[];
    activeVmIndex: number;
}

const initialState: VmState = {
    vmPageStates: [],
    activeVmIndex: -1 // This enables auto-focus of IR editor when user creates/imports first VM
};

const addVmConsoleOutputs = (
    state: VmState,
    messages: ConsoleMessagePart[][]
) => {
    const currentCount =
        state.vmPageStates[state.activeVmIndex].consoleOutputs.length;
    const addCount = messages.length;

    if (addCount >= MAX_CONSOLE_OUTPUT_COUNT) {
        state.vmPageStates[state.activeVmIndex].consoleOutputs = messages.slice(
            addCount - MAX_CONSOLE_OUTPUT_COUNT
        );
    } else {
        if (currentCount + addCount > MAX_CONSOLE_OUTPUT_COUNT) {
            state.vmPageStates[state.activeVmIndex].consoleOutputs =
                state.vmPageStates[state.activeVmIndex].consoleOutputs.slice(
                    currentCount + addCount - MAX_CONSOLE_OUTPUT_COUNT
                );
        }

        state.vmPageStates[state.activeVmIndex].consoleOutputs.push(
            ...messages
        );
    }
};

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
        setIsIrChanged: (state, action: PayloadAction<boolean>) => {
            state.vmPageStates[state.activeVmIndex].isIrChanged =
                action.payload;
        },
        addConsoleOutputs: (
            state,
            action: PayloadAction<Array<ConsoleMessagePart[]>>
        ) => {
            addVmConsoleOutputs(state, action.payload);
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
        setShouldIndicateCurrentLineNumber: (
            state,
            action: PayloadAction<boolean>
        ) => {
            state.vmPageStates[
                state.activeVmIndex
            ].shouldIndicateCurrentLineNumber = action.payload;
        },
        setLocalVariableTablesPagination: (
            state,
            action: PayloadAction<{
                size?: number;
                currentIndex?: number;
            }>
        ) => {
            state.vmPageStates[
                state.activeVmIndex
            ].localVariableTablesPagination = {
                ...state.vmPageStates[state.activeVmIndex]
                    .localVariableTablesPagination,
                ...action.payload
            };
        },
        reset: state => {
            state.vmPageStates[
                state.activeVmIndex
            ].shouldIndicateCurrentLineNumber = false;
            state.vmPageStates[state.activeVmIndex].consoleInputPrompt = [];
            state.vmPageStates[state.activeVmIndex].consoleInput = "";
            state.vmPageStates[
                state.activeVmIndex
            ].localVariableTablesPagination = {
                ...state.vmPageStates[state.activeVmIndex]
                    .localVariableTablesPagination,
                currentIndex: 1
            };
        },
        resetAndSetIrString: (state, action: PayloadAction<string>) => {
            state.vmPageStates[
                state.activeVmIndex
            ].shouldIndicateCurrentLineNumber = false;
            state.vmPageStates[state.activeVmIndex].consoleInputPrompt = [];
            state.vmPageStates[state.activeVmIndex].consoleInput = "";
            state.vmPageStates[
                state.activeVmIndex
            ].localVariableTablesPagination = {
                ...state.vmPageStates[state.activeVmIndex]
                    .localVariableTablesPagination,
                currentIndex: 1
            };
            state.vmPageStates[state.activeVmIndex].irString = action.payload;
            state.vmPageStates[state.activeVmIndex].isIrChanged = true;
        },
        clearConsoleInputAndPrompt: state => {
            state.vmPageStates[state.activeVmIndex].consoleInputPrompt = [];
            state.vmPageStates[state.activeVmIndex].consoleInput = "";
        },
        clearConsoleInputAndOutput: state => {
            state.vmPageStates[state.activeVmIndex].consoleOutputs = [];
            state.vmPageStates[state.activeVmIndex].consoleInput = "";
        },
        syncVmState: state => {
            const currentVm = vmContainer.at(state.activeVmIndex);

            state.vmPageStates[state.activeVmIndex].state = currentVm.state;
            state.vmPageStates[state.activeVmIndex].globalVariableDetails =
                currentVm.globalVariableDetails;
            state.vmPageStates[state.activeVmIndex].localVariableDetailsStack =
                currentVm.localVariableDetailsStack;
            state.vmPageStates[state.activeVmIndex].options =
                currentVm.currentOptions;
            state.vmPageStates[state.activeVmIndex].stepCount =
                currentVm.stepCount;
            state.vmPageStates[state.activeVmIndex].memoryUsage =
                currentVm.memoryUsage;
            state.vmPageStates[state.activeVmIndex].peakMemoryUsage =
                currentVm.currentPeakMemoryUsage;
            state.vmPageStates[state.activeVmIndex].staticErrors =
                currentVm.staticErrors;
            state.vmPageStates[state.activeVmIndex].runtimeErrors =
                currentVm.runtimeErrors;
            state.vmPageStates[state.activeVmIndex].currentLineNumber =
                currentVm.currentLineNumber;

            currentVm.flushWriteBuffer(writeBuffer =>
                addVmConsoleOutputs(state, writeBuffer)
            );
        }
    }
});

export const {
    setActiveVmIndex,
    setName,
    addVmPageState,
    deleteVmPageState,
    setIsIrChanged,
    addConsoleOutputs,
    setConsoleInputPrompt,
    setConsoleInput,
    setShouldIndicateCurrentLineNumber,
    setLocalVariableTablesPagination,
    reset,
    resetAndSetIrString,
    clearConsoleInputAndPrompt,
    clearConsoleInputAndOutput,
    syncVmState
} = vmSlice.actions;

export default vmSlice.reducer;
