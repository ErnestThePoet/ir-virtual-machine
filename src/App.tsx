import React from "react";
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

    return (
        <IntlProvider messages={currentLocale} locale="en">
            <div className={currentThemeClassName}>
                <RouterProvider router={router} />
            </div>
        </IntlProvider>
    );
};

export default App;
