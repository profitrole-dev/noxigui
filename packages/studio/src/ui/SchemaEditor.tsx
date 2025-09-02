import React from 'react';
import { Trash2 } from 'lucide-react';
import type { SchemaField } from '../types/schema.js';

const emptyField: SchemaField = { key: '', type: '', default: '' };

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
    const rows = [...fields, { ...emptyField }];
    rows[idx] = { ...rows[idx], [key]: value };
    const filtered = rows.filter(
      (r) => r.key || r.type || (r.default ?? '') !== '',
    );
    onChange(filtered);
  };

  const removeRow = (idx: number) => {
    const next = fields.filter((_, i) => i !== idx);
    onChange(next);
  };

  const rows = [...fields, { ...emptyField }];

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
        {rows.map((f, idx) => (
          <tr key={idx} className="border-b border-neutral-800">
            <td className="px-2 py-1">
              <input
                className="w-full bg-transparent outline-none"
                value={f.key}
                onChange={(e) => handleChange(idx, 'key', e.target.value)}
              />
            </td>
            <td className="px-2 py-1">
              <select
                className="w-full bg-transparent outline-none"
                value={f.type}
                onChange={(e) => handleChange(idx, 'type', e.target.value)}
              >
                <option value=""></option>
                <option value="Number">Number</option>
                <option value="String">String</option>
                <option value="Boolean">Boolean</option>
                <option value="List">List</option>
                <option value="Dictionary">Dictionary</option>
              </select>
            </td>
            <td className="px-2 py-1">
              <div className="flex items-center gap-1">
                <input
                  className="flex-1 bg-transparent outline-none"
                  value={f.default ?? ''}
                  onChange={(e) => handleChange(idx, 'default', e.target.value)}
                />
                {idx < fields.length && (
                  <button
                    className="p-1 rounded hover:bg-neutral-700"
                    onClick={() => removeRow(idx)}
                    title="Delete field"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
