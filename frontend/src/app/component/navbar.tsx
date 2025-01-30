"use client";

import { AvatarIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-900">
          <Link href="/">Library Management</Link>
        </h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-900">
            <AvatarIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
