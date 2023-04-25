import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigpaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/IR-Virtual-Machine",
    build: {
        outDir: "./docs"
    },
    server: {
        host: true
    },
    plugins: [react(), tsconfigpaths()]
});
