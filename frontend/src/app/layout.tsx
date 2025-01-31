import type { Metadata } from "next";
import "../globals.css";
import QueryProvider from "@/app/api/queryProvider";
import Navbar from "./component/navbar";
import Sidebar from "./component/sidebar";
import { SAPI_GetToken } from "./utils/token";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "Library Management",
  description: "Manage books and categories efficiently",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const token = await SAPI_GetToken()
  return (
    <html lang="en">
      <body className="flex bg-white text-gray-800 w-full">
        <QueryProvider>
          <Theme className="w-full">
            {token ? (
              <div className="flex w-full h-screen">
                <Sidebar />
                <div className="w-full flex flex-col flex-1">
                  <main className="p-4 pt-16">{children}</main>
                  <Navbar />
                </div>
              </div>
            ) : (
              <main className="flex flex-col items-center justify-center w-full h-screen p-4">
                {children}
              </main>
            )}
          </Theme>
        </QueryProvider>
      </body>
    </html>
  );
}
