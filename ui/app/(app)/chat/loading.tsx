export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col overflow-hidden bg-white lg:h-screen">
      <div className="flex shrink-0 items-center justify-between border-slate-100 border-b px-6 py-4">
        <div className="space-y-2">
          <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl space-y-3 px-6 py-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
