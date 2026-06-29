"use client";

import { useRef, useState } from "react";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { exportDataBackup, exportFullBackup, importBackup } from "@/lib/backup";
import { useSettingsStore } from "@/stores/settingsStore";
import { runSeed } from "@/lib/seed";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsPageHeader } from "@/components/settings/SettingsNavCard";
import { PageShell } from "@/components/ui/page-shell";

type Props = {
  title?: string;
  description?: string;
  showReseed?: boolean;
};

export function SettingsBackupPage({
  title = "Backup / Restore",
  description = "Export and restore your Forge data.",
  showReseed = true,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setImportOpen(true);
  };

  const confirmImport = async () => {
    if (!pendingFile) return;
    try {
      await importBackup(pendingFile);
      toast.success("Backup restored successfully");
    } catch {
      toast.error("Failed to import backup");
    } finally {
      setImportOpen(false);
      setPendingFile(null);
    }
  };

  const reseed = () => {
    useSettingsStore.getState().setHasSeeded(false);
    runSeed();
    toast.success("Blueprint and routines re-seeded");
  };

  return (
    <PageShell className="space-y-6 pb-24">
      <SettingsPageHeader title={title} description={description} />

      <GlassCard className="space-y-3">
        <p className="text-xs text-muted-foreground">
          All data stays on this device. Export regularly for safety.
        </p>
        <Button className="w-full" variant="secondary" onClick={() => exportDataBackup()}>
          Export Data (forge-backup.json)
        </Button>
        <Button className="w-full" variant="secondary" onClick={() => exportFullBackup()}>
          Export Full (+ photos)
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button className="w-full" variant="outline" onClick={() => fileRef.current?.click()}>
          Import Backup
        </Button>
        {showReseed && (
          <Button className="w-full" variant="ghost" onClick={reseed}>
            Re-seed from Blueprint defaults
          </Button>
        )}
      </GlassCard>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Import backup?</DialogTitle>
            <DialogDescription>
              This replaces all local Forge data with{" "}
              <strong>{pendingFile?.name}</strong>. Export first if unsure.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmImport}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
