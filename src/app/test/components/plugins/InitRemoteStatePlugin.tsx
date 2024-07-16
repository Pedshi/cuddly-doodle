import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, SerializedElementNode } from "lexical";
import { useEffect } from "react";
import { syncEngine } from "./listener-plugin";

export const InitRemoteStatePlugin = () => {
    const [editor] = useLexicalComposerContext();
    
    useEffect(() => {
        const t = editor.getEditorState().read(() => {
          const root = $getRoot();
          const pageId = crypto.randomUUID();
          const transaction = [{
            event: "create_block",
            args: {
              id: pageId,
              type: "page",
              properties: {},
            },
          }];
    
          const children = root.getChildren();
    
          for (const child of children) {
            const block = child.exportJSON() as SerializedElementNode & { blockId: string };
            const t = {
              event: "create_block",
              args: {
                id: block.blockId,
                type: block.type,
              },
            }
            const addAsChild = {
              event: "add_child",
              args: {
                id: pageId,
                childId: block.blockId,
                type: "page",
              },
            }
            transaction.push(t as any);
            transaction.push(addAsChild as any);
          }
    
          return transaction;
          });
          
        syncEngine([t]);
        
      },[]);

      return null;
};