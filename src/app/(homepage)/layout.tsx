import * as React from "react";
import Header from "./components/header";
import { auth } from "@clerk/nextjs/server";
import Footer from "./components/footer";

const HomepageLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default HomepageLayout;
