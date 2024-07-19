import { Doc } from "yjs";
import { mockDataReceiveUpdateAndCreate } from "./data/mock-data-receive";
import { clientProvider } from "./Provider/ClientProvider";
import { YBlock } from "./EditorStore/YBlock";

const getData = () => {
  return mockDataReceiveUpdateAndCreate;
};

export function FetchNewDataPlugin({
  doc,
  idToYBlock,
}: {
  doc: Doc;
  idToYBlock: Map<string, YBlock>;
}) {
  const fetchNewData = async () => {
    const newData = getData();
    clientProvider(newData, doc, idToYBlock);
  };

  return (
    <div>
      <button onClick={fetchNewData}>Fetch New Data</button>
    </div>
  );
}
