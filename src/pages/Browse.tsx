import { useState, useEffect, FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, FileText, ChevronRight } from 'lucide-react';

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const q = searchParams.get('q') || '';
  const year = searchParams.get('year') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const itemsPerPage = parseInt(searchParams.get('limit') || '10', 10);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (year) params.append('year', year);
    if (category) params.append('category', category);
    if (sort) params.append('sort', sort);

    fetch(`${import.meta.env.VITE_API_URL}/api/repository?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      });
  }, [q, year, category, sort]);

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams(searchParams);
    
    const searchQ = formData.get('q') as string;
    const searchYear = formData.get('year') as string;
    const searchCat = formData.get('category') as string;
    const searchSort = formData.get('sort') as string;

    if (searchQ) newParams.set('q', searchQ); else newParams.delete('q');
    if (searchYear) newParams.set('year', searchYear); else newParams.delete('year');
    if (searchCat) newParams.set('category', searchCat); else newParams.delete('category');
    if (searchSort) newParams.set('sort', searchSort); else newParams.delete('sort');
    
    newParams.set('page', '1'); // Reset to page 1 on new search

    setSearchParams(newParams);
  };

  const setPage = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const setLimit = (limit: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', limit.toString());
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const totalItems = documents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentDocuments = documents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-gray-900">Filter Pencarian</h2>
          </div>
          
          <form key={searchParams.toString() + categories.length} onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kata Kunci</label>
              <div className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={q}
                  placeholder="Judul, penulis, NIM..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <select
                name="year"
                defaultValue={year}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Semua Tahun</option>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select
                name="category"
                defaultValue={category}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">Semua Kategori</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan</label>
              <select
                name="sort"
                defaultValue={sort}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="author_asc">Penulis (A-Z)</option>
                <option value="author_desc">Penulis (Z-A)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition font-medium text-sm"
            >
              Terapkan Filter
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">Hasil Pencarian</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Tampilkan:</label>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                }}
                className="px-2 py-1 border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
              {totalItems} Dokumen Ditemukan
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : currentDocuments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada dokumen</h3>
            <p className="text-gray-500">Coba ubah kata kunci atau filter pencarian Anda.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDocuments.map((doc) => (
              <Link
                key={doc.id}
                to={`/document/${doc.id}`}
                className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition group"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {doc.category_name}
                      </span>
                      <span className="text-sm text-gray-500 font-mono">{doc.year}</span>
                      <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {doc.document_code}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                      {doc.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {doc.abstract}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="font-medium text-gray-900">{doc.author}</div>
                      <div className="text-gray-500 font-mono">{doc.nim}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center p-4 bg-gray-50 rounded-xl group-hover:bg-indigo-50 transition">
                    <ChevronRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600" />
                  </div>
                </div>
              </Link>
            ))}
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl shadow-sm mt-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-medium">{totalItems}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronRight className="h-5 w-5 rotate-180" aria-hidden="true" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setPage(page)}
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
                        onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
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
        )}
      </div>
    </div>
  );
}
