import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, EditorState } from "lexical";
import { useEffect, useRef, useState } from "react";
import {
  Array as YArray,
  Doc as YDoc,
  Map as YMap,
  Transaction,
  YEvent,
} from "yjs";
import { $createYjsElementNode, YjsElementNode } from "../data/YjsElementNode";
import { addElementsToYjsArray, addpropertiesToYjsMap } from "../data/util";

type LuneToLexMap = Map<string, YjsElementNode>;

type Binding = {
  blockMap: YMap<unknown>;
  luneToLexMap: LuneToLexMap;
  page: YjsElementNode;
};

const DOC_NAME = "lune_block";

// We assume blockMap only contains non page blocks for now
export const YjsPlugin = ({
  blockMap,
  blocks,
  pageBlockId,
}: {
  blockMap: YMap<unknown>;
  blocks: YjsElementNode[];
  pageBlockId: string;
}) => {
  const [editor] = useLexicalComposerContext();
  const [binding, setBinding] = useState<Binding | null>(null);
  const hasUpdatedRef = useRef(false);

  useEffect(() => {
    const luneToLexMap = new Map();
    if (hasUpdatedRef.current) {
      return;
    }

    editor.update(
      () => {
        const lexicalRoot = $getRoot();
        const page = findBlockById(pageBlockId, blocks);
        if (!page) {
          console.error("Root block not found");
          return;
        }
        for (const block of page._children) {
          const node = $createLexicalNodeRecursive(block, luneToLexMap);
          lexicalRoot.append(node);
        }

        setBinding({
          luneToLexMap,
          blockMap,
          page,
        });
      },
      { tag: "init" }
    );

    hasUpdatedRef.current = true;
  }, []);

  useEffect(() => {
    if (!binding) {
      return;
    }

    const { blockMap, luneToLexMap, page } = binding;
    const removeListener = editor.registerUpdateListener(
      ({
        dirtyElements,
        dirtyLeaves,
        editorState,
        normalizedNodes,
        prevEditorState,
        tags,
      }) => {
        syncLuneNodes(page, tags, editorState, prevEditorState);
      }
    );

    const syncLexicalNodes = (
      events: Array<YEvent<any>>,
      transaction: Transaction
    ) => {
      console.log("SyncLexicalNodes");
      // if (transaction.origin === "editor") {
      //     return;
      // }
    };

    const syncToLuneServer = (
      events: Array<YEvent<any>>,
      transaction: Transaction
    ) => {
      console.log("SyncToLuneServer");
    };

    blockMap.observeDeep(syncLexicalNodes);
    blockMap.observeDeep(syncToLuneServer);

    return () => {
      blockMap.unobserveDeep(syncLexicalNodes);
      blockMap.unobserveDeep(syncToLuneServer);
      removeListener();
    };
  }, [binding]);

  return null;
};

const findBlockById = (id: string, blocks: YjsElementNode[]) => {
  for (const block of blocks) {
    if (block._blockId === id) {
      return block;
    }
  }
  return null;
};

const $createLexicalNodeRecursive = (
  block: YjsElementNode,
  luneToLexMap: LuneToLexMap
) => {
  // Create blockNode and add each child recursively.
  // add block to luneToLexMap too

  const lexicalNode = $createParagraphNode();

  luneToLexMap.set(lexicalNode.getKey(), block);

  return lexicalNode;
};

const syncLuneNodes = (
  luneRoot: YjsElementNode,
  tags: Set<string>,
  state: EditorState,
  prevState: EditorState
) => {
  // Should go through Yjs transact
  console.log("SyncLuneNodes");
};

const $createLuneNodes = (map: YMap<unknown>) => {
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
};
