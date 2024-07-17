export const mockData: MockData = {
  data: [
    {
      id: "123-page",
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
  title?: Record<string, any>;
  type: string;
  properties?: {
    title?: string;
  };
};
