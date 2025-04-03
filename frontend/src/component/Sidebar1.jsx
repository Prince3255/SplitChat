// import React from 'react';
// import { Sidebar } from 'flowbite-react';
// import { Link } from "react-router-dom";
// import { AiOutlineDashboard } from "react-icons/ai";
// import { HiOutlineUsers, HiOutlineUserGroup } from "react-icons/hi";
// import { MdOutlineRoundaboutRight } from "react-icons/md";
// import { CgProfile } from "react-icons/cg";

// export default function Sidebar1({ activeTab }) {

//   const routes = [
//     { path: "/?tab=dashboard", tab: "dashboard", label: "Dashboard", icon: AiOutlineDashboard },
//     { path: "/?tab=non-group", tab: "non-group", label: "Non Group", icon: HiOutlineUsers },
//     { path: "/?tab=group", tab: "group", label: "Group", icon: HiOutlineUserGroup },
//     { path: "/?tab=profile", tab: "profile", label: "Profile", icon: CgProfile },
//     { path: "/?tab=about", tab: "about", label: "About", icon: MdOutlineRoundaboutRight },
//   ];

//   return (
//     <Sidebar className="w-full">
//       <Sidebar.Items className="pt-4">
//         <Sidebar.ItemGroup className="flex flex-col gap-6">
//           {routes.map((route) => (
//             <Sidebar.Item labelColor="dark" key={route.path} active={activeTab === route.tab} as="div" className="cursor-pointer">
//               <Link to={route.path} className="flex items-center gap-2">
//                 <route.icon className="text-xl" />
//                 {route.label}
//               </Link>
//             </Sidebar.Item>
//           ))}
//         </Sidebar.ItemGroup>
//       </Sidebar.Items>
//     </Sidebar>
//   );
// }

import { useState } from "react"
import { Sidebar } from "flowbite-react"
import { Link } from "react-router-dom"
import { AiOutlineDashboard } from "react-icons/ai"
import { HiOutlineUsers, HiOutlineUserGroup, HiMenuAlt3, HiX } from "react-icons/hi"
import { MdOutlineRoundaboutRight } from "react-icons/md"
import { CgProfile } from "react-icons/cg"

export default function Sidebar1({ activeTab }) {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
  const [mobileOpen, setMobileOpen] = useState(false)

  const routes = [
    { path: "/?tab=dashboard", tab: "dashboard", label: "Dashboard", icon: AiOutlineDashboard },
    { path: "/?tab=non-group", tab: "non-group", label: "Non Group", icon: HiOutlineUsers },
    { path: "/?tab=group", tab: "group", label: "Group", icon: HiOutlineUserGroup },
    { path: "/?tab=profile", tab: "profile", label: "Profile", icon: CgProfile },
    { path: "/?tab=about", tab: "about", label: "About", icon: MdOutlineRoundaboutRight },
  ]

  // Toggle sidebar on mobile
  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  // Toggle collapsed state for desktop
  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      {/* Mobile Toggle Button - Fixed at the bottom */}
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <button onClick={toggleMobileSidebar} className="p-2 rounded-full bg-green-500 text-white shadow-lg">
          {mobileOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden md:block transition-all duration-300 ease-in-out ${collapsed ? "w-16" : "w-64"}`}>
        <div className="flex justify-end p-2">
          <button onClick={toggleCollapsed} className="p-1 rounded-full hover:bg-gray-200 text-gray-500">
            <HiMenuAlt3
              size={20}
              className={`transform transition-transform ${collapsed ? "rotate-180" : "rotate-0"}`}
            />
          </button>
        </div>
        <Sidebar className="w-full h-full border-r">
          <Sidebar.Items className="pt-2">
            <Sidebar.ItemGroup className="flex flex-col gap-2 sm:gap-4">
              {routes.map((route) => (
                <Sidebar.Item
                  key={route.path}
                  active={activeTab === route.tab}
                  as="div"
                  className={`cursor-pointer transition-all duration-200 ${activeTab === route.tab ? "bg-green-50 text-green-600" : "hover:bg-gray-50"}`}
                >
                  <Link to={route.path} className="flex items-center gap-2 py-2">
                    <route.icon className={`text-xl ${collapsed ? "mx-auto" : ""}`} />
                    {!collapsed && <span>{route.label}</span>}
                  </Link>
                </Sidebar.Item>
              ))}
            </Sidebar.ItemGroup>
          </Sidebar.Items>
        </Sidebar>
      </div>

      {/* Mobile Sidebar - Slide in from left */}
      <div
        className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
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
                  activeTab === route.tab ? "bg-green-50 text-green-600 border-l-4 border-green-500" : ""
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
  )
}

