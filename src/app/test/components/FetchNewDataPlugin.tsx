import { Doc } from "yjs";
import { mockDataReceive } from "./data/mock-data-receive";
import { clientProvider } from "./Provider/ClientProvider";

const getData = () => {
  return mockDataReceive;
};

export function FetchNewDataPlugin({ doc }: { doc: Doc }) {
  const fetchNewData = async () => {
    const newData = getData();
    clientProvider(newData, doc);
  };

  return (
    <div>
      <button onClick={fetchNewData}>Fetch New Data</button>
    </div>
  );
}
