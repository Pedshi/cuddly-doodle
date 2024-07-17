"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Doc, Map as YMap, Array as YArray } from "yjs";
import { MockData, mockData } from "./components/data/mock-data";
import { YjsElementNode } from "./components/data/YjsElementNode";

const Editor = dynamic(
  () => import("./components/editor").then((mod) => mod.Editor),
  {
    ssr: false,
  }
);

const fetchBlocks = async () => {
  return mockData;
}

const MAP_NAME = "lune_blocks";

export default function App() {
  const [doc, setDoc] = useState(new Doc());
  const [loading, setLoading] = useState(true);

  const [blockMap, setBlockMap] = useState<YMap<unknown> | null>(null);
  const [blocks, setBlocks] = useState<YjsElementNode[]>([]);
  const [pageId, setPageId] = useState("");

  useEffect(() => {
    const setupBlocks = async () => {
      const data = await fetchBlocks();

      const blockMap = doc.getMap(MAP_NAME);
      const {blocks} = setupYjsNodes(data, blockMap);

      // connect to storequeue
      // blockMap.observeDeep(storeQueue)

      const pageId = getPageBlockId(data);
      if (!pageId) {
        throw new Error("Page block not found");
      }

      setBlockMap(blockMap);
      setBlocks(blocks);
      setPageId(pageId);
      setLoading(false);
    };

    setupBlocks();
  }, [])
  
  if (loading || !blockMap) {
    return <div>Loading...</div>;
  }

  return <Editor blockMap={blockMap} blocks={blocks} pageId={pageId}/>;
}


function setupYjsNodes(data: MockData, blockMap: YMap<unknown>) {
  const blocks: YjsElementNode[] = [];
  for (const block of data.data) {
    const titleMap = new YArray();
    const propertiesMap = new YMap();
    const element = new YjsElementNode(block.id, propertiesMap, titleMap, block.type, []);

    const elementMap = new YMap();
    // TODO: missing type in properties
    elementMap.set('properties', propertiesMap);
    elementMap.set('title', titleMap);
    
    blockMap.set(block.id, elementMap);
    
    blocks.push(element);

    // create YjsElementNode from block
    // add corresponding Map to the blockMap
  }

  return {blockMap, blocks};
}

function getPageBlockId(data: MockData) {
  return data.data.find((node) => node.type === "page")?.id;
}