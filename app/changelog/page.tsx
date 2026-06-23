import React from "react";
import { Metadata } from "next";
import Changelog from "./changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "View the latest updates and changes.",
};

const ChangelogPage = async () => {
  return (
    <div className="pt-5">
      <Changelog />
    </div>
  );
};

export default ChangelogPage;
