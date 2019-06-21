import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import copy from "rollup-copy-plugin"

const packages = require('./package.json');

const ENV = process.env.NODE_ENV;
export default [
    {
        input: 'src/background.js',
        output: {
            file: `dist/background.js`,
            format: 'umd',
            name: 'bundle-name'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            })
        ],
    },
    {
        input: 'src/content.js',
        output: {
            file: `dist/content.js`,
            format: 'umd',
            name: 'content-name'
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            })
        ],
    },
    {
        input: "src/popup.js",
        output: {
            file: "dist/popup.js",
            format: "umd",
            name:"popup=name"
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**',
                runtimeHelpers: true,
            }),
            copy(
                {
                    "src/popup.html":"dist/popup.html",
                    "src/manifest.json":"dist/manifest.json"
                }
            )
        ],

        

        
    }
    
]