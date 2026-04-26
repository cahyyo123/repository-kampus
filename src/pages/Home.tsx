import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Book, FileText, GraduationCap, ArrowRight, Gamepad2, Video, AppWindow, Library, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [stats, setStats] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => setStats(data));
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'skripsi': return <GraduationCap className="h-6 w-6" />;
      case 'tugas akhir': return <Book className="h-6 w-6" />;
      case 'laporan pkl': return <FileText className="h-6 w-6" />;
      case 'jurnal mahasiswa': return <Library className="h-6 w-6" />;
      case 'game': return <Gamepad2 className="h-6 w-6" />;
      case 'video': return <Video className="h-6 w-6" />;
      case 'aplikasi': return <AppWindow className="h-6 w-6" />;
      default: return <FileText className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'skripsi': return 'bg-blue-100 text-blue-600';
      case 'tugas akhir': return 'bg-indigo-100 text-indigo-600';
      case 'laporan pkl': return 'bg-emerald-100 text-emerald-600';
      case 'jurnal mahasiswa': return 'bg-amber-100 text-amber-600';
      case 'game': return 'bg-purple-100 text-purple-600';
      case 'video': return 'bg-rose-100 text-rose-600';
      case 'aplikasi': return 'bg-cyan-100 text-cyan-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 shadow-2xl"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-indigo-400 blur-3xl"></div>
          <div className="absolute top-1/2 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        </div>

        <div className="relative z-10 px-6 py-20 md:py-28 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-sm font-medium mb-8 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Sistem Repository Digital Terpadu
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight"
          >
            Temukan <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">Karya Ilmiah</span> & Inovasi Mahasiswa
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-indigo-100/90 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Eksplorasi ribuan skripsi, jurnal, tugas akhir, game, video, dan aplikasi yang dihasilkan oleh mahasiswa berprestasi.
          </motion.p>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            onSubmit={handleSearch} 
            className="flex max-w-2xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-2xl overflow-hidden p-1.5 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:bg-white transition-all duration-300 group"
          >
            <div className="pl-5 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-indigo-200 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Cari judul, penulis, NIM, atau kata kunci..."
              className="flex-1 px-4 py-4 text-white group-focus-within:text-gray-900 placeholder-indigo-200 group-focus-within:placeholder-gray-400 focus:outline-none bg-transparent text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-white text-indigo-900 px-8 py-4 rounded-full hover:bg-indigo-50 transition-colors flex items-center gap-2 font-bold shadow-sm">
              Cari
            </button>
          </motion.form>
        </div>
      </motion.div>

      {/* Stats & Categories Section */}
      {stats && (
        <div className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Jelajahi Kategori</h2>
              <p className="text-gray-500 mt-2">Temukan karya berdasarkan program dan jenisnya</p>
            </div>
            <div className="bg-indigo-50 text-indigo-700 px-5 py-2.5 rounded-2xl font-bold flex items-center gap-3 border border-indigo-100">
              <Book className="h-5 w-5" />
              <span>Total {stats.totalDocs} Dokumen</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {(stats?.docsByCategory || []).map((cat: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                key={idx}
              >
                <Link
                  to={`/browse?category=${cat.id}`}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col items-start group h-full relative overflow-hidden"
                >
                  <div className={`p-4 rounded-2xl mb-4 ${getCategoryColor(cat.name)} group-hover:scale-110 transition-transform duration-300`}>
                    {cat.logo_url ? (
                      <img src={cat.logo_url} alt={cat.name} className="h-6 w-6 object-contain" />
                    ) : (
                      getCategoryIcon(cat.name)
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-gray-500 font-medium mt-1">
                    {cat.count} Karya
                  </p>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <div className="bg-indigo-50 p-2 rounded-full text-indigo-600">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div className="space-y-8 pt-8 border-t border-gray-100">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Karya Terbaru</h2>
            <p className="text-gray-500 mt-2">Publikasi dan inovasi terkini dari mahasiswa</p>
          </div>
          <Link to="/browse" className="hidden md:flex text-indigo-600 hover:text-indigo-800 font-bold items-center gap-1 group bg-indigo-50 px-5 py-2.5 rounded-full transition-colors">
            Lihat Semua Koleksi <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats?.recentDocs.map((doc: any, idx: number) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              key={doc.id}
            >
              <Link to={`/document/${doc.id}`} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-5">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(doc.category_name)}`}>
                    {doc.category_name}
                  </span>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {doc.year}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                  {doc.title}
                </h3>
                
                <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {doc.abstract}
                </p>
                
                <div className="pt-5 border-t border-gray-50 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{doc.author}</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{doc.nim}</p>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-full text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        <div className="md:hidden flex justify-center mt-6">
          <Link to="/browse" className="text-indigo-600 font-bold flex items-center gap-2 bg-indigo-50 px-6 py-3 rounded-full">
            Lihat Semua Koleksi <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
