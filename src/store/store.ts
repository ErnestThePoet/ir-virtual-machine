import { configureStore } from "@reduxjs/toolkit";
import localeReducer from "./reducers/locale/locale";
import themeReducer from "./reducers/theme/theme";

const store = configureStore({
    reducer: {
        locale: localeReducer,
        theme: themeReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
