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
import { YBlock } from "./YBlock";
import { addElementsToYjsArray, addpropertiesToYjsMap } from "../data/util";
import { Bindings, LuneToLexMap } from "./types";

const isChildrenKey = (key: string) => key === "children";
const isTitleKey = (key: string) => key === "title";

const isNewBlockCreatedEvent = (event: YEvent<any>) => {
  return event instanceof YMapEvent && event.path.length === 0;
};

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
      const nextNodeKeys = Array.from(state._nodeMap.keys());
      const prevNodeKeys = Array.from(prevState._nodeMap.keys());

      // TODO: This might not work when a block changes type. In lexical a change of block type is a new block.
      // In our instance we would like to keep the block. We might be able to solve this by checking if a block is an orphan.
      const removedKeys = prevNodeKeys.filter(
        (key) => !nextNodeKeys.includes(key)
      );
      for (const key of removedKeys) {
        const yblock = bindings.luneToLexMap.get(key);
        if (!yblock) {
          continue;
        }

        yblock.ydestroy(bindings, key);
      }
    });
  }, "editor");
}

export function $syncLexicalNodesFromYBlocks(
  bindings: Bindings,
  events: Array<YEvent<any>>
) {
  for (const event of events) {
    if (isNewBlockCreatedEvent(event)) {
      createBlocksEvent(event as YMapEvent<any>, bindings);
      continue;
    }

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
      const updatedKey = path[1];
      if (typeof updatedKey !== "string") {
        throw new Error(`Invalid key type ${updatedKey}, expected string`);
      }

      if (isTitleKey(updatedKey)) {
        yblock.$syncLexicalWithYjsTitle(lexicalNode);
      } else if (isChildrenKey(updatedKey)) {
        yblock.$syncLexicalWithYjsChildren(lexicalNode, bindings);
      } else {
        throw new Error(`Invalid key ${updatedKey}`);
      }
    }
  }
}

function createBlocksEvent(event: YMapEvent<any>, bindings: Bindings) {
  const { idToYBlockMap, luneToLexMap, blockIdToNodeKeyPair } = bindings;
  const { keysChanged, target } = event;
  for (const blockId of keysChanged) {
    if (typeof blockId !== "string") {
      throw new Error(`Invalid blockId ${blockId}`);
    }

    const yblock = idToYBlockMap.get(blockId);
    if (!yblock) {
      throw new Error(`Could not find YBlock with id ${blockId}`);
    }

    createLexicalFromYBlock(yblock, luneToLexMap, blockIdToNodeKeyPair);
  }
}

function createLexicalFromYBlock(
  yblock: YBlock,
  luneToLexMap: LuneToLexMap,
  blockIdNodeKeyPair: Map<string, string>
) {
  const lexicalNode = yblock.$createCurrentNodeInLexical();
  const nodeKey = lexicalNode.getKey();
  luneToLexMap.set(nodeKey, yblock);
  blockIdNodeKeyPair.set(yblock._blockId, nodeKey);
}
