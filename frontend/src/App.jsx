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
import PaywallModal from "./components/PaywallModal";
import AuthModal from "./components/AuthModal";

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
  const [session, setSession] = useState(null);
  const View = VIEWS[active];

  return (
    <div className="flex h-screen bg-transparent overflow-hidden relative">
      <div className="fixed inset-0 z-[-1]" style={{ backgroundImage: 'var(--bg-gradient)' }} />
      <AuthModal session={session} setSession={setSession} />
      <TermsModal />
      <PaywallModal session={session} />
      <Sidebar active={active} onChange={setActive} />
      <main className="flex-1 overflow-y-auto scrollbar-thin pb-28 md:pb-0" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div key={active} className="page-transition min-h-full">
          <View />
        </div>
      </main>
      <MobileNav active={active} onChange={setActive} />
    </div>
  );
}
