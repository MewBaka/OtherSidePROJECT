"use client";

import { Constants } from "@/lib/api/config";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center p-4">
        <Image src={Constants.src.images.LOGO} className="w-1/2 h-auto" alt="Logo" />
        {/* <p className="text-white font-thin text-2xl">{Constants.info.app.name}</p> */}
      </div>
    </div>
  );
};