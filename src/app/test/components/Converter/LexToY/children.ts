import * as Y from "yjs";
export function updateChildrenArray(
  sharedChildren: Y.Array<string>,
  newChildren: string[]
) {
  for (let i = 0; i < newChildren.length; i++) {
    const fresh = newChildren[i];
    const old =
      i > sharedChildren.length - 1 ? undefined : sharedChildren.get(i);

    if (!old) {
      sharedChildren.insert(i, [fresh]);
      continue;
    }

    if (fresh !== old) {
      sharedChildren.delete(i, 1);
      sharedChildren.insert(i, [fresh]);
    }
  }

  if (newChildren.length < sharedChildren.length) {
    sharedChildren.delete(
      newChildren.length,
      sharedChildren.length - newChildren.length
    );
  }
}
