import { ServerEvent } from "../Provider/ClientProvider";

export const mockDataReceive: ServerEvent = {
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
