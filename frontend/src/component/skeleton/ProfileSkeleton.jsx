import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div class="animate-pulse">
        <div class="w-32 h-32 mx-auto my-4 bg-gray-200 rounded-full"></div>
        <div class="mb-8 h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div class="space-y-6 px-6 py-8">
          <div>
            <div class="mb-1 h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div>
            <div class="mb-1 h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-10 bg-gray-200 rounded w-full"></div>
          </div>
          <div class="pt-6 space-y-4">
            <div class="text-xl font-semibold mb-4 h-5 bg-gray-200 rounded w-1/3"></div>
            <div class="flex items-center justify-between py-3 border-b">
              <div class="flex items-center gap-2 text-gray-600 w-1/2">
                <div class="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <span class="h-4 bg-gray-200 rounded w-3/4"></span>
              </div>
              <span class="text-gray-900 h-4 bg-gray-200 rounded w-1/4"></span>
            </div>
            <div class="flex items-center justify-between py-3 border-b">
              <div class="flex items-center gap-2 text-gray-600 w-1/2">
                <div class="w-5 h-5 bg-gray-200 rounded mr-2"></div>
                <span class="h-4 bg-gray-200 rounded w-3/4"></span>
              </div>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 h-6 w-1/4"></span>
            </div>
          </div>
          <div class="pt-6 h-12 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}
