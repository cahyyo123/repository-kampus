import React, { useState, useEffect, FormEvent, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, FileText, Search, AlertCircle, CheckCircle, Clock, Key, Layers, Menu as MenuIcon, Eye, EyeOff, LayoutDashboard, Users, Settings, Tag, MonitorPlay, UploadCloud, ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ site_title: '', site_description: '', theme_color: '', site_logo: '' });
  const [logoUploading, setLogoUploading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'docs' | 'requests' | 'pages' | 'menus' | 'categories' | 'users' | 'settings'>('docs');
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Custom Modal States
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, message: string, targetId: number | null, actionType: string | null}>({ isOpen: false, message: '', targetId: null, actionType: null });
  const [alertDialog, setAlertDialog] = useState({ isOpen: false, message: '' });

  const showAlert = (message: string) => setAlertDialog({ isOpen: true, message });
  
  const handleConfirmAction = async () => {
    if (confirmDialog.targetId === null || confirmDialog.actionType === null) return;
    const { targetId, actionType } = confirmDialog;
    
    if (actionType === 'doc') {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/repository/${targetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchDocuments(searchQuery, statusFilter);
      else showAlert(data.message || 'Gagal menghapus');
    } else if (actionType === 'page') {
      await fetch(`${import.meta.env.VITE_API_URL}/api/pages/${targetId}`, { method: 'DELETE' }); 
      fetchPages();
    } else if (actionType === 'menu') {
      await fetch(`${import.meta.env.VITE_API_URL}/api/menus/${targetId}`, { method: 'DELETE' }); 
      fetchMenus();
    } else if (actionType === 'category') {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories/${targetId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchCategories(); else showAlert(data.message);
    } else if (actionType === 'user') {
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/${targetId}`, { method: 'DELETE' }); 
      fetchUsers();
    }
    setConfirmDialog({ isOpen: false, message: '', targetId: null, actionType: null });
  };

  // Modals Data
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [menuFormData, setMenuFormData] = useState({ label: '', url: '', order_index: 0, is_hidden: false });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryLogo, setCategoryLogo] = useState('');
  const [categoryLogoUploading, setCategoryLogoUploading] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({ username: '', password: '', name: '', email: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('repo_user') || localStorage.getItem('admin_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDocuments();
    fetchRequests();
    fetchPages();
    fetchMenus();
    fetchCategories();
    fetchUsers();
    fetchSettings();
  }, [navigate]);

  // --- Fetchers ---
  const fetchDocuments = (q = '', status = statusFilter) => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/repository?q=${encodeURIComponent(q)}&status=${status}`)
      .then(res => res.json())
      .then(data => { setDocuments(data); setLoading(false); });
  };
  const fetchRequests = () => fetch(`${import.meta.env.VITE_API_URL}/api/access-requests`).then(res => res.json()).then(setRequests);
  const fetchPages = () => fetch(`${import.meta.env.VITE_API_URL}/api/pages`).then(res => res.json()).then(setPages);
  const fetchMenus = () => fetch(`${import.meta.env.VITE_API_URL}/api/menus`).then(res => res.json()).then(setMenus);
  const fetchCategories = () => fetch(`${import.meta.env.VITE_API_URL}/api/categories`).then(res => res.json()).then(setCategories);
  const fetchUsers = () => fetch(`${import.meta.env.VITE_API_URL}/api/users`).then(res => res.json()).then(setUsers);
  const fetchSettings = () => fetch(`${import.meta.env.VITE_API_URL}/api/settings`).then(res => res.json()).then(setSettings);

  // --- File Handlers ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setLogoUploading(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-image`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSettings({ ...settings, site_logo: data.url });
      } else {
        showAlert(data.message || 'Gagal mengupload logo');
      }
    } catch {
      showAlert('Terjadi kesalahan saat mengupload');
    } finally {
      setLogoUploading(false);
    }
  };

  // --- Handlers ---
  const handleSearch = (e: FormEvent) => { e.preventDefault(); fetchDocuments(searchQuery, statusFilter); };
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
    fetchDocuments(searchQuery, e.target.value);
  };
  const handleDeleteDoc = async (id: number) => {
    setConfirmDialog({ isOpen: true, message: 'Hapus dokumen ini?', targetId: id, actionType: 'doc' });
  };
  const handleRequestId = async (id: number, status: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/access-requests/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    if (res.ok) fetchRequests();
  };

  const totalItems = documents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentDocuments = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageDelete = async (id: number) => {
    setConfirmDialog({ isOpen: true, message: 'Hapus halaman ini?', targetId: id, actionType: 'page' });
  };

  const handleMenuSave = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingMenu ? `/api/menus/${editingMenu.id}` : '/api/menus';
    const method = editingMenu ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(menuFormData) });
    const data = await res.json();
    if (data.success) { setIsMenuModalOpen(false); fetchMenus(); } else showAlert(data.message);
  };
  const handleMenuDelete = async (id: number) => {
    setConfirmDialog({ isOpen: true, message: 'Hapus menu ini?', targetId: id, actionType: 'menu' });
  };

  const handleCategoryLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setCategoryLogoUploading(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload-image`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setCategoryLogo(data.url);
      } else {
        showAlert(data.message || 'Gagal mengupload logo kategori');
      }
    } catch {
      showAlert('Terjadi kesalahan saat mengupload');
    } finally {
      setCategoryLogoUploading(false);
    }
  };

  const handleCategorySave = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = editingCategory ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: categoryName, logo_url: categoryLogo }) });
    const data = await res.json();
    if (data.success) { setIsCategoryModalOpen(false); fetchCategories(); } else showAlert(data.message);
  };
  const handleCategoryDelete = async (id: number) => {
    setConfirmDialog({ isOpen: true, message: 'Hapus kategori ini?', targetId: id, actionType: 'category' });
  };

  const handleUserSave = async (e: FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userFormData) });
    const data = await res.json();
    if (data.success) { setIsUserModalOpen(false); fetchUsers(); } else showAlert(data.message);
  };
  const handleUserDelete = async (id: number) => {
    setConfirmDialog({ isOpen: true, message: 'Hapus pengguna ini?', targetId: id, actionType: 'user' });
  };

  const handleSettingsSave = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
    const data = await res.json();
    if (data.success) {
      showAlert('Pengaturan berhasil disimpan');
      setTimeout(() => window.location.reload(), 1500); // To apply theme changes globally if implemented
    } else showAlert(data.message);
  };

  // --- Render ---
  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-[calc(100vh-4rem)] -mt-8 -mx-4 sm:-mx-6 lg:-mx-8">
      {/* WordPress-style Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-gray-300 md:min-h-screen flex-shrink-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-white font-black text-xl tracking-tight flex items-center gap-2">
            <MonitorPlay className="w-6 h-6 text-indigo-400" />
            Admin CMS
          </h2>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          <button onClick={() => setActiveTab('docs')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'docs' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5" /> Repositori Dokumen
          </button>
          <button onClick={() => setActiveTab('categories')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'categories' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <Tag className="w-5 h-5" /> Kategori
          </button>
          <button onClick={() => setActiveTab('requests')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <Key className="w-5 h-5" /> Permintaan Akses
            {requests.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'pending').length}</span>
            )}
          </button>
          <div className="my-2 border-t border-gray-800"></div>
          <button onClick={() => setActiveTab('pages')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'pages' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <FileText className="w-5 h-5" /> Halaman Utama
          </button>
          <button onClick={() => setActiveTab('menus')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'menus' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <MenuIcon className="w-5 h-5" /> Menu Navigasi
          </button>
          <div className="my-2 border-t border-gray-800"></div>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <Users className="w-5 h-5" /> Pengguna
          </button>
          <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-800 hover:text-white'}`}>
            <Settings className="w-5 h-5" /> Pengaturan Web
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 md:p-10 overflow-x-hidden">
        
        {/* DOCUMENTS TAB */}
        {activeTab === 'docs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Repositori Dokumen</h2>
              <Link to="/admin/add" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-sm inline-flex justify-center">
                <Plus className="h-5 w-5" /> Tambah Baru
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
                <div className="flex flex-wrap items-center gap-4 w-full">
                  <select value={statusFilter} onChange={handleStatusFilterChange} className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm bg-white min-w-[160px]">
                    <option value="all">Semua Status</option>
                    <option value="approved">✅ Disetujui</option>
                    <option value="pending">⏳ Menunggu</option>
                    <option value="rejected">❌ Ditolak/Revisi</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 font-medium">Tampilkan:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-sm bg-white"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <form onSubmit={handleSearch} className="flex-1 relative min-w-[200px]">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input type="text" placeholder="Cari judul, penulis, absen..." className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </form>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200">
                      <th className="px-6 py-4 font-bold">Judul & Penulis</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr><td colSpan={3} className="py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div></td></tr>
                    ) : currentDocuments.length === 0 ? (
                      <tr><td colSpan={3} className="py-12 text-center text-gray-500">Tidak ada dokumen ditemukan.</td></tr>
                    ) : (
                      currentDocuments.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 mb-1">{doc.title}</div>
                            <div className="text-gray-500">{doc.author} <span className="font-mono text-xs ml-1 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{doc.nim}</span></div>
                            <div className="text-xs text-indigo-600 font-medium mt-1">{doc.category_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            {doc.status === 'pending' ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><Clock className="w-3.5 h-3.5" /> Menunggu</span>
                             : doc.status === 'rejected' ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><AlertCircle className="w-3.5 h-3.5" /> Revisi</span>
                             : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Disetujui</span>}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <Link to={`/admin/edit/${doc.id}`} className="inline-flex items-center text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-bold mr-2 transition">
                              {doc.status === 'pending' ? 'Tinjau' : 'Edit'}
                            </Link>
                            <button onClick={() => handleDeleteDoc(doc.id)} className="inline-flex items-center text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition"><Trash2 className="w-4.5 h-4.5" /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-medium">{totalItems}</span> dokumen
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Previous</span>
                          <ChevronRight className="h-5 w-5 rotate-180" aria-hidden="true" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                              currentPage === page
                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                          <span className="sr-only">Next</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Kategori Dokumen</h2>
              <button onClick={() => { setEditingCategory(null); setCategoryName(''); setCategoryLogo(''); setIsCategoryModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-sm inline-flex justify-center">
                <Plus className="h-5 w-5" /> Tambah Kategori
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200"><th className="px-6 py-4 font-bold">Logo</th><th className="px-6 py-4 font-bold">Nama Kategori</th><th className="px-6 py-4 font-bold text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {categories.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {c.logo_url ? (
                          <img src={c.logo_url} alt={c.name} className="h-10 w-10 object-contain bg-gray-50 border rounded-lg p-1" />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 border rounded-lg flex items-center justify-center text-gray-400">
                            <MonitorPlay className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingCategory(c); setCategoryName(c.name); setCategoryLogo(c.logo_url || ''); setIsCategoryModalOpen(true); }} className="text-indigo-600 font-bold hover:text-indigo-900 px-3 mr-2">Edit</button>
                        <button onClick={() => handleCategoryDelete(c.id)} className="text-red-500 font-bold hover:text-red-700">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Manajemen Pengguna</h2>
              <button onClick={() => { setEditingUser(null); setUserFormData({ username: '', password: '', name: '', email: '', role: 'student' }); setShowPassword(false); setIsUserModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-sm inline-flex justify-center">
                <Plus className="h-5 w-5" /> Tambah Pengguna
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200"><th className="px-6 py-4 font-bold">Nama & Username</th><th className="px-6 py-4 font-bold">Role</th><th className="px-6 py-4 font-bold text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{u.name}</div>
                        <div className="text-gray-500 font-mono text-xs">{u.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => { setEditingUser(u); setUserFormData({ username: u.username, password: '', name: u.name, email: u.email || '', role: u.role || 'student' }); setShowPassword(false); setIsUserModalOpen(true); }} className="text-indigo-600 font-bold hover:text-indigo-900 px-3 mr-2">Edit</button>
                        {u.username !== 'admin' && (
                          <button onClick={() => handleUserDelete(u.id)} className="text-red-500 font-bold hover:text-red-700">Hapus</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGES TAB */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Halaman CMS</h2>
              <Link to="/admin/pages/add" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center gap-2 font-bold shadow-sm inline-flex justify-center">
                <Plus className="h-5 w-5" /> Halaman Baru
              </Link>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200"><th className="px-6 py-4 font-bold">Judul & Slug</th><th className="px-6 py-4 font-bold">Status</th><th className="px-6 py-4 font-bold text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {pages.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div className="font-bold text-gray-900">{p.title}</div><div className="text-gray-500 font-mono text-xs">/p/{p.slug}</div></td>
                      <td className="px-6 py-4">{p.is_hidden ? <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs">Draft</span> : <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">Publik</span>}</td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/admin/pages/edit/${p.id}`} className="text-indigo-600 font-bold hover:text-indigo-900 px-3 mr-2">Edit</Link>
                        <button onClick={() => handlePageDelete(p.id)} className="text-red-500 font-bold hover:text-red-700">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Permohonan Akses (Bab 4/5)</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50"><tr className="text-gray-600 text-xs uppercase tracking-wider border-b border-gray-200"><th className="px-6 py-4 font-bold">Pemohon</th><th className="px-6 py-4 font-bold">Dokumen & Alasan</th><th className="px-6 py-4 font-bold text-right">Status</th></tr></thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {requests.map(req => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div className="font-bold text-gray-900">{req.requester_name}</div><div className="text-gray-500">{req.requester_email}</div></td>
                      <td className="px-6 py-4"><Link to={`/document/${req.document_id}`} className="font-bold text-indigo-600 hover:underline">{req.document_title}</Link><p className="text-gray-600 mt-1 italic">"{req.reason}"</p></td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleRequestId(req.id, 'approved')} className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-bold">Terima</button>
                            <button onClick={() => handleRequestId(req.id, 'rejected')} className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold">Tolak</button>
                          </div>
                        ) : req.status === 'approved' ? (<span className="text-emerald-600 font-bold">Disetujui</span>) : (<span className="text-red-600 font-bold">Ditolak</span>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pengaturan Web</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6">
              <form onSubmit={handleSettingsSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Logo Website (Opsional)</label>
                  <div className="flex items-center gap-4">
                    {settings.site_logo && (
                      <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={settings.site_logo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                      </div>
                    )}
                    <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer ${logoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <UploadCloud className="h-6 w-6 text-indigo-500 mb-1" />
                      <span className="text-sm font-medium text-gray-600">{logoUploading ? 'Mengupload...' : 'Pilih Gambar (Maks 2MB)'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Judul Situs (Site Title)</label><input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" value={settings.site_title || ''} onChange={e => setSettings({...settings, site_title: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Situs</label><textarea rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" value={settings.site_description || ''} onChange={e => setSettings({...settings, site_description: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Warna Utama (Hex, Opsional untuk CSS Vars UI/UX kedepan)</label><input type="color" className="p-1 h-12 w-24 border border-gray-300 rounded-xl" value={settings.theme_color || '#4f46e5'} onChange={e => setSettings({...settings, theme_color: e.target.value})} /></div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-gray-800">Simpan Pengaturan</button>
              </form>
            </div>
          </div>
        )}

        {/* MENUS TAB */}
        {activeTab === 'menus' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu Navigasi</h2><button onClick={() => { setEditingMenu(null); setMenuFormData({ label: '', url: '', order_index: 0, is_hidden: false }); setIsMenuModalOpen(true); }} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold"><Plus className="h-5 w-5 inline-block mr-1" /> Tambah Menu</button></div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
              {menus.map(m => (
                <div key={m.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition">
                  <div>
                    <span className="font-bold text-gray-900 text-lg mr-3">{m.label}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">{m.url}</span>
                    {m.is_hidden === 1 && <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Sembunyi</span>}
                  </div>
                  <div>
                    <button onClick={() => { setEditingMenu(m); setMenuFormData({ label: m.label, url: m.url, order_index: m.order_index, is_hidden: m.is_hidden === 1 }); setIsMenuModalOpen(true); }} className="text-indigo-600 font-bold px-3">Edit</button>
                    <button onClick={() => handleMenuDelete(m.id)} className="text-red-500 font-bold px-3">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ALL MODALS DOCKED AT BOTTOM --- */}

      {/* Menu Modal */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-md"><div className="p-5 border-b"><h3 className="text-xl font-bold">{editingMenu ? 'Edit Menu' : 'Menu Baru'}</h3></div><form onSubmit={handleMenuSave} className="p-5 space-y-4"><div><label className="block text-sm font-bold mb-1">Label</label><input required className="w-full px-4 py-2 border rounded-xl" value={menuFormData.label} onChange={e => setMenuFormData({...menuFormData, label: e.target.value})} placeholder="Nama link" /></div><div><label className="block text-sm font-bold mb-1">Pilih Halaman CMS</label><select className="w-full px-4 py-2 border rounded-xl mb-2 bg-gray-50 text-sm" onChange={e => { if(e.target.value) { setMenuFormData(prev => ({...prev, url: e.target.value})); if(!menuFormData.label) { const p = pages.find(x => `/p/${x.slug}` === e.target.value); if(p) setMenuFormData(prev => ({...prev, label: p.title})); } } }}><option value="">-- Pilih Halaman --</option>{pages.map(p => <option key={p.id} value={`/p/${p.slug}`}>{p.title}</option>)}</select><label className="block text-sm font-bold mb-1 mt-3">Atau Masukkan URL Kustom</label><input required className="w-full px-4 py-2 border rounded-xl font-mono text-sm" value={menuFormData.url} onChange={e => setMenuFormData({...menuFormData, url: e.target.value})} placeholder="Misal: /browse atau https://..." /></div><div><label className="block text-sm font-bold mb-1">Urutan</label><input type="number" required className="w-full px-4 py-2 border rounded-xl" value={menuFormData.order_index} onChange={e => setMenuFormData({...menuFormData, order_index: parseInt(e.target.value)||0})} /></div><div className="flex gap-2"><input type="checkbox" id="hm" checked={menuFormData.is_hidden} onChange={e => setMenuFormData({...menuFormData, is_hidden: e.target.checked})} /><label htmlFor="hm" className="text-sm font-medium">Sembunyikan Menu Ini</label></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={()=>setIsMenuModalOpen(false)} className="px-4 py-2 rounded-xl border font-bold">Batal</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold">Simpan</button></div></form></div></div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-5 border-b"><h3 className="text-xl font-bold">{editingCategory ? 'Edit Kategori' : 'Kategori Baru'}</h3></div>
            <form onSubmit={handleCategorySave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Nama Kategori</label>
                <input required className="w-full px-4 py-2 border rounded-xl" value={categoryName} onChange={e => setCategoryName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Logo Kategori (Opsional)</label>
                <div className="flex items-center gap-4">
                  {categoryLogo && (
                    <div className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img src={categoryLogo} alt="Logo" className="max-w-full max-h-full object-contain p-1" />
                    </div>
                  )}
                  <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 py-4 bg-gray-50 hover:bg-gray-100 transition cursor-pointer ${categoryLogoUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <UploadCloud className="h-6 w-6 text-indigo-500 mb-1" />
                    <span className="text-sm font-medium text-gray-600">{categoryLogoUploading ? 'Mengupload...' : 'Pilih Gambar (Maks 2MB)'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleCategoryLogoUpload} />
                  </label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={()=>setIsCategoryModalOpen(false)} className="px-4 py-2 rounded-xl border">Batal</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm"><div className="bg-white rounded-2xl w-full max-w-lg"><div className="p-5 border-b"><h3 className="text-xl font-bold">{editingUser ? 'Edit Pengguna' : 'Pengguna Baru'}</h3></div><form onSubmit={handleUserSave} className="p-5 space-y-4"><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><label className="block text-sm font-bold mb-1">Nama Lengkap</label><input required className="w-full px-4 py-2 border rounded-xl" value={userFormData.name} onChange={e => setUserFormData({...userFormData, name: e.target.value})} /></div><div><label className="block text-sm font-bold mb-1">Username / NIM</label><input required className="w-full px-4 py-2 border rounded-xl" value={userFormData.username} onChange={e => setUserFormData({...userFormData, username: e.target.value})} disabled={editingUser && editingUser.username==='admin'} /></div><div><label className="block text-sm font-bold mb-1">Email</label><input type="email" className="w-full px-4 py-2 border rounded-xl" value={userFormData.email} onChange={e => setUserFormData({...userFormData, email: e.target.value})} /></div><div className="col-span-2"><label className="block text-sm font-bold mb-1">Password {editingUser ? '(Kosongkan jika tidak diubah)' : ''}</label><div className="relative"><input type={showPassword ? 'text' : 'password'} required={!editingUser} className="w-full px-4 py-2 border rounded-xl pr-10" value={userFormData.password} onChange={e => setUserFormData({...userFormData, password: e.target.value})} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div><div className="col-span-2"><label className="block text-sm font-bold mb-1">Role Akses</label><select className="w-full px-4 py-2 border rounded-xl" value={userFormData.role} onChange={e => setUserFormData({...userFormData, role: e.target.value})} disabled={editingUser && editingUser.username==='admin'} ><option value="student">Mahasiswa / Umum</option><option value="admin">Administrator</option></select></div></div><div className="pt-4 flex justify-end gap-3"><button type="button" onClick={()=>setIsUserModalOpen(false)} className="px-4 py-2 rounded-xl border">Batal</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold">Simpan</button></div></form></div></div>
      )}

      {/* Custom Alert Modal */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">{alertDialog.message}</h3>
            <button onClick={() => setAlertDialog({ isOpen: false, message: '' })} className="mt-4 w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl hover:bg-indigo-700 transition">Tutup</button>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{confirmDialog.message}</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-2.5 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition">Batal</button>
              <button onClick={handleConfirmAction} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">Hapus</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
