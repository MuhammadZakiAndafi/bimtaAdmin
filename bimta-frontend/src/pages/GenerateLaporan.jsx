import { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { laporanService } from '../services/laporanService';
import { IoDocumentText, IoDownload } from 'react-icons/io5';

const GenerateLaporan = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [laporanData, setLaporanData] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [formData, setFormData] = useState({
    jenis_laporan: 'bulanan',
    bulan: currentMonth,
    tahun: currentYear,
    program_studi: '',
  });

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await laporanService.generateLaporan(formData);
      setLaporanData(response.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal generate laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!laporanData) {
      alert('Silakan generate laporan terlebih dahulu');
      return;
    }

    setExportLoading(true);
    
    try {
      const response = await laporanService.exportLaporan(formData);
      
      // Create blob dari response
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const monthName = months.find(m => m.value === parseInt(formData.bulan))?.label || '';
      const filename = `Laporan_${formData.jenis_laporan}_${monthName}_${formData.tahun}.xlsx`;
      link.setAttribute('download', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      alert('Laporan berhasil diexport!');
    } catch (error) {
      console.error('Export error:', error);
      alert(error.response?.data?.message || 'Gagal export laporan');
    } finally {
      setExportLoading(false);
    }
  };

  const handleResetFilter = () => {
    setFormData({
      jenis_laporan: 'bulanan',
      bulan: currentMonth,
      tahun: currentYear,
      program_studi: '',
    });
    setLaporanData(null);
  };

  const getPeriodeText = () => {
    if (!laporanData) return '';
    
    if (formData.jenis_laporan === 'bulanan') {
      const monthName = months.find(m => m.value === parseInt(formData.bulan))?.label;
      return `${monthName} ${formData.tahun}`;
    } else {
      return `Tahun ${formData.tahun}`;
    }
  };

  return (
    <MainLayout title="Generate Laporan Bimbingan">
      {/* Parameter Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Parameter Laporan</h3>
        
        <form onSubmit={handleGenerate}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Jenis Laporan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis Laporan
              </label>
              <select
                name="jenis_laporan"
                value={formData.jenis_laporan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="bulanan">Bulanan</option>
                <option value="semester">Semester</option>
              </select>
            </div>

            {/* Bulan - Only show for bulanan */}
            {formData.jenis_laporan === 'bulanan' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bulan
                </label>
                <select
                  name="bulan"
                  value={formData.bulan}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tahun */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <select
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Program Studi */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Studi (Opsional)
              </label>
              <select
                name="program_studi"
                value={formData.program_studi}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Semua Prodi</option>
                <option value="Informatika">Informatika</option>
                <option value="Sistem Informasi">Sistem Informasi</option>
                <option value="Teknik Komputer">Teknik Komputer</option>
              </select>
            </div> */}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              icon={<IoDocumentText size={20} />}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Laporan'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetFilter}
            >
              Reset Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow-md p-12">
          <LoadingSpinner size="lg" text="Sedang generate laporan..." />
        </div>
      )}

      {/* Hasil Laporan */}
      {!loading && laporanData && (
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Laporan {laporanData.jenis_laporan === 'bulanan' ? 'Bulanan' : 'Semester'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Periode: {getPeriodeText()}
              </p>
              <p className="text-sm text-gray-600">
                Total Data: {laporanData.total_records} records
              </p>
            </div>
            
            <Button
              variant="success"
              icon={<IoDownload size={20} />}
              onClick={handleExportExcel}
              disabled={exportLoading}
            >
              {exportLoading ? 'Exporting...' : 'Export Excel'}
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {laporanData.jenis_laporan === 'bulanan' ? (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      NIM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mahasiswa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dosen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Bimbingan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {laporanData.laporan.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nim}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nama_mahasiswa}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nama_dosen}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status_bimbingan === 'ongoing' 
                            ? 'bg-blue-100 text-blue-800'
                            : item.status_bimbingan === 'done'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status_bimbingan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.total_bimbingan || 0}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.progress_selesai || 0}/{item.total_progress || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dosen Pembimbing
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total Bimbingan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Selesai
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Berlangsung
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rata-rata Pertemuan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {laporanData.laporan.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.nama_dosen}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.total_bimbingan}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{item.bimbingan_selesai}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{item.bimbingan_berlangsung}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {parseFloat(item.rata_rata_pertemuan).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !laporanData && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <IoDocumentText size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Pilih parameter dan klik "Generate Laporan" untuk melihat data
          </p>
        </div>
      )}
    </MainLayout>
  );
};

export default GenerateLaporan;