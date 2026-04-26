import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, FileUp, Plus, Trash2, MessageCircle } from 'lucide-react';
import FileDropzone from '../../components/FileDropzone';

export default function EditDocument() {
  const { id } = useParams();
  const [categories, setCategories] = useState<any[]>([]);
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authors, setAuthors] = useState([{ name: '', nim: '' }]);
  const [customFiles, setCustomFiles] = useState<{ id: string, label: string, isDeleted?: boolean, isNew?: boolean, filename?: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch(`/api/repository/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data);
        if (data.author && data.nim) {
          const authorNames = data.author.split(',').map((s: string) => s.trim());
          const authorNims = data.nim.split(',').map((s: string) => s.trim());
          const parsedAuthors = authorNames.map((name: string, idx: number) => ({
            name,
            nim: authorNims[idx] || ''
          }));
          setAuthors(parsedAuthors.length > 0 ? parsedAuthors : [{ name: '', nim: '' }]);
        }
        if (data.custom_files) {
          try {
            const parsed = JSON.parse(data.custom_files);
            setCustomFiles(parsed.map((f: any, idx: number) => ({
              id: `custom_file_old_${idx}`,
              label: f.label,
              filename: f.filename,
              isNew: false
            })));
          } catch(e) {}
        }
      });
  }, [id]);

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

  const handleAddCustomFile = () => {
    setCustomFiles([...customFiles, { id: `custom_file_${Date.now()}`, label: '', isNew: true }]);
  };

  const handleRemoveCustomFile = (id: string) => {
    setCustomFiles(customFiles.map(f => f.id === id ? { ...f, isDeleted: true } : f).filter(f => f.isNew ? !f.isDeleted : true));
  };
  
  const handleCustomFileLabelChange = (id: string, value: string) => {
    setCustomFiles(customFiles.map(f => f.id === id ? { ...f, label: value } : f));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    Object.entries(selectedFiles).forEach(([key, file]: [string, any]) => {
      if (file) {
        formData.delete(key);
        formData.set(key, file);
      }
    });

    // Combine authors and nims
    const authorNames = authors.map(a => a.name.trim()).filter(Boolean).join(', ');
    const authorNims = authors.map(a => a.nim.trim()).filter(Boolean).join(', ');
    
    formData.set('author', authorNames);
    formData.set('nim', authorNims);

    const customFilesMeta = customFiles.map(f => ({
      fieldname: f.id,
      label: f.label || 'File Tambahan',
      isNew: f.isNew,
      isDeleted: f.isDeleted,
      filename: f.filename
    }));
    formData.set('custom_files_meta', JSON.stringify(customFilesMeta));

    try {
      const res = await fetch(`/api/repository/${id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert('Dokumen berhasil diupdate');
        navigate('/admin/dashboard');
      } else {
        alert(data.message || 'Gagal mengupdate dokumen');
      }
    } catch (err) {
      alert('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  if (!doc) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2 transition">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Tinjau / Edit Dokumen</h1>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Admin Review Section */}
          <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 mb-8 space-y-4">
            <h2 className="text-lg font-bold text-indigo-900 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> Tinjauan Admin
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-indigo-900 mb-2">Status Persetujuan</label>
                <select
                  name="status"
                  defaultValue={doc.status}
                  className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                >
                  <option value="pending">Menunggu Tinjauan</option>
                  <option value="approved">Disetujui (Publikasikan)</option>
                  <option value="rejected">Ditolak / Perlu Revisi</option>
                </select>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-indigo-900 mb-2">Komentar / Catatan Revisi</label>
                <textarea
                  name="admin_comment"
                  rows={3}
                  defaultValue={doc.admin_comment}
                  placeholder="Berikan catatan perbaikan kepada mahasiswa jika diperlukan..."
                  className="w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Judul Dokumen</label>
              <input
                type="text"
                name="title"
                required
                defaultValue={doc.title}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-700">Penulis Dokumen</label>
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Tambah Penulis
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
                        placeholder="Nama lengkap penulis"
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
                        placeholder="Contoh: 22104567"
                      />
                    </div>
                  </div>
                  {authors.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAuthor(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition mt-6"
                      title="Hapus Penulis"
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
                defaultValue={doc.year}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
              <select
                name="category_id"
                required
                defaultValue={doc.category_id}
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
                defaultValue={doc.abstract}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-none"
              ></textarea>
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Kata Kunci (Pisahkan dengan koma)</label>
              <input
                type="text"
                name="keywords"
                required
                defaultValue={doc.keywords}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Link Eksternal (Opsional)</label>
              <input
                type="url"
                name="external_link"
                defaultValue={doc.external_link}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Contoh: https://itch.io/game-saya atau https://youtube.com/..."
              />
              <p className="text-xs text-gray-500 mt-1">Gunakan ini jika karya berupa game, video besar, atau aplikasi yang dihosting di luar.</p>
            </div>

            {/* Render files (either full file or bab 1-5) */}
            <div className="col-span-1 md:col-span-2 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex flex-col gap-2 relative mt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-800">Manajemen File Tambahan</span>
                <button
                  type="button"
                  onClick={handleAddCustomFile}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition"
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
                  defaultValue={doc.file_path_label || ''}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Masukkan nama/label file utama (opsional)"
                />
              </div>
              <FileDropzone label="File Karya (Utama)" initialFileName={doc.file_path || null} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file}))} />
            </div>
            {doc.file_bab1 && <div className="col-span-1 md:col-span-2"><FileDropzone label="File Bab 1" initialFileName={doc.file_bab1} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file_bab1: file}))} /></div>}
            {doc.file_bab2 && <div className="col-span-1 md:col-span-2"><FileDropzone label="File Bab 2" initialFileName={doc.file_bab2} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file_bab2: file}))} /></div>}
            {doc.file_bab3 && <div className="col-span-1 md:col-span-2"><FileDropzone label="File Bab 3" initialFileName={doc.file_bab3} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file_bab3: file}))} /></div>}
            {doc.file_bab4 && <div className="col-span-1 md:col-span-2"><FileDropzone label="File Bab 4" initialFileName={doc.file_bab4} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file_bab4: file}))} /></div>}
            {doc.file_bab5 && <div className="col-span-1 md:col-span-2"><FileDropzone label="File Bab 5" initialFileName={doc.file_bab5} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, file_bab5: file}))} /></div>}

            {customFiles.filter(f => !f.isDeleted).map((fileOption) => (
              <div key={fileOption.id} className="col-span-1 md:col-span-2 bg-gray-50 p-4 border border-gray-200 rounded-xl relative">
                <button
                  type="button"
                  onClick={() => handleRemoveCustomFile(fileOption.id)}
                  className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <div className="mb-4 pr-12">
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
                <div className="mt-2">
                  <FileDropzone initialFileName={fileOption.filename || null} onFileSelect={(file) => setSelectedFiles(prev => ({...prev, [fileOption.id]: file}))} />
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
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
