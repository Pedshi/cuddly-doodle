import { ServerEvent } from "../Provider/ClientProvider";

export const mockDataReceiveOnlyUpdate: ServerEvent = {
  tag: "from_someone_else",
  transactions: [
    {
      eventType: "update",
      data: {
        id: "234-text",
        type: "text",
        title: {
          content: [
            {
              text: "Fresh text from remote",
            },
          ],
        },
      },
    },
  ],
};

export const mockDataReceiveUpdateAndCreate: ServerEvent = {
  tag: "from_someone_else",
  transactions: [
    {
      eventType: "update",
      data: {
        id: "234-text",
        type: "text",
        title: {
          content: [
            {
              text: "Fresh text from remote",
            },
          ],
        },
      },
    },
    {
      eventType: "create",
      data: {
        id: "789-text",
        type: "text",
        title: {
          content: [
            {
              text: "This block is completely new",
            },
          ],
        },
      },
    },
    {
      eventType: "update",
      data: {
        id: "123-page",
        type: "page",
        content: ["234-text", "456-text", "789-text"],
      },
    },
  ],
};

export const mockDataReceiveCRUDOps: ServerEvent = {
  tag: "from_someone_else",
  transactions: [
    {
      eventType: "update",
      data: {
        id: "234-text",
        type: "text",
        title: {
          content: [
            {
              text: "Fresh text from remote",
            },
          ],
        },
      },
    },
    {
      eventType: "create",
      data: {
        id: "789-text",
        type: "text",
        title: {
          content: [
            {
              text: "This block is completely new",
            },
          ],
        },
      },
    },
    {
      eventType: "update",
      data: {
        id: "123-page",
        type: "page",
        content: ["234-text", "456-text", "789-text"],
      },
    },
    {
      eventType: "delete",
      data: {
        id: "d123-text",
      },
    },
  ],
};
