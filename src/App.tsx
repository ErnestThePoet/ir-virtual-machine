import React, { useEffect } from "react";
import { useAppSelector } from "./store/hooks";
import "antd/dist/reset.css";
import { IntlProvider } from "react-intl";

import { loader } from "@monaco-editor/react";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

import "@/themes/light.scss";
import Home from "./pages/Home";
// Add new theme import here //

/////////////////////////////////

self.MonacoEnvironment = {
    getWorker(_, label) {
        if (label === "json") {
            return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
            return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
            return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
            return new tsWorker();
        }
        return new editorWorker();
    }
};

loader.config({ monaco });

loader.init();

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
            <Home />
        </IntlProvider>
    );
};

export default App;
