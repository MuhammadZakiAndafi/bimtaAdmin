import { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import SearchBar from '../components/Common/SearchBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { userService } from '../services/userService';
import { IoAdd, IoCreate, IoTrash, IoKey, IoPersonCircle } from 'react-icons/io5';

const AkunMahasiswa = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [formData, setFormData] = useState({
    user_id: '',
    nama: '',
    no_whatsapp: '',
    password: '',
    photo: null,
  });

  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const filters = { role: 'mahasiswa' };
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      
      const response = await userService.getUsers(filters);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    
    if (mode === 'edit' && user) {
      setFormData({
        user_id: user.user_id,
        nama: user.nama,
        no_whatsapp: user.no_whatsapp,
        password: '',
        photo: null,
      });
    } else {
      setFormData({
        user_id: '',
        nama: '',
        no_whatsapp: '',
        password: '',
        photo: null,
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('no_whatsapp', formData.no_whatsapp);
    data.append('role', 'mahasiswa');
    
    if (modalMode === 'create') {
      data.append('user_id', formData.user_id);
      data.append('password', formData.password);
    }
    
    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      if (modalMode === 'create') {
        await userService.createUser(data);
        alert('Mahasiswa berhasil ditambahkan!');
      } else {
        await userService.updateUser(selectedUser.user_id, data);
        alert('Mahasiswa berhasil diupdate!');
      }
      
      handleCloseModal();
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mahasiswa ini?')) {
      try {
        await userService.deleteUser(userId);
        alert('Mahasiswa berhasil dihapus!');
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menghapus mahasiswa');
      }
    }
  };

  const handleResetPassword = async () => {
    if (!resetPassword) {
      alert('Password baru harus diisi');
      return;
    }

    try {
      await userService.resetPassword(selectedUser.user_id, resetPassword);
      alert('Password berhasil direset!');
      setShowResetModal(false);
      setResetPassword('');
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal reset password');
    }
  };

  return (
    <MainLayout title="Mengelola Akun Mahasiswa">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari mahasiswa (Nama, NIM, dll...)"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>

            <Button
              variant="primary"
              icon={<IoAdd size={20} />}
              onClick={() => handleOpenModal('create')}
            >
              Buat Akun Baru
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner size="lg" text="Memuat data mahasiswa..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mahasiswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIM
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. WhatsApp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IoPersonCircle size={40} className="text-gray-400" />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{user.nama}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.no_whatsapp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.user_id}@student.edu
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status_user === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status_user === 'active' ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal('edit', user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <IoCreate size={20} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Reset Password"
                          >
                            <IoKey size={20} />
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id)}
                            className="text-red-600 hover:text-red-900"
                            title="Hapus"
                          >
                            <IoTrash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      Tidak ada data mahasiswa
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'Buat Akun Mahasiswa Baru' : 'Edit Akun Mahasiswa'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="NIM"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            placeholder="Contoh: 2021110001"
            required
            disabled={modalMode === 'edit'}
          />
          
          <Input
            label="Nama Lengkap"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Contoh: Ahmad Wijaya"
            required
          />
          
          <Input
            label="No. WhatsApp"
            name="no_whatsapp"
            value={formData.no_whatsapp}
            onChange={handleChange}
            placeholder="Contoh: 081234567890"
            required
          />
          
          {modalMode === 'create' && (
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Masukkan password"
              required
            />
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Profil
            </label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={handleCloseModal}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {modalMode === 'create' ? 'Simpan' : 'Update'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Password"
        size="sm"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-4">
            Reset password untuk mahasiswa: <strong>{selectedUser?.nama}</strong>
          </p>
          
          <Input
            label="Password Baru"
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Masukkan password baru"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleResetPassword}>
            Reset Password
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default AkunMahasiswa;