import { SyntaxNode } from 'web-tree-sitter';
import {
  AbstractLanguageFacts,
  IClassBlockInfo,
  IFunctionBlockInfo,
} from './base';
import {
  classBlockSet,
  functionBlockSet,
  javascriptBlockCodeTypes,
  provideClassInfo,
  provideFunctionInfo,
} from './javascript';

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

  provideFunctionCodeBlocks(): Set<string> {
    return functionBlockSet;
  }

  provideFunctionInfo(node: SyntaxNode): IFunctionBlockInfo | null {
    return provideFunctionInfo(node);
  }

  provideClassCodeBlocks(): Set<string> {
    return classBlockSet;
  }

  provideClassInfo(node: SyntaxNode): IClassBlockInfo | null {
    return provideClassInfo(node);
  }
}
