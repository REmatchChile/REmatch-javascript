import REmatchModule from "./rematch-bindings";

const DEFAULT_QUERY_FLAGS = {
  multiMatch: false,
  lineByLine: false,
  maxMempoolDuplications: 8,
  maxDeterministicStates: 1024,
};

async function initREmatch() {
  const wasmModule = await REmatchModule();
  return new REmatchInterface(wasmModule);
}

class REmatchInterface {
  constructor(wasmModule, options) {
    this._wasmModule = wasmModule;
  }

  reql(pattern, flags = DEFAULT_QUERY_FLAGS) {
    if (flags.multiMatch) return new MultiQuery(pattern, flags, this._wasmModule);

    return new Query(pattern, flags, this._wasmModule);
  }
}

class Match {
  constructor(wasmMatch) {
    this._wasmMatch = wasmMatch;
  }

  start(key) {
    if (typeof key === "number") {
      return this._wasmMatch.start_index(key);
    } else if (typeof key === "string") {
      return this._wasmMatch.start_var(key);
    }

    throw new Error("key must be number or string");
  }

  end(key) {
    if (typeof key === "number") {
      return this._wasmMatch.end_index(key);
    } else if (typeof key === "string") {
      return this._wasmMatch.end_var(key);
    }

    throw new Error("key must be number or string");
  }

  span(key) {
    let span = undefined;
    if (typeof key === "number") {
      span = this._wasmMatch.span_index(key);
    } else if (typeof key === "string") {
      span = this._wasmMatch.span_var(key);
    }

    if (span) return span.map((pos) => Number(pos));

    throw new Error("key must be number or string");
  }

  group(key) {
    if (typeof key === "number") {
      return this._wasmMatch.group_index(key);
    } else if (typeof key === "string") {
      return this._wasmMatch.group_var(key);
    }

    throw new Error("key must be number or string");
  }

  empty() {
    return this._wasmMatch.empty();
  }

  variables() {
    const wasmVector = this._wasmMatch.variables();
    const res = _wasmVectorToArray(wasmVector);
    wasmVector.delete();
    return res;
  }

  toString() {
    const res = this.variables().map((v) => `${v} -> [${this.start(v)}, ${this.end(v)}>`);
    if (res.length) return res.join("\n");

    return "Empty match";
  }

  free() {
    this._wasmMatch.delete();
  }
}

function _flagsToWasmFlags(flags, wasmModule) {
  const wasmFlags = new wasmModule.Flags();
  flags.line_by_line = flags.lineByLine ?? DEFAULT_QUERY_FLAGS.lineByLine;
  flags.max_mempool_duplications = flags.maxMempoolDuplications ?? DEFAULT_QUERY_FLAGS.maxMempoolDuplications;
  flags.max_deterministic_states = flags.maxDeterministicStates ?? DEFAULT_QUERY_FLAGS.maxDeterministicStates;

  return wasmFlags;
}

function _wasmVectorToArray(wasmVector) {
  const res = new Array(wasmVector.size());
  for (let i = 0; i < wasmVector.size(); ++i) res[i] = wasmVector.get(i);
  return res;
}

class MatchIterator {
  constructor(wasmMatchIterator) {
    this._wasmMatchIterator = wasmMatchIterator;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        const wasmMatch = this._wasmMatchIterator.next();
        if (wasmMatch) return { value: new Match(wasmMatch) };

        return { done: true };
      },
    };
  }

  variables() {
    const wasmVector = this._wasmMatchIterator.variables();
    const res = _wasmVectorToArray(wasmVector);
    wasmVector.delete();
    return res;
  }

  free() {
    this._wasmMatchIterator.delete();
  }
}

class Query {
  constructor(pattern, flags, wasmModule) {
    const wasmFlags = _flagsToWasmFlags(flags, wasmModule);
    this._wasmQuery = new wasmModule.Query(pattern, wasmFlags);
  }

  findIter(document) {
    const wasmMatchIterator = this._wasmQuery.finditer(document);
    return new MatchIterator(wasmMatchIterator);
  }

  findOne(document) {
    const wasmMatch = this._wasmQuery.findone(document);
    if (wasmMatch) return new Match(wasmMatch);
    return null;
  }

  check(document) {
    return this._wasmQuery.check(document);
  }

  free() {
    this._wasmQuery.delete();
  }
}

class MultiMatch {
  constructor(wasmMultiMatch) {
    this._wasmMultiMatch = wasmMultiMatch;
  }

  spans(key) {
    let wasmSpans = undefined;
    if (typeof key === "number") {
      wasmSpans = this._wasmMultiMatch.spans_index(key);
    } else if (typeof key === "string") {
      wasmSpans = this._wasmMultiMatch.spans_var(key);
    }

    if (wasmSpans) {
      const res = _wasmVectorToArray(wasmSpans);
      wasmSpans.delete();
      return res;
    }

    throw new Error("key must be number or string");
  }

  groups(key) {
    let wasmGroups = undefined;
    if (typeof key === "number") {
      wasmGroups = this._wasmMultiMatch.groups_index(key);
    } else if (typeof key === "string") {
      wasmGroups = this._wasmMultiMatch.groups_var(key);
    }

    if (wasmGroups) {
      const res = _wasmVectorToArray(wasmGroups);
      wasmGroups.delete();
      return res;
    }

    throw new Error("key must be number or string");
  }

  submatch(span) {
    return new MultiMatch(this._wasmMultiMatch.submatch(span));
  }

  empty() {
    return this._wasmMultiMatch.empty();
  }

  free() {
    this._wasmMultiMatch.delete();
  }
}

class MultiMatchIterator {
  constructor(wasmMultiMatchIterator) {
    this._wasmMultiMatchIterator = wasmMultiMatchIterator;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        const wasmMultiMatch = this._wasmMultiMatchIterator.next();
        if (wasmMultiMatch) return { value: new MultiMatch(wasmMultiMatch) };

        return { done: true };
      },
    };
  }

  variables() {
    const wasmVector = this._wasmMultiMatchIterator.variables();
    const res = _wasmVectorToArray(wasmVector);
    wasmVector.delete();
    return res;
  }

  free() {
    this._wasmMultiMatchIterator.delete();
  }
}

class MultiQuery {
  constructor(pattern, flags, wasmModule) {
    const wasmFlags = _flagsToWasmFlags(flags, wasmModule);
    this._wasmMultiQuery = new wasmModule.MultiQuery(pattern, wasmFlags);
  }

  findIter(document) {
    const wasmMultiMatchIterator = this._wasmMultiQuery.finditer(document);
    return new MultiMatchIterator(wasmMultiMatchIterator);
  }

  findOne(document) {
    const wasmMultiMatch = this._wasmMultiQuery.findone(document);
    if (wasmMultiMatch) return new MultiMatch(wasmMultiMatch);
    return null;
  }

  check(document) {
    return this._wasmMultiQuery.check(document);
  }

  free() {
    this._wasmMultiQuery.delete();
  }
}

export default initREmatch;