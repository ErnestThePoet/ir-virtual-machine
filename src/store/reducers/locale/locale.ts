import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
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
        setLocale: (state, action: PayloadAction<AppLocale>) => {
            state.currentLocale = action.payload;
        }
    }
});

export const { setLocale } = localeSlice.actions;
export default localeSlice.reducer;
