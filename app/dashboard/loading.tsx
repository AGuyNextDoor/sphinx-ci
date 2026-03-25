export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-40 rounded mb-6" style={{ background: "#252036" }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg" style={{ background: "#252036" }} />
              <div>
                <div className="h-3 w-20 rounded mb-2" style={{ background: "#252036" }} />
                <div className="h-6 w-10 rounded" style={{ background: "#252036" }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-6 w-32 rounded mb-4" style={{ background: "#252036" }} />
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg p-4 border mb-3" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="h-4 w-48 rounded mb-2" style={{ background: "#252036" }} />
          <div className="h-3 w-32 rounded" style={{ background: "#252036" }} />
        </div>
      ))}
    </div>
  );
}
