import { redirect } from "next/navigation";

export default function LegacyKeysPage() {
  redirect("/dashboard/api-keys");
}
