"use client";

import { TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScreenGuard() {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkScreen = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const isMobile = width < 768;
      const isTabletPortrait = width >= 768 && width <= 1024 && height > width;

      setAllowed(!isMobile && !isTabletPortrait);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);
    window.addEventListener("orientationchange", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("orientationchange", checkScreen);
    };
  }, []);

  if (allowed === null) return null;

  if (!allowed) {
    return (
      <div className=" fixed inset-0 z-9999 flex items-center justify-center backdrop-blur-md bg-white/70 px-6 text-center text-black">
        <div className="max-w-md space-y-4 flex flex-col items-center">
          <TriangleAlertIcon className="w-10 h-10" />
          <h1 className="text-2xl font-semibold">Screen Not Supported</h1>
          <p className="text-black">
            This application is optimized for Desktop and iPad (landscape) only.
          </p>
        </div>
      </div>
    );
  }
}
