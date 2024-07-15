import {
  $getNodeByKey,
  EditorState,
  ElementNode,
  LexicalNode,
  SerializedElementNode,
} from "lexical";
import { toBlockType } from "./helpers";

const $combineTextNodes = (nodes: LexicalNode[]) => {
  const textNodes = [];
  for (const node of nodes) {
    if (node.getType() !== "text") {
      continue;
    }

    const json = node.exportJSON();
    textNodes.push(json);
  }

  return textNodes;
};

const getJson = (nodeKey: string, state: EditorState) => {
  const json = state.read(() => {
    const n = $getNodeByKey(nodeKey);
    if (!n || !(n instanceof ElementNode)) {
      return null;
    }

    const children = n.getChildren();
    const textNodes = $combineTextNodes(children);

    const js = n.exportJSON() as SerializedElementNode & { blockId: string };
    return { ...js, title: textNodes };
  });

  return json;
};

export const getDiffElementForKeys = (
  nodeKeys: Set<string>,
  currState: EditorState,
  prevState: EditorState
) => {
  const actions = [];
  for (const key of nodeKeys) {
    const diff = getDiffElement(key, currState, prevState);
    if (!diff) {
      continue;
    }

    actions.push(diff);
  }

  return actions;
};

export const getDiffElement = (
  nodeKey: string,
  currState: EditorState,
  prevState: EditorState
) => {
  const currentJson = getJson(nodeKey, currState);

  if (!currentJson) {
    return {
      eventType: "delete",
      args: {
        id: nodeKey,
      },
    };
  }

  const prevJson = getJson(nodeKey, prevState);

  if (!prevJson) {
    return {
      eventType: "create",
      args: {
        id: currentJson.blockId,
        properties: { ...currentJson },
        type: currentJson.type,
      },
    };
  }

  if (JSON.stringify(currentJson) === JSON.stringify(prevJson)) {
    return null;
  }

  return {
    eventType: "update",
    args: {
      id: currentJson.blockId,
      properties: { ...currentJson },
      type: currentJson.type,
    },
  };
};

export const ifTextNodeGetParent = (
  nodeKey: string,
  currState: EditorState
) => {
  return currState.read(() => {
    const n = $getNodeByKey(nodeKey);
    if (!n) {
      return null;
    }
    if (n.getType() !== "text") {
      return null;
    }

    const parent = n.getParent();
    if (!parent) {
      throw new Error(`Parent not found for text node key ${nodeKey}`);
    }

    return parent.getKey();
  });
};
