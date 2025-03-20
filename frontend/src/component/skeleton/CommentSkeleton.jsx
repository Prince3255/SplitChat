import React from "react";

export default function CommentSkeleton() {
  return (
    <div className="mx-auto w-full sm:w-4/5 p-3">
      <div className="flex items-center gap-1 my-5 text-gray-500 text-sm animate-pulse">
        <div className="h-4 bg-gray-200 w-24"></div>
        <div className="h-5 w-5 rounded-full bg-gray-200"></div>
        <div className="h-4 bg-gray-200 w-32"></div>
      </div>
      <div className="border border-teal-500 rounded-md p-3 animate-pulse">
        <div className="h-20 bg-gray-200 mt-2 mb-4"></div>
        <div className="flex justify-between items-center mt-5">
          <div className="h-4 bg-gray-200 w-48"></div>
          <div className="h-10 bg-gray-200 w-20"></div>
        </div>
      </div>
    </div>
  );
}
