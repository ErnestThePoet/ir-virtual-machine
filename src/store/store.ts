import { configureStore } from "@reduxjs/toolkit";
import localeReducer from "./reducers/locale/locale";
import themeReducer from "./reducers/theme/theme";
import vmReducer from "./reducers/vm/vm";

const store = configureStore({
    reducer: {
        locale: localeReducer,
        theme: themeReducer,
        vm: vmReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
