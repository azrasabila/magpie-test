"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { useState } from "react";
import Link from "next/link";
import {
  DashboardIcon,
  FileTextIcon,
  ArchiveIcon,
  HamburgerMenuIcon,
  PersonIcon,
  HandIcon,
} from "@radix-ui/react-icons";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="h-screen flex">
      <div className={`h-full flex flex-col bg-gray-900 text-white transition-all ${open ? "w-64" : "w-20"}`}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className={`text-lg font-bold transition-all ${!open && "hidden"}`}>Library</h1>
          <Collapsible.Trigger asChild>
            <button className="p-2 rounded-md bg-gray-800 hover:bg-gray-700">
              <HamburgerMenuIcon className="w-6 h-6" />
            </button>
          </Collapsible.Trigger>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-2">
          <NavItem href="/" icon={<DashboardIcon className="w-5 h-5" />} label="Dashboard" open={open} />
          <NavItem href="/book" icon={<FileTextIcon className="w-5 h-5" />} label="Books" open={open} />
          <NavItem href="/lending" icon={<HandIcon className="w-5 h-5" />} label="Lending" open={open} />
          <NavItem href="/category" icon={<ArchiveIcon className="w-5 h-5" />} label="Categories" open={open} />
          <NavItem href="/member" icon={<PersonIcon className="w-5 h-5" />} label="Member" open={open} />
        </nav>
      </div>
    </Collapsible.Root>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  open: boolean;
}

function NavItem({ href, icon, label, open }: NavItemProps) {
  return (
    <Link href={href} className="flex items-center p-3 hover:bg-gray-800 cursor-pointer">
      {icon}
      <span className={`ml-3 transition-all ${!open && "hidden"}`}>{label}</span>
    </Link>
  );
}
