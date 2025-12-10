"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumb() {
    const pathname = usePathname()

    if (pathname === "/") {
        return null
    }

    // new breadcrumb items
    const pathSegments = pathname.split("/").filter(Boolean)

    // new link breadcrumb
    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`
        const isLast = index === pathSegments.length - 1

        //  segment to displayname (capitalize and replace hyphens with spaces)
        const displayName = segment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")

        return {
            href,
            label: displayName,
            isLast,
        }
    })

    return (
        <>
            <nav className="flex items-center text-sm text-muted-foreground">
                <Link href="/" className="flex items-center hover:text-foreground transition-colors">
                    <Home className="h-4 w-4" />
                    <span className="sr-only">Home</span>
                </Link>

                {
                    breadcrumbs.map((breadcrumb, index) => (
                        <div key={breadcrumb.href} className="flex items-center">
                            <ChevronRight className="h-4 w-4 mx-2" />
                            {breadcrumb.isLast ? (
                                <span className="font-medium text-foreground">{breadcrumb.label}</span>
                            ) : (
                                <Link href={breadcrumb.href} className="hover:text-foreground transition-colors">
                                    {breadcrumb.label}
                                </Link>
                            )}
                        </div>
                    ))
                }
            </nav>
        </>
    )
}

