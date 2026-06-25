import { cn } from "@/lib/utils";

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function parseMarkdown(content: string): React.ReactNode[] {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (!listItems.length || !listType) return;
    const ListTag = listType === "ul" ? "ul" : "ol";
    nodes.push(
      <ListTag
        key={`list-${nodes.length}`}
        className="my-3 ml-4 list-disc space-y-1 text-sm text-muted-foreground"
      >
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ListTag>
    );
    listItems = [];
    listType = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4
          key={`h4-${nodes.length}`}
          className="mt-4 mb-2 text-sm font-semibold text-foreground"
        >
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3
          key={`h3-${nodes.length}`}
          className="mt-4 mb-2 text-base font-semibold text-foreground"
        >
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith("- ")) {
      if (listType !== "ul") {
        flushList();
        listType = "ul";
      }
      listItems.push(trimmed.slice(2));
      continue;
    }
    flushList();
    nodes.push(
      <p
        key={`p-${nodes.length}`}
        className="text-sm leading-relaxed text-muted-foreground"
      >
        {renderInline(trimmed)}
      </p>
    );
  }
  flushList();
  return nodes;
}

export function Prose({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content?.trim()) {
    return (
      <p className="text-sm italic text-muted-foreground">Nothing here yet.</p>
    );
  }
  return (
    <div className={cn("prose-forge space-y-1", className)}>
      {parseMarkdown(content)}
    </div>
  );
}
