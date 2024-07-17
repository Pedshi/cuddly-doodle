import { YBlock } from "./YBlock";
import { Map as YMap } from "yjs";

export type LuneToLexMap = Map<string, YBlock>;

export type Bindings = {
  blockMap: YMap<unknown>;
  luneToLexMap: LuneToLexMap;
  page: YBlock;
};
