import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface SingleVmPageState {
    name: string;
    irPath: string;
    isIrChanged: boolean;
    irString: string;
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
        setVmPageState: (
            state,
            action: PayloadAction<{ index: number; state: SingleVmPageState }>
        ) => {
            state.vmPageStates[action.payload.index] = action.payload.state;
        },
        setIsIrChanged: (
            state,
            action: PayloadAction<{ index: number; isIrChanged: boolean }>
        ) => {
            state.vmPageStates[action.payload.index].isIrChanged =
                action.payload.isIrChanged;
        },
        setIrString: (
            state,
            action: PayloadAction<{ index: number; irString: string }>
        ) => {
            state.vmPageStates[action.payload.index].irString =
                action.payload.irString;
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
        }
    }
});

export const {
    setActiveVmIndex,
    setVmPageState,
    setIsIrChanged,
    setIrString,
    addVmPageState,
    deleteVmPageState
} = vmSlice.actions;

export default vmSlice.reducer;
