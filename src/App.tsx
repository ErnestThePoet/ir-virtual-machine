import React from "react";
import { useAppSelector } from "./store/hooks";
import "antd/dist/reset.css";
import { RouterProvider } from "react-router-dom";
import { IntlProvider } from "react-intl";
import router from "./router";

const App: React.FC = () => {
    const currentLocale = useAppSelector(state => state.locale.currentLocale);

    return (
        <IntlProvider messages={currentLocale} locale="en">
            <RouterProvider router={router} />
        </IntlProvider>
    );
};

export default App;
