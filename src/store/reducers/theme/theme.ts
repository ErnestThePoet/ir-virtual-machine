import { createSlice } from "@reduxjs/toolkit";
import type { AppTheme } from "@/themes";
import themes from "@/themes";

interface ThemeState {
    currentTheme: AppTheme;
}

const initialState: ThemeState = {
    currentTheme: themes[0].theme
};

export const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        switchTheme: (state, action) => {
            state.currentTheme = action.payload;
        }
    }
});

export const { switchTheme } = themeSlice.actions;
export default themeSlice.reducer;
