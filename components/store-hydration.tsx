"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

// Triggers Zustand persist rehydration from localStorage after client mount.
// Required when skipHydration:true is set to avoid SSR/client state mismatch.
export function StoreHydration() {
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);
  return null;
}
