"use client";
import { Theme } from "@radix-ui/themes";
import "@/app/globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Theme>{children}</Theme>
  );
}
