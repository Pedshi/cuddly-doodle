import { $getNodeByKey, LexicalEditor, SerializedElementNode } from "lexical";
import { toBlockType } from "./helpers";
import { ActionEvent } from "./types";

export const TransactionMachineAddBlock = (
  nodeKey: string,
  editor: LexicalEditor
) => {
  const json = editor.getEditorState().read(() => {
    const n = $getNodeByKey(nodeKey);
    if (!n) {
      return null;
    }
    const js = n.exportJSON() as SerializedElementNode & { blockId: string };
    return js;
  });

  if (!json) {
    return;
  }
  let blockType = toBlockType(json.type);
  const { type: typeBlock, version, blockId, ...properties } = json;
  const actions: ActionEvent[] = [
    {
      eventType: "create",
      args: {
        id: json.blockId,
        properties: { ...properties },
        type: blockType,
      },
    },
  ];

  const parentJson = editor.getEditorState().read(() => {
    const n = $getNodeByKey(nodeKey);
    if (!n) {
      return null;
    }

    const parent = n.getParent();
    if (!parent) {
      return null;
    }

    return parent.exportJSON() as SerializedElementNode & { blockId: string };
  });
  if (!parentJson) {
    return actions;
  }

  // We assume if that there are only one page block so if type here is block
  // then id is undefined.
  // This is because we cannot define a custom id on the root node currently
  actions.push({
    eventType: "add_child",
    args: {
      id: parentJson.blockId,
      childId: json.blockId,
      type: toBlockType(parentJson.type),
    },
  });

  return actions;
};
