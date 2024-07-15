import { DecoratorNode, LexicalNode, NodeKey, SerializedLexicalNode } from "lexical";
import React, { memo, ReactNode } from "react";

export class LuneTableNode extends DecoratorNode<ReactNode> {
    __id: string;
  
    static getType(): string {
      return 'lune-table';
    }
  
    static clone(node: LuneTableNode): LuneTableNode {
      return new LuneTableNode(node.__id, node.__key);
    }
  
    constructor(id: string, key?: NodeKey) {
      super(key);
      this.__id = id;
    }

    importJSON(json: SerializedLexicalNode): LuneTableNode {
      return new LuneTableNode(this.__id, this.__key);
    }

    exportJSON(): SerializedLexicalNode {
      return {
        type: LuneTableNode.getType(),
        version: 1,
      };
    }
  
    createDOM(): HTMLElement {
      return document.createElement('div');
    }
  
    updateDOM(): false {
      return false;
    }
  
    decorate(): ReactNode {
      return <TableView />;
    }
  }
  
const TableView = () => {
    return (
        <div className="border border-gray-200 rounded-lg">
            <p>Some text</p>
            <Input/>
        </div>
    )
}
const Input = memo(function Input() {
  const [text, setText] = React.useState('write something')

  console.log('rendering input')
    return (
      <input type="text" value={text} onChange={e => setText(e.target.value)}/>
    )
});

  export function $createLuneTableNode(): LuneTableNode {
    return new LuneTableNode("t");
  }
  
  export function $isLuneTableNode(
    node: LexicalNode | null | undefined,
  ): node is LuneTableNode {
    return node instanceof LuneTableNode;
  }