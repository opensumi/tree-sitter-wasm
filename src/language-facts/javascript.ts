import { toMonacoRange } from '../utils/range';

import {
  AbstractLanguageFacts,
  IClassBlockInfo,
  IFunctionBlockInfo,
} from './base';

import type { SyntaxNode } from 'web-tree-sitter';

/**
 * javascript 中表示代码块的节点类型query22
 */
export const javascriptBlockCodeTypes = [
  'function',
  'function_declaration',
  'function_expression',
  'arrow_function',
  'class_declaration',
  'method_definition',
  'if_statement',
  'switch_case',
  'while_statement',
  'do_statement',
  'for_statement',
  'for_in_statement',
  'try_statement',
  'catch_clause',
  'block',
  'export_statement',
  'lexical_declaration',
];

export const functionBlockCodeTypes = [
  'function',
  'function_declaration',
  'function_expression',
  'arrow_function',
  'method_definition',
];

export const classBlockCodeTypes = [
  'class_declaration',
  'interface_declaration',
];

export const functionBlockSet = new Set(functionBlockCodeTypes);
export const classBlockSet = new Set(classBlockCodeTypes);
const blockSet = new Set(javascriptBlockCodeTypes);

export function provideFunctionInfo(
  node: SyntaxNode,
): IFunctionBlockInfo | null {
  switch (node.type) {
    case 'function_declaration':
    case 'function_expression': {
      const name = node.childForFieldName('name')?.text || '';
      return {
        infoCategory: 'function',
        type: node.type,
        name,
        signatures: node.children
          .filter((child) => child.type === 'parameter')
          .map((param) => param.firstChild?.text || ''),
        range: toMonacoRange(node),
      };
    }
    // case: const a = () => {}
    case 'arrow_function': {
      const parent = node.parent;
      if (
        parent &&
        parent.type === 'variable_declarator' &&
        parent.parent &&
        (parent.parent.type === 'lexical_declaration' ||
          parent.parent.type === 'export_statement' ||
          parent.parent.type === 'variable_declaration')
      ) {
        return {
          infoCategory: 'function',
          type: node.type,
          name: parent.firstChild?.text || '',
          signatures: node.children
            .filter((child) => child.type === 'parameter')
            .map((param) => param.firstChild?.text || ''),
          range: toMonacoRange(parent.parent),
        };
      }
      return null;
    }
    case 'method_definition': {
      const name = node.childForFieldName('name')?.text || '';
      return {
        infoCategory: 'function',
        type: node.type,
        name,
        signatures: node.children
          .filter((child) => child.type === 'parameter')
          .map((param) => param.firstChild?.text || ''),
        range: toMonacoRange(node),
      };
    }
  }

  return null;
}

export function provideClassInfo(node: SyntaxNode): IClassBlockInfo | null {
  switch (node.type) {
    case 'class_declaration':
    case 'interface_declaration': {
      const name = node.childForFieldName('name')?.text || '';
      return {
        infoCategory: 'class',
        type: node.type,
        name,
        range: toMonacoRange(node),
      };
    }
  }
  return null;
}

export class JavaScriptLanguageFacts implements AbstractLanguageFacts {
  name = 'javascript' as const;
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
