import {
  ElementNode,
  LexicalNode,
  LineBreakNode,
  TEXT_TYPE_TO_FORMAT,
  TextNode,
} from "lexical";
import { Map as YMap, Array as YArray } from "yjs";
import {
  getCommonProperties,
  getPropertyKeys,
  lexicalTypeToLuneType,
} from "../typeConverter";

export function syncPropertiesFromLexical(
  nextNode: ElementNode,
  sharedProperties: YMap<unknown>,
  blockType: string
) {
  const propertyKeys = [
    getPropertyKeys(blockType),
    getCommonProperties(),
  ].flat();

  for (const [luneKey, lexicalKey] of propertyKeys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let nextValue = (nextNode as any)[lexicalKey];

    if (luneKey === "type") {
      nextValue = lexicalTypeToLuneType(nextValue);
    }

    const value = sharedProperties.get(luneKey);

    if (nextValue !== value) {
      sharedProperties.set(luneKey, nextValue);
    }
  }
}
