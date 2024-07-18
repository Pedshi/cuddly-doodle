import { useEffect, useState } from "react";
import { Doc } from "yjs";
import { MAP_NAME } from "../../page";

export const YTreePlugin = ({ doc }: { doc: Doc }) => {
  const [refresh, setRefresh] = useState(new Date());
  const json = doc.getMap(MAP_NAME).toJSON();

  useEffect(() => {
    const map = doc.getMap(MAP_NAME);
    const update = () => {
      setRefresh(new Date());
    };
    map.observeDeep(update);
    return () => {
      map.unobserveDeep(update);
    };
  }, []);

  return (
    <div className="border p-3">
      <h1>Yjs Tree</h1>
      <pre>{JSON.stringify(json, null, 2)}</pre>
    </div>
  );
};
