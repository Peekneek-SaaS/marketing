import { title } from "process";
import React from "react";

const Features = () => {
  const howItWorks = [
    {
      id: "1",
      title: "Enter URL",
      description: "Paste your website URL and choose crawl options",
    },
    {
      id: "2",
      title: "Check",
      description: "We scan every page and check all links for errors",
    },
    {
      id: "3",
      title: "View Results",
      description: "See a visual tree of all links with their status",
    },
  ];
  return (
    <section className="w-full max-w-2xl py-8">
      <h2 className="text-2xl font-bold text-foreground text-center mb-4">
        How it works
      </h2>

      <div className="flex items-center justify-center gap-8">
        {howItWorks.map((item) => (
          <div
            className="flex flex-col  justify-center items-center gap-2"
            key={item.id}
          >
            <span className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center text-primary-foreground font-semibold text-sm">
              {item.id}
            </span>
            <p className="font-semibold text-foreground mt-4 text-base">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
