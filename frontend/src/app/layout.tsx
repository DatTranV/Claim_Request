import "@/app/globals.css";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Provider from "@components/provider";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import React from "react";
import { SidebarInset, SidebarProvider } from "@components/ui/sidebar";
import { AppSidebar } from "@components/app-sidebar";
import { ThemeProvider } from "@components/theme-provider";
import Header from "@components/shared/Header";
import { ToastContainer } from "react-toastify";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/auth-context";
import AppProgressBar from "@/components/progress-bar";

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-roboto",
  // preload: false,
});

export const metadata: Metadata = {
  title: "Claim Request - NET 3",
  description: "Claim Request System",
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={roboto.className} suppressHydrationWarning>
        <AppProgressBar>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                  <Provider>
                    <Header />
                    <Toaster />
                    <main>{children}</main>
                    <ReactQueryDevtools initialIsOpen={false} />
                  </Provider>
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                  />
                </SidebarInset>
              </SidebarProvider>
            </AuthProvider>
          </ThemeProvider>
        </AppProgressBar>
      </body>
    </html>
  );
};

export default AppLayout;
