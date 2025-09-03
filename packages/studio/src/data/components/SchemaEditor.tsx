import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import TypeDropdown from './TypeDropdown';
import type { SchemaField } from '../types/schema.js';

export default function SchemaEditor({
  fields,
  onChange,
}: {
  fields: SchemaField[];
  onChange: (fields: SchemaField[]) => void;
}) {
  const handleChange = (
    idx: number,
    key: keyof SchemaField,
    value: string,
  ) => {
    const next = fields.map((f, i) => (i === idx ? { ...f, [key]: value } : f));
    onChange(next);
  };

  const addRow = () => {
    onChange([...fields, { key: '', type: 'Number', default: '' }]);
  };

  const removeRow = (idx: number) => {
    const next = fields.filter((_, i) => i !== idx);
    onChange(next);
  };

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b border-neutral-700">
          <th className="px-2 py-1">Key</th>
          <th className="px-2 py-1">Type</th>
          <th className="px-2 py-1">Default</th>
        </tr>
      </thead>
      <tbody>
        {fields.map((f, idx) => (
          <tr key={idx} className="border-b border-neutral-800">
            <td className="px-2 py-1">
              <input
                className="w-full bg-transparent outline-none"
                value={f.key}
                onChange={(e) => handleChange(idx, 'key', e.target.value)}
              />
            </td>
            <td className="px-2 py-1">
              <TypeDropdown
                value={f.type}
                onChange={(v) => handleChange(idx, 'type', v)}
              />
            </td>
            <td className="px-2 py-1">
              <div className="flex items-center gap-1">
                <input
                  className="flex-1 bg-transparent outline-none"
                  value={f.default ?? ''}
                  onChange={(e) => handleChange(idx, 'default', e.target.value)}
                />
                <button
                  className="p-1 rounded hover:bg-neutral-700"
                  onClick={() => removeRow(idx)}
                  title="Delete field"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={3} className="text-center py-2">
            <button
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
              onClick={addRow}
            >
              <Plus size={14} /> Add
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
