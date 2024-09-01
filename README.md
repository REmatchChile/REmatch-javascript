# REmatch-javascript: REmatch bindings for JavaScript (Browser)

JavaScript bindings for REmatch, an information extraction focused regex library that uses constant delay algoirthms.

`REmatch-javascript` generated bindings were compiled directly from REmatch's C++ source code using the [emscripten](https://emscripten.org/) compiler.

* [REmatch's Official Website](https://rematch.cl)
* [GitHub repository](https://github.com/REmatchChile/REmatch-javascript)
* [NPM package](https://www.npmjs.com/package/REmatch-javascript)
* [Project Wiki](https://github.com/REmatchChile/REmatch/wiki)

## Installation - npm

```bash
npm install rematch-javascript
```

Then you can import the REmatch initializer function with:

```js
import initREmatch from 'rematch-javascript';
```

## Installation - browser

Make the `initREmatch` function available globally with:

The IIFE versions

```html
<!-- Direct reference non-minified -->
<script src="./lib/rematch.iife.js"></script>
<!-- Direct reference minified -->
<script src="./lib/rematch.iife.min.js"></script>

<!-- unpkg CDN non-minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/rematch.iife.js"></script>
<!-- unpkg CDN minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/rematch.iife.min.js"></script>

<!-- jsDelivr CDN non-minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.iife.js"></script>
<!-- jsDelivr CDN minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.min.iife.js"></script>
```

The ESM versions

```html
<script type="module">
  // Direct reference non-minified
  import initREmatch from './lib/rematch.esm.js';
  // Direct reference minified
  import initREmatch from './lib/rematch.esm.min.js';
  // unpkg CDN non-minified
  import initREmatch from 'https://unpkg.com/rematch-javascript@latest/lib/rematch.esm.js';
  // unpkg CDN minified
  import initREmatch from 'https://unpkg.com/rematch-javascript@latest/lib/rematch.esm.min.js';
  // jsDelivr CDN non-minified
  import initREmatch from 'https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.esm.js';
  // jsDelivr CDN minified
  import initREmatch from 'https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.esm.min.js';
</script>
```

The UMD versions

```html
<!-- Direct reference non-minified -->
<script src="./lib/rematch.umd.js"></script>
<!-- Direct reference minified -->
<script src="./lib/rematch.umd.min.js"></script>

<!-- unpkg CDN non-minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/rematch.umd.js"></script>
<!-- unpkg CDN minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/rematch.umd.min.js"></script>

<!-- jsDelivr CDN non-minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.umd.js"></script>
<!-- jsDelivr CDN minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/rematch.umd.min.js"></script>
```

## Usage

As said before, `REmatch-javascript` was built with emscripten, so it uses [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) to run. The `.wasm` code is embedded directly into the library's code, so it is not needed to bundle or import it.

First you would need to load the REmatch module instance by importing the `initREmatch` function:

```js
// Create a REmatch module instance
const REmatch = await initREmatch();

// Define the document and pattern to search for
const document = "cperez@gmail.com\npvergara@ing.uc.cl\njuansoto@uc.cl";
const pattern = String.raw`@!domain{(\w+\.)+\w+}(\n|$)`;

// Create a REQL query
const query = REmatch.reql(pattern);

// Execute the query and show the matches
const matchIterator = query.findIter(document);
for (const match of matchIterator) {
  console.log(`Match: "${match.group("domain")}"`);

  // Current match will no longer be used
  match.free();
}

// Query and MatchIterator will no longer be used
query.free();
matchIterator.free();
```

As you notice in the previous snippet, due the lack of garbage collection in JavaScript, the bindings **should be explicitly freed** when you are done with them. Otherwise, it will lead to memory leaks.

## Usage Webpack

One issue that you may encounter is that if you are using `REmatch-javascript` with `Webpack`, you may need to just ignore the polyfill for `module`, by setting:`resolve.fallback.module` to `false`. The rest should be fine.
