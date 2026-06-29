import { SettingsBackupPage } from "@/components/settings/SettingsBackupPage";

export default function Page() {
  return (
    <SettingsBackupPage
      title="Import / Export"
      description="Move Forge data on or off this device."
      showReseed={false}
    />
  );
}
