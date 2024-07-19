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
import * as Y from "yjs";
import { Bindings, LuneToLexMap, TitleItem } from "./types";
import {
  $createParagraphFromYBlock,
  getFormatFromMarks,
  getTextSplitByNewLine,
} from "../Converter/YtoLex";
import { syncPropertiesFromLexical } from "../Converter/LexToY/properties";
import {
  getDirectTextAndLineBreakNodes,
  lexicalTextToTitleItems,
  syncTitleFromLexical,
} from "../Converter/LexToY/title";

export class YBlock {
  _blockId: string;
  _properties: Y.Map<unknown>;
  _title: Y.Array<TitleItem>;
  _childrenIds: Y.Array<string>;
  _parentId: string;
  // Maybe that we remove this and only use childrenIds with a blockId to YBlock map
  _children: YBlock[];

  constructor(
    blockId: string,
    properties: Y.Map<unknown>,
    title: Y.Array<TitleItem>,
    childrenIds: Y.Array<string>,
    children: YBlock[]
  ) {
    this._blockId = blockId;
    this._properties = properties;
    this._title = title;
    this._childrenIds = childrenIds;
    this._children = children;
    // For now
    this._parentId = "";
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

  // To know which ones to remove we need to look at previous state
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

      // What if child node exists but has moved to new parent
      const childYblock = luneToLexMap.get(childKey);
      if (!childYblock) {
        console.log(
          `Could not find YBlock for child key ${childKey}, current blockId ${this._blockId}`
        );
        const childYBlock = $createYBlockFromLexicalNode(
          childLexicalNode,
          bindings
        );
        console.log("luneToLexMap", luneToLexMap);
        childYBlock.ysyncChildrenWithLexical(childLexicalNode, bindings);
        this.addChild(childYBlock);
        this._childrenIds.push([childYBlock._blockId]);

        continue;
      }

      // Check if exists as child
      const childId = childYblock._blockId;
      const childIds = this._childrenIds.toArray();
      if (!childIds.includes(childId)) {
        this._childrenIds.push([childId]);
        this.addChild(childYblock);
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

function buildTextNodesFromYArray(
  yarray: Y.Array<TitleItem>
): TitleDiffMatch[] {
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

export function $createYBlockFromLexicalNode(
  lexicalNode: ElementNode,
  bindings: Bindings
) {
  const nodeKey = lexicalNode.getKey();

  const properties = buildPropertiesFromLexical(
    lexicalNode,
    lexicalNode.__type
  );

  const type = lextoLuneType(lexicalNode.__type);
  properties["type"] = type;

  const titles = buildTitleFromLexical(lexicalNode);
  const blockId = crypto.randomUUID().toString();

  const yProps = new Y.Map<unknown>();
  for (const key in properties) {
    yProps.set(key, properties[key]);
  }

  const yTitles = new Y.Array<TitleItem>();
  yTitles.push(titles);

  // Cannot have any children yet, thus init to empty array
  const yChildren = new Y.Array<string>();

  const yblock = new YBlock(blockId, yProps, yTitles, yChildren, []);
  const elementMap = new Y.Map();
  elementMap.set("properties", yblock._properties);
  elementMap.set("title", yblock._title);
  elementMap.set("children", yblock._childrenIds);

  bindings.blockMap.set(blockId, elementMap);

  bindings.idToYBlockMap.set(blockId, yblock);
  bindings.blockIdToNodeKeyPair.set(blockId, nodeKey);
  bindings.luneToLexMap.set(nodeKey, yblock);

  return yblock;
}

function buildTitleFromLexical(lexicalNode: ElementNode) {
  const textOrLineBreakNodes = getDirectTextAndLineBreakNodes(lexicalNode);
  const newTitles = lexicalTextToTitleItems(textOrLineBreakNodes);
  return newTitles;
}

function buildPropertiesFromLexical(
  lexicalNode: ElementNode,
  lexicalType: string
) {
  const incProps = getIncludedProperties(lexicalType);
  if (!incProps) {
    console.error(
      `Include properties not defined for lexical type ${lexicalType}`
    );
    return {};
  }

  const props: Record<string, unknown> = {};
  for (const prop of incProps) {
    props[prop] = lexicalNode[prop as keyof typeof lexicalNode];
  }

  return props;
}

function lextoLuneType(lexicalType: string) {
  switch (lexicalType) {
    case "paragraph":
      return "text";
    case "root":
      return "page";
    default:
      return lexicalType;
  }
}

function getIncludedProperties(lexicalType: string): string[] | undefined {
  return includeProperties[lexicalType as keyof typeof includeProperties];
}

const includeProperties = {
  // TODO: maybe keep format
  paragraph: [],
  root: [],
};
