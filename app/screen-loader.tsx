"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { setNavigator, showScreen } from "./runtime";

export default function ScreenLoader({ id }: { id: string }) {
  const router = useRouter();
  useEffect(() => {
    setNavigator((to) => router.push(to));
    showScreen(id);
  }, [id, router]);
  return null;
}
