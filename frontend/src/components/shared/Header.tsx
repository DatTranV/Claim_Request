"use client"
import React from "react";
import { Separator } from "@radix-ui/react-separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ModeToggle } from "@components/mode-toggle";
import { Breadcrumb } from "./breadcrumb";


export default function Header() {


  return (
    <header className="flex h-16 shrink-0
     items-center gap-2 border-b 
     sticky top-0 z-50 bg-background
     rounded-t-lg
     ">
      <SidebarTrigger className="ml-4" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb />
      <div className="flex-1" />
      <ModeToggle />
      <div className="mr-2" />
    </header>
  );
}
