import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import babel from 'rollup-plugin-babel';
//import json from 'rollup-plugin-json';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/main.browser.js',
		output: {
			name: 'Report',
			file: pkg.browser,
			format: 'umd',
      compact: true,
      sourcemap: true
		},
    treeshake: true,
		plugins: [
			resolve({
        browser: true,
      }),
			commonjs(),
      terser(),
      babel({
        exclude: 'node_modules/**'
      }),
      /*
      json({
        include: 'fonts/**',
        exclude: [ 'node_modules/**' ],
        compact: true, // Default: false
      })
      */
		]
	},
  // ES module (for bundlers) build.
  {
		input: 'src/main.browser.js',
		external: ['jspdf'],
		output: { file: pkg.module, format: 'es' }
	},
	// CommonJS (for Node) build.
	{
		input: 'src/main.node.js',
		external: ['pdfkit','xmldom','fs'],
		output: [
			{ file: pkg.main, format: 'cjs', interop: false }
		]
	}
];
