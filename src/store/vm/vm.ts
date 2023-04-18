import { createSlice } from "@reduxjs/toolkit";

export const vmSlice = createSlice({
    name: "vm",
    initialState,
    reducers: {
        loadNewInstructions: (state, action) => {
            state = initialState;
            state.instructions = action.payload;
        },
        preprocessInstructions: state => {
            
        },
        runSingleStep: state => {
            if (
                state.executionState !== "INITIAL" &&
                state.executionState !== "FREE"
            ) {
                return;
            }
        }
    }
});
