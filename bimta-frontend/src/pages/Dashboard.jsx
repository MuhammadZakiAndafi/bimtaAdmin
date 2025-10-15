import { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import StatCard from '../components/Dashboard/StatCard';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { laporanService } from '../services/laporanService';
import { IoPeople, IoSchool, IoDocument, IoCheckmarkCircle } from 'react-icons/io5';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await laporanService.getDashboardData();
      setData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Dashboard">
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" text="Memuat data..." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Selamat Datang, Admin">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<IoPeople size={32} className="text-white" />}
          title="Total Mahasiswa"
          value={data?.statistics?.totalMahasiswa || 0}
          subtitle="Terdaftar"
          color="blue"
        />
        <StatCard
          icon={<IoSchool size={32} className="text-white" />}
          title="Total Dosen"
          value={data?.statistics?.totalDosen || 0}
          subtitle="Pembimbing"
          color="green"
        />
        <StatCard
          icon={<IoDocument size={32} className="text-white" />}
          title="Referensi TA"
          value={data?.statistics?.totalReferensi || 0}
          subtitle="Dokumen"
          color="yellow"
        />
        <StatCard
          icon={<IoCheckmarkCircle size={32} className="text-white" />}
          title="Laporan Generated"
          value={data?.statistics?.totalBimbingan?.done || 0}
          subtitle="Selesai"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data?.quickActions?.map((action, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-3">
            {data?.recentActivities?.length > 0 ? (
              data.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">{activity.activity}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.mahasiswa_nama} - {activity.dosen_nama}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.datetime).toLocaleDateString('id-ID')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas</p>
            )}
          </div>
        </div>

        {/* System Warnings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Peringatan Sistem</h3>
          <div className="space-y-3">
            {data?.systemWarnings?.map((warning, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  warning.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : warning.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <p className="text-sm font-medium text-gray-800">{warning.message}</p>
                <p className="text-xs text-gray-500 mt-1">{warning.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;