import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Auth",
  description: "Auth",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
        
        
        {children}</div>
  );
}
