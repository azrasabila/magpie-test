"use client"
import { AvatarIcon, ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { DropdownMenu } from "radix-ui";
import { logoutUser } from "../utils/token";

export default function Navbar() {
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      throw("Logout failed");
    }
  };

  return (
    <header className="w-full bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-900">
          <Link href="/">Library Management</Link>
        </h1>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none">
              <AvatarIcon className="w-6 h-6" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content align="end" className="bg-white shadow-lg rounded-md p-4">
            <DropdownMenu.Item onClick={handleLogout} className="flex items-center text-red-500 hover:bg-red-100">
              <ExitIcon className="mr-2" />
              Logout
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
