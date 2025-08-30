import React from "react";
import { useStudio } from "../state/useStudio";

export function AssetsTab() {
  const { project, setAssets } = useStudio();

  const update = (index: number, key: "alias" | "src", value: string) => {
    const list = [...(project.assets || [])];
    list[index] = { ...list[index], [key]: value };
    setAssets(list);
  };

  const add = () => {
    setAssets([...(project.assets || []), { alias: "", src: "" }]);
  };

  return (
    <div className="p-3 flex flex-col gap-2">
      {(project.assets || []).map((asset, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input input-bordered input-sm w-32"
            placeholder="alias"
            value={asset.alias}
            onChange={(e) => update(i, "alias", e.target.value)}
          />
          <input
            className="input input-bordered input-sm flex-1"
            placeholder="link"
            value={asset.src}
            onChange={(e) => update(i, "src", e.target.value)}
          />
        </div>
      ))}
      <button className="btn btn-sm w-fit mt-2" onClick={add}>
        Add asset
      </button>
    </div>
  );
}

