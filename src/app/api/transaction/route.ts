import { writeFile } from "fs";

const BLOCK_TABLE: Record<string, any> = {};

export async function POST(request: Request) {
  const body = await request.json();

  for (const transaction of body.transactions) {
    for (const query of transaction) {
      switch (query.event) {
        case "update_block":
          updateBlock(query);
          break;
        case "delete_block":
          deleteBlock(query);
          break;
        case "create_block":
          createBlock(query);
          break;
        case "add_child":
          addChild(query);
          break;
        case "remove_child":
          removeChild(query);
          break;
        default:
          throw new Error(`Unknown event ${transaction.event}`);
      }
    }
  }

  flush();

  return Response.json({ ok: true });
}

const flush = () => {
  const jsonContent = JSON.stringify(BLOCK_TABLE, null, 2);
  const filepath = "./blocks.json";

  writeFile(filepath, jsonContent, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log("File has been created");
  });
};

const updateBlock = (query: any) => {
  const block = BLOCK_TABLE[query.args.id];
  if (!block) {
    throw new Error(`Block with id ${query.args.id} not found`);
  }

  const { title, type, properties } = query.args;
  block.title = title;
  block.type = type;
  block.properties = properties;
};

const deleteBlock = (query: any) => {
  const block = BLOCK_TABLE[query.args.id];
  if (!block) {
    throw new Error(`Block with id ${query.args.id} not found`);
  }

  delete BLOCK_TABLE[query.args.id];
};

const createBlock = (query: any) => {
  const block = {
    id: query.args.id,
    title: query.args.title,
    type: query.args.type,
    children: [],
    properties: query.args.properties,
  };

  BLOCK_TABLE[block.id] = block;
};

const getPageBlock = () => {
  for (const block of Object.values(BLOCK_TABLE)) {
    if (block.type === "page") {
      return block;
    }
  }

  return null;
};

const addChild = (query: any) => {
  let block = BLOCK_TABLE[query.args.id];

  const { childId, type } = query.args;

  if (type === "root" || type === "page") {
    block = getPageBlock();
    if (!block) {
      let pageId = crypto.randomUUID();
      const pageBlock = {
        id: pageId,
        children: [],
        type: "page",
      };
      BLOCK_TABLE[pageId] = pageBlock;
      block = pageBlock;
    }
  }
  if (!block) {
    throw new Error(`Block with id ${query.args.id} not found`);
  }

  block.children.push(childId);
};

const removeChild = (query: any) => {
  let block = BLOCK_TABLE[query.args.id];

  const { childId, type } = query.args;

  if (type === "root") {
    block = getPageBlock();
    if (!block) {
      let pageId = crypto.randomUUID();
      const pageBlock = {
        id: pageId,
        children: [],
        type: "page",
      };
      BLOCK_TABLE[pageId] = pageBlock;
      block = pageBlock;
      return;
    }
  }

  if (!block) {
    throw new Error(`Block with id ${query.args.id} not found`);
  }

  block.children = block.children.filter((id: string) => id !== childId);
};
