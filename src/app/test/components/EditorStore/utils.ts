import {
  $createParagraphNode,
  $getNodeByKey,
  $getRoot,
  EditorState,
  ElementNode,
} from "lexical";
import {
  Transaction,
  Array as YArray,
  YArrayEvent,
  YEvent,
  Map as YMap,
  YMapEvent,
} from "yjs";
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
  dirtyElements: Map<string, boolean>,
  tags: Set<string>,
  state: EditorState,
  prevState: EditorState,
  bindings: Bindings
) {
  // Should go through Yjs transact
  console.log("SyncLuneNodes");
  const { doc } = bindings;

  doc.transact((transaction) => {
    state.read(() => {
      if (!dirtyElements.has("root")) {
        return;
      }

      const nextLexicalRoot = $getRoot();
      const page = bindings.page;
      page.ysyncBlockWithLexical(nextLexicalRoot, bindings);
      page.ysyncChildrenWithLexical(nextLexicalRoot, bindings);
    });
  }, "editor");
}

export function $syncLexicalNodesFromYBlocks(
  bindings: Bindings,
  events: Array<YEvent<any>>
) {
  for (const event of events) {
    const { path } = event;
    const blockId = path[0];
    if (!(typeof blockId === "string")) {
      console.error(`BlockId is not a string, skipping`);
      continue;
    }

    const yblock = bindings.idToYBlockMap.get(blockId);
    if (!yblock) {
      console.error(`Could not find YBlock with id ${blockId}`);
      continue;
    }

    // TODO: when handling create we must add lexical node here
    const nodeKey = bindings.blockIdToNodeKeyPair.get(blockId);
    if (!nodeKey) {
      console.error(`Could not find nodeKey for blockId ${blockId}`);
      continue;
    }

    const lexicalNode = $getNodeByKey(nodeKey);
    if (!lexicalNode || !(lexicalNode instanceof ElementNode)) {
      console.error(`Could not find Lexical node with key ${nodeKey}`);
      continue;
    }

    if (event instanceof YMapEvent) {
      const keysChanged = event.keysChanged;
      yblock.$syncLexicalWithYjsProperties(lexicalNode, keysChanged);
      continue;
    }
    if (event instanceof YArrayEvent) {
      yblock.$syncLexicalWithYjsTitle(lexicalNode);
    }
  }
}
