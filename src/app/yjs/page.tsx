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

  const [elem, setElem] = useState<Y.XmlElement | null>(null);
  const [text, setText] = useState<Y.XmlText | null>(null);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const yPageArray = ydoc.getArray("root");

    const elem = new Y.XmlElement("node-name");
    elem.setAttribute("MyKey1", "MyValue1");

    const text = new Y.XmlText("Hello World");
    text.setAttribute("MyTextAttribute1", "MyTextValue");

    yPageArray.insert(0, [elem, text]);

    yPageArray.observeDeep((event, transaction) => {
      event.forEach((e) => e.delta);

      for (const e of event) {
        console.log("event", e);
        console.log("event path", e.path);
        console.log("event delta", e.delta);
        console.log("event changes", e.changes);
        console.log("event attributesChanged", e?.attributesChanged);
        console.log(".-----");
      }
    });

    setElem(elem);
    setText(text);
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
      elem?.setAttribute("MyKey1", "MyNewValue1");
      elem?.setAttribute("MyKey2", "MyValue2");
      text?.setAttribute("MyTextAttribute1", "MyNewTextValue1");
      text?.setAttribute("MyTextAttribute2", "MyTextValue2");
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
