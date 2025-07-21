'use client';

interface BooleanQueryDisplayProps {
  query: string;
}

export function BooleanQueryDisplay({ query }: BooleanQueryDisplayProps) {
  return (
    <div className="mt-8">
      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words p-4 bg-secondary/50 rounded-lg border">
        {query}
      </pre>
    </div>
  );
}
