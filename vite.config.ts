import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import path from "path"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        dts({
            include: ['src'],
            insertTypesEntry: true,
            tsconfigPath: './tsconfig.app.json',
            afterDiagnostic: () => { },
        })],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'), // ✅ correct
        },
    },
    css: {
        postcss: path.resolve(__dirname, "postcss.config.js"),
    },
    build: {
        lib: {
            entry: "src/index.ts",
            name: "SypherDropzoneSubmit",
            fileName: (format) => `sypher-widgets-beta.${format}.js`,
            formats: ["es", "umd"],
        },
        rollupOptions: {
            external: ["react", "react-dom"],
            output: {
                globals: {
                    react: "React",
                    "react-dom": "ReactDOM",
                },
            },
        },
    },
})
