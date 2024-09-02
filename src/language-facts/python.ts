import { SyntaxNode } from 'web-tree-sitter';
import { AbstractLanguageFacts, IFunctionBlockInfo } from './base';
import { toMonacoRange } from '../common';

/**
 * python 中表示代码块的节点类型
 */
export const pythonBlockCodeTypes = [
  'function_definition',
  'class_definition',
  'compound_statement',
  'if_statement',
  'elif_clause',
  'else_clause',
  'for_statement',
  'while_statement',
  'try_statement',
  'except_clause',
  'with_statement',
  'decorated_definition',
];

const blockSet = new Set(pythonBlockCodeTypes);

export const functionBlockCodeTypes = ['function_definition'];

export class PythonLanguageFacts implements AbstractLanguageFacts {
  name = 'python' as const;
  listCommentStyle = '# ';
  blockCommentStyle = {
    start: "'''",
    end: "'''",
    linePrefix: '',
  };

  provideCodeBlocks(): Set<string> {
    return blockSet;
  }

  provideFunctionCodeBlocks(): Set<string> {
    return new Set(functionBlockCodeTypes);
  }

  provideFunctionInfo(node: SyntaxNode): IFunctionBlockInfo | null {
    switch (node.type) {
      case 'function_definition': {
        const signatures = [] as string[];
        const parameters = node.childForFieldName('parameters');
        if (parameters) {
          const ids = parameters.descendantsOfType('identifier');
          ids.forEach((id) => {
            signatures.push(id.text);
          });
        }
        const name = node.childForFieldName('name')?.text || '';
        return {
          infoCategory: 'function',
          type: node.type,
          range: toMonacoRange(node),
          name,
          signatures,
        };
      }
      default:
        return null;
    }
  }
}
