import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  ElementNode,
  LexicalNode,
  LineBreakNode,
  NodeMap,
  RootNode,
  TextFormatType,
  TextNode,
} from "lexical";
import type { Map as YMap, Array as YArray } from "yjs";
import { Bindings, LuneToLexMap, TitleItem } from "./types";
import {
  $createParagraphFromYBlock,
  getFormatFromMarks,
  getTextSplitByNewLine,
} from "../Converter/YtoLex";
import { syncPropertiesFromLexical } from "../Converter/LexToY/properties";
import { syncTitleFromLexical } from "../Converter/LexToY/title";

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

  $createLexicalNodeWithChildren(
    luneToLexMap: LuneToLexMap,
    blockIdNodeKeyPair: Map<string, string>
  ) {
    let currentNode = this._$createCurrentNodeInLexical();
    const nodeKey = currentNode.getKey();
    luneToLexMap.set(nodeKey, this);
    blockIdNodeKeyPair.set(this._blockId, nodeKey);

    if (currentNode instanceof RootNode) {
      // Lexical adds a paragraph on initiation. We need to clear it
      currentNode.clear();
    }

    for (const child of this._children) {
      const childNode = child.$createLexicalNodeWithChildren(
        luneToLexMap,
        blockIdNodeKeyPair
      );
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

  $syncLexicalWithYjsProperties(
    lexicalNode: ElementNode,
    keysChanged: Set<string>
  ) {
    const writableNode = lexicalNode.getWritable() as LexicalNode;
    for (const key of keysChanged) {
      if (key === "type") {
        console.log("Skipping type for now");
        continue;
      }

      const value = this._properties.get(key) as any;

      writableNode[key as keyof typeof writableNode] = value;
    }
  }

  $syncLexicalWithYjsTitle(lexicalNode: ElementNode) {
    const diffText = buildTextNodesFromYArray(this._title);
    const lexicalChildren = lexicalNode.getChildren();
    for (let i = 0; i < diffText.length; i++) {
      const diff = diffText[i];
      const lexicalChild =
        i > lexicalChildren.length - 1 ? undefined : lexicalChildren[i];

      if (!lexicalChild) {
        const textNode = $createTextNode(diff.text);
        for (const format of diff.formats) {
          textNode.setFormat(format);
        }
        lexicalNode.append(textNode);
        continue;
      }

      if (diff.type === "text") {
        let writableChild = lexicalChild.getWritable();

        if (!isTextNode(writableChild)) {
          const textNode = $createTextNode(diff.text);
          for (const format of diff.formats) {
            textNode.setFormat(format);
          }
          writableChild.replace(textNode);
          continue;
        }

        if (writableChild.__text !== diff.text) {
          writableChild.__text = diff.text;
        }

        for (const format of diff.formats) {
          writableChild.setFormat(format);
        }

        continue;
      } else if (diff.type === "linebreak") {
        const writableChild = lexicalChild.getWritable();

        if (!isLineBreakNode(writableChild)) {
          const lineBreak = $createLineBreakNode();
          writableChild.replace(lineBreak);
          continue;
        }
      }
    }

    // Remove any extra nodes
    if (diffText.length < lexicalChildren.length) {
      for (let i = diffText.length; i < lexicalChildren.length; i++) {
        const child = lexicalChildren[i];
        if (isTextNode(child) || isLineBreakNode(child)) {
          const writableChild = child.getWritable();
          child.remove();
        }
      }
    }
  }

  getBlockType() {
    return this._properties.get("type");
  }
}

function isTextNode(node: LexicalNode): node is TextNode {
  return node instanceof TextNode;
}

function isLineBreakNode(node: LexicalNode): node is LineBreakNode {
  return node instanceof LineBreakNode;
}

function buildTextNodesFromYArray(yarray: YArray<TitleItem>): TitleDiffMatch[] {
  const diff: TitleDiffMatch[] = [];
  for (const titleItem of yarray) {
    const textSplitByNewLine = getTextSplitByNewLine(titleItem.text);
    let formats: TextFormatType[] = [];

    if (titleItem.marks) {
      const format = getFormatFromMarks(titleItem.marks);
      formats.push(...format);
    }

    for (let i = 0; i < textSplitByNewLine.length; i++) {
      const text = textSplitByNewLine[i];
      diff.push({ text, formats: formats, type: "text" });

      if (i < textSplitByNewLine.length - 1) {
        diff.push({ text: "", formats: [], type: "linebreak" });
      }
    }
  }

  return diff;
}

type TitleDiffMatch = {
  text: string;
  formats: TextFormatType[];
  type: "text" | "linebreak";
};

export function $createYjsElementNode(
  propertiesMap: YMap<unknown>,
  titleMap: YArray<TitleItem>,
  blockId: string,
  type: string
) {
  return new YBlock(blockId, propertiesMap, titleMap, []);
}
