import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { SchemaField } from '../types/schema.js'

export default function DatasetEditor({
  schema,
  rows,
  onChange,
}: {
  schema: SchemaField[]
  rows: Record<string, any>[]
  onChange: (rows: Record<string, any>[]) => void
}) {
  const handleChange = (
    rowIdx: number,
    key: string,
    value: any,
  ) => {
    const next = rows.map((r, i) => (i === rowIdx ? { ...r, [key]: value } : r))
    onChange(next)
  }

  const addRow = () => {
    const defaults: Record<string, any> = {}
    for (const f of schema) {
      if (f.default !== undefined) {
        switch (f.type) {
          case 'Number':
            defaults[f.key] = Number(f.default)
            break
          case 'Bool':
            defaults[f.key] = f.default === 'true'
            break
          default:
            defaults[f.key] = f.default
        }
      } else {
        defaults[f.key] = ''
      }
    }
    onChange([
      ...rows,
      { id: Math.random().toString(36).slice(2, 8), ...defaults },
    ])
  }

  const removeRow = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx)
    onChange(next)
  }

  const renderCell = (
    row: Record<string, any>,
    rowIdx: number,
    field: SchemaField,
  ) => {
    const value = row[field.key]
    switch (field.type) {
      case 'Number':
        return (
          <input
            type="number"
            className="w-full bg-transparent outline-none"
            value={value ?? 0}
            onChange={(e) =>
              handleChange(rowIdx, field.key, Number(e.target.value))
            }
          />
        )
      case 'Bool':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleChange(rowIdx, field.key, e.target.checked)}
          />
        )
      default:
        return (
          <input
            className="w-full bg-transparent outline-none"
            value={value ?? ''}
            onChange={(e) => handleChange(rowIdx, field.key, e.target.value)}
          />
        )
    }
  }

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b border-neutral-700">
          <th className="px-2 py-1">id</th>
          {schema.map((f) => (
            <th key={f.key} className="px-2 py-1">
              {f.key}
            </th>
          ))}
          <th className="px-2 py-1"></th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr key={idx} className="border-b border-neutral-800">
            <td className="px-2 py-1">
              <input
                className="w-full bg-transparent outline-none"
                value={r.id ?? ''}
                onChange={(e) => handleChange(idx, 'id', e.target.value)}
              />
            </td>
            {schema.map((f) => (
              <td key={f.key} className="px-2 py-1">
                {renderCell(r, idx, f)}
              </td>
            ))}
            <td className="px-2 py-1">
              <button
                className="p-1 rounded hover:bg-neutral-700"
                onClick={() => removeRow(idx)}
                title="Delete row"
              >
                <Trash2 size={14} />
              </button>
            </td>
          </tr>
        ))}
        <tr>
          <td colSpan={schema.length + 2} className="text-center py-2">
            <button
              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600"
              onClick={addRow}
            >
              <Plus size={14} /> Add row
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
