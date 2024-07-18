import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  ElementNode,
  NodeMap,
  RootNode,
  TextFormatType,
} from "lexical";
import { Map } from "yjs";
import type { Map as YMap, Array as YArray } from "yjs";
import { Bindings, LuneToLexMap, TitleItem } from "./types";
import { syncPropertiesFromLexical, syncTitleFromLexical } from "./BlockUtils";
import assert from "assert";

export class YBlock {
  _blockId: string;
  _properties: YMap<unknown>;
  // TODO: Might be better to use XMLElement here
  _title: YArray<TitleItem>;
  _children: YBlock[];

  constructor(
    blockId: string,
    properties: YMap<unknown>,
    title: YArray<TitleItem>,
    children: YBlock[]
  ) {
    this._blockId = blockId;
    this._properties = properties;
    this._title = title;
    this._children = children;
  }

  addChild(child: YBlock) {
    this._children.push(child);
  }

  $createLexicalNodeWithChildren(luneToLexMap: LuneToLexMap) {
    let currentNode = this._$createCurrentNodeInLexical();
    luneToLexMap.set(currentNode.getKey(), this);

    if (currentNode instanceof RootNode) {
      // Lexical adds a paragraph on initiation. We need to clear it
      currentNode.clear();
    }

    for (const child of this._children) {
      const childNode = child.$createLexicalNodeWithChildren(luneToLexMap);
      currentNode.append(childNode);
    }

    return currentNode;
  }

  _$createCurrentNodeInLexical() {
    const type = this._properties.get("type");
    switch (type) {
      case "page":
        return $getRoot();
      case "text":
        // TODO: We don't add the text nodes created here to luneToLexMap. Check if we should
        return $createParagraphFromYBlock(this);
      default:
        throw new Error(`Unknown type ${type}`);
    }
  }

  ysyncBlockWithLexical(lexicalNode: ElementNode, bindings: Bindings) {
    const blockType = this.getBlockType();
    if (typeof blockType !== "string") {
      throw new Error("Block type must be a string");
    }

    syncPropertiesFromLexical(lexicalNode, this._properties, blockType);
    syncTitleFromLexical(lexicalNode, this._title);
  }

  ysyncChildrenWithLexical(lexicalNode: ElementNode, bindings: Bindings) {
    const luneToLexMap = bindings.luneToLexMap;
    const childrenKeys = lexicalNode.getChildrenKeys();

    for (const childKey of childrenKeys) {
      const childLexicalNode = $getNodeByKey(childKey);
      if (!childLexicalNode) {
        console.error(`Could not find Lexical child node with key ${childKey}`);
        continue;
      }
      if (!(childLexicalNode instanceof ElementNode)) {
        console.log(`Not ElementNode, skipping`);
        continue;
      }

      const childYblock = luneToLexMap.get(childKey);
      if (!childYblock) {
        console.error(
          `Could not find YBlock child with key ${childKey}, probably need to create it`
        );
        continue;
      }

      childYblock.ysyncBlockWithLexical(childLexicalNode, bindings);
      childYblock.ysyncChildrenWithLexical(childLexicalNode, bindings);
    }
  }

  getBlockType() {
    return this._properties.get("type");
  }
}

function $createParagraphFromYBlock(block: YBlock) {
  const paragraph = $createParagraphNode();
  for (const titleItem of block._title) {
    const textNode = $createTextNode(titleItem.text);

    if (titleItem.marks) {
      const formats = getFormatFromMarks(titleItem.marks);
      for (const format of formats) {
        textNode.setFormat(format);
      }
    }

    paragraph.append(textNode);
  }

  return paragraph;
}

function getFormatFromMarks(marks: string[]): TextFormatType[] {
  const formats: TextFormatType[] = [];
  for (const mark of marks) {
    switch (mark) {
      case "bold":
        formats.push("bold");
        break;
      case "italic":
        formats.push("italic");
        break;
      case "underline":
        formats.push("underline");
        break;
      case "strikethrough":
        formats.push("strikethrough");
        break;
      default:
        throw new Error(`Unknown mark ${mark}`);
    }
  }
  return formats;
}

export function $createYjsElementNode(
  propertiesMap: Map<unknown>,
  titleMap: YArray<TitleItem>,
  blockId: string,
  type: string
) {
  return new YBlock(blockId, propertiesMap, titleMap, []);
}
