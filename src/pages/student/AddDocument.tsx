import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileUp, Plus, Trash2 } from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';

export default function StudentAddDocument() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const userStr = localStorage.getItem('repo_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [authors, setAuthors] = useState([{ name: user?.name || '', nim: user?.username || '' }]);
  const [customFiles, setCustomFiles] = useState<{ id: string, label: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, [navigate]);

  const handleAddAuthor = () => {
    setAuthors([...authors, { name: '', nim: '' }]);
  };

  const handleRemoveAuthor = (index: number) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleAuthorChange = (index: number, field: 'name' | 'nim', value: string) => {
    const newAuthors = [...authors];
    newAuthors[index][field] = value;
    setAuthors(newAuthors);
  };

  const handleAddCustomFile = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    setCustomFiles([...customFiles, { id: `custom_file_${Date.now()}_${Math.random()}`, label: '' }]);
  };

  const handleRemoveCustomFile = (e: any, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setCustomFiles(customFiles.filter(f => f.id !== id));
  };
  
  const handleCustomFileLabelChange = (id: string, value: string) => {
    setCustomFiles(customFiles.map(f => f.id === id ? { ...f, label: value } : f));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    // Append custom files from component state
    Object.entries(selectedFiles).forEach(([key, file]: [string, any]) => {
      if (file) {
        formData.delete(key); // Remove any empty input[type="file"] reference
        formData.set(key, file);
      }
    });

    const authorNames = authors.map(a => a.name.trim()).filter(Boolean).join(', ');
    const authorNims = authors.map(a => a.nim.trim()).filter(Boolean).join(', ');
    
    formData.set('author', authorNames);
    formData.set('nim', authorNims);
    formData.set('uploader_id', user.id);
    formData.set('status', 'pending');

    const customFilesMeta = customFiles.map(f => ({
      fieldname: f.id,
      label: f.label || 'File Tambahan',
      isNew: true
    }));
    formData.set('custom_files_meta', JSON.stringify(customFilesMeta));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/repository`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Dokumen berhasil diupload dan menunggu persetujuan admin');
        navigate('/student/dashboard');
      } else {
        alert(data.message || 'Gagal mengupload dokumen');
      }
    } catch (err) {
      alert('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/student/dashboard" className="text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2 transition">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Upload Mandiri</h1>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Judul Dokumen</label>
              <input
                type="text"
                name="title"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Contoh: Perancangan Sistem Informasi..."
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-700">Penulis / Kelompok</label>
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Tambah Anggota
                </button>
              </div>
              
              {authors.map((author, index) => (
                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Nama Penulis {index + 1}</label>
                      <input
                        type="text"
                        required
                        value={author.name}
                        onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">NIM {index + 1}</label>
                      <input
                        type="text"
                        required
                        value={author.nim}
                        onChange={(e) => handleAuthorChange(index, 'nim', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono"
                      />
                    </div>
                  </div>
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition mt-6"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Tahun</label>
              <input
                type="number"
                name="year"
                required
                min="2000"
                max={new Date().getFullYear()}
                defaultValue={new Date().getFullYear()}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
              <select
                name="category_id"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">Pilih Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Abstrak</label>
              <textarea
                name="abstract"
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                placeholder="Tuliskan abstrak atau deskripsi singkat mengenai karya..."
              ></textarea>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kata Kunci</label>
              <input
                type="text"
                name="keywords"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="web, desain, aplikasi..."
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Link Eksternal (Opsional)</label>
              <input
                type="url"
                name="external_link"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="col-span-1 md:col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-800">Upload File Karya</span>
                <button
                  type="button"
                  onClick={handleAddCustomFile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition drop-shadow-sm cursor-pointer z-20 relative"
                >
                  <Plus className="h-4 w-4" /> Tambah File
                </button>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 bg-gray-50 p-4 border border-gray-200 rounded-xl relative">
              <div className="mb-4 pr-12">
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama File Karya (Utama) (cth: Proposal, Jurnal)</label>
                <input
                  type="text"
                  name="file_path_label"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Masukkan nama/label file utama (opsional)"
                />
              </div>
              <FileDropzone label="Upload File" onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file}))} />
            </div>

            {customFiles.map((fileOption) => (
              <div key={fileOption.id} className="col-span-1 md:col-span-2 bg-gray-50 p-4 border border-gray-200 rounded-xl relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 pr-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama File (cth: Lampiran, Dataset)</label>
                    <input
                      type="text"
                      required
                      value={fileOption.label}
                      onChange={(e) => handleCustomFileLabelChange(fileOption.id, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                      placeholder="Masukkan nama/label file"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveCustomFile(e, fileOption.id)}
                    className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition drop-shadow-sm cursor-pointer border border-transparent hover:border-red-100 z-20 relative"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-2">
                  <FileDropzone onFileSelect={(file) => setSelectedFiles(prev => ({...prev, [fileOption.id]: file}))} />
                </div>
              </div>
            ))}

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white py-3 px-8 rounded-xl hover:bg-indigo-700 transition font-bold text-lg shadow-lg shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? 'Mengupload...' : 'Upload Dokumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
