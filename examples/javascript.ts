import { LanguageParserService } from '../src';
import { createTestTextModel } from './utils';
import path from 'path';

function code() {
  const a = 1;
  function fibonacci(n) {
    if (n === 0) {
      return 0;
    }
    if (n === 1) {
      return 1;
    }
    return fibonacci(n - 1) + fibonacci(n - 2);
  }

  class A {
    async function1(params) {}
  }

  const function1 = () => {};
}

async function main() {
  const basePath = path.resolve(__dirname, '..');
  const service = new LanguageParserService(
    // url.pathToFileURL(basePath).toString(),
    basePath,
  );
  const parser = await service.createParser('javascript')!;
  const textModel = createTestTextModel(code.toString(), 'javascript');
  const info = await parser.provideAllFunctionAndClassInfo(textModel);
  console.log(`🚀 ~ main ~ info:`, info);
}

main().catch(console.error);
