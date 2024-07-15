import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createLuneTableNode, LuneTableNode } from "./nodes/table-node";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

export const MyCustomNodePlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.registerNodeTransform(LuneTableNode, (node) => {
      // Your node transformation logic
      console.log("Node transformation logic");
    });

    editor.update(() => {
      const root = $getRoot();
      const paragraph = $createParagraphNode();
      const text = $createTextNode(
        "Hello, this is a paragraph with a decorator node: "
      );
      paragraph.append(text);
      paragraph.append($createLuneTableNode());
      root.append(paragraph);
    });
  }, [editor]);

  return null;
};
