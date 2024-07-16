import {
  $getNodeByKey,
  $isElementNode,
  EditorState,
  SerializedElementNode,
  SerializedLineBreakNode,
  SerializedTextNode,
  TEXT_TYPE_TO_FORMAT,
} from "lexical";
import { ActionEvent } from "./types";

export const toTransactions = (
  actionList: ActionEvent[],
  state: EditorState,
  prevState: EditorState
) => {
  const transactions: any[] = [];

  for (const action of actionList) {
    switch (action.eventType) {
      case "create":
        transactions.push(transactionCreate(action, state));
        break;
      case "delete":
        transactions.push(transactionDelete(action, prevState));
        break;
      case "update":
        transactions.push(transactionUpdate(action, state));
        break;
      default:
        throw new Error(`Unknown event type: ${action.eventType}`);
    }
  }

  return transactions;
};

const transactionDelete = (action: ActionEvent, prevState: EditorState) => {
  const deleteQuery = getDeleteQuery(action);
  const parentJson = prevState.read(() => $getParentJson(action.lexicalKey));

  if (!parentJson) {
    return [deleteQuery];
  }

  const removeChildQuery = getRemoveChildQuery(parentJson, action.args.id);

  return [deleteQuery, removeChildQuery];
};

const transactionUpdate = (action: ActionEvent, state: EditorState) => {
  return getUpdateQuery(action);
};

const transactionCreate = (action: ActionEvent, state: EditorState) => {
  const createNodeQuery = getCreateQuery(action);
  const parentJson = state.read(() => $getParentJson(action.lexicalKey));

  if (!parentJson) {
    return [createNodeQuery];
  }

  const addChildQuery = getAddChildQuery(parentJson, action.args.id);

  return [createNodeQuery, addChildQuery];
};

const $getParentJson = (key: string) => {
  const createdNode = $getNodeByKey(key);
  if (!createdNode || !$isElementNode(createdNode)) {
    throw new Error(`Node not found for key ${key}`);
  }

  const parent = createdNode.getParent();
  if (!parent) {
    return null;
  }

  return parent.exportJSON() as SerializedElementNode & { blockId: string };
};

const getUpdateQuery = (action: ActionEvent) => {
  const titleRaw = action.args?.properties?.title;

  let title: Title | undefined;
  if (titleRaw) {
    title = convertTextNodes(titleRaw);
  }

  return {
    event: "update_block",
    args: {
      id: action.args.id,
      type: action.args.type,
      title: title,
      properties: toLuneProperties(action),
    },
  };
};

const getDeleteQuery = (action: ActionEvent) => {
  return {
    event: "delete_block",
    args: {
      id: action.args.id,
      type: action.args.type,
    },
  };
};

const getAddChildQuery = (
  json: SerializedElementNode & { blockId: string },
  childBlockId: string
) => {
  return {
    event: "add_child",
    args: {
      id: json.blockId,
      childId: childBlockId,
      type: json.type,
    },
  };
};

const getRemoveChildQuery = (
  json: SerializedElementNode & { blockId: string },
  childBlockId: string
) => {
  return {
    event: "remove_child",
    args: {
      id: json.blockId,
      childId: childBlockId,
      type: json.type,
    },
  };
};

const getCreateQuery = (action: ActionEvent) => {
  const titleRaw = action.args?.properties?.title;

  let title: Title | undefined;
  if (titleRaw) {
    title = convertTextNodes(titleRaw);
  }

  // TODO: Add children if there are any

  const block = {
    id: action.args.id,
    type: action.args.type, // Convert to our types,
    title: title,
    properties: toLuneProperties(action),
  };

  return {
    event: "create_block",
    args: block,
  };
};

const toLuneProperties = (action: ActionEvent) => {
  if (isSerializedTextNode(action.args)) {
    return {
      marks: getFormat(action.args),
    };
  }
};

// For now if linebreak encountered, we add the following text separately
const convertTextNodes = (
  textNodes: Array<SerializedTextNode | SerializedLineBreakNode>
) => {
  const title: Title = { content: [] };

  for (const node of textNodes) {
    let text = "";
    let format;

    if (isSerializedTextNode(node)) {
      text = node.text;
      format = getFormat(node);
      title.content.push({ text, marks: format });
      continue;
    }

    if (isSerializedLineBreakNode(node)) {
      const addText = "\n";

      // If there is already a text then add the linebreak to the last text
      // Else add a new text with the linebreak
      if (title.content.length > 0) {
        title.content[title.content.length - 1].text += addText;
      } else {
        title.content.push({ text: addText });
      }
    }
  }

  return title;
};

const isSerializedTextNode = (node: {
  type: string;
}): node is SerializedTextNode => {
  return node.type === "text";
};

const isSerializedLineBreakNode = (
  node: SerializedTextNode | SerializedLineBreakNode
): node is SerializedLineBreakNode => {
  return node.type === "linebreak";
};

const getFormat = (node: SerializedTextNode) => {
  const lexicalFormat = node.format;
  const luneFormat: string[] = [];

  for (const key in TEXT_TYPE_TO_FORMAT) {
    const flag = TEXT_TYPE_TO_FORMAT[key];
    if (lexicalFormat & flag) {
      const luneFormatKey = lexicalFormatToLuneFormat(key);
      if (luneFormatKey) {
        luneFormat.push(luneFormatKey);
      }
    }
  }

  return luneFormat;
};

const lexicalFormatToLuneFormat = (lexicalFormat: string) => {
  switch (lexicalFormat) {
    case "bold":
      return "bold";
    case "italic":
      return "italic";
    case "highlight":
      return "highlight";
    case "underline":
      return "underline";
    case "strikethrough":
      return "strikethrough";
    default:
      return null;
  }
};

type Title = {
  content: TitleItem[];
};

type TitleItem = {
  text: string;
  marks?: string[];
};
