import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  LexicalEditor,
  ParagraphNode,
  RootNode,
} from "lexical";
import { FloatingFormatPlugin } from "./plugins/floating-format-plugin";
import TreeViewPlugin from "./treeview";

import { HeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { Block, MockData, mockData } from "./data/mock-data";
import { createNodeFromRoot, findPageNode } from "./util/block-compose";
import { ListenerPlugin } from "./plugins/listener-plugin";
import { useCallback } from "react";
import { Doc } from "yjs";
import { WebsocketProvider } from "y-websocket";
import { ChecklistNode } from "./nodes/checklist-node";
import { $createBlockNode, BlockNode } from "./nodes/block-node";
import { InitRemoteStatePlugin } from "./plugins/InitRemoteStatePlugin";

const placeholder = "Enter some rich text...";

const theme = {
  code: "editor-code",
  heading: {
    h1: "font-bold text-2xl editor-heading-h1",
    h2: "editor-heading-h2",
    h3: "editor-heading-h3",
    h4: "editor-heading-h4",
    h5: "editor-heading-h5",
  },
  image: "editor-image",
  link: "editor-link",
  list: {
    listitem: "editor-listitem",
    nested: {
      listitem: "editor-nested-listitem",
    },
    ol: "editor-list-ol",
    ul: "editor-list-ul",
  },
  ltr: "ltr",
  paragraph: "editor-paragraph",
  placeholder: "editor-placeholder",
  quote: "editor-quote",
  rtl: "rtl",
  text: {
    bold: "editor-text-bold",
    code: "editor-text-code",
    hashtag: "editor-text-hashtag",
    italic: "editor-text-italic",
    overflowed: "editor-text-overflowed",
    strikethrough: "editor-text-strikethrough",
    underline: "editor-text-underline",
    underlineStrikethrough: "editor-text-underlineStrikethrough",
  },
};

const randomThreeDigitNr = () => {
  return Math.floor(100 + Math.random() * 900);
};

const editorConfig = {
  namespace: "React.js Demo",
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    ChecklistNode,
    BlockNode,
    {
      replace: ParagraphNode,
      with: (node: ParagraphNode) => {
        return $createBlockNode(crypto.randomUUID());
      },
    },
  ],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // The editor theme
  theme,
  // editorState: (editor: LexicalEditor) => {
  //   const root = $getRoot();

  //   const pageNode = findPageNode(mockData);
  //   if (!pageNode || !pageNode.content) {
  //     return;
  //   }

  //   for (const id of pageNode.content) {
  //     const block = mockData.data.find((node) => node.id === id);
  //     if (!block) {
  //       throw new Error(`Node with id ${id} not found`);
  //     }

  //     const node = createNodeFromRoot(block, mockData);
  //     root.append(node);
  //   }
  // },
};

let idSuffix = 0;

export const Editor = () => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div className="editor-container p-2">
        <FloatingFormatPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input p-6"
                aria-placeholder={placeholder}
                placeholder={"Enter some rich text..."}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={null}
          />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
          {/* <DraggableBlockPlugin /> */}
          <ListenerPlugin />
          <InitRemoteStatePlugin />
        </div>
      </div>
    </LexicalComposer>
  );
};
