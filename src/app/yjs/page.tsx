"use client";
import { useEffect, useState } from "react";
import * as Y from "yjs";

const randomThreeDigitNr = () => {
  return Math.floor(100 + Math.random() * 900);
};

let val = { title: "value 1 " + randomThreeDigitNr() };
export default function TestY() {
  const [y1, setY1] = useState<Y.Doc | null>(null);
  const [y2, setY2] = useState<Y.Doc | null>(null);

  const [elem, setElem] = useState<Y.Map<unknown> | null>(null);
  const [text, setText] = useState<Y.Array<unknown> | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const ypageMap = ydoc.getMap("page");

    const yarray = new Y.Array();
    yarray.push(["itemA", "itemB", "itemC"]);

    ypageMap.set("FIRST-ARRAY", yarray);

    ypageMap.observeDeep((event, transaction) => {
      event.forEach((e) => e.delta);

      for (const e of event) {
        console.log("event", e);
        console.log("event path", e.path);
        console.log("event delta", e.delta);
        console.log("event changes", e.changes);
        console.log(".-----");
      }
    });

    setY1(ydoc);
  }, []);
  useEffect(() => {
    const ydoc = new Y.Doc();
    setY2(ydoc);
  }, []);

  const addKeyY1 = () => {
    if (!y1) {
      return;
    }
    y1.transact(() => {
      const newMap = new Y.Map();

      const pageMap = y1.getMap("page");

      const titleArray = new Y.Array();
      titleArray.insert(0, ["newTitle"]);

      const props = new Y.Map();
      props.set("type", "paragraph");

      newMap.set("TITLE", titleArray);
      newMap.set("PROPERTIES", props);

      pageMap.set("NEW_BLOCK_ID", newMap);
      setElem(newMap);
      setText(titleArray);
    }, "server");
  };

  const addKeyY2 = () => {
    if (!y1) {
      return;
    }
    y1.transact(() => {
      if (!elem) {
        return;
      }

      elem.set("NEW_KEY", "NEW_VALUE");
    });
  };

  const print = () => {
    if (!y1) {
      return;
    }
    const map = y1.getMap("page");
    console.log("page", map.toJSON());
  };

  return (
    <div className="flex flex-col gap-4">
      <h1>TestY</h1>
      <button onClick={addKeyY1}>Add to Y1</button>
      <button onClick={addKeyY2}>Add to Y2</button>
      <button onClick={print}>Print</button>
    </div>
  );
}
