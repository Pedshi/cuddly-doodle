"use client";
import { useEffect, useState } from "react";
import * as Y from "yjs";

const randomThreeDigitNr = () => {
  return Math.floor(100 + Math.random() * 900);
};

export default function TestY() {
  const [y1, setY1] = useState<Y.Doc | null>(null);
  const [y2, setY2] = useState<Y.Doc | null>(null);

  const [block1, setBlock1] = useState<Y.Map<unknown> | null>(null);
  const [block2, setBlock2] = useState<Y.Map<unknown> | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yPageArray = ydoc.getArray("root");
    yPageArray.observe((event) => {
      console.log("Page changes", event.changes.keys);
    });

    const block1 = new Y.Map();
    block1.observe((event) => {
      console.log("Block1 changes", event);
    });

    const block2 = new Y.Map();
    block2.observe((event) => {
      console.log("Block2 changes", event);
      console.log("Block2 changes path ", event.path);
    });

    yPageArray.insert(0, [block1, block2]);

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
      block1.set("block 1", { title: "value 1 " + randomThreeDigitNr() });
      block2.set("block 2", { title: "value 2 " + randomThreeDigitNr() });
    });
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
