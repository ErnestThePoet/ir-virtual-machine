import { configureStore } from "@reduxjs/toolkit";
import localeReducer from "./reducers/locale/locale";

const store = configureStore({
    reducer: {
        locale: localeReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
