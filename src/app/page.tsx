"use client";
import Image from "next/image";
import Form from "./components/form";
import History from "./components/history";
import { useState } from "react";

export default function Home() {
  const [activeRequestIndex, setActiveRequestIndex] = useState(0);
  return (
    <main className="">
      <Form
        activeRequestIndex={activeRequestIndex}
        setActiveRequestIndex={setActiveRequestIndex}
      />
      <History
        activeRequestIndex={activeRequestIndex}
        setActiveRequestIndex={setActiveRequestIndex}
      />
    </main>
  );
}
