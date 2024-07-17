import { RootNode } from "lexical";
import { Map } from "yjs";
import type { Map as YMap, Array as YArray } from "yjs";

export class YBlock {
  _blockId: string;
  _properties: YMap<unknown>;
  _title: YArray<unknown>;
  _type: string;
  _children: YBlock[];

  constructor(
    blockId: string,
    properties: YMap<unknown>,
    title: YArray<unknown>,
    type: string,
    children: YBlock[]
  ) {
    this._blockId = blockId;
    this._properties = properties;
    this._title = title;
    this._type = type;
    this._children = children;
  }

  init(lexicalRoot: RootNode) {
    // Traverse each child and setup
  }
}

export function $createYjsElementNode(
  propertiesMap: Map<unknown>,
  titleMap: YArray<unknown>,
  blockId: string,
  type: string
) {
  return new YBlock(blockId, propertiesMap, titleMap, type, []);
}
