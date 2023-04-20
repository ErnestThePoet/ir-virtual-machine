import zhCn from "./zhcn";
// Add new language import here //

//////////////////////////////////

export type AppLocale = typeof zhCn;
export type AppLocaleKey = keyof typeof zhCn;
export interface FormattableMessage {
    key: AppLocaleKey;
    values?: {};
}

const locales: { name: string; locale: AppLocale }[] = [
    {
        name: "简体中文",
        locale: zhCn
    }
    // Add new language entry here //

    /////////////////////////////////
];

export default locales;
