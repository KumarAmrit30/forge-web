"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCheckpointStore } from "@/stores/checkpointStore";
import { currentMonthKey } from "@/lib/date-utils";
import { generateId } from "@/lib/id";
import {
  compressImage,
  photoKey,
  savePhoto,
} from "@/lib/photo-storage";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MonthlyCheckpointSheet({ open, onOpenChange }: Props) {
  const month = currentMonthKey();
  const addCheckpoint = useCheckpointStore((s) => s.addCheckpoint);

  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");
  const [chest, setChest] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");
  const [notes, setNotes] = useState("");

  const handlePhoto = async (
    type: "hair" | "skin",
    variant: string,
    file: File
  ) => {
    const blob = await compressImage(file);
    const key = photoKey(type, month, variant);
    await savePhoto(key, blob);
  };

  const save = () => {
    addCheckpoint({
      id: generateId(),
      month,
      weight: weight ? parseFloat(weight) : undefined,
      measurements: {
        waist: waist ? parseFloat(waist) : undefined,
        chest: chest ? parseFloat(chest) : undefined,
        arms: arms ? parseFloat(arms) : undefined,
        thighs: thighs ? parseFloat(thighs) : undefined,
      },
      progressNotes: notes,
      hairPhotoIds: [
        photoKey("hair", month, "front"),
        photoKey("hair", month, "top"),
        photoKey("hair", month, "crown"),
      ],
      skinPhotoIds: [photoKey("skin", month, "main")],
      createdAt: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Monthly Checkpoint — {month}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Weight (kg)</Label>
              <Input value={weight} onChange={(e) => setWeight(e.target.value)} type="number" step="0.1" />
            </div>
            <div>
              <Label>Waist (cm)</Label>
              <Input value={waist} onChange={(e) => setWaist(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Chest (cm)</Label>
              <Input value={chest} onChange={(e) => setChest(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Arms (cm)</Label>
              <Input value={arms} onChange={(e) => setArms(e.target.value)} type="number" />
            </div>
            <div>
              <Label>Thighs (cm)</Label>
              <Input value={thighs} onChange={(e) => setThighs(e.target.value)} type="number" />
            </div>
          </div>

          <div>
            <Label>Progress Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" />
          </div>

          <div className="space-y-2">
            <Label>Hair Photos</Label>
            {["front", "top", "crown"].map((v) => (
              <Input
                key={v}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handlePhoto("hair", v, f);
                }}
              />
            ))}
          </div>

          <div>
            <Label>Skin Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePhoto("skin", "main", f);
              }}
            />
          </div>

          <Button className="w-full" onClick={save}>
            Save Checkpoint
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
