import React from "react";
import { NavbarDemo } from "../common/navBar";
import { Footer } from "../common/footer";
import { Outlet } from "react-router-dom";

export const UserLayout = () => {
  return (
    <div className="relative w-full min-h-screen">
      {<NavbarDemo />}

      {/* MAIN CONTENT */}
      <main className="relative w-full">
        <Outlet />
      </main>

      {<Footer />}
    </div>
  );
};
