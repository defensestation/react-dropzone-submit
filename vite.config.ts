import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from "vite-plugin-dts"
import path from "path"

export default defineConfig({
    plugins: [react(), dts({
        beforeWriteFile: (filePath, content) => {
            return {
                filePath,
                content: content.replace(/@\/(.*)/g, './$1') // 🔁 converts '@/lib/utils' → './lib/utils'
            }
        },
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
            name: "SypherWidgets",
            fileName: (format) => `sypher-widgets-beta.${format}.js`,
            formats: ["es", "cjs"],
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
