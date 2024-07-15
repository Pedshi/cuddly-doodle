import { ParagraphNode, SerializedParagraphNode } from "lexical";

export class BlockNode extends ParagraphNode {
  __blockId: string;
  static getType() {
    return "block";
  }

  constructor(blockId: string) {
    super();
    this.__blockId = blockId;
  }

  static clone() {
    return new BlockNode(crypto.randomUUID());
  }
  exportJSON(): SerializedParagraphNode & { blockId: string } {
    return {
      ...super.exportJSON(),
      blockId: this.__blockId,
    };
  }
}

export const $createBlockNode = (blockId: string) => {
  return new BlockNode(blockId);
};
