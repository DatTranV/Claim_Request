import Footer from '@components/shared/Footer'
import React from 'react'

export default function UserLayout({
    children
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <div className="container mx-auto">
                {children}
            </div>
            <Footer />
        </>
    )
}
