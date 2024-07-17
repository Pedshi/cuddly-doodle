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

  const [block1, setBlock1] = useState<Y.Map<unknown> | null>(null);
  const [block2, setBlock2] = useState<Y.Map<unknown> | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yPageArray = ydoc.getArray("root");

    const yarray = new Y.Array();
    yarray.insert(0, [1, 2, 3]);
    yarray.insert(0, [4, 5, 6]);
    yarray.push([{ title: "value 3 " + randomThreeDigitNr() }]);

    const block1 = new Y.Map();
    block1.set("Some key", val);

    const block2 = new Y.Map();

    console.log("val", val);
    yPageArray.insert(0, [block1, block2, yarray]);

    yPageArray.observeDeep((event, transaction) => {
      console.log("event", event);
      console.log("transaction", transaction);
    });

    setBlock1(block1);
    setBlock2(block2);
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
      if (!block1 || !block2) {
        return;
      }
      val = { title: "value 2 " + randomThreeDigitNr() };
      // block1.set("Some key", { title: "value 1 " + randomThreeDigitNr() });
    }, "server");
  };

  const addKeyY2 = () => {
    if (!y2) {
      return;
    }
    const ymap = y2.getMap();
    ymap.set("key Y2", "value Y2");
    const map = y2.getMap();
    console.log("map", map?.toJSON());
  };

  const print = () => {
    if (!y1) {
      return;
    }
    const yarray = y1.getArray("root");
    console.log("yarray", yarray.toJSON());
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
