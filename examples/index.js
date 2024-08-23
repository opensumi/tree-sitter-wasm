const { LanguageParserService } = require('../lib');
const path = require('path');

function createTestTextModel(text, language) {
  console.log(`🚀 ~ createTestTextModel ~ text:`, text);
  return {
    getValue() {
      return text;
    },
    getVersionId() {
      return 1;
    },
    id: '1',
  };
}

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
}

async function main() {
  const basePath = path.resolve(__dirname, '..');
  const service = new LanguageParserService(
    // url.pathToFileURL(basePath).toString(),
    basePath,
  );
  const parser = await service.createParser('javascript');
  const textModel = createTestTextModel(code.toString(), 'javascript');
  const info = await parser.provideAllCodeBlockInfo(textModel);
  console.log(`🚀 ~ main ~ info:`, info);
}

main().catch(console.error);
