import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import { Map as YMap, Transaction, YEvent, Doc } from "yjs";
import { YBlock } from "./YBlock";
import {
  $createLexicalNodeRecursive,
  $syncLexicalNodesFromYBlocks,
  findBlockById,
  syncLuneNodes,
} from "./utils";
import { Bindings } from "./types";
import { serverProvider } from "../Provider/ServerProvider";

export const BroadcastPlugin = ({
  blockMap,
  doc,
  page,
  idToYBlockMap,
}: {
  blockMap: YMap<unknown>;
  page: YBlock;
  doc: Doc;
  idToYBlockMap: Map<string, YBlock>;
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
        const blockIdToNodeKeyPair = new Map<string, string>();
        page.$createLexicalNodeWithChildren(luneToLexMap, blockIdToNodeKeyPair);

        setBinding({
          luneToLexMap,
          blockMap,
          page,
          doc,
          idToYBlockMap,
          blockIdToNodeKeyPair,
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
        syncLuneNodes(
          page,
          dirtyElements,
          tags,
          editorState,
          prevEditorState,
          binding
        );
      }
    );

    const syncLexicalNodes = (
      events: Array<YEvent<any>>,
      transaction: Transaction
    ) => {
      if (transaction.origin === "editor" || transaction.origin === "init") {
        return;
      }

      editor.update(() => {
        $syncLexicalNodesFromYBlocks(binding, events);
      });
    };

    const syncToLuneServer = (
      events: Array<YEvent<any>>,
      transaction: Transaction
    ) => {
      if (transaction.origin === "server" || transaction.origin === "init") {
        return;
      }
      console.log("lexical update origin", transaction.origin);

      serverProvider(events, transaction);
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
