import {
  $getNodeByKey,
  $isElementNode,
  $isLineBreakNode,
  $isTextNode,
  EditorState,
  LexicalNode,
  SerializedElementNode,
  SerializedLineBreakNode,
  SerializedTextNode,
} from "lexical";
import { ActionEvent } from "./types";

const $combineTextNodes = (
  nodes: LexicalNode[]
): Array<SerializedTextNode | SerializedLineBreakNode> => {
  const textNodes = [];
  for (const node of nodes) {
    if (!$isTextNode(node) && !$isLineBreakNode(node)) {
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
    if (!n || !$isElementNode(n)) {
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
): ActionEvent | null => {
  const currentJson = getJson(nodeKey, currState);
  const prevJson = getJson(nodeKey, prevState);

  if (!currentJson && !prevJson) {
    throw new Error(
      `Node not found in current and previous state, key: ${nodeKey}`
    );
  }

  if (!currentJson) {
    return {
      eventType: "delete",
      lexicalKey: nodeKey,
      args: {
        id: prevJson!.blockId,
        type: prevJson!.type,
      },
    };
  }

  if (!prevJson) {
    return {
      lexicalKey: nodeKey,
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
    lexicalKey: nodeKey,
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
  currState: EditorState,
  prevState: EditorState
) => {
  let parentKey = currState.read(() => $getParentKey(nodeKey));
  if (parentKey) {
    return parentKey;
  }

  return prevState.read(() => $getParentKey(nodeKey));
};

const $getParentKey = (key: string) => {
  const n = $getNodeByKey(key);
  if (!n) {
    return null;
  }
  if (!$isTextNode(n) && !$isLineBreakNode(n)) {
    return null;
  }

  const parent = n.getParent();
  if (!parent) {
    throw new Error(`Parent not found for text node key ${key}`);
  }

  return parent.getKey();
};
