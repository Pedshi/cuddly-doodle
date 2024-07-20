import { TitleItem } from "../EditorStore/types";

export const mockDataOnlyPage: MockData = {
  data: [
    {
      id: "123-page",
      type: "page",
    },
  ],
};

export const mockDataOnlyParagraphAndPage: MockData = {
  data: [
    {
      id: "d123-text",
      type: "text",
      title: {
        content: [
          {
            text: "To be deleted",
          },
        ],
      },
      properties: {},
    },
    {
      id: "456-text",
      type: "text",
      title: {
        content: [
          {
            text: "This is a paragraph \n",
          },
          { text: "Formatted text", marks: ["bold"] },
        ],
      },
      properties: {},
    },
    {
      id: "234-text",
      type: "text",
      title: {
        content: [
          {
            text: "This is also a paragraph",
          },
        ],
      },
      properties: {},
    },
    {
      id: "123-page",
      content: ["234-text", "456-text", "d123-text"],
      type: "page",
    },
  ],
};

export const mockDataLong: MockData = {
  data: [
    {
      id: "456-text",
      type: "text",
      title: {
        content: [
          {
            text: "This is a paragraph \n",
          },
          { text: "Formatted text", marks: ["bold"] },
        ],
      },
      properties: {},
    },
    {
      id: "234-text",
      type: "text",
      title: {
        content: [
          {
            text: "This is also a paragraph",
          },
        ],
      },
      properties: {},
    },
    {
      id: "123-header",
      type: "header",
      title: {
        content: [
          {
            text: "This is a header",
          },
        ],
      },
      properties: {},
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
  title?: { content: TitleItem[] };
  type: string;
  properties?: {
    title?: string;
  };
};
