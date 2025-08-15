import { uid } from "./utils.js";

export function seedUsers() {
  const now = Date.now();
  return [
    { id: uid(), name: "Demo Owner",    email: "owner@demo.app",    phone: "0500000000", password: "owner123",    role: "owner",    createdAt: now },
    { id: uid(), name: "Demo Provider", email: "provider@demo.app", phone: "0500000001", password: "provider123", role: "provider", createdAt: now },
  ];
}
