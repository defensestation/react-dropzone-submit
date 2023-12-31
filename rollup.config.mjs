import resolve from '@rollup/plugin-node-resolve';
import {babel} from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json';



import packageJson from './package.json' assert { type: "json" };

export default {
    input: 'src/index.js',
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
            name: 'react-lib'
        },
        {
            file: packageJson.module,
            format: 'esm',
            sourcemap: true
        }
    ],
    plugins: [
        external(),
        resolve({
            extensions: [".js", ".jsx"],
          }),
        commonjs(),
        babel({ 
            exclude: 'node_modules/**',
            presets: ['@babel/env', '@babel/preset-react']
        }),
        postcss(),
        json(),
        terser()
    ],
    external: ["react", "react-dom"],
}