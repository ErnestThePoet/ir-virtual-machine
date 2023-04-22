import { createSlice } from "@reduxjs/toolkit";
import { Vm } from "@/modules/vm/vm";

interface SingleVmPageState {
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
        switchActiveVm: (state, action) => {
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
            if (state.activeVmIndex >= action.payload.index) {
                state.activeVmIndex--;
            }
            state.vmPageStates.splice(action.payload.index, 1);
        }
    }
});

export const {
    switchActiveVm,
    setVmPageState,
    addVmPageState,
    deleteVmPageState
} = vmSlice.actions;

export default vmSlice.reducer;
