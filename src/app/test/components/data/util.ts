import { Map as YMap, Array as YArray } from "yjs";
export function addpropertiesToYjsMap(
  obj: Record<string, unknown>,
  ymap: YMap<unknown>
) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      ymap.set(key, obj[key]);
    }
  }
  return ymap;
}

export function addElementsToYjsArray(
  arr: Array<unknown>,
  yarr: YArray<unknown>
) {
  for (const item of arr) {
    yarr.push([item]);
  }
  return yarr;
}
