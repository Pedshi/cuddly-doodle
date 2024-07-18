export function lexicalTypeToLuneType(lexicalType: string) {
  switch (lexicalType) {
    case "paragraph":
      return "text";
    case "root":
      return "page";
    default:
      return null;
  }
}

export function getPropertyKeys(blockType: string) {
  switch (blockType) {
    case "page":
      return [];
    case "text":
      return [["marks", "format"]];
    default:
      return [];
  }
}

export function getCommonProperties() {
  return [["type", "__type"]];
}
