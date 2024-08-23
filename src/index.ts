import { LanguageParser } from './parser';
import {
  SupportedTreeSitterLanguages,
  SupportedLanguages,
  parserNameMap,
} from './language-facts';
import { WasmModuleLoader } from './wasm-loader';
import { IDisposable } from './types';

export class LanguageParserService implements IDisposable {
  private pool = new Map<SupportedTreeSitterLanguages, LanguageParser>();
  wasmLoader: WasmModuleLoader;

  /**
   * @param baseUrl The base URL to load the wasm files from(file scheme is also supported for Node.js)
   */
  constructor(baseUrl: string) {
    this.wasmLoader = new WasmModuleLoader(baseUrl);
  }

  createParser(languageId: string | SupportedLanguages) {
    const treeSitterLang = parserNameMap[languageId as SupportedLanguages];
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

  removeParser(languageId: string | SupportedLanguages) {
    const treeSitterLang = parserNameMap[languageId as SupportedLanguages];
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
