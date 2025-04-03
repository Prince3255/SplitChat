import React from "react";
import logo from '../assets/logo.png'

export default function NoChatSelected() {
  return (
    <div className="hidden w-full sm:flex flex-1 flex-col items-center justify-center h-full bg-base-100/50">
      <div className="text-center space-y-4">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 flex items-center
             justify-center animate-bounce"
            >
              <img src={logo} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold">Welcome to Chat!</h2>
        <p className="text-base-content/60">
          Select a conversation from the sidebar to start chatting
        </p>
      </div>
    </div>
  );
}
