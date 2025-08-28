// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import type * as monacoEditor from 'monaco-editor';
import * as PIXI from 'pixi.js';
import { RuntimeInstance } from '@noxigui/runtime';
import { createPixiRenderer } from '@noxigui/renderer-pixi';

const initialSchema = `
<Grid Margin="16" RowGap="12" ColumnGap="12">
  <Grid.RowDefinitions>
    <RowDefinition Height="Auto"/>
    <RowDefinition Height="*"/>
  </Grid.RowDefinitions>

  <!-- добавили три колонки -->
  <Grid.ColumnDefinitions>
    <ColumnDefinition Width="*"/>
    <ColumnDefinition Width="*"/>
    <ColumnDefinition Width="*"/>
  </Grid.ColumnDefinitions>

  <Resources>
    <Template Key="Card">
      <Border Padding="8" Background="#1f1f1f" ClipToBounds="True">
        <Grid RowGap="8">
          <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
          </Grid.RowDefinitions>
          <ContentPresenter Slot="Media" Grid.Row="0"/>
          <TextBlock Grid.Row="1" Text="{Title}" FontSize="{TitleSize}" Foreground="#fff"/>
        </Grid>
      </Border>
    </Template>
  </Resources>

  <!-- ряд карточек -->
  <Use Grid.Row="1" Grid.Column="0" Template="Card" Title="UniformToFill" TitleSize="16">
    <Slot Name="Media">
      <Image Source="monster" Stretch="UniformToFill"/>
    </Slot>
  </Use>

  <Use Grid.Row="1" Grid.Column="1" Template="Card" Title="Centered" TitleSize="16">
    <Slot Name="Media">
      <Image Source="monster" Stretch="Uniform" HorizontalAlignment="Center"/>
    </Slot>
  </Use>

  <Use Grid.Row="1" Grid.Column="2" Template="Card" Title="Fill" TitleSize="16">
    <Slot Name="Media">
      <Image Source="monster" Stretch="Fill" HorizontalAlignment="Left" VerticalAlignment="Top"/>
    </Slot>
  </Use>
</Grid>`;

type RuntimeHandle = {
  container: PIXI.Container;
  layout: (size: { width: number; height: number }) => void;
  destroy: () => void;
};

export default function App() {
  const [code, setCode] = useState(initialSchema);
  const [assetsReady, setAssetsReady] = useState(false);

  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const runtimeRef = useRef<RuntimeHandle | null>(null);

  // 1) Инициализация PIXI
  useEffect(() => {
    if (!pixiRef.current) return;

    const app = new PIXI.Application({
      resizeTo: pixiRef.current,
      backgroundColor: 0x222222,
      antialias: true
    });

    pixiRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    return () => {
      try {
        app.destroy(true, { children: true });
      } catch {}
      appRef.current = null;
      runtimeRef.current = null;
    };
  }, []);

  // 2) Предзагрузка ассетов
  useEffect(() => {
    let cancelled = false;

    const loadAssets = async () => {
      PIXI.Assets.add([
        { alias: 'monster', src: '/monster.png' }
      ]);

      await PIXI.Assets.load([
        'monster',
      ]);

      if (!cancelled) setAssetsReady(true);
    };

    loadAssets().catch(err => {
      console.warn('Assets load error:', err);
      if (!cancelled) setAssetsReady(true); // даём UI стартануть даже без ассетов
    });

    return () => { cancelled = true; };
  }, []);

  // 3) Построение/перестроение UI при изменении XML или готовности ассетов
  useEffect(() => {
    const app = appRef.current;
    if (!app || !assetsReady) return;

    // убираем предыдущий рантайм
    if (runtimeRef.current) {
      try { runtimeRef.current.destroy(); } catch {}
      app.stage.removeChildren().forEach(ch => ch.destroy());
      runtimeRef.current = null;
    }

    try {
      const runtime = RuntimeInstance.create(code, createPixiRenderer());
      runtimeRef.current = runtime;
      // runtime.setGridDebug(true);

      app.stage.addChild(runtime.container);

      const relayout = () => {
        if (!appRef.current || !runtimeRef.current) return;
        runtimeRef.current.layout({
          width: appRef.current.renderer.width,
          height: appRef.current.renderer.height,
        });
      };

      // первый лейаут
      relayout();

      // ресайз
      const r: any = app.renderer as any;
      if (r && typeof r.on === 'function') r.on('resize', relayout);

      return () => {
        if (r && typeof r.off === 'function') r.off('resize', relayout);
        else if (r && typeof r.removeListener === 'function') r.removeListener('resize', relayout);
      };
    } catch (e) {
      console.warn('Invalid schema:', e);
    }
  }, [code, assetsReady]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'monospace',
        backgroundColor: '#1e1e1e'
      }}
    >
      <MonacoEditor
        language="xml"
        theme="vs-dark"
        value={code}
        onChange={setCode}
        height="100%"
        width="50%"
        editorDidMount={(_editor: monacoEditor.editor.IStandaloneCodeEditor, monaco: typeof monacoEditor) => {
          const elementAttributes: Record<string, string[]> = {
            Grid: ['Margin', 'RowGap', 'ColumnGap', 'Row', 'Column'],
            Use: ['Template', 'Title', 'TitleSize', 'Grid.Row', 'Grid.Column'],
            Slot: ['Name'],
            Image: ['Source', 'Stretch', 'HorizontalAlignment', 'VerticalAlignment'],
            Border: ['Padding', 'Background', 'ClipToBounds'],
            TextBlock: ['Text', 'FontSize', 'Foreground'],
            RowDefinition: ['Height'],
            ColumnDefinition: ['Width'],
          };

          monaco.languages.registerCompletionItemProvider('xml', {
            triggerCharacters: ['<', ' ', '.'],
            provideCompletionItems: (model, position) => {
              const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              });

              const trimmed = textUntilPosition.trimStart();
              if (!trimmed.startsWith('<')) {
                return { suggestions: [] };
              }

              const word = model.getWordUntilPosition(position);
              const range: monacoEditor.IRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              };

              const afterLt = trimmed.slice(1);
              const hasSpace = afterLt.includes(' ');

              if (!hasSpace) {
                const tagSuggestions: monacoEditor.languages.CompletionItem[] = [
                  {
                    label: 'Grid',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: '<Grid>\n\t$0\n</Grid>',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  },
                  {
                    label: 'Use Card',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: '<Use Template="Card">\n\t<Slot Name="Media">\n\t\t$0\n\t</Slot>\n</Use>',
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  },
                  {
                    label: 'RowDefinition',
                    kind: monaco.languages.CompletionItemKind.Snippet,
                    insertText: '<RowDefinition Height="Auto" />',
                    range,
                  },
                ];

                return { suggestions: tagSuggestions };
              }

              const tagName = afterLt.split(/\s+/)[0];
              const attrs = elementAttributes[tagName] ?? [];
              const attrSuggestions: monacoEditor.languages.CompletionItem[] = attrs.map(label => ({
                label,
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: `${label}="$0"`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range,
              }));

              return { suggestions: attrSuggestions };
            },
          });
        }}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
      <div
        ref={pixiRef}
        style={{
          flex: 1,
          minWidth: 0,
          backgroundColor: '#2a2a2a',
          position: 'relative',
        }}
      />
    </div>
  );
}
