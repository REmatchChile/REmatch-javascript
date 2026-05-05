import REmatchModule from "./rematch-bindings";

async function initREmatch() {
  const wasmModule = await REmatchModule();
  return new REmatchInstance(wasmModule);
}

class _Reader {
  constructor(cppReader) {
    this._cppReader = cppReader;
  }
}

class REmatchInstance {
  constructor(wasmModule) {
    this._wasmModule = wasmModule;
    this.Flags = this._wasmModule.cppFlags;
    this.DEFAULT_MAX_MEMPOOL_DUPLICATIONS = this._wasmModule.DEFAULT_MAX_MEMPOOL_DUPLICATIONS;
    this.DEFAULT_MAX_DETERMINISTIC_STATES = this._wasmModule.DEFAULT_MAX_DETERMINISTIC_STATES;
    this.DEFAULT_STREAM_BUFFER_SIZE = this._wasmModule.DEFAULT_STREAM_BUFFER_SIZE;
    this._wasmModule.onAbort = () => {
      this.onAbort();
    };
  }

  reql(
    pattern,
    flags = this.Flags.NONE,
    max_mempool_duplications = this.DEFAULT_MAX_MEMPOOL_DUPLICATIONS,
    max_deterministic_states = this.DEFAULT_MAX_DETERMINISTIC_STATES,
    buffer_size = this.DEFAULT_STREAM_BUFFER_SIZE
  ) {
    const cppQuery = this._wasmModule.cppReql(pattern, flags, max_mempool_duplications, max_deterministic_states, buffer_size);
    return new Query(cppQuery);
  }

  multiReql(
    pattern,
    flags = this.Flags.NONE,
    max_mempool_duplications = this.DEFAULT_MAX_MEMPOOL_DUPLICATIONS,
    max_deterministic_states = this.DEFAULT_MAX_DETERMINISTIC_STATES,
    buffer_size = this.DEFAULT_STREAM_BUFFER_SIZE
  ) {
    const cppMultiQuery = this._wasmModule.cppMultiReql(
      pattern,
      flags,
      max_mempool_duplications,
      max_deterministic_states,
      buffer_size
    );
    return new MultiQuery(cppMultiQuery);
  }

  getExceptionMessage(exception) {
    return this._wasmModule.getExceptionMessage(exception);
  }

  onAbort() {
    console.error("REmatch instance aborted!");
  }

  Reader(path) {
    const wrapper = new this._wasmModule.cppReaderWrapper(path);
    return new _Reader(wrapper);
  }
}

class Match {
  constructor(cppMatch) {
    this._cppMatch = cppMatch;
  }

  start(key) {
    let start = undefined;
    if (typeof key === "number") {
      start = this._cppMatch.startIndex(key);
    } else if (typeof key === "string") {
      start = this._cppMatch.startVar(key);
    }

    if (start !== undefined) return Number(start);

    throw new Error("key must be number or string");
  }

  end(key) {
    let end = undefined;
    if (typeof key === "number") {
      end = this._cppMatch.endIndex(key);
    } else if (typeof key === "string") {
      end = this._cppMatch.endVar(key);
    }

    if (end !== undefined) return Number(end);

    throw new Error("key must be number or string");
  }

  span(key) {
    let span = undefined;
    if (typeof key === "number") {
      span = this._cppMatch.spanIndex(key);
    } else if (typeof key === "string") {
      span = this._cppMatch.spanVar(key);
    }

    if (span !== undefined) return span.map((pos) => Number(pos));

    throw new Error("key must be number or string");
  }

  group(key) {
    let group = undefined;
    if (typeof key === "number") {
      group = this._cppMatch.groupIndex(key);
    } else if (typeof key === "string") {
      group = this._cppMatch.groupVar(key);
    }

    if (group !== undefined) return group;

    throw new Error("key must be number or string");
  }

  empty() {
    return this._cppMatch.empty();
  }

  variables() {
    const cppVector = this._cppMatch.variables();
    const res = _cppVectorToArray(cppVector);
    cppVector.delete();
    return res;
  }

  toString() {
    return this._cppMatch.toString();
  }

  free() {
    this._cppMatch.delete();
  }
}

class MatchGenerator {
  constructor(cppMatchGenerator) {
    this._cppMatchGenerator = cppMatchGenerator;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        if (this._cppMatchGenerator.hasValue()) {
          const cppMatch = this._cppMatchGenerator.get();
          this._cppMatchGenerator.next();
          return { value: new Match(cppMatch) };
        }

        return { done: true };
      },
    };
  }

  free() {
    this._cppMatchGenerator.delete();
  }
}

class Query {
  constructor(cppQuery) {
    this._cppQuery = cppQuery;
  }

