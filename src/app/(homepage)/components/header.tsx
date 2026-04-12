"use client";

import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Globe, Menu } from "lucide-react";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="border-b border-border px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Globe className="size-5 text-foreground" />
          <span className="font-semibold text-foreground text-lg">
            LinkCheck
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Docs
            </a>
          </nav> */}
          <Show when="signed-out">
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm">
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
