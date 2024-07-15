import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { $isAtNodeEnd, $setBlocksType } from "@lexical/selection";
import { ElementNode, RangeSelection, TextNode } from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { $createTodoNode } from "../nodes/checklist-node";

export const FloatingFormatPlugin: React.FC<FloatingFormatPluginProps> = () => {
  const [editor] = useLexicalComposerContext();
  const [show, setShow] = useState(false);
  const [isBold, setIsBold] = useState(false);

  const handleSelection = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();

      const isRangeSelection = $isRangeSelection(selection);
      if (!isRangeSelection) {
        return setShow(false);
      }

      setIsBold(selection.hasFormat("bold"));

      if (selection.getTextContent() !== "") {
        return setShow(true);
      }

      // setShow(false);
    });
  }, [editor]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelection);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
    };
  }, [handleSelection]);

  if (!show) {
    return null;
  }

  const formatHeading = () => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }
      $setBlocksType(selection, () => $createHeadingNode("h1"));
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const addTodoList = () => {
    editor.update(() => {
      const node = $createTodoNode();
      $insertNodes([node]);
    });
  };

  return (
    <div>
      <h3>floating toolbar</h3>
      <div className="flex flex-col">
        <button
          onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
          className={isBold ? " font-bold" : ""}
        >
          B
        </button>
        <button onClick={formatBulletList}>List</button>
        <button onClick={formatHeading}>H1</button>
        <button onClick={addTodoList}>TODO</button>
      </div>
    </div>
  );
};

export interface FloatingFormatPluginProps {
  anchorElem?: HTMLElement;
}

export function getSelectedNode(
  selection: RangeSelection
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
