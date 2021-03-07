import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import camelCase from 'lodash.camelcase';
import typescript from '@rollup/plugin-typescript';

const pkg = require('./package.json');

const libraryName = 'rxjs-audio';

export default {
  input: `src/index.ts`,
  output: [
    { file: pkg.main, name: camelCase(libraryName), format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: ['rxjs'],
  watch: {
    include: 'src/**'
  },
  plugins: [
    // Compile TypeScript files
    typescript(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/plugins/tree/master/packages/node-resolve
    nodeResolve()
  ]
};
