/**
 * 1 based
 */
export interface IRange {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
}

export interface IDisposable {
  dispose(): void;
}

export interface ITextModel {
  id: string;
  getValue(): string;
  getVersionId(): number;
}
