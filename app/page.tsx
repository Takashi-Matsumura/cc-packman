"use client";

import { useEffect, useState } from "react";
import PackmanGame from "./components/PackmanGame";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">Game Packman</h1>
      <PackmanGame />
    </div>
  );
}