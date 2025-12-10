import React from "react";
import { Button } from "@components/ui/button";
import Link from "next/link";

export default function ButtonLink({
  to,
  className,
  label,
}: Readonly<{ to: string; className?: string; label?: string }>) {
  return (
    <>
      <Link href={to} className="w-full">
        <Button className={className}>{label} </Button>
      </Link>
    </>
  );
}
