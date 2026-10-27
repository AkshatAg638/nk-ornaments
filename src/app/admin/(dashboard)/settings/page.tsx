import { getSiteSettings } from "@/lib/data";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Site Settings | N.K Ornaments Admin",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsClient initialSettings={settings} />;
}
