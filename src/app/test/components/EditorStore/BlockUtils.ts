import {
  ElementNode,
  LexicalNode,
  LineBreakNode,
  TEXT_TYPE_TO_FORMAT,
  TextNode,
} from "lexical";
import { Map as YMap, Array as YArray } from "yjs";
import { TitleItem } from "./types";

export function syncTitleFromLexical(
  nextNode: ElementNode,
  sharedTitle: YArray<TitleItem>
) {
  const textNodes = getDirectTextNodes(nextNode);
  const newTitles = lexicalTextToTitleItems(textNodes);

  replaceOldTitleWithNew(sharedTitle, newTitles);
}

function replaceOldTitleWithNew(
  sharedTitle: YArray<TitleItem>,
  newTitle: TitleItem[]
) {
  sharedTitle.delete(0, sharedTitle.length);
  sharedTitle.insert(0, newTitle);
}

function lexicalTextToTitleItems(textNodes: TextNode[]) {
  const newTitle = [];

  for (const node of textNodes) {
    const text = node.getTextContent();
    const titleItem: TitleItem = { text };

    const format = node.getFormat();
    if (format !== 0) {
      const marks = formatToMarks(format);
      titleItem.marks = marks;
    }

    newTitle.push(titleItem);
  }

  return newTitle;
}

function getDirectTextNodes(node: ElementNode): TextNode[] {
  const nodes = node.getChildren();
  const textNodes = [];

  for (const child of nodes) {
    if (child instanceof TextNode) {
      textNodes.push(child);
    }
  }

  return textNodes;
}

const formatToMarks = (lexicalFormatNr: number) => {
  const marks: string[] = [];

  for (const key in TEXT_TYPE_TO_FORMAT) {
    const flag = TEXT_TYPE_TO_FORMAT[key];
    if (lexicalFormatNr & flag) {
      const luneFormatKey = lexicalFormatToLuneFormat(key);
      if (luneFormatKey) {
        marks.push(luneFormatKey);
      }
    }
  }

  return marks;
};

const lexicalFormatToLuneFormat = (lexicalFormat: string) => {
  switch (lexicalFormat) {
    case "bold":
      return "bold";
    case "italic":
      return "italic";
    case "highlight":
      return "highlight";
    case "underline":
      return "underline";
    case "strikethrough":
      return "strikethrough";
    default:
      return null;
  }
};

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
    const nextValue = (nextNode as any)[lexicalKey];

    const value = sharedProperties.get(luneKey);

    if (nextValue !== value) {
      sharedProperties.set(luneKey, nextValue);
    }
  }
}

function getPropertyKeys(blockType: string) {
  switch (blockType) {
    case "page":
      return [];
    case "text":
      return [["marks", "format"]];
    default:
      return [];
  }
}

function getCommonProperties() {
  return [["type", "__type"]];
}
