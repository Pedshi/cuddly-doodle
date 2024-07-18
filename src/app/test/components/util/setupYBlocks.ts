import { Doc, Map as YMap, Array as YArray } from "yjs";
import { Block, MockData } from "../data/mock-data";
import { YBlock } from "../EditorStore/YBlock";
import { TitleItem } from "../EditorStore/types";

export function setupYBlocks(
  data: MockData,
  blockMap: YMap<unknown>,
  idToYBlock: Map<string, YBlock>
) {
  const page = getPageBlock(data);
  if (!page) {
    throw new Error("Page block not found in data");
  }

  const yPage = traverseFromBlock(data, page, blockMap, idToYBlock);

  return { blockMap, page: yPage };
}

function traverseFromBlock(
  data: MockData,
  parent: Block,
  blockMap: YMap<unknown>,
  idToYBlock: Map<string, YBlock>
): YBlock {
  const yparent = createYBlockFromBlock(
    parent.id,
    parent.type,
    parent.properties,
    parent.title,
    blockMap,
    idToYBlock
  );

  if (!parent.content) {
    return yparent;
  }

  for (const childId of parent.content) {
    const childBlock = data.data.find((node) => node.id === childId);
    if (!childBlock) {
      throw new Error(`Block with id ${childId} not found`);
    }
    const ychild = traverseFromBlock(data, childBlock, blockMap, idToYBlock);
    yparent.addChild(ychild);
  }

  return yparent;
}

function createYBlockFromBlock(
  blockId: string,
  type: string,
  properties: Record<string, unknown> | undefined,
  title: { content: TitleItem[] } | undefined,
  blockMap: YMap<unknown>,
  idToYBlock: Map<string, YBlock>
) {
  const propertiesMap = getYMapFromProperties(properties, type);
  const titleArray = getYArrayFromTitle(title);

  // TODO: children need to also be in an array
  const block = new YBlock(blockId, propertiesMap, titleArray, []);

  const elementMap = new YMap();
  elementMap.set("properties", block._properties);
  elementMap.set("title", block._title);
  blockMap.set(block._blockId, elementMap);

  idToYBlock.set(blockId, block);

  return block;
}

function getYMapFromProperties(
  properties: Record<string, unknown> | undefined,
  type: string
) {
  const propertiesMap = new YMap();
  propertiesMap.set("type", type);
  if (!properties) {
    return propertiesMap;
  }

  for (const key in properties) {
    propertiesMap.set(key, properties[key]);
  }
  return propertiesMap;
}

function getYArrayFromTitle(title: { content: TitleItem[] } | undefined) {
  const yarray: YArray<TitleItem> = new YArray();
  if (!title) {
    return yarray;
  }
  if (title.content != null && Array.isArray(title.content)) {
    yarray.push(title.content);
  }
  return yarray;
}

function getPageBlock(data: MockData) {
  return data.data.find((node) => node.type === "page");
}
