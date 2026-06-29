import { HabitEditorScreen } from "@/components/habits/HabitEditorScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function HabitEditorPage({ params }: Props) {
  const { id } = await params;
  return <HabitEditorScreen habitId={id} />;
}
