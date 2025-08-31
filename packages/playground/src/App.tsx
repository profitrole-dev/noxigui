// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as PIXI from 'pixi.js';
import Noxi from 'noxi.js';
import { ViewModel } from '@noxigui/runtime';

const initialSchema = `

<!-- ROOT: game-oriented scene, main centered vertically -->
<Grid RowGap="12" ColumnGap="12" Margin="60">
  <Grid.RowDefinitions>
    <RowDefinition Height="*"/>    <!-- TOP spacer -->
    <RowDefinition Height="Auto"/> <!-- MAIN content (centered) -->
    <RowDefinition Height="*"/>    <!-- BOTTOM spacer -->
  </Grid.RowDefinitions>

  <!-- Templates -->
  <Resources>
    <Template Key="Card">
      <Border Padding="8" Background="#E4C88E" CornerRadius="10" ClipToBounds="True">
        <StackPanel Spacing="8">
          <Image Stretch="Uniform" Height="96" Source="{Source}"/>
          <TextBlock Text="{Title}" FontSize="14" HorizontalAlignment="Center" Foreground="black"/>
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
      <Image Source="hero" Stretch="Uniform" Height="240" HorizontalAlignment="Center"/>
    </Border>

    <!-- r0 c1: character stats -->
    <Border Grid.Row="0" Grid.Column="1" Background="#141414" CornerRadius="8" Padding="12">
      <StackPanel Spacing="8">
        <TextBlock Text="Hero Stats" FontSize="20"/>
        <TextBlock Text="{Binding Stats.Health}"/>
        <TextBlock Text="{Binding Stats.Strength}"/>
        <TextBlock Text="{Binding Stats.Agility}"/>
        <TextBlock Text="{Binding Stats.Intelligence}"/>
        <TextBlock Text="{Binding Stats.Stamina}"/>
        <TextBlock Text="{Binding Stats.Defense}"/>
        <TextBlock Text="{Binding Stats.CritChance}"/>
        <TextBlock Text="{Binding Stats.MoveSpeed}"/>
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
        <!-- Scroll area -->
        <ScrollViewer Grid.Row="1"
                      Height="350"
                      HorizontalScrollBarVisibility="Disabled"
                      VerticalScrollBarVisibility="Auto"
                      PanningMode="VerticalOnly">
          <ItemsControl ItemsPanel="WrapPanel" ItemsSource="{Binding Inventory}" ItemTemplate="Card"/>
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
  const vmRef = useRef(ViewModel({
    Stats: {
      Health: 120,
      Strength: 18,
      Agility: 14,
      Intelligence: 10,
      Stamina: 16,
      Defense: 12,
      CritChance: 7,
      MoveSpeed: 5.2,
    },
    Inventory: [
      { Title: 'Iron Ore', Source: 'iron_ore' },
      { Title: 'Copper Ore', Source: 'copper_ore' },
      { Title: 'Silver Ore', Source: 'silver_ore' },
      { Title: 'Gold Ore', Source: 'gold_ore' },
      { Title: 'Mithril Ore', Source: 'mithril_ore' },
      { Title: 'Adamantite Ore', Source: 'adamantite_ore' },
      { Title: 'Coal', Source: 'coal' },
      { Title: 'Wood Log', Source: 'wood_log' },
      { Title: 'Hardwood', Source: 'hardwood' },
      { Title: 'Fiber', Source: 'fiber' },
      { Title: 'Herbs', Source: 'herbs' },
      { Title: 'Mushrooms', Source: 'mushrooms' },
      { Title: 'Leather' },
      { Title: 'Hide' },
      { Title: 'Bone' },
      { Title: 'Cloth' },
      { Title: 'Thread' },
      { Title: 'Feather' },
      { Title: 'Crystal Shard' },
      { Title: 'Runestone' },
      { Title: 'Water Flask' },
      { Title: 'Oil' },
      { Title: 'Powder' },
      { Title: 'Gunpowder' },
      { Title: 'Gemstone' },
      { Title: 'Ruby' },
      { Title: 'Sapphire' },
      { Title: 'Emerald' },
      { Title: 'Topaz' },
      { Title: 'Diamond' },
    ],
  }));

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
        { alias: 'monster', src: '/monster.png' },
        { alias: 'hero', src: '/hero.png' },
        { alias: 'adamantite_ore', src: 'resources/adamantite_ore.png' },
        { alias: 'coal', src: 'resources/coal.png' },
        { alias: 'copper_ore', src: 'resources/copper_ore.png' },
        { alias: 'gold_ore', src: 'resources/gold_ore.png' },
        { alias: 'iron_ore', src: 'resources/iron_ore.png' },
        { alias: 'mithril_ore', src: 'resources/mithril_ore.png' },
        { alias: 'silver_ore', src: 'resources/silver_ore.png' },
        { alias: 'wood_log', src: 'resources/wood_log.png' },
        { alias: 'hardwood', src: 'resources/hardwood.png' },
        { alias: 'fiber', src: 'resources/fiber.png' },
        { alias: 'herbs', src: 'resources/herbs.png' },
        { alias: 'mushrooms', src: 'resources/mushrooms.png' },
      ]);

      await PIXI.Assets.load([
        'monster', 'hero','adamantite_ore', 'coal', 'copper_ore',
        'gold_ore', 'iron_ore', 'mithril_ore', 'silver_ore', 'wood_log',
        'hardwood', 'fiber', 'herbs', 'mushrooms'
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
      gui.bind(vmRef.current);
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
