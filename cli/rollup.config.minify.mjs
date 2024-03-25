import terser from "@rollup/plugin-terser";

export default [
    {
        input: "build/irvm.js",
        output: {
            file: "build/irvm.js",
            format: "es",
            plugins: [terser()]
        }
    }
];
