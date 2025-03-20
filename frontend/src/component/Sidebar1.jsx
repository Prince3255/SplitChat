import React from 'react';
import { Sidebar } from 'flowbite-react';
import { Link } from "react-router-dom";
import { AiOutlineDashboard } from "react-icons/ai";
import { HiOutlineUsers, HiOutlineUserGroup } from "react-icons/hi";
import { PiContactlessPaymentLight } from "react-icons/pi";
import { CgProfile } from "react-icons/cg";

export default function Sidebar1({ activeTab }) {

  const routes = [
    { path: "/?tab=dashboard", tab: "dashboard", label: "Dashboard", icon: AiOutlineDashboard },
    { path: "/?tab=non-group", tab: "non-group", label: "Non Group", icon: HiOutlineUsers },
    { path: "/?tab=group", tab: "group", label: "Group", icon: HiOutlineUserGroup },
    { path: "/?tab=payment", tab: "payment", label: "Payment", icon: PiContactlessPaymentLight },
    { path: "/?tab=profile", tab: "profile", label: "Profile", icon: CgProfile },
  ];

  return (
    <Sidebar className="w-full">
      <Sidebar.Items className="pt-4">
        <Sidebar.ItemGroup className="flex flex-col gap-6">
          {routes.map((route) => (
            <Sidebar.Item labelColor="dark" key={route.path} active={activeTab === route.tab} as="div" className="cursor-pointer">
              <Link to={route.path} className="flex items-center gap-2">
                <route.icon className="text-xl" />
                {route.label}
              </Link>
            </Sidebar.Item>
          ))}
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
}