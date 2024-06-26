const path = require('path');

const childProcess = require('child_process');

const pkgJson = require('../package.json');
const { mkdirSync, cpSync } = require('fs');

const parserPkgNamePrefix = 'tree-sitter-';
const sourceDir = path.join(__dirname, '../node_modules');
const outputDir = path.join(__dirname, '..');

mkdirSync(outputDir, { recursive: true });

const parserMap = {
  typescript: ['typescript', 'tsx'],
  java: [''],
  javascript: [''],
  rust: [''],
  go: [''],
  python: [''],
};

const webTreeSitterWasm = path.join(
  path.dirname(require.resolve('web-tree-sitter/package.json')),
  'tree-sitter.wasm'
);

cpSync(webTreeSitterWasm, path.join(outputDir, 'tree-sitter.wasm'));

const parsers = Object.keys(pkgJson.devDependencies).filter(
  k => k !== 'tree-sitter-cli' && k.startsWith(parserPkgNamePrefix)
);

for (const parser of parsers) {
  const languageName = parser.substring(parserPkgNamePrefix.length);
  const sub = parserMap[languageName];
  if (!sub) {
    console.log(`skip ${parser}`);
    continue;
  }
  for (const language of parserMap[languageName]) {
    const dir = path.join(sourceDir, `${parser}/${language}`);
    const grammerJson = path.join(dir, 'src/grammar.json');
    const grammerName = require(grammerJson).name;
    console.log(`build gramme:`, grammerName);
    const wasmName = `tree-sitter-${grammerName}.wasm`;

    const cmd = `tree-sitter build --wasm --output ${outputDir}/${wasmName} ${dir}`;

    commandSync(cmd);
    commandSync(`mv ${wasmName} ${outputDir}/${wasmName}`);
  }
}

function commandSync(cmd) {
  console.log(`[RUN]`, cmd);
  childProcess.execSync(cmd, {
    stdio: 'inherit',
  });
}
