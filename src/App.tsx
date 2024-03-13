import React, { useEffect } from "react";
import { useAppSelector } from "./store/hooks";
import "antd/dist/reset.css";
import { RouterProvider } from "react-router-dom";
import { IntlProvider } from "react-intl";
import router from "./router";

import "@/themes/light.scss";
// Add new theme import here //

/////////////////////////////////

const App: React.FC = () => {
    const currentLocale = useAppSelector(state => state.locale.currentLocale);
    const currentThemeClassName = useAppSelector(
        state => state.theme.currentClassName
    );

    useEffect(() => {
        document.body.className = currentThemeClassName;
    }, [currentThemeClassName]);

    return (
        <IntlProvider messages={currentLocale} locale="en">
            <RouterProvider router={router} />
        </IntlProvider>
    );
};

export default App;
