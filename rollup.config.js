import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';

const substituteModulePaths = {
}

export default [
    // browser-friendly UMD build
    {
        input: './build/module/index.js',
        output: {
            name: 'webglCore',
            file: pkg.browser,
            format: 'umd'
        },
        plugins: [
            alias(substituteModulePaths),
            nodeResolve({
                browser: true
            }),
            commonjs()
        ]
    }

];