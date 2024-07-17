import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import { Map as YMap, Transaction, YEvent } from "yjs";
import { YBlock } from "./YBlock";
import {
  $createLexicalNodeRecursive,
  findBlockById,
  syncLuneNodes,
} from "./utils";
import { Bindings } from "./types";

export const BroadcastPlugin = ({
  blockMap,
  blocks,
  pageBlockId,
}: {
  blockMap: YMap<unknown>;
  blocks: YBlock[];
  pageBlockId: string;
}) => {
  const [editor] = useLexicalComposerContext();
  const [binding, setBinding] = useState<Bindings | null>(null);
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
