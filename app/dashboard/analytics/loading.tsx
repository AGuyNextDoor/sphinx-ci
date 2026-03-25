export default function AnalyticsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-36 rounded mb-2" style={{ background: "#252036" }} />
      <div className="h-4 w-64 rounded mb-8" style={{ background: "#252036" }} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <div className="h-3 w-16 rounded mb-2" style={{ background: "#252036" }} />
            <div className="h-7 w-12 rounded" style={{ background: "#252036" }} />
          </div>
        ))}
      </div>

      <div className="h-6 w-40 rounded mb-4" style={{ background: "#252036" }} />
      <div className="rounded-lg p-4 border mb-10" style={{ background: "#1a1628", borderColor: "#252036" }}>
        <div className="h-24 rounded" style={{ background: "#252036" }} />
      </div>

      <div className="h-6 w-32 rounded mb-4" style={{ background: "#252036" }} />
      <div className="rounded-lg border" style={{ background: "#1a1628", borderColor: "#252036" }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b" style={{ borderColor: "rgba(37,32,54,0.5)" }}>
            <div className="h-3 w-32 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-8 rounded ml-auto" style={{ background: "#252036" }} />
            <div className="h-3 w-8 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-8 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-12 rounded" style={{ background: "#252036" }} />
            <div className="h-3 w-10 rounded" style={{ background: "#252036" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
