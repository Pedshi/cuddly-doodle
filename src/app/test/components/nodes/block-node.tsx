import { $applyNodeReplacement, ParagraphNode, SerializedParagraphNode } from "lexical";

export class BlockNode extends ParagraphNode {
  __blockId: string;
  static getType() {
    return "block";
  }

  constructor(blockId: string, key?: string) {
    super(key);
    this.__blockId = blockId;
  }

  static clone(node: BlockNode) {
    return new BlockNode(node.__blockId, node.__key);
  }

  exportJSON(): SerializedParagraphNode & { blockId: string } {
    return {
      ...super.exportJSON(),
      blockId: this.__blockId,
    };
  }
}

export const $createBlockNode = (blockId: string) => {
  return $applyNodeReplacement(new BlockNode(blockId));
};
