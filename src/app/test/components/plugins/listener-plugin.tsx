import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useLayoutEffect } from "react";
import {
  getDiffElementForKeys,
  ifTextNodeGetParent,
} from "./transactionMachine/update";
import { ActionEvent } from "./transactionMachine/types";
import { toTransactions } from "./transactionMachine/toTransactions";

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
      console.log("actions", actions);
      console.log("transactions", toTransactions(actions, state.editorState, state.prevEditorState));
      console.log("state", structuredClone(state))
    });
  }, [editor]);

  return null;
};
