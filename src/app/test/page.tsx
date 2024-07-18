"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Doc, Map as YMap, Array as YArray } from "yjs";
import {
  MockData,
  mockDataOnlyPage,
  mockDataOnlyParagraphAndPage,
} from "./components/data/mock-data";
import { YBlock } from "./components/EditorStore/YBlock";
import { setupYBlocks } from "./components/util/setupYBlocks";

const Editor = dynamic(
  () => import("./components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

const fetchBlocks = async () => {
  return mockDataOnlyParagraphAndPage;
};

export const MAP_NAME = "lune_blocks";

export default function App() {
  const [doc, setDoc] = useState(new Doc());
  const [loading, setLoading] = useState(true);

  const [blockMap, setBlockMap] = useState<YMap<unknown> | null>(null);
  const [page, setPage] = useState<YBlock | null>();
  const hasSetupBlocks = useRef(false);

  useEffect(() => {
    if (hasSetupBlocks.current) {
      return;
    }
    const setupBlocks = async () => {
      const data = await fetchBlocks();

      const blockMap = doc.getMap(MAP_NAME);
      const { page } = setupYBlocks(data, blockMap);

      // connect to storequeue
      // blockMap.observeDeep(storeQueue)

      setBlockMap(blockMap);
      setPage(page);
      setLoading(false);
    };

    setupBlocks();
    hasSetupBlocks.current = true;
  }, []);

  if (loading || !blockMap || !page) {
    return <div>Loading...</div>;
  }

  return <Editor blockMap={blockMap} page={page} doc={doc} />;
}
