import React from "react";

export default function GroupExpenseSkeleton() {
  return (
    <div className="w-full animate-pulse p-4 sm:p-6">
      <div className="flex justify-between w-full items-center">
        <div className="mb-8 h-24 w-full rounded bg-gray-200"></div>
      </div>
      <div className="space-y-5 mt-4 p-4">
        <div className="flex w-full justify-between items-center">
          <div className="w-full flex space-x-3 items-center">
            <div className="h-8 w-1/5 rounded bg-gray-200"></div>
          </div>
          <div className="h-8 w-1/4 flex space-x-4">
            <div className="w-1/2 rounded bg-gray-200"></div>
            <div className="w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-3 px-2 mb-9">
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
        </div>
        <div className="flex flex-col justify-between items-center space-y-8 px-4 w-full">
          <div className="flex flex-col space-y-2 w-full mt-8">
            <div className="h-4 w-1/4 rounded bg-gray-200 mb-2"></div>
            <div className="flex items-center space-x-3 w-full">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex flex-col space-y-2 w-full">
            <div className="h-4 w-1/4 rounded bg-gray-200 mb-2"></div>
            <div className="flex items-center space-x-3 w-full">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
            <div className="flex items-center space-x-3 w-full">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
            <div className="flex items-center space-x-3 w-full">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="h-4 w-1/3 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
          <div className="h-4 w-1/3 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
