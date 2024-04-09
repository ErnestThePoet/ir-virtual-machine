import zhCn from "./zhcn";
// Add new language import here //
import en from "./en";
import { IntlShape } from "react-intl";

//////////////////////////////////

export type AppLocale = typeof zhCn;
export type AppLocaleKey = keyof typeof zhCn;
export interface FormattableMessage {
    key: AppLocaleKey;
    values?: Parameters<IntlShape["formatMessage"]>[1];
}

const locales: { name: string; locale: AppLocale }[] = [
    {
        name: "简体中文",
        locale: zhCn
    },
    // Add new language entry here //
    {
        name: "English",
        locale: en
    }
    /////////////////////////////////
];

export default locales;
