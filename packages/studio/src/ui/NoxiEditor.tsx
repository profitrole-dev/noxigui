import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useNoxiMonacoTheme } from "./theme/useNoxiMonacoTheme";

export type NoxiEditorProps = {
  value: string;
  onChange?: (next: string) => void;
  language?: string;           // "xml" | "json" | "typescript" | ...
  readOnly?: boolean;
  height?: number | string;    // по умолчанию 100%
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  className?: string;
};

export default function NoxiEditor({
                                     value,
                                     onChange,
                                     language = "xml",
                                     readOnly = false,
                                     height = "100%",
                                     options,
                                     className,
                                   }: NoxiEditorProps) {
  useNoxiMonacoTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const valueRef = useRef(value);

  // create / dispose
  useEffect(() => {
    if (!containerRef.current) return;

    const ed = monaco.editor.create(containerRef.current, {
      value,
      language,
      readOnly,
      theme: "noxi-dark",
      fontSize: 12,
      lineHeight: 20,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontLigatures: true,
      minimap: { enabled: false },
      scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      renderLineHighlight: "gutter",
      cursorBlinking: "smooth",
      smoothScrolling: true,
      padding: { top: 8, bottom: 8 },
      tabSize: 2,
      wordWrap: "off",
      automaticLayout: true,
      ...options,
    });

    editorRef.current = ed;
    valueRef.current = value;

    const sub = ed.onDidChangeModelContent(() => {
      const next = ed.getValue();
      if (next !== valueRef.current) {
        valueRef.current = next;
        onChange?.(next);
      }
    });

    return () => {
      sub.dispose();
      ed.dispose();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // external updates (controlled)
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    if (value !== valueRef.current) {
      valueRef.current = value;
      const model = ed.getModel();
      if (model) {
        const pos = ed.getPosition();
        ed.pushUndoStop();
        ed.executeEdits("ext-update", [
          {
            range: model.getFullModelRange(),
            text: value,
          },
        ]);
        ed.pushUndoStop();
        if (pos) ed.setPosition(pos);
      } else {
        ed.setValue(value);
      }
    }
  }, [value]);

  // reactive language / readOnly changes
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const model = ed.getModel();
    if (model) monaco.editor.setModelLanguage(model, language);
    ed.updateOptions({ readOnly });
  }, [language, readOnly]);

  return (
    <div
      ref={containerRef}
      className={["editor-surface", className].filter(Boolean).join(" ")}
      style={{ height }}
    />
  );
}
