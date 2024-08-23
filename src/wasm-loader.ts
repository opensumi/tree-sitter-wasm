import Parser from 'web-tree-sitter';

import { PromiseWithResolvers } from './utils';

export class WasmModuleLoader {
  private cachedRuntime: Map<string, PromiseWithResolvers<Parser.Language>> =
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

  private async loadFromFetch(wasmUrl: string): Promise<Parser.Language> {
    const grammar = await fetch(wasmUrl).then((res) => res.arrayBuffer());
    return await Parser.Language.load(new Uint8Array(grammar));
  }

  private async loadFromNode(wasmUrl: string): Promise<Parser.Language> {
    return await Parser.Language.load(wasmUrl);
  }

  async loadLanguage(language: string): Promise<Parser.Language> {
    if (!this.cachedRuntime.has(language)) {
      const wasmUrl = `${this.baseUrl}/tree-sitter-${language}.wasm`;

      const deferred = new PromiseWithResolvers<Parser.Language>();
      this.cachedRuntime.set(language, deferred);
      if (this.baseUrl.startsWith('http')) {
        this.loadFromFetch(wasmUrl).then((languageParser) => {
          deferred.resolve(languageParser);
        });
      } else {
        this.loadFromNode(wasmUrl).then((languageParser) => {
          deferred.resolve(languageParser);
        });
      }
    }

    return this.cachedRuntime.get(language)!.promise;
  }
}
