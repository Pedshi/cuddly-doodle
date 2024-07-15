export const toBlockType = (type: string) => {
  switch (type) {
    case "paragraph":
      return "text";
    case "header":
      return "header";
    case "page":
      return "page";
    case "root":
      return "page";
    default:
      return "text";
  }
};
