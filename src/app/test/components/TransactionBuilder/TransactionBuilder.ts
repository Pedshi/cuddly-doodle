import {
  Transaction,
  YArrayEvent,
  YEvent,
  YMapEvent,
  Array as YArray,
  Map as YMap,
} from "yjs";
import { TitleItem } from "../EditorStore/types";

const isTitleKey = (key: string) => key === "title";
const isPropertiesKey = (key: string) => key === "properties";

export function transactionProvider(
  events: Array<YEvent<any>>,
  transaction: Transaction
) {
  events.forEach((event) => event.delta);

  const transactions = [];
  for (const event of events) {
    const target = event.target;

    if (event instanceof YMapEvent) {
      const { path } = event;
      const blockId = path[0];
      const updatedKey = path[1];

      if (!(typeof updatedKey === "string")) {
        console.error("Invalid key type", updatedKey);
        continue;
      }

      if (!isPropertiesKey(updatedKey)) {
        console.error("Invalid key", updatedKey);
        continue;
      }

      const propertiesYmap = target as YMap<any>;
      const properties = propertiesYmap.toJSON();
      const luneEvent = {
        eventType: "update",
        data: {
          id: blockId as string,
          properties,
        },
      };

      transactions.push(luneEvent);
    } else if (event instanceof YArrayEvent) {
      const { path } = event;
      const blockId = path[0];
      const updatedKey = path[1];

      if (!(typeof updatedKey === "string")) {
        console.error("Invalid key type", updatedKey);
        continue;
      }

      if (!isTitleKey(updatedKey)) {
        console.error("Invalid key", updatedKey);
        continue;
      }

      const titleYarray = target as YArray<TitleItem>;
      const title = titleYarray.toJSON();
      const luneEvent = {
        eventType: "update",
        data: {
          id: blockId as string,
          title: { content: title },
        },
      };

      transactions.push(luneEvent);
    }
  }

  console.log("Lune transactions", transactions);
}

type LuneTransaction = {
  eventType: string;
  data: {
    id: string;
    type?: string;
    title?: { content: Array<TitleItem> };
    properties?: Record<string, any>;
  };
};
