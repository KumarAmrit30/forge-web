"use client";

import { useWorkoutStore } from "@/stores/workoutStore";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChevronUp, ChevronDown, Trash2, Plus } from "lucide-react";
import { generateId } from "@/lib/id";
import type { WorkoutDay, Exercise } from "@/types";

export function WorkoutEditor() {
  const plan = useWorkoutStore((s) => s.plan);
  const updateDay = useWorkoutStore((s) => s.updateDay);
  const addDay = useWorkoutStore((s) => s.addDay);
  const removeDay = useWorkoutStore((s) => s.removeDay);
  const reorderDays = useWorkoutStore((s) => s.reorderDays);
  const resetCycle = useWorkoutStore((s) => s.resetCycle);

  const moveDay = (index: number, dir: -1 | 1) => {
    const ids = plan.days.map((d) => d.id);
    const target = index + dir;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderDays(ids);
  };

  const addExercise = (dayId: string) => {
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    const ex: Exercise = {
      id: generateId(),
      name: "New Exercise",
      targetSets: 3,
      targetReps: "8-12",
      restSeconds: 90,
    };
    updateDay(dayId, { exercises: [...day.exercises, ex] });
  };

  const updateExercise = (
    dayId: string,
    exId: string,
    updates: Partial<Exercise>
  ) => {
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    updateDay(dayId, {
      exercises: day.exercises.map((e) =>
        e.id === exId ? { ...e, ...updates } : e
      ),
    });
  };

  const removeExercise = (dayId: string, exId: string) => {
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    updateDay(dayId, {
      exercises: day.exercises.filter((e) => e.id !== exId),
    });
  };

  const addNewDay = () => {
    const day: WorkoutDay = {
      id: generateId(),
      name: "New Day",
      order: plan.days.length,
      exercises: [],
    };
    addDay(day);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={addNewDay}>
          <Plus className="mr-1 h-4 w-4" /> Add Day
        </Button>
        <Button size="sm" variant="outline" onClick={resetCycle}>
          Reset Cycle
        </Button>
      </div>

      {plan.days.map((day, di) => (
        <GlassCard key={day.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={day.name}
              onChange={(e) => updateDay(day.id, { name: e.target.value })}
              className="font-semibold"
            />
            <Button size="icon" variant="ghost" onClick={() => moveDay(di, -1)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => moveDay(di, 1)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => removeDay(day.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {day.exercises.map((ex) => (
            <div key={ex.id} className="space-y-2 border-t border-border/50 pt-3">
              <Input
                value={ex.name}
                onChange={(e) =>
                  updateExercise(day.id, ex.id, { name: e.target.value })
                }
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Sets"
                  value={ex.targetSets}
                  onChange={(e) =>
                    updateExercise(day.id, ex.id, {
                      targetSets: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
                <Input
                  placeholder="Reps"
                  value={ex.targetReps}
                  onChange={(e) =>
                    updateExercise(day.id, ex.id, { targetReps: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Rest (s)"
                  value={ex.restSeconds}
                  onChange={(e) =>
                    updateExercise(day.id, ex.id, {
                      restSeconds: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
              </div>
              <Textarea
                placeholder="Notes"
                value={ex.notes ?? ""}
                onChange={(e) =>
                  updateExercise(day.id, ex.id, { notes: e.target.value })
                }
                rows={2}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive"
                onClick={() => removeExercise(day.id, ex.id)}
              >
                Remove exercise
              </Button>
            </div>
          ))}

          <Button size="sm" variant="secondary" onClick={() => addExercise(day.id)}>
            <Plus className="mr-1 h-4 w-4" /> Add Exercise
          </Button>
        </GlassCard>
      ))}
    </div>
  );
}