  findOne(document) {

    if (typeof document === "string") {
      const cppMatch = this._cppQuery.findone(document);
      return new Match(cppMatch);
    } else if (document instanceof _Reader) {
      const cppMatch = this._cppQuery.findoneStream(document._cppReader);
      return new Match(cppMatch);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  findMany(document, limit) {
    if (typeof document === "string") {
      const cppMatches = this._cppQuery.findmany(document, limit);
      return _cppVectorToArray(cppMatches).map((cppMatch) => new Match(cppMatch));
    } else if (document instanceof _Reader) {
      const cppMatches = this._cppQuery.findmanyStream(document._cppReader, limit);
      return _cppVectorToArray(cppMatches).map((cppMatch) => new Match(cppMatch));
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  findAll(document) {
    if (typeof document === "string") {
      const cppMatches = this._cppQuery.findall(document);
      return _cppVectorToArray(cppMatches).map((cppMatch) => new Match(cppMatch));
    } else if (document instanceof _Reader) {
      const cppMatches = this._cppQuery.findallStream(document._cppReader);
      return _cppVectorToArray(cppMatches).map((cppMatch) => new Match(cppMatch));
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  findIter(document) {
    if (typeof document === "string") {
      const cppMatchGenerator = this._cppQuery.finditer(document);
      return new MatchGenerator(cppMatchGenerator);
    } else if (document instanceof _Reader) {
      const cppMatchGenerator = this._cppQuery.finditerStream(document._cppReader);
      return new MatchGenerator(cppMatchGenerator);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  check(document) {
    if (typeof document === "string") {
      return this._cppQuery.check(document);
    } else if (document instanceof _Reader) {
      return this._cppQuery.checkStream(document._cppReader);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  variables() {
    const cppVector = this._cppQuery.variables();
    const res = _cppVectorToArray(cppVector);
    cppVector.delete();
    return res;
  }

  free() {
    this._cppQuery.delete();
  }
}

class MultiMatch {
  constructor(cppMultiMatch) {
    this._cppMultiMatch = cppMultiMatch;
  }

  spans(key) {
    let cppSpans = undefined;
    if (typeof key === "number") {
      cppSpans = this._cppMultiMatch.spansIndex(key);
    } else if (typeof key === "string") {
      cppSpans = this._cppMultiMatch.spansVar(key);
    }

    if (cppSpans !== undefined) {
      const res = _cppVectorToArray(cppSpans);
      cppSpans.delete();
      return res.map(([from, to]) => [Number(from), Number(to)]);
    }

    throw new Error("key must be number or string");
  }

  groups(key) {
    let cppGroups = undefined;
    if (typeof key === "number") {
      cppGroups = this._cppMultiMatch.groupsIndex(key);
    } else if (typeof key === "string") {
      cppGroups = this._cppMultiMatch.groupsVar(key);
    }

    if (cppGroups !== undefined) {
      const res = _cppVectorToArray(cppGroups);
      cppGroups.delete();
      return res;
    }

    throw new Error("key must be number or string");
  }

  submatch(span) {
    return new MultiMatch(this._cppMultiMatch.submatch(span));
  }

  empty() {
    return this._cppMultiMatch.empty();
  }

  variables() {
    const cppVector = this._cppMultiMatch.variables();
    const res = _cppVectorToArray(cppVector);
    cppVector.delete();
    return res;
  }

  toString() {
    return this._cppMultiMatch.toString();
  }

  free() {
    this._cppMultiMatch.delete();
  }
}

class MultiMatchGenerator {
  constructor(cppMultiMatchGenerator) {
    this._cppMultiMatchGenerator = cppMultiMatchGenerator;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        if (this._cppMultiMatchGenerator.hasValue()) {
          const cppMultiMatch = this._cppMultiMatchGenerator.get();
          this._cppMultiMatchGenerator.next();
          return { value: new MultiMatch(cppMultiMatch) };
        }

        return { done: true };
      },
    };
  }

  free() {
    this._cppMultiMatchGenerator.delete();
  }
}

class MultiQuery {
  constructor(cppMultiQuery) {
    this._cppMultiQuery = cppMultiQuery;
  }

  findOne(document) {
    if (typeof document === "string") {
      const cppMultiMatch = this._cppMultiQuery.findone(document);
      return new MultiMatch(cppMultiMatch);
    } else if (document instanceof _Reader) {
      const cppMultiMatch = this._cppMultiQuery.findoneStream(document._cppReader);
      return new MultiMatch(cppMultiMatch);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  findMany(document, limit) {
    if (typeof document === "string") {
      const cppMultiMatches = this._cppMultiQuery.findmany(document, limit);
      return _cppVectorToArray(cppMultiMatches).map((cppMultiMatch) => new MultiMatch(cppMultiMatch));
    } else if (document instanceof _Reader) {
      const cppMultiMatches = this._cppMultiQuery.findmanyStream(document._cppReader, limit);
      return _cppVectorToArray(cppMultiMatches).map((cppMultiMatch) => new MultiMatch(cppMultiMatch));
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  findAll(document) {
    if (typeof document === "string") {
      const cppMultiMatches = this._cppMultiQuery.findall(document);
      return _cppVectorToArray(cppMultiMatches).map((cppMultiMatch) => new MultiMatch(cppMultiMatch));
    } else if (document instanceof _Reader) {
    } else {
      const cppMultiMatches = this._cppMultiQuery.findallStream(document._cppReader);
      return _cppVectorToArray(cppMultiMatches).map((cppMultiMatch) => new MultiMatch(cppMultiMatch));
      throw new Error("The document must be String or Reader")
    }
  }

  findIter(document) {
    if (typeof document === "string") {
      const cppMultiMatchGenerator = this._cppMultiQuery.finditer(document);
      return new MultiMatchGenerator(cppMultiMatchGenerator);
    } else if (document instanceof _Reader) {
      const cppMultiMatchGenerator = this._cppMultiQuery.finditerStream(document._cppReader);
      return new MultiMatchGenerator(cppMultiMatchGenerator);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  check(document) {
    if (typeof document === "string") {
      return this._cppMultiQuery.check(document);
    } else if (document instanceof _Reader) {
      return this._cppMultiQuery.checkStream(document._cppReader);
    } else {
      throw new Error("The document must be String or Reader")
    }
  }

  variables() {
    const cppVector = this._cppMultiQuery.variables();
    const res = _cppVectorToArray(cppVector);
    cppVector.delete();
    return res;
  }

  free() {
    this._cppMultiQuery.delete();
  }
}

function _cppVectorToArray(wasmVector) {
  const res = new Array(wasmVector.size());
  for (let i = 0; i < wasmVector.size(); ++i) res[i] = wasmVector.get(i);
  return res;
}

export default initREmatch;
