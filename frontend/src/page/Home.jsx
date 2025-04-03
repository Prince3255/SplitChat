import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Sidebar1 } from "../component/index";
import { About, Dashboard, Group, NonGroup, Profile } from "../page/index";

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get("tab") || "dashboard";

  const validTabs = ["dashboard", "group", "non-group", "profile", "about"];

  useEffect(() => {
    if (!queryParams.get("tab") || !validTabs.includes(queryParams.get("tab"))) {
      navigate("/?tab=dashboard", { replace: true });
    }
  }, [location.search, navigate]);

  const [activeTab, setActiveTab] = useState(currentTab);


  useEffect(() => {
    if (currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [currentTab]);

  const switchTab = (tab) => {
    if (tab !== activeTab) {
      setActiveTab(tab);
      navigate(`/?tab=${tab}`);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const renderTab = () => {
    const tabs = {
      dashboard: <Dashboard />,
      group: <Group />,
      "non-group": <NonGroup />,
      profile: <Profile />,
      about: <About />,
    };

    return (
      tabs[activeTab] || <Dashboard />
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="md:w-56">
        <Sidebar1 activeTab={activeTab} setActiveTab={switchTab} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3">{renderTab()}</main>
    </div>
  );
}
