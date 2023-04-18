import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store/store";
import type { AppLocale } from "@/locales";
import locales from "@/locales";

interface LocaleState {
    currentLocale: AppLocale;
}

const initialState: LocaleState = {
    currentLocale: locales[0].locale
};

export const localeSlice = createSlice({
    name: "locale",
    initialState,
    reducers: {
        switchLocale: (state, action) => {
            state.currentLocale = action.payload;
        }
    }
});

export const { switchLocale } = localeSlice.actions;
export default localeSlice.reducer;
