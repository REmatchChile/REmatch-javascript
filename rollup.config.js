import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import builtins from "rollup-plugin-node-builtins";

const SRC_DIR = "src";
const INPUT = SRC_DIR + "/index.js";
const LIB_DIR = "lib";
const OUTPUT_PREFIX = LIB_DIR + "/browser/rematch";
const MINIFIER = terser({ keep_classnames: true, keep_fnames: true });
const PLUGINS = [nodeResolve({ preferBuiltins: false, browser: true }), , commonjs(), builtins()];

const COMMON_CONFIG = {
  input: INPUT,
  plugins: PLUGINS,
};

const IIFE_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: OUTPUT_PREFIX + ".js",
    format: "iife",
    sourcemap: false,
    name: "initREmatch",
  },
};

const ESM_CONFIG = {
  ...COMMON_CONFIG,
  output: {
    file: OUTPUT_PREFIX + ".esm.js",
    format: "es",
    sourcemap: false,
    name: "REmatch",
  },
};

const IIFE_MIN_CONFIG = {
  ...IIFE_CONFIG,
  output: {
    ...IIFE_CONFIG.output,
    file: OUTPUT_PREFIX + ".min.js",
  },
  plugins: [...IIFE_CONFIG.plugins, MINIFIER],
};

const ESM_MIN_CONFIG = {
  ...ESM_CONFIG,
  output: {
    ...ESM_CONFIG.output,
    file: OUTPUT_PREFIX + ".esm.min.js",
  },
  plugins: [...ESM_CONFIG.plugins, MINIFIER],
};

export default [IIFE_CONFIG, ESM_CONFIG, IIFE_MIN_CONFIG, ESM_MIN_CONFIG];
