import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";
import TermsModal from "./components/TermsModal";
import Dashboard from "./components/Dashboard";
import ChatPanel from "./components/ChatPanel";
import ContentVault from "./components/ContentVault";
import Composer from "./components/Composer";
import Scheduler from "./components/Scheduler";
import GroupsAssisted from "./components/GroupsAssisted";
import Settings from "./components/Settings";
import MarketingPlaybook from "./components/MarketingPlaybook";

const VIEWS = {
  dashboard: Dashboard,
  chat: ChatPanel,
  vault: ContentVault,
  composer: Composer,
  scheduler: Scheduler,
  groups: GroupsAssisted,
  settings: Settings,
  playbook: MarketingPlaybook,
};

export default function App() {
  const [active, setActive] = useState("dashboard");
  const View = VIEWS[active];

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      <TermsModal />
      <Sidebar active={active} onChange={setActive} />
      <main className="flex-1 overflow-y-auto scrollbar-thin pb-16 md:pb-0">
        <View />
      </main>
      <MobileNav active={active} onChange={setActive} />
    </div>
  );
}
