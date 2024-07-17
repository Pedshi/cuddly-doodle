import { $createParagraphNode, $createTextNode, ParagraphNode } from "lexical";
import { Block, MockData, mockDataOnlyPage } from "../data/mock-data";

import { $createHeadingNode } from "@lexical/rich-text";
import { $createBlockNode, BlockNode } from "../nodes/block-node";

export const findPageNode = (data: MockData) =>
  mockDataOnlyPage.data.find((node) => node.type === "page");

const getrandomthreedigitNr = () => {
  return Math.floor(100 + Math.random() * 900);
};

const createNodeType = (node: Block) => {
  let textNode;
  switch (node.type) {
    case "text":
      const paragraphNode = $createBlockNode(node.id);
      textNode = $createTextNode(node.properties?.title);
      paragraphNode.append(textNode);
      return paragraphNode;
    case "header":
      const headingNode = $createHeadingNode("h1");
      textNode = $createTextNode(node.properties?.title);
      headingNode.append(textNode);
      return headingNode;
    default:
      throw new Error(`Unknown node type: ${node.type}`);
  }
};

export const createNodeFromRoot = (root: Block, data: MockData) => {
  const node = createNodeType(root);
  if (!root.content) {
    return node;
  }

  for (const id of root.content) {
    const childBlock = data.data.find((node) => node.id === id);
    if (!childBlock) {
      throw new Error(`Node with id ${id} not found`);
    }

    const childNode = createNodeFromRoot(childBlock, data);
    if (!childNode) {
      continue;
    }

    node.append(childNode);
  }

  return node;
};
