export default function TrendsDashboard() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-4">Historical Trends</h2>
        <p className="text-gray-600 mb-6">
          The historical variance trends dashboard is currently undergoing an upgrade to fully support the new 3-Tier Reconciliation Math engine.
        </p>
        <p className="text-gray-600 font-medium">
          Please use the Manager Dashboard (Run Recon Engine) to calculate variances on-the-fly.
        </p>
      </div>
    </div>
  );
}
