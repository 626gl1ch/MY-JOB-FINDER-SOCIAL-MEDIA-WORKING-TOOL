import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatPanel from "./components/ChatPanel";
import ContentVault from "./components/ContentVault";
import Composer from "./components/Composer";
import Scheduler from "./components/Scheduler";
import GroupsAssisted from "./components/GroupsAssisted";
import Settings from "./components/Settings";

const VIEWS = {
  dashboard: Dashboard,
  chat: ChatPanel,
  vault: ContentVault,
  composer: Composer,
  scheduler: Scheduler,
  groups: GroupsAssisted,
  settings: Settings,
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const View = VIEWS[active];

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      <Sidebar active={active} onChange={setActive} />
      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <View />
      </main>
    </div>
  );
}
