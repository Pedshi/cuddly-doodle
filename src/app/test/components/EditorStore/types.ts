import { YBlock } from "./YBlock";
import { Doc, Map as YMap } from "yjs";

export type LuneToLexMap = Map<string, YBlock>;

export type Bindings = {
  blockMap: YMap<unknown>;
  luneToLexMap: LuneToLexMap;
  page: YBlock;
  doc: Doc;
};

export type TitleItem = {
  text: string;
  marks?: string[];
};
