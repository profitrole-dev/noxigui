// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as PIXI from 'pixi.js';
import Noxi from 'noxi.js';

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

export default function App() {
  const [code, setCode] = useState(initialSchema);
  const [assetsReady, setAssetsReady] = useState(false);

  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const runtimeRef = useRef<ReturnType<typeof Noxi.gui.create> | null>(null);

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
      const runtime = Noxi.gui.create(code);
      runtimeRef.current = runtime;
      // runtime.setGridDebug(true);

      app.stage.addChild(runtime.container.getDisplayObject());

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
