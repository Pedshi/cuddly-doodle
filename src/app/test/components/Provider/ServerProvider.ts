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
const isChildrenKey = (key: string) => key === "children";

const isCreateNewBlockEvent = (event: YMapEvent<any>) => {
  const { path } = event;
  return path.length === 0;
};

export function serverProvider(
  events: Array<YEvent<any>>,
  transaction: Transaction
) {
  // This line precompute the delta before editor update. The reason is
  // delta is computed when it is accessed. Note that this can only be
  // safely computed during the event call. If it is accessed after event
  // call it might result in unexpected behavior.
  // https://github.com/yjs/yjs/blob/00ef472d68545cb260abd35c2de4b3b78719c9e4/src/utils/YEvent.js#L132
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
  if (
    !blockId ||
    typeof blockId !== "string" ||
    typeof updatedKey !== "string"
  ) {
    throw new Error(
      `Invalid blockId or updatedKey blockId: ${blockId}, updatedKey: ${updatedKey}`
    );
  }

  if (isChildrenKey(updatedKey)) {
    return updateChildrenEvent(blockId, event);
  } else if (isTitleKey(updatedKey)) {
    return updateTitleEvent(blockId, event);
  } else {
    console.error("Invalid key type", updatedKey);
  }
}

function updateChildrenEvent(blockId: string, event: YArrayEvent<any>) {
  const childrenYarray = event.target as YArray<string>;
  const children = childrenYarray.toJSON();

  const luneEvent = {
    eventType: "update",
    data: {
      id: blockId as string,
      children,
    },
  };

  return luneEvent;
}

function updateTitleEvent(blockId: string, event: YArrayEvent<any>) {
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
  if (isCreateNewBlockEvent(event)) {
    return createNewBlockEvent(event);
  }

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

function createNewBlockEvent(event: YMapEvent<any>): LuneTransaction[] {
  const { keysChanged, target } = event;
  const transactions = [];
  for (const blockId of keysChanged) {
    if (typeof blockId !== "string") {
      throw new Error(`Invalid blockId ${blockId}`);
    }

    transactions.push(
      getCreateBlockTransaction(blockId, target as YMap<unknown>)
    );
  }

  return transactions;
}

function getCreateBlockTransaction(blockId: string, blockMap: YMap<unknown>) {
  const block = blockMap.get(blockId);
  if (!block || !(block instanceof YMap)) {
    throw new Error(`Block not a YMap or found, id ${blockId}`);
  }

  const title = block.get("title");
  const properties = block.get("properties");
  const children = block.get("children");

  const luneEvent = {
    eventType: "create",
    data: {
      id: blockId,
      title: title.toJSON(),
      properties: properties.toJSON(),
      children: children.toJSON(),
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
