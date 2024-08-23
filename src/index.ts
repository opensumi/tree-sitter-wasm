import { LanguageParser } from './parser';
import { SupportedTreeSitterLanguages, parserNameMap } from './language-facts';
import { WasmModuleLoader } from './wasm-loader';
import { IDisposable } from './types';

export class LanguageParserService implements IDisposable {
  private pool = new Map<SupportedTreeSitterLanguages, LanguageParser>();
  wasmLoader: WasmModuleLoader;

  constructor(baseUrl: string) {
    this.wasmLoader = new WasmModuleLoader(baseUrl);
  }

  createParser(language: string) {
    const treeSitterLang = parserNameMap[language];
    if (treeSitterLang) {
      if (!this.pool.has(treeSitterLang)) {
        this.pool.set(
          treeSitterLang,
          new LanguageParser(treeSitterLang, this.wasmLoader),
        );
      }

      return this.pool.get(treeSitterLang);
    }
  }

  removeParser(language: string) {
    const treeSitterLang = parserNameMap[language];
    if (treeSitterLang) {
      const parser = this.pool.get(treeSitterLang);
      if (parser) {
        parser.dispose();
        this.pool.delete(treeSitterLang);
      }
    }
  }

  dispose() {
    this.pool.forEach((parser) => parser.dispose());
    this.pool.clear();
  }
}
