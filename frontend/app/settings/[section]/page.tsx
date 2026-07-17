import { notFound } from "next/navigation";
import SettingsSectionView, {
  type SettingsSectionKey,
} from "../settings-section-view";

const validSections = new Set<SettingsSectionKey>([
  "business-profile",
  "billing-gst",
  "staff-management",
  "inventory",
  "notifications",
  "integrations",
  "security",
  "backup-recovery",
]);

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  if (!validSections.has(section as SettingsSectionKey)) {
    notFound();
  }

  return <SettingsSectionView section={section as SettingsSectionKey} />;
}
