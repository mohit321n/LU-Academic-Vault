import { useState, useEffect } from 'react';
import { admin } from '../../services/api';

export default function Reports() {
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); admin.getReports().then(d => { setReportsList(d.reports); setTotal(d.total); }).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports ({total})</h1>
      {loading ? <div className="text-center py-12 text-gray-500">Loading...</div> : reportsList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reports.</div>
      ) : (
        <div className="space-y-3">
          {reportsList.map((r: any) => (
            <div key={r.id} className="p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Report #{r.id} — {r.reason}</div>
                <div className="text-xs text-gray-500 mt-1">Resource #{r.resource_id} | {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${r.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                {r.status !== 'resolved' && <button onClick={() => { admin.resolveReport(r.id).then(load); }} className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">Resolve</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
