import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigpaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    build: {
        outDir: "./dist_netlify"
    },
    server: {
        host: true
    },
    plugins: [react(), tsconfigpaths()]
});
