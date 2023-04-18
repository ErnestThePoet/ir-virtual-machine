import React from "react";
import { useAppSelector } from "./store/hooks";
import "antd/dist/reset.css";
import { IntlProvider } from "react-intl";

const App: React.FC = () => {
    const currentLocale = useAppSelector(state => state.locale.currentLocale);

    return (
        <IntlProvider messages={currentLocale} locale="en">
            <div className="App"></div>
        </IntlProvider>
    );
};

export default App;
