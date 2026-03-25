export default function QuizzesLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 rounded mb-2" style={{ background: "#252036" }} />
      <div className="h-4 w-64 rounded mb-6" style={{ background: "#252036" }} />

      <div className="rounded-lg border overflow-hidden" style={{ background: "#1a1628", borderColor: "#252036" }}>
        {/* Header */}
        <div className="flex gap-4 px-4 py-3 border-b" style={{ borderColor: "#252036" }}>
          {[80, 60, 50, 40, 60, 30].map((w, i) => (
            <div key={i} className="h-3 rounded" style={{ background: "#252036", width: `${w}px` }} />
          ))}
        </div>
        {/* Rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b" style={{ borderColor: "rgba(37,32,54,0.5)" }}>
            <div className="h-3 w-28 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-40 rounded" style={{ background: "#252036" }} />
            <div className="h-5 w-16 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-10 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-20 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-8 rounded" style={{ background: "#252036" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
