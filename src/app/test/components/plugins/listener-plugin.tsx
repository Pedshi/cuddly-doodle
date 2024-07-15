import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useLayoutEffect } from "react";
import {
  getDiffElementForKeys,
  ifTextNodeGetParent,
} from "./transactionMachine/update";

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
        const parentKey = ifTextNodeGetParent(key, state.editorState);
        if (parentKey) {
          updateElements.add(parentKey);
          continue;
        }

        updateElements.add(key);
      }

      const actions = getDiffElementForKeys(
        updateElements,
        state.editorState,
        state.prevEditorState
      );
    });
  }, [editor]);

  return null;
};
