const shimmer = `
  relative overflow-hidden before:absolute before:inset-0
  before:-translate-x-full before:animate-[shimmer_2s_ease-in-out_infinite]
  before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent
`;

function Bone({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`${shimmer} rounded bg-gray-200 ${className}`} style={style} />
  );
}

export default function AgentFormSkeleton() {
  return (
    <>
      <style>{`
       @keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .skeleton-enter {
          animation: fade-in 0.4s ease both;
        }
        .stagger-1 { animation: fade-in 0.4s 0.05s ease both; }
        .stagger-2 { animation: fade-in 0.4s 0.10s ease both; }
        .stagger-3 { animation: fade-in 0.4s 0.15s ease both; }
        .stagger-4 { animation: fade-in 0.4s 0.20s ease both; }
        .stagger-5 { animation: fade-in 0.4s 0.25s ease both; }
        .stagger-6 { animation: fade-in 0.4s 0.30s ease both; }
      `}</style>

      <div className="flex h-screen w-full flex-col bg-white skeleton-enter">

        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Bone className="h-8 w-8 rounded-full" />
            <Bone className="h-8 w-36" />
          </div>
          <div className="flex items-center gap-3">
            <Bone className="h-9 w-24 rounded-md" />
            <Bone className="h-9 w-36 rounded-md" />
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 p-4 pt-8">
            <nav className="space-y-1">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 stagger-${i + 1}`}
                >
                  <Bone className="h-6 w-6 shrink-0 rounded" />
                  <Bone className="h-8 flex-1 rounded" style={{ width: `${65 + (i % 3) * 12}%` }} />
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-8 pt-10">
            <div className="mx-auto max-w-3xl space-y-6">

              {/* Page title area */}
              <div className="space-y-2">
                <Bone className="h-8 w-48 rounded-md" />
                <Bone className="h-4 w-56 rounded" />
              </div>

              {/* Cards */}
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={`rounded-xl border border-gray-100 bg-gray-100 p-10 space-y-3 stagger-${i + 1}`}
                >
                </div>
              ))}

            </div>
          </main>

        </div>
      </div>
    </>
  );
}