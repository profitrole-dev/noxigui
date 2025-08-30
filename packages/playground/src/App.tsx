// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as PIXI from 'pixi.js';
import Noxi from 'noxi.js';

const initialSchema = `
<!-- ROOT: game-oriented scene, main centered vertically -->
<Grid RowGap="12" ColumnGap="12" Margin="16">
  <Grid.RowDefinitions>
    <RowDefinition Height="*"/>    <!-- TOP spacer -->
    <RowDefinition Height="Auto"/> <!-- MAIN content (centered) -->
    <RowDefinition Height="*"/>    <!-- BOTTOM spacer -->
  </Grid.RowDefinitions>

  <!-- Templates -->
  <Resources>
    <Template Key="Card">
      <Border Padding="8" Background="#1f1f1f" CornerRadius="10" ClipToBounds="True">
        <StackPanel Spacing="8">
          <Image Stretch="Uniform" Height="96"/>
          <TextBlock Text="{Title}" FontSize="14" HorizontalAlignment="Center"/>
        </StackPanel>
      </Border>
    </Template>
  </Resources>

  <!-- MAIN -->
  <Grid Grid.Row="1" RowGap="12" ColumnGap="12">
    <Grid.RowDefinitions>
      <RowDefinition Height="*"/>
      <RowDefinition Height="*"/>
    </Grid.RowDefinitions>
    <Grid.ColumnDefinitions>
      <ColumnDefinition Width="*"/>
      <ColumnDefinition Width="*"/>
    </Grid.ColumnDefinitions>

    <!-- r0 c0: monster image -->
    <Border Grid.Row="0" Grid.Column="0" Background="#141414" CornerRadius="8" Padding="8" ClipToBounds="True">
      <Image Source="monster" Stretch="Uniform" Height="240" HorizontalAlignment="Center"/>
    </Border>

    <!-- r0 c1: character stats -->
    <Border Grid.Row="0" Grid.Column="1" Background="#141414" CornerRadius="8" Padding="12">
      <StackPanel Spacing="8">
        <TextBlock Text="Hero Stats" FontSize="20"/>
        <TextBlock Text="Health: 120 / 120"/>
        <TextBlock Text="Strength: 18"/>
        <TextBlock Text="Agility: 14"/>
        <TextBlock Text="Intelligence: 10"/>
        <TextBlock Text="Stamina: 16"/>
        <TextBlock Text="Defense: 12"/>
        <TextBlock Text="Crit Chance: 7%"/>
        <TextBlock Text="Move Speed: 5.2"/>
      </StackPanel>
    </Border>

    <!-- r1 c0..1: inventory panel with header (categories) + scroll -->
    <Border Grid.Row="1" Grid.Column="0" Grid.ColumnSpan="2"
            Background="#141414" CornerRadius="8" Padding="12" ClipToBounds="True">
      <!-- Header + Scroll layout -->
      <Grid RowGap="12">
        <Grid.RowDefinitions>
          <RowDefinition Height="Auto"/> <!-- categories header -->
          <RowDefinition Height="*"/>   <!-- scroll area -->
        </Grid.RowDefinitions>

        <!-- Categories header (will become tabs later) -->
        <Grid Grid.Row="0" ColumnGap="8">
          <Grid.ColumnDefinitions>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="*"/>
            <ColumnDefinition Width="*"/>
          </Grid.ColumnDefinitions>

          <Border Grid.Column="0" Padding="8,6" Background="#232323" CornerRadius="6">
            <TextBlock Text="Clothing" HorizontalAlignment="Center"/>
          </Border>
          <Border Grid.Column="1" Padding="8,6" Background="#232323" CornerRadius="6">
            <TextBlock Text="Resources" HorizontalAlignment="Center"/>
          </Border>
          <Border Grid.Column="2" Padding="8,6" Background="#232323" CornerRadius="6">
            <TextBlock Text="Bows" HorizontalAlignment="Center"/>
          </Border>
          <Border Grid.Column="3" Padding="8,6" Background="#232323" CornerRadius="6">
            <TextBlock Text="Swords" HorizontalAlignment="Center"/>
          </Border>
          <Border Grid.Column="4" Padding="8,6" Background="#232323" CornerRadius="6">
            <TextBlock Text="Food" HorizontalAlignment="Center"/>
          </Border>
        </Grid>

        <!-- Scroll area -->
        <ScrollViewer Grid.Row="1"
                      Height="350"
                      HorizontalScrollBarVisibility="Disabled"
                      VerticalScrollBarVisibility="Auto"
                      PanningMode="VerticalOnly">
          <StackPanel Spacing="12">
            <!-- 30 resource cards from template -->
            <Use Template="Card" Title="Iron Ore"/>
            <Use Template="Card" Title="Copper Ore"/>
            <Use Template="Card" Title="Silver Ore"/>
            <Use Template="Card" Title="Gold Ore"/>
            <Use Template="Card" Title="Mithril Ore"/>
            <Use Template="Card" Title="Adamantite Ore"/>
            <Use Template="Card" Title="Coal"/>
            <Use Template="Card" Title="Wood Log"/>
            <Use Template="Card" Title="Hardwood"/>
            <Use Template="Card" Title="Fiber"/>
            <Use Template="Card" Title="Herbs"/>
            <Use Template="Card" Title="Mushrooms"/>
            <Use Template="Card" Title="Leather"/>
            <Use Template="Card" Title="Hide"/>
            <Use Template="Card" Title="Bone"/>
            <Use Template="Card" Title="Cloth"/>
            <Use Template="Card" Title="Thread"/>
            <Use Template="Card" Title="Feather"/>
            <Use Template="Card" Title="Crystal Shard"/>
            <Use Template="Card" Title="Runestone"/>
            <Use Template="Card" Title="Water Flask"/>
            <Use Template="Card" Title="Oil"/>
            <Use Template="Card" Title="Powder"/>
            <Use Template="Card" Title="Gunpowder"/>
            <Use Template="Card" Title="Gemstone"/>
            <Use Template="Card" Title="Ruby"/>
            <Use Template="Card" Title="Sapphire"/>
            <Use Template="Card" Title="Emerald"/>
            <Use Template="Card" Title="Topaz"/>
            <Use Template="Card" Title="Diamond"/>
          </StackPanel>
        </ScrollViewer>
      </Grid>
    </Border>
  </Grid>
</Grid>`;

export default function App() {
  const [code, setCode] = useState(initialSchema);
  const [assetsReady, setAssetsReady] = useState(false);

  const pixiRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const guiRef = useRef<ReturnType<typeof Noxi.gui.create> | null>(null);

  // 1) Инициализация PIXI
  useEffect(() => {
    if (!pixiRef.current) return;

    const app = new PIXI.Application({
      resizeTo: pixiRef.current,
      backgroundColor: 0x222222,
      antialias: true,
      eventFeatures: {
        wheel: true
      }
    });

    pixiRef.current.appendChild(app.view as HTMLCanvasElement);
    appRef.current = app;

    return () => {
      try {
        app.destroy(true, { children: true });
      } catch {}
      appRef.current = null;
      guiRef.current = null;
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
    if (guiRef.current) {
      try { guiRef.current.destroy(); } catch {}
      app.stage.removeChildren().forEach(ch => ch.destroy());
      guiRef.current = null;
    }

    try {
      const gui = Noxi.gui.create(code);
      guiRef.current = gui;
      // runtime.setGridDebug(true);

      app.stage.addChild(gui.container.getDisplayObject());

      const relayout = () => {
        if (!appRef.current || !guiRef.current) return;
        guiRef.current.layout({
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
