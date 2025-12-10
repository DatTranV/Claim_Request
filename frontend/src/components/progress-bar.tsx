"use client";
import { useProgress } from "@bprogress/next";
import { ProgressProvider } from "@bprogress/next/app";

export default function AppProgressBar({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProgressProvider
      height="4px"
      color="#000000"
      options={{ showSpinner: false }}
      shallowRouting
      disableSameURL
    >
      {children}
    </ProgressProvider>
  );
}
