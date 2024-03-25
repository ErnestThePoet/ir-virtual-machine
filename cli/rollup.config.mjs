import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
    input: "tsc_out/cli/src/irvm.mjs",
    output: {
        file: "build/irvm.mjs",
        format: "es"
    },
    // commonjs is for lodash
    plugins: [commonjs(), nodeResolve(), terser()]
};
