import { useEffect } from "react";
import * as monaco from "monaco-editor";
import { cssVarRGB, rgbToHex } from "./cssVars";

let defined = false;

export function useNoxiMonacoTheme() {
  useEffect(() => {
    if (!defined) {
      const topbar = rgbToHex(cssVarRGB("--cu-topbar",  "17 17 17"));
      const panel  = rgbToHex(cssVarRGB("--cu-grey200", "34 34 34"));
      const base   = rgbToHex(cssVarRGB("--cu-grey100", "25 25 25"));
      const border = rgbToHex(cssVarRGB("--cu-border",  "64 64 64"));

      monaco.editor.defineTheme("noxi-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "e5e7eb" },
          { token: "comment", foreground: "6b7280" },
          { token: "string",  foreground: "a7f3d0" },
          { token: "number",  foreground: "fde68a" },
          { token: "keyword", foreground: "a78bfa", fontStyle: "bold" },
          { token: "type.identifier", foreground: "93c5fd" },
          { token: "tag", foreground: "fca5a5" },
          { token: "attribute.name", foreground: "fcd34d" },
        ],
        colors: {
          "editor.background":                 topbar,
          "editor.foreground":                 "#e5e7eb",
          "editor.lineHighlightBackground":    "#ffffff0f",
          "editor.lineHighlightBorder":        "#00000000",
          "editorCursor.foreground":           "#ffffff",
          "editor.selectionBackground":        "#818cf880",
          "editor.inactiveSelectionBackground":"#818cf84a",
          "editorWhitespace.foreground":       "#ffffff26",
          "editorIndentGuide.background":      "#ffffff1a",
          "editorIndentGuide.activeBackground":"#ffffff33",
          "editorLineNumber.foreground":       "#9ca3af80",
          "editorLineNumber.activeForeground": "#e5e7ebcc",
          "editorGutter.background":           topbar,
          "scrollbarSlider.background":        "#ffffff1f",
          "scrollbarSlider.hoverBackground":   "#ffffff34",
          "scrollbarSlider.activeBackground":  "#ffffff4f",
          "minimap.background":                topbar,
          "editorWidget.background":           base,
          "editorWidget.border":               border,
          "editorSuggestWidget.background":    base,
          "editorSuggestWidget.border":        border,
          "editorSuggestWidget.selectedBackground":"#2c1a75aa",
          "dropdown.background":               base,
          "dropdown.border":                   border,
          "input.background":                  base,
          "input.border":                      border,
          "panel.background":                  panel,
          "panel.border":                      border,
          "tab.activeBackground":              topbar,
          "tab.border":                        border,
        },
      });

      monaco.editor.setTheme("noxi-dark");

      defined = true;
    }
  }, []);
}
