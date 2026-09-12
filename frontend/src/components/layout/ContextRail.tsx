"use client";

interface ContextRailProps {
  citations?: Array<{
    id: string;
    source: string;
    text: string;
    category: string;
  }>;
  isVisible?: boolean;
}

export function ContextRail({ citations = [], isVisible = true }: ContextRailProps) {
  if (!isVisible) return null;

  return (
    <aside
      className="fixed right-0 top-[56px] bottom-0 border-l overflow-y-auto hidden xl:block"
      style={{
        width: "var(--context-rail-width)",
        background: "var(--surface)",
        borderColor: "var(--border-hairline)",
      }}
    >
      <div className="p-4">
        <h3 className="label-sm mb-4" style={{ color: "var(--ink-muted)" }}>
          CONTEXT & SOURCES
        </h3>

        {citations.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto mb-3 opacity-30" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="body-sm" style={{ color: "var(--ink-muted)" }}>
              Source documents and citations will appear here during a conversation.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {citations.map((citation, index) => (
              <div key={citation.id} className="card p-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className="badge-saffron flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="label-md" style={{ color: "var(--ink-primary)" }}>
                    {citation.source}
                  </span>
                </div>
                <p className="body-sm" style={{ color: "var(--ink-muted)" }}>
                  {citation.text}
                </p>
                <span className="badge-emerald mt-2 inline-block">
                  {citation.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
