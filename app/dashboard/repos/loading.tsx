export default function ReposLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-32 rounded mb-2" style={{ background: "#252036" }} />
      <div className="h-4 w-64 rounded mb-8" style={{ background: "#252036" }} />

      <div className="h-5 w-40 rounded mb-4" style={{ background: "#252036" }} />
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg p-4 border mb-3" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-48 rounded mb-2" style={{ background: "#252036" }} />
              <div className="h-3 w-72 rounded" style={{ background: "#252036" }} />
            </div>
            <div className="h-8 w-24 rounded-lg" style={{ background: "#252036" }} />
          </div>
        </div>
      ))}

      <div className="h-5 w-40 rounded mb-4 mt-10" style={{ background: "#252036" }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg p-4 border mb-3" style={{ background: "#1a1628", borderColor: "#252036" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 w-40 rounded mb-2" style={{ background: "#252036" }} />
              <div className="h-3 w-56 rounded" style={{ background: "#252036" }} />
            </div>
            <div className="h-8 w-24 rounded-lg" style={{ background: "#252036" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
