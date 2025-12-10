
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function HeaderLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: any;
}) {
  return (
    <>
      <Link
        href={href}
        className={cn(
          "text-base cursor-pointer capitalize",
          pathname === href ? "text-blue-500" : "text-gray-500"
        )}
      >
        {label}
      </Link>
    </>
  );
}
