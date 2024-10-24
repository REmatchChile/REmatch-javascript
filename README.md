# REmatch-javascript: REmatch bindings for JavaScript

JavaScript bindings for REmatch, an information extraction focused regex library that uses constant delay algoirthms.

`REmatch-javascript` generated bindings were compiled directly from REmatch's C++ source code using the [emscripten](https://emscripten.org/) compiler.

* [REmatch's Official Website](https://rematch.cl)
* [GitHub repository](https://github.com/REmatchChile/REmatch-javascript)
* [NPM package](https://www.npmjs.com/package/rematch-javascript)
* [Project Wiki](https://github.com/REmatchChile/REmatch/wiki)

## Installation - npm

```bash
npm install rematch-javascript
```

Then you can import the REmatch initializer function with:

```js
import initREmatch from 'rematch-javascript';
```

## Installation

Make the `initREmatch` function available globally in browsers with:

```html
<!-- Direct reference non-minified -->
<script src="./lib/index.umd.js"></script>
<!-- Direct reference minified -->
<script src="./lib/index.umd.min.js"></script>

<!-- unpkg CDN non-minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/index.umd.js"></script>
<!-- unpkg CDN minified -->
<script src="https://unpkg.com/rematch-javascript@latest/lib/index.umd.min.js"></script>

<!-- jsDelivr CDN non-minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/index.umd.js"></script>
<!-- jsDelivr CDN minified -->
<script src="https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/index.umd.min.js"></script>
```

For ESM modules:

```javascript
// Direct reference
import initREmatch from './lib/index.esm.js';

// unpkg CDN
import initREmatch from 'https://unpkg.com/rematch-javascript@latest/lib/index.esm.js';

// jsDelivr CDN
import initREmatch from 'https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/index.esm.js';
```

For CJS modules:

```javascript
// Direct reference
const initREmatch = require('./lib/index.cjs');

// unpkg CDN
const initREmatch = require('https://unpkg.com/rematch-javascript@latest/lib/index.cjs');

// jsDelivr CDN
const initREmatch = require('https://cdn.jsdelivr.net/npm/rematch-javascript@latest/lib/index.cjs');
```

## Usage

As said before, `REmatch-javascript` was built with emscripten, so it uses [WebAssembly](https://developer.mozilla.org/en-US/docs/WebAssembly) to run. The `.wasm` code is embedded directly into the library's code, so it is not needed to bundle or import it.

First you would need to load the REmatch module instance by importing the `initREmatch` function:

```javascript
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
  console.log(`Match: ${match.toString()}`);

  // Current match will no longer be used
  match.free();
}

// Query and MatchIterator will no longer be used
query.free();
matchIterator.free();
```

As you notice in the previous snippet, due the lack of garbage collection in JavaScript, the bindings **should be explicitly freed** when you are done with them. Otherwise, it will lead to memory leaks.

## Development

If you want to update the emscripten bindings, first make sure that you have the [emscripten compiler](https://emscripten.org/) installed. Then, if you want to the latest REmatch, do the following steps:

1. Update the REmatch's submodule (at `/REmatch`) with the latest version
2. Build the emscripten bindings with `npm run build:bindings`
3. Build the project with `npm run build`
