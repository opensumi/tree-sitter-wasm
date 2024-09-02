import { SyntaxNode } from 'web-tree-sitter';
import { AbstractLanguageFacts, IFunctionBlockInfo } from './base';
import { javascriptBlockCodeTypes, provideFunctionInfo } from './javascript';

/**
 * jsx 中表示代码块的节点类型
 * 与 javascript 中的基础节点类型一致
 */
export const javascriptreactBlockCodeTypes = [
  ...javascriptBlockCodeTypes,
  'jsx_element',
  'jsx_self_closing_element',
  'jsx_expression',
  'jsx_fragment',
];

const blockSet = new Set(javascriptreactBlockCodeTypes);

export class JavaScriptReactLanguageFacts implements AbstractLanguageFacts {
  name = 'jsx' as const;
  listCommentStyle = '// ';
  blockCommentStyle = {
    start: '/**',
    end: ' */',
    linePrefix: ' * ',
  };

  provideCodeBlocks(): Set<string> {
    return blockSet;
  }

  provideFunctionInfo(node: SyntaxNode): IFunctionBlockInfo | null {
    return provideFunctionInfo(node);
  }
}
