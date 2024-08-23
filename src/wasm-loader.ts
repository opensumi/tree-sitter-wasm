import Parser from 'web-tree-sitter';

import { PromiseWithResolvers } from './utils';

export class WasmModuleLoader {
  private cachedRuntime: Map<string, PromiseWithResolvers<ArrayBuffer>> =
    new Map();

  constructor(public baseUrl: string) {}

  private parserInitialized = false;

  async loadParser() {
    const wasmPath = `${this.baseUrl}/tree-sitter.wasm`;
    if (!this.parserInitialized) {
      await Parser.init({
        locateFile: () => wasmPath,
      });
      this.parserInitialized = true;
    }

    return new Parser();
  }

  async loadLanguage(language: string): Promise<ArrayBuffer> {
    if (!this.cachedRuntime.has(language)) {
      const deferred = new PromiseWithResolvers<ArrayBuffer>();
      this.cachedRuntime.set(language, deferred);
      const wasmUrl = `${this.baseUrl}/tree-sitter-${language}.wasm`;
      fetch(wasmUrl)
        .then((res) => res.arrayBuffer())
        .then((buffer) => {
          deferred.resolve(buffer);
        });
    }

    return this.cachedRuntime.get(language)!.promise;
  }
}
