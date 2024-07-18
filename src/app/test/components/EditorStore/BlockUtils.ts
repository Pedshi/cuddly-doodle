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
  const textNodes = getDirectTextAndLineBreakNodes(nextNode);
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

function lexicalTextToTitleItems(textNodes: (TextNode | LineBreakNode)[]) {
  const newTitle: TitleItem[] = [];

  for (let i = 0; i < textNodes.length; i++) {
    const prevTitle =
      newTitle.length !== 0 ? newTitle[newTitle.length - 1] : undefined;
    const node = textNodes[i];

    // 1. Se if the node can be normalized with the previous text. That is if the node
    // is a line break or text node with same format as previous.
    // TODO: optimize so we only fetch format etc only once
    const maybePrevTitle =
      prevTitle && tryNormalizeTextAndLineBreakNodes(prevTitle, node);

    if (maybePrevTitle) {
      newTitle[newTitle.length - 1] = maybePrevTitle;
      continue;
    }

    // 2. If could not be normalized add new item.
    if (node instanceof LineBreakNode) {
      const titleItem: TitleItem = { text: "\n" };
      newTitle.push(titleItem);
      continue;
    }

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

function tryNormalizeTextAndLineBreakNodes(
  prevTitle: TitleItem,
  node: TextNode | LineBreakNode
) {
  const prevMarks = prevTitle.marks || [];
  let marks: string[] = [];
  if (node instanceof TextNode) {
    marks = formatToMarks(node.getFormat());
  }

  if (!marksEqual(prevMarks, marks)) {
    return null;
  }

  let newText = "";
  if (node instanceof TextNode) {
    newText = node.getTextContent();
  } else {
    newText = "\n";
  }

  const titleItem: TitleItem = { text: prevTitle.text + newText, marks };

  return titleItem;
}

function marksEqual(marks1: string[], marks2: string[]) {
  if (marks1.length !== marks2.length) {
    return false;
  }

  for (let i = 0; i < marks1.length; i++) {
    if (marks1[i] !== marks2[i]) {
      return false;
    }
  }

  return true;
}

function getDirectTextAndLineBreakNodes(
  node: ElementNode
): (TextNode | LineBreakNode)[] {
  const nodes = node.getChildren();
  const textNodes = [];

  for (const child of nodes) {
    if (child instanceof TextNode || child instanceof LineBreakNode) {
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
