import { useState, useEffect } from 'react';
import MainLayout from '../components/Layout/MainLayout';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';
import Input from '../components/Common/Input';
import SearchBar from '../components/Common/SearchBar';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import { referensiService } from '../services/referensiService';
import { IoAdd, IoCreate, IoTrash, IoEye, IoDocument } from 'react-icons/io5';

const ReferensiTA = () => {
  const [referensiList, setReferensiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedReferensi, setSelectedReferensi] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({
    nim_mahasiswa: '',
    nama_mahasiswa: '',
    judul: '',
    document: null,
  });

  useEffect(() => {
    fetchReferensi();
  }, [search]);

  const fetchReferensi = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      
      const response = await referensiService.getAllReferensi(filters);
      setReferensiList(response.data);
    } catch (error) {
      console.error('Error fetching referensi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode, referensi = null) => {
    setModalMode(mode);
    setSelectedReferensi(referensi);
    
    if (mode === 'edit' && referensi) {
      setFormData({
        nim_mahasiswa: referensi.nim_mahasiswa,
        nama_mahasiswa: referensi.nama_mahasiswa,
        judul: referensi.judul,
        document: null,
      });
    } else {
      setFormData({
        nim_mahasiswa: '',
        nama_mahasiswa: '',
        judul: '',
        document: null,
      });
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedReferensi(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'document') {
      setFormData({ ...formData, document: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    data.append('nama_mahasiswa', formData.nama_mahasiswa);
    data.append('judul', formData.judul);
    
    if (modalMode === 'create') {
      data.append('nim_mahasiswa', formData.nim_mahasiswa);
      if (!formData.document) {
        alert('File PDF harus diupload');
        return;
      }
      data.append('document', formData.document);
    } else {
      if (formData.document) {
        data.append('document', formData.document);
      }
    }

    try {
      if (modalMode === 'create') {
        await referensiService.createReferensi(data);
        alert('Referensi TA berhasil ditambahkan!');
      } else {
        await referensiService.updateReferensi(selectedReferensi.nim_mahasiswa, data);
        alert('Referensi TA berhasil diupdate!');
      }
      
      handleCloseModal();
      fetchReferensi();
    } catch (error) {
      alert(error.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async (nim) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus referensi ini?')) {
      try {
        await referensiService.deleteReferensi(nim);
        alert('Referensi TA berhasil dihapus!');
        fetchReferensi();
      } catch (error) {
        alert(error.response?.data?.message || 'Gagal menghapus referensi');
      }
    }
  };

  const handleViewDocument = (docUrl) => {
    window.open(`http://localhost:5000${docUrl}`, '_blank');
  };

  return (
    <MainLayout title="Referensi Tugas Akhir">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari referensi (Judul, Nama, Tag, dll...)"
            />
          </div>
          
          <Button
            variant="primary"
            icon={<IoAdd size={20} />}
            onClick={() => handleOpenModal('create')}
          >
            Tambah Referensi
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Memuat referensi..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {referensiList.length > 0 ? (
            referensiList.map((ref) => (
              <div key={ref.nim_mahasiswa} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {/* Header */}
                <div className="bg-primary-500 p-4 flex items-center justify-center">
                  <IoDocument size={48} className="text-white" />
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
                    {ref.judul}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Penulis:</span>
                      <span>{ref.nama_mahasiswa}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">NIM:</span>
                      <span>{ref.nim_mahasiswa}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Tahun:</span>
                      <span>{new Date(ref.created_at).getFullYear()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDocument(ref.doc_url)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                      title="Lihat Dokumen"
                    >
                      <IoEye size={18} />
                      <span className="text-sm font-medium">Lihat</span>
                    </button>
                    <button
                      onClick={() => handleOpenModal('edit', ref)}
                      className="flex items-center justify-center p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                      title="Edit"
                    >
                      <IoCreate size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(ref.nim_mahasiswa)}
                      className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Hapus"
                    >
                      <IoTrash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              Tidak ada referensi TA
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={modalMode === 'create' ? 'Tambah Referensi Baru' : 'Edit Referensi'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="NIM Mahasiswa"
            name="nim_mahasiswa"
            value={formData.nim_mahasiswa}
            onChange={handleChange}
            placeholder="Contoh: 2020110001"
            required
            disabled={modalMode === 'edit'}
          />
          
          <Input
            label="Nama Mahasiswa"
            name="nama_mahasiswa"
            value={formData.nama_mahasiswa}
            onChange={handleChange}
            placeholder="Contoh: Siti Rahma"
            required
          />
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Judul Tugas Akhir <span className="text-red-500">*</span>
            </label>
            <textarea
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Masukkan judul lengkap TA"
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Dokumen PDF {modalMode === 'create' && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              name="document"
              accept=".pdf"
              onChange={handleChange}
              required={modalMode === 'create'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {modalMode === 'edit' 
                ? 'Kosongkan jika tidak ingin mengganti dokumen' 
                : 'Format: PDF, Maksimal 10MB'}
            </p>
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
    </MainLayout>
  );
};

export default ReferensiTA;