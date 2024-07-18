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

export function serverProvider(
  events: Array<YEvent<any>>,
  transaction: Transaction
) {
  events.forEach((event) => event.delta);

  const transactions = [];
  for (const event of events) {
    const target = event.target;

    if (event instanceof YMapEvent) {
      const luneEvent = handleYMapEvent(event);

      transactions.push(luneEvent);
    } else if (event instanceof YArrayEvent) {
      const luneEvent = handleYArrayEvent(event);

      transactions.push(luneEvent);
    }
  }

  console.log("Lune transactions", transactions);
}

// For now only handles title events as array
function handleYArrayEvent(event: YArrayEvent<any>) {
  const { path } = event;
  const blockId = path[0];
  const updatedKey = path[1];

  if (!(typeof updatedKey === "string") || !isTitleKey(updatedKey)) {
    console.error("Invalid key type", updatedKey);
    return;
  }

  const titleYarray = event.target as YArray<TitleItem>;
  const title = titleYarray.toJSON();

  const luneEvent = {
    eventType: "update",
    data: {
      id: blockId as string,
      title: { content: title },
    },
  };

  return luneEvent;
}

function handleYMapEvent(event: YMapEvent<any>) {
  const { path } = event;
  const blockId = path[0];
  const updatedKey = path[1];

  if (!(typeof updatedKey === "string") || !isPropertiesKey(updatedKey)) {
    console.error("Invalid key type", updatedKey);
    return;
  }

  const propertiesYmap = event.target as YMap<any>;
  const properties = propertiesYmap.toJSON();

  const luneEvent = {
    eventType: "update",
    data: {
      id: blockId as string,
      properties,
    },
  };

  return luneEvent;
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
