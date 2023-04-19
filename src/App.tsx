import React from "react";
import { useAppSelector } from "./store/hooks";
import "antd/dist/reset.css";

const App: React.FC = () => {
    const currentLocale = useAppSelector(state => state.locale.currentLocale);

    return (
        <div className="App"></div>
    );
};

export default App;
