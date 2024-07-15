"use client";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";

import ToolbarPlugin from "./components/toolbar";
import TreeViewPlugin from "./components/treeview";
import {
  $createLuneTableNode,
  LuneTableNode,
} from "./components/nodes/table-node";
import { MyCustomNodePlugin } from "./components/custom-plugin";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  LexicalEditor,
} from "lexical";
import DraggableBlockPlugin from "./components/plugins/drag-move-plugin";
import { FloatingFormatPlugin } from "./components/plugins/floating-format-plugin";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("./components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

export default function App() {
  return <Editor />;
}
