import type { Metadata } from "next";
import "../globals.css";
import QueryProvider from "@/app/api/queryProvider";
import Navbar from "./component/navbar";
import Sidebar from "./component/sidebar";
import { SAPI_GetToken } from "./utils/token";
import "@radix-ui/themes/styles.css";

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
      <body className="flex bg-white text-gray-800">
        <QueryProvider>
          {token ?
            <>
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Navbar />
                <main className="p-4 pt-16">{children}</main>
              </div>
            </>
            :
            <>
              <div className="flex-1 flex flex-col">
                <main className="p-4 pt-16">{children}</main>
              </div>
            </>
          }
        </QueryProvider>
      </body>
    </html>
  );
}
