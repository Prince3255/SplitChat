import React from "react";

function SidebarSkeleton() {
  const skeletonContact = Array(8).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded">
            <img
              src="https://media.istockphoto.com/id/938887966/vector/two-people-icon-symbol-of-group-or-pair-of-persons-friends-contacts-users-outline-modern.jpg?s=612x612&w=0&k=20&c=575mQXvCuoAjbX6tnVXU4TIlGw9CJH6AVR0QjA4S7JA="
              alt="img"
              className="w-full h-full rounded-md object-cover border-2"
            />
          </div>
          <span className="font-medium hidden lg:block">Friends & Groups</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {skeletonContact.map((_, id) => (
          <div className="w-full p-3 flex items-center gap-3" key={id}>
            <div className="relative mx-auto lg:mx-0">
              <div className="skeleton size-12 rounded-full" />
            </div>

            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="skeleton h-4 w-32 mb-2" />
              <div className="skeleton h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default SidebarSkeleton;
