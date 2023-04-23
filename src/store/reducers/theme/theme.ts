import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import themes from "@/themes";

interface ThemeState {
    currentClassName: string;
}

const initialState: ThemeState = {
    currentClassName: themes[0].className
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        switchTheme: (state, action: PayloadAction<string>) => {
            state.currentClassName = action.payload;
        }
    }
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;
