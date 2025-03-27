"use client";
import dynamic from "next/dynamic";

// Import UserProfile without SSR
const UserProfile = dynamic(() => import("./user-profile"), { ssr: false });

export default function ClientUserProfile() {
  return <UserProfile />;
}
