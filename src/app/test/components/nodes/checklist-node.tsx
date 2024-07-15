import {
  EditorConfig,
  ElementNode,
  LexicalEditor,
  NodeKey,
  SerializedElementNode,
  Spread,
} from "lexical";

type SerializedToDoNode = Spread<
  {
    checked: boolean;
  },
  SerializedElementNode
>;

export class ChecklistNode extends ElementNode {
  __checked: boolean;

  constructor(checked: boolean, key?: NodeKey) {
    super(key);
    this.__checked = checked;
  }

  static getType(): string {
    return "to_do";
  }

  static clone(node: ChecklistNode): ChecklistNode {
    return new ChecklistNode(node.__checked, node.__key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const outer = document.createElement("div");
    outer.className = "flex gap-2 items-center";

    const checkBox = document.createElement("div");
    checkBox.className =
      "checkBox w-4 h-4 border border-gray-400 rounded cursor-pointer";
    checkBox.style.backgroundColor = this.__checked ? "black" : "white";

    checkBox.addEventListener("click", () => {
      const checked = _editor.getEditorState().read(() => this.getchecked());
      _editor.update(() => this.toggleChecked());
    });

    outer.appendChild(checkBox);

    return outer;
  }

  updateDOM(
    _prevNode: ChecklistNode,
    _dom: HTMLElement,
    _config: EditorConfig
  ): boolean {
    const currentChecked = this.__checked;
    if (_prevNode.__checked !== currentChecked) {
      const checkDom = _dom.querySelector(".checkBox");
      if (checkDom && checkDom instanceof HTMLElement) {
        checkDom.style.backgroundColor = currentChecked ? "black" : "white";
      } else {
        throw new Error("Check box not found");
      }
    }
    return false;
  }

  exportJSON(): SerializedToDoNode {
    return {
      ...super.exportJSON(),
      type: ChecklistNode.getType(),
      version: 1,
      checked: this.__checked,
    };
  }

  importJSON(json: SerializedToDoNode): ChecklistNode {
    return new ChecklistNode(json.checked);
  }

  setChecked(checked: boolean): void {
    const writeable = this.getWritable();
    writeable.__checked = checked;
  }

  getchecked(): boolean {
    return this.getLatest().__checked;
  }

  toggleChecked(): void {
    this.setChecked(!this.getchecked());
  }
}

export function $createTodoNode(checked?: boolean): ChecklistNode {
  return new ChecklistNode(checked ?? false);
}

export function $isTodoNode(node: ElementNode): node is ChecklistNode {
  return node instanceof ChecklistNode;
}
