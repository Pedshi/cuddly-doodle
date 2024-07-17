import { $createParagraphNode, $getRoot, EditorState } from "lexical";
import { Array as YArray, Map as YMap } from "yjs";
import { $createYjsElementNode, YBlock } from "./YBlock";
import { addElementsToYjsArray, addpropertiesToYjsMap } from "../data/util";
import { LuneToLexMap } from "./types";

export function findBlockById(id: string, blocks: YBlock[]) {
  for (const block of blocks) {
    if (block._blockId === id) {
      return block;
    }
  }
  return null;
}

export function $createLexicalNodeRecursive(
  block: YBlock,
  luneToLexMap: LuneToLexMap
) {
  // Create blockNode and add each child recursively.
  // add block to luneToLexMap too

  const lexicalNode = $createParagraphNode();

  luneToLexMap.set(lexicalNode.getKey(), block);

  return lexicalNode;
}

export function syncLuneNodes(
  luneRoot: YBlock,
  tags: Set<string>,
  state: EditorState,
  prevState: EditorState
) {
  // Should go through Yjs transact
  console.log("SyncLuneNodes");
}

export function $createLuneNodes(map: YMap<unknown>) {
  const blockId = crypto.randomUUID();

  const lexicalRoot = $getRoot();
  const properties = new YMap();
  const title = new YArray();
  addpropertiesToYjsMap({}, properties);
  addElementsToYjsArray([], title);

  const luneRoot = $createYjsElementNode(properties, title, "root", "root");

  const blockMap = new YMap();
  blockMap.set("properties", properties);
  blockMap.set("title", title);

  map.set(blockId, blockMap);

  // Init LuneElements by traversing the lexicalRoot and creating LuneElementNodes
  luneRoot.init(lexicalRoot);

  return luneRoot;
}
