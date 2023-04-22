import { createSlice } from "@reduxjs/toolkit";
import { Vm } from "@/modules/vm/vm";

interface VmState {
    vms: {
        name: string;
        irPath: string;
        vm: Vm;
    }[];
    currentVmIndex: number;
}

const initialState: VmState = {
    vms: [],
    currentVmIndex: 0
};

export const vmSlice = createSlice({
    name: "vm",
    initialState,
    reducers: {
        setVms: (state, action) => {
            state.vms = action.payload;
        },
        switchVm: (state, action) => {
            state.currentVmIndex = action.payload;
        },
        updateVm: (state, action) => {
            state.vms[state.currentVmIndex].vm = action.payload;
        }
    }
});

export const { setVms, switchVm, updateVm } = vmSlice.actions;

export default vmSlice.reducer;
