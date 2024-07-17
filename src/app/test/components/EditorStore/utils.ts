import { $createParagraphNode, $getRoot, EditorState } from "lexical";
import { Array as YArray, Map as YMap } from "yjs";
import { $createYjsElementNode, YBlock } from "./YBlock";
import { addElementsToYjsArray, addpropertiesToYjsMap } from "../data/util";
import { Bindings, LuneToLexMap } from "./types";

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
  prevState: EditorState,
  bindings: Bindings
) {
  // Should go through Yjs transact
  console.log("SyncLuneNodes");
  // const doc = bindings.doc;

  // doc.transact(() => {
  //   const randomNr = Math.random();
  //   bindings.page._properties.set("randomNr", randomNr);
  // }, "editor");
}
