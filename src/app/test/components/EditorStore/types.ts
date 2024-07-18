import { YBlock } from "./YBlock";
import { Doc, Map as YMap } from "yjs";

// nodekey -> YBlock
export type LuneToLexMap = Map<string, YBlock>;

export type Bindings = {
  blockMap: YMap<unknown>;
  luneToLexMap: LuneToLexMap;
  idToYBlockMap: Map<string, YBlock>;
  blockIdToNodeKeyPair: Map<string, string>;
  page: YBlock;
  doc: Doc;
};

export type TitleItem = {
  text: string;
  marks?: string[];
};
