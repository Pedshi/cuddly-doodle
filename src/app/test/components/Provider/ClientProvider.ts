import { Doc, Map as YMap, Array as YArray } from "yjs";
import { TitleItem } from "../EditorStore/types";
import { MAP_NAME } from "../../page";
import { updateTitles } from "../Converter/LexToY/title";

// Updates properties of blocks
export function clientProvider(event: ServerEvent, doc: Doc) {
  if (isUpdateFromMe(event.tag)) {
    return;
  }

  doc.transact(() => {
    const { transactions } = event;
    const blockMap = doc.getMap(MAP_NAME);

    for (const t of transactions) {
      const { eventType, data } = t;
      const blockId = data.id;

      if (eventType === "update") {
        const map = blockMap.get(blockId) as YMap<unknown>;
        updateBlock(map, data);
      }
    }
  }, "server");
}

function updateBlock(map: YMap<unknown>, data: LuneTransactionData) {
  if (data.title) {
    updateTitle(map, data.title);
  }

  if (data.properties) {
    updateProperties(map, data.properties);
  }

  if (data.type) {
    updateType(map, data.type);
  }
}

function updateType(map: YMap<unknown>, type: string) {
  const yproperties = map.get("properties") as YMap<unknown>;
  const ytype = yproperties.get("type");
  if (type !== ytype) {
    yproperties.set("type", type);
  }
}

function updateProperties(map: YMap<unknown>, properties: Record<string, any>) {
  const yproperties = map.get("properties") as YMap<unknown>;
  for (const [key, value] of Object.entries(properties)) {
    const yvalue = yproperties.get(key);
    if (value !== yvalue) {
      yproperties.set(key, value);
    }
  }
}

function updateTitle(map: YMap<unknown>, title: { content?: TitleItem[] }) {
  const ytitle = map.get("title") as YArray<TitleItem>;
  if (!title?.content) {
    return clearYArray(ytitle);
  }

  updateTitles(ytitle, title.content);
}

function clearYArray<T>(yarray: YArray<T>) {
  yarray.delete(0, yarray.length);
}

function isUpdateFromMe(tag: string) {
  return tag === "update_from_me";
}

export type ServerEvent = {
  tag: string;
  transactions: LuneTransaction[];
};

type LuneTransaction = {
  eventType: string;
  data: LuneTransactionData;
};

type LuneTransactionData = {
  id: string;
  type?: string;
  title?: { content: Array<TitleItem> };
  properties?: Record<string, any>;
};
