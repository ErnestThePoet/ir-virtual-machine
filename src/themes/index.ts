import light from "./light";
// Add new theme import here //

//////////////////////////////////

export type AppTheme = typeof light;
export type AppThemeKey = keyof typeof light;

const themes: { name: string; theme: AppTheme }[] = [
    {
        name: "Light",
        theme: light
    }
    // Add new theme entry here //

    /////////////////////////////////
];

export default themes;
