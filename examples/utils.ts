let modelId = 0;

export function createTestTextModel(text: string, language: string) {
  return {
    getValue() {
      return text;
    },
    getVersionId() {
      return 1;
    },
    id: String(modelId++),
  };
}
