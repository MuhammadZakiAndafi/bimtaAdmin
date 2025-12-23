const User = require('../models/User');
const ReferensiTA = require('../models/ReferensiTA');
const Bimbingan = require('../models/Bimbingan');

class DashboardController {
  static async getDashboardData(req, res, next) {
    try {
      // Hitung total per role
      const usersByRole = await User.countByRole();
      
      const totalMahasiswa = usersByRole.find(u => u.role === 'mahasiswa')?.total || 0;
      const totalDosen = usersByRole.find(u => u.role === 'dosen')?.total || 0;
      
      // Hitung referensi TA
      const totalReferensi = await ReferensiTA.count();

      // Hitung bimbingan per status
      const bimbinganByStatus = await Bimbingan.countByStatus();
      const ongoingBimbingan = bimbinganByStatus.find(b => b.status_bimbingan === 'ongoing')?.total || 0;
      const doneBimbingan = bimbinganByStatus.find(b => b.status_bimbingan === 'done')?.total || 0;
      const warningBimbingan = bimbinganByStatus.find(b => b.status_bimbingan === 'warning')?.total || 0;
      const terminatedBimbingan = bimbinganByStatus.find(b => b.status_bimbingan === 'terminated')?.total || 0;

      // Aktivitas terbaru
      const recentActivities = await Bimbingan.getRecentActivity(5);

      // Aksi cepat (contoh data)
      const quickActions = [
        {
          title: 'Kelola Akun Mahasiswa',
          description: 'Tambah, edit dan kelola akun mahasiswa',
          icon: '👨‍🎓',
          link: '/akun-mahasiswa'
        },
        {
          title: 'Kelola Akun Dosen',
          description: 'Tambah, edit dan kelola akun dosen',
          icon: '👨‍🏫',
          link: '/akun-dosen'
        },
        {
          title: 'Referensi TA',
          description: 'Upload dan kelola referensi tugas akhir',
          icon: '📚',
          link: '/referensi-ta'
        },
        {
          title: 'Generate Laporan',
          description: 'Buat laporan bimbingan berbasis periode',
          icon: '📊',
          link: '/generate-laporan'
        }
      ];

      // Peringatan sistem (contoh)
      const systemWarnings = [
        ...(warningBimbingan > 0 ? [{
          message: `${warningBimbingan} mahasiswa belum login sejak lama`,
          type: 'warning',
          time: '3 jam lalu'
        }] : []),
        ...(ongoingBimbingan > 50 ? [{
          message: `Dosen referensi mencapai 85%`,
          type: 'info',
          time: '1 jam lalu'
        }] : []),
        {
          message: 'Backup sistem berhasil diselesaikan',
          type: 'success',
          time: '2 jam lalu'
        }
      ];

      res.json({
        success: true,
        data: {
          statistics: {
            totalMahasiswa: parseInt(totalMahasiswa),
            totalDosen: parseInt(totalDosen),
            totalReferensi: parseInt(totalReferensi),
            totalBimbingan: {
              ongoing: parseInt(ongoingBimbingan),
              done: parseInt(doneBimbingan),
              warning: parseInt(warningBimbingan),
              terminated: parseInt(terminatedBimbingan),
            }
          },
          quickActions,
          recentActivities,
          systemWarnings,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;