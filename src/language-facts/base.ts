import Parser from 'web-tree-sitter';

import { SupportedTreeSitterLanguages } from './types';
import { IRange } from '../types';

interface IBaseCodeBlockInfo {
  infoCategory: string;
  type: string;
  range: IRange;
}

export interface IFunctionBlockInfo extends IBaseCodeBlockInfo {
  infoCategory: 'function';

  name: string;
  signatures: string[];
}

export interface IOtherBlockInfo extends IBaseCodeBlockInfo {
  infoCategory: 'other';
}

interface IBlockCommentStyle {
  start: string;
  end: string;
  linePrefix: string;
}

export type ICodeBlockInfo = IFunctionBlockInfo | IOtherBlockInfo;

export abstract class AbstractLanguageFacts {
  abstract name: SupportedTreeSitterLanguages;

  abstract listCommentStyle: string;
  abstract blockCommentStyle: IBlockCommentStyle;

  abstract provideFunctionInfo?(
    node: Parser.SyntaxNode,
  ): IFunctionBlockInfo | null;
  abstract provideCodeBlocks(): Set<string>;
  abstract provideFunctionCodeBlocks?(): Set<string>;
}

export type AbstractLanguageFactsDerived = (new () => AbstractLanguageFacts) &
  typeof AbstractLanguageFacts;
