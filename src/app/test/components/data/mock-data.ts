import { title } from "process";

export const mockData: MockData = {
  data: [
    {
      id: "456-text",
      type: "text",
      properties: {
        title: "This is not a paragraph",
      },
    },
    {
      id: "234-text",
      type: "text",
      properties: {
        title: "This is a text",
      },
    },
    {
      id: "123-header",
      type: "header",
      properties: {
        title: "Dokument titel",
      },
    },
    {
      id: "123-page",
      content: ["123-header", "234-text", "456-text"],
      type: "page",
    },
  ],
};

export type MockData = {
  data: Block[];
};
export type Block = {
  id: string;
  content?: string[];
  type: string;
  properties?: {
    title?: string;
  };
};
