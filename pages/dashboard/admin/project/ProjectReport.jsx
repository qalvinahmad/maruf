import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

const ProjectReport = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      // Use service role (admin) session, so admin can see all reports
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setReports(data || []);
      setIsLoading(false);
    };
    fetchReports();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Laporan Pengguna</h2>
      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Memuat data laporan...</div>
      ) : reports.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Tidak ada laporan ditemukan.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50 text-gray-700 border-b">
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">User ID</th>
                <th className="px-4 py-3 text-left font-semibold">Target Type</th>
                <th className="px-4 py-3 text-left font-semibold">Reason</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs">{report.id}</td>
                  <td className="px-4 py-3 text-xs">{report.user_id}</td>
                  <td className="px-4 py-3">{report.target_type}</td>
                  <td className="px-4 py-3">{report.reason}</td>
                  <td className="px-4 py-3 text-xs">
                    {report.created_at ? new Date(report.created_at).toLocaleString('id-ID') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectReport;
