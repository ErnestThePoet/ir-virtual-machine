import { createSlice } from "@reduxjs/toolkit";

export interface SingleVmPageState {
    name: string;
    irPath: string;
    isIrChanged: boolean;
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
        setActiveVmIndex: (state, action) => {
            state.activeVmIndex = action.payload;
        },
        setVmPageState: (state, action) => {
            state.vmPageStates[action.payload.index] = action.payload.state;
        },
        addVmPageState: (state, action) => {
            state.vmPageStates.push(action.payload);
            state.activeVmIndex = state.vmPageStates.length - 1;
        },
        deleteVmPageState: (state, action) => {
            // If active VM is left to the closed one, do nothing.
            // If active VM is the closed one, and is the right most
            // VM, make its left VM active. Otherwise make its right
            // VM active.
            // If active VM is right to the closed one, keep it active
            // by decreasing activeVmIndex.
            if (state.activeVmIndex > action.payload) {
                state.activeVmIndex--;
            }
            else if (state.activeVmIndex === action.payload) {
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
    addVmPageState,
    deleteVmPageState
} = vmSlice.actions;

export default vmSlice.reducer;
