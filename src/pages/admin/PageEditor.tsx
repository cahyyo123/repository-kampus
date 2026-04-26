import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function PageEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);

  useEffect(() => {
    const userStr = localStorage.getItem('repo_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (id) {
      fetch('/api/pages')
        .then(res => res.json())
        .then(data => {
          const page = data.find((p: any) => p.id === parseInt(id));
          if (page) {
            setTitle(page.title);
            setSlug(page.slug);
            setContent(page.content);
            setIsHidden(page.is_hidden === 1);
          }
          setInitialLoading(false);
        });
    }
  }, [id, navigate]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!id) {
      setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, ''));
    }
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const url = id ? `/api/pages/${id}` : '/api/pages';
    const method = id ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content, is_hidden: isHidden })
      });
      const data = await res.json();
      
      if (data.success) {
        navigate('/admin/dashboard'); // Or pass state to set activeTab
      } else {
        alert(data.message || 'Gagal menyimpan halaman');
      }
    } catch (err) {
      alert('Terjadi kesalahan pada server');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/dashboard" className="text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2 transition">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Dashboard
        </Link>
      </div>

      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-normal text-gray-800">
            {id ? 'Edit Page' : 'Add New Page'}
          </h1>
          {id && (
            <Link to="/admin/pages/add" className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-3 py-1 rounded text-sm font-medium transition">
              Add New
            </Link>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Main Editor Content (Left Column) */}
        <div className="flex-1 w-full space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="space-y-6">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Enter title here"
                  className="w-full text-xl px-4 py-2 border border-gray-300 shadow-inner rounded-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 transition"
                  value={title}
                  onChange={handleTitleChange}
                />
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>Permalink: /p/</span>
                  <input 
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="font-mono bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="bg-white">
                <style>
                  {`
                    .ql-editor {
                      min-height: 400px;
                      font-family: inherit;
                      font-size: 14px;
                    }
                    .ql-container.ql-snow {
                      border: 1px solid #d1d5db;
                      border-bottom-left-radius: 0.5rem;
                      border-bottom-right-radius: 0.5rem;
                    }
                    .ql-toolbar.ql-snow {
                      border: 1px solid #d1d5db;
                      border-top-left-radius: 0.5rem;
                      border-top-right-radius: 0.5rem;
                      background-color: #f9fafb;
                    }
                  `}
                </style>
                <ReactQuill 
                  theme="snow" 
                  value={content} 
                  onChange={setContent} 
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                  placeholder="Tuliskan konten halaman..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar settings (Right Column) */}
        <div className="w-full lg:w-80 space-y-6 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold text-gray-800">
              Publish
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-500" /> Visibilitas:
                </span>
                <select
                  value={isHidden ? 'hidden' : 'public'}
                  onChange={(e) => setIsHidden(e.target.value === 'hidden')}
                  className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="public">Publik</option>
                  <option value="hidden">Sembunyi / Draft</option>
                </select>
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition font-bold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {id ? 'Perbarui Halaman' : 'Publikasikan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
