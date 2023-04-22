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
        switchVm: (state, action) => {
            state.currentVmIndex = action.payload;
        }
    }
});
