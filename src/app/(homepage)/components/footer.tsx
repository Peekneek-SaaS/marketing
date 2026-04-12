import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-border px-4">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="font-semibold text-foreground text-xs hover:underline"
          >
            Terms & conditions
          </Link>
          <Link
            href="#"
            className="font-semibold text-foreground text-xs hover:underline"
          >
            Privacy
          </Link>
        </div>
        <span className="font-semibold text-foreground text-xs">
          2026 copyrights
        </span>
      </div>
    </footer>
  );
};

export default Footer;
