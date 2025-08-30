import React from "react";
import { CodeTab } from "../tabs/CodeTab";
import { DataTab } from "../tabs/DataTab";
import { AssetsTab } from "../tabs/AssetsTab";
import { Renderer } from "../Renderer";
import type { Tab } from "../state/useStudio";

export function MainPane({ activeTab }: { activeTab: Tab }) {
  return (
    <div className="grid grid-cols-2">
      <section className="border-r border-base-300 overflow-hidden">
        {activeTab === "Code" && <CodeTab />}
        {activeTab === "Data" && <DataTab />}
        {activeTab === "Assets" && <AssetsTab />}
      </section>
      <section className="overflow-hidden bg-base-200">
        <Renderer />
      </section>
    </div>
  );
}
