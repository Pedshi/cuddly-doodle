import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useLayoutEffect } from "react";
import {
  getDiffElementForKeys,
  ifTextNodeGetParent,
} from "./transactionMachine/update";
import { ActionEvent } from "./transactionMachine/types";
import { toTransactions } from "./transactionMachine/toTransactions";
import { $getRoot, SerializedElementNode } from "lexical";

export const syncEngine = (transactions: any[]) => {
  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify({transactions}),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const ListenerPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    return editor.registerUpdateListener((state) => {
      const updateElements: Set<string> = new Set();
      for (const [key, isDirty] of state.dirtyElements) {
        if (key === "root") {
          continue;
        }

        if (!isDirty) {
          continue;
        }
        updateElements.add(key);
      }

      for (const key of state.dirtyLeaves) {
        // If leaf is a text node and is updated we add parent element key.
        // If leaf was deleted then the parent should be dirty already.
        const parentKey = ifTextNodeGetParent(key, state.editorState, state.prevEditorState);
        if (parentKey) {
          updateElements.add(parentKey);
          continue;
        }

        updateElements.add(key);
      }

      const actions: ActionEvent[] = getDiffElementForKeys(
        updateElements,
        state.editorState,
        state.prevEditorState
      );
      const transactions = toTransactions(actions, state.editorState, state.prevEditorState);
      syncEngine(transactions);
    });
  }, [editor]);

  return null;
};
