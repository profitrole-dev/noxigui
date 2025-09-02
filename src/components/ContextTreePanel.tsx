import React, { useState } from 'react';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';

export type TreeNode = {
  id: string;
  label: string;
  children?: TreeNode[];
};

interface TreePanelProps {
  title: string;
  nodes: TreeNode[];
}

function renderTree(nodes: TreeNode[]): React.ReactNode {
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 16 }}>
      {nodes.map((node) => (
        <li key={node.id}>
          {node.label}
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );
}

export function ContextTreePanel({ title, nodes }: TreePanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((c) => !c);

  return (
    <div
      style={{
        width: 200,
        color: '#fff',
        backgroundColor: '#333',
        padding: 8,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      <div
        onClick={toggle}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        <span style={{ flexGrow: 1 }}>{title}</span>
        {collapsed ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />}
      </div>
      {!collapsed && <div>{renderTree(nodes)}</div>}
    </div>
  );
}
