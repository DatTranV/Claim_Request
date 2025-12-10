"use client";

import { AppSidebar } from "@/components/app-sidebar";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-10">
        {/* <Header /> */}
        {children}
      </div>
    </>
  );
}
