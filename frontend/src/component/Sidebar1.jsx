import React, { useState } from "react";
import { Sidebar } from "flowbite-react";
import { Link } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import {
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiMenuAlt3,
  HiX,
} from "react-icons/hi";
import { MdOutlineRoundaboutRight } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

export default function Sidebar1({ activeTab }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const routes = [
    {
      path: "/tab?tab=dashboard",
      tab: "dashboard",
      label: "Dashboard",
      icon: AiOutlineDashboard,
    },
    {
      path: "/tab?tab=non-group",
      tab: "non-group",
      label: "Non Group",
      icon: HiOutlineUsers,
    },
    {
      path: "/tab?tab=group",
      tab: "group",
      label: "Group",
      icon: HiOutlineUserGroup,
    },
    {
      path: "/tab?tab=profile",
      tab: "profile",
      label: "Profile",
      icon: CgProfile,
    },
    {
      path: "/tab?tab=about",
      tab: "about",
      label: "About",
      icon: MdOutlineRoundaboutRight,
    },
  ];

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-full bg-green-500 text-white shadow-lg"
        >
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>
      <Sidebar className="w-full hidden md:block border-r">
        <Sidebar.Items className="pt-4">
          <Sidebar.ItemGroup className="flex flex-col gap-6">
            {routes.map((route) => (
              <Sidebar.Item
                labelColor="dark"
                key={route.path}
                active={activeTab === route.tab}
                as="div"
                className={`cursor-pointer transition-all duration-200 ${
                  activeTab === route.tab
                    ? "bg-green-50 text-green-600"
                    : "hover:bg-gray-50"
                }`}
              >
                <Link to={route.path} className="flex items-center gap-2 py-1">
                  <route.icon className="text-xl" />
                  {route.label}
                </Link>
              </Sidebar.Item>
            ))}
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>

      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleMobileSidebar}
      >
        <div
          className={`absolute top-0 left-0 h-full w-64 bg-white transform transition-transform duration-300 ease-in-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-semibold text-lg">Menu</h2>
            <button onClick={toggleMobileSidebar} className="p-1">
              <HiX size={24} className="text-gray-500" />
            </button>
          </div>
          <div className="py-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 ${
                  activeTab === route.tab
                    ? "bg-green-50 text-green-600 border-l-4 border-green-500"
                    : ""
                }`}
                onClick={toggleMobileSidebar}
              >
                <route.icon className="text-xl" />
                <span>{route.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
