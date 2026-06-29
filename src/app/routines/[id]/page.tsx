import { RoutineEditorScreen } from "@/components/routines/RoutineEditorScreen";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RoutineEditorPage({ params }: Props) {
  const { id } = await params;
  return <RoutineEditorScreen routineId={id} />;
}
