import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  TextFormatType,
} from "lexical";
import { YBlock } from "../EditorStore/YBlock";

export function $createParagraphFromYBlock(block: YBlock) {
  const paragraph = $createParagraphNode();
  for (const titleItem of block._title) {
    const textSplitByNewLine = getTextSplitByNewLine(titleItem.text);
    const formats: TextFormatType[] = [];

    if (titleItem.marks) {
      const format = getFormatFromMarks(titleItem.marks);
      formats.push(...format);
    }

    for (let i = 0; i < textSplitByNewLine.length; i++) {
      const textNode = $createTextNode(textSplitByNewLine[i]);
      for (const format of formats) {
        textNode.setFormat(format);
      }
      paragraph.append(textNode);

      if (i < textSplitByNewLine.length - 1) {
        const lineBreak = $createLineBreakNode();
        paragraph.append(lineBreak);
      }
    }
  }

  return paragraph;
}

export function getTextSplitByNewLine(text: string): string[] {
  return text.split("\n");
}

export function getFormatFromMarks(marks: string[]): TextFormatType[] {
  const formats: TextFormatType[] = [];
  for (const mark of marks) {
    switch (mark) {
      case "bold":
        formats.push("bold");
        break;
      case "italic":
        formats.push("italic");
        break;
      case "underline":
        formats.push("underline");
        break;
      case "strikethrough":
        formats.push("strikethrough");
        break;
      default:
        throw new Error(`Unknown mark ${mark}`);
    }
  }
  return formats;
}
