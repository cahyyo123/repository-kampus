import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Download, FileText, Calendar, User, Hash, Tag, ArrowLeft, ExternalLink, Video, FileArchive, Lock, CheckCircle, Clock, AlertCircle, Quote, Copy } from 'lucide-react';

export default function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requestReason, setRequestReason] = useState('');
  const [accessStatus, setAccessStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citationFormat, setCitationFormat] = useState('APA');
  const [copied, setCopied] = useState(false);
  
  const userStr = localStorage.getItem('repo_user') || localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isCampusEmail = user?.email?.endsWith('@kampus.ac.id') || user?.role === 'admin';

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/repository/${id}`)
      .then(res => res.json())
      .then(data => {
        setDoc(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && !isCampusEmail) {
      fetch(`${import.meta.env.VITE_API_URL}/api/access-requests/check?document_id=${id}&email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => {
          setAccessStatus(data.status);
        });
    }
  }, [id, user, isCampusEmail]);

  const handleRequestAccess = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Silakan login terlebih dahulu');
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_id: id,
          requester_email: user.email,
          requester_name: user.name,
          reason: requestReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setAccessStatus('pending');
        alert('Permintaan berhasil dikirim. Menunggu persetujuan admin.');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!doc || doc.message) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dokumen Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-6">Dokumen yang Anda cari mungkin telah dihapus atau URL tidak valid.</p>
        <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/browse')} className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Pencarian
        </button>
      </div>
    );
  }

  const getFileExtension = (filename: string) => {
    if (!filename) return '';
    return filename.split('.').pop()?.toLowerCase();
  };

  const renderDownloadButton = (label: string, filePath: string) => {
    if (!filePath) return null;
    return (
      <a
        href={`${import.meta.env.VITE_API_URL}/uploads/file_pdf/${filePath}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-bold shadow-lg shadow-indigo-200"
      >
        <Download className="h-5 w-5" /> Lihat/Download {label}
      </a>
    );
  };

  const canAccessBab45 = isCampusEmail || accessStatus === 'approved';

  const getCitation = (format: string) => {
    if (!doc) return '';
    const authorsArr = doc.author ? doc.author.split(',').map((a: string) => a.trim()) : [];
    const mainAuthor = authorsArr[0] || 'Unknown';
    const nameParts = mainAuthor.split(' ');
    const lastName = nameParts.length > 1 ? nameParts.pop() : mainAuthor;
    const firstName = nameParts.join(' ');
    const formattedAuthor = nameParts.length > 0 ? `${lastName}, ${firstName}` : mainAuthor;
    const etAl = authorsArr.length > 1 ? ' et al.' : '';
    const authorCitation = formattedAuthor + etAl;
  
    switch(format) {
      case 'APA':
        return `${authorCitation}. (${doc.year}). ${doc.title}. ${doc.category_name}, Repository Kampus.`;
      case 'MLA':
        return `${authorCitation}. "${doc.title}." Repository Kampus, ${doc.year}.`;
      case 'Chicago':
        return `${authorCitation}. "${doc.title}." ${doc.category_name}, Repository Kampus, ${doc.year}.`;
      case 'Harvard':
        return `${authorCitation}, ${doc.year}. ${doc.title}. ${doc.category_name}, Repository Kampus.`;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button onClick={() => window.history.length > 2 ? navigate(-1) : navigate('/browse')} className="text-gray-500 hover:text-indigo-600 font-medium inline-flex items-center gap-2 transition">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
              {doc.category_name}
            </span>
            <span className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
              {doc.document_code}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-8">
            {doc.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-gray-100 p-2 rounded-lg">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Penulis</p>
                <p className="font-semibold text-gray-900 text-base">{doc.author}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Hash className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">NIM</p>
                <p className="font-mono text-gray-900 text-base">{doc.nim}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <div className="bg-gray-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">Tahun</p>
                <p className="font-mono text-gray-900 text-base">{doc.year}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-gray-50 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" /> Abstrak / Deskripsi
            </h3>
            <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed">
              <p className="whitespace-pre-line">{doc.abstract}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Tag className="h-4 w-4 text-gray-400" /> Kata Kunci
            </h3>
            <div className="flex flex-wrap gap-2">
              {doc.keywords.split(',').map((kw: string, idx: number) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded bg-white border border-gray-200 text-sm text-gray-600 shadow-sm">
                  {kw.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Quote className="h-5 w-5 text-indigo-600" /> Sitasi Dokumen
            </h3>
            <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
                {['APA', 'MLA', 'Chicago', 'Harvard'].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setCitationFormat(fmt)}
                    className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${citationFormat === fmt ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
              <div className="p-4 flex gap-4 items-start justify-between bg-white">
                <p className="text-gray-700 font-serif leading-relaxed text-base pt-1">
                  {getCitation(citationFormat)}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getCitation(citationFormat));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="shrink-0 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Salin Sitasi"
                >
                  {copied ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-indigo-600" /> File Tersedia
            </h3>
            <div className="flex flex-wrap gap-4">
              {renderDownloadButton(doc.file_path_label || "File Lengkap", doc.file_path)}
              {renderDownloadButton("Bab 1", doc.file_bab1)}
              {renderDownloadButton("Bab 2", doc.file_bab2)}
              {renderDownloadButton("Bab 3", doc.file_bab3)}
              
              {doc.file_bab4 && canAccessBab45 && renderDownloadButton("Bab 4", doc.file_bab4)}
              {doc.file_bab5 && canAccessBab45 && renderDownloadButton("Bab 5", doc.file_bab5)}

              {(() => {
                let customFilesList: { label: string, filename: string }[] = [];
                try {
                  if (doc.custom_files) {
                    customFilesList = JSON.parse(doc.custom_files);
                  }
                } catch (e) {}
                
                return customFilesList.map((f, i) => (
                  <div key={i}>
                    {renderDownloadButton(f.label, f.filename)}
                  </div>
                ));
              })()}

              {doc.external_link && (
                <a
                  href={doc.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition font-bold shadow-lg shadow-emerald-200"
                >
                  <ExternalLink className="h-5 w-5" /> Kunjungi Link Eksternal
                </a>
              )}
            </div>

            {(!canAccessBab45 && (doc.file_bab4 || doc.file_bab5)) && (
              <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">Bab 4 & 5 Terkunci</h4>
                    <p className="text-gray-500 text-sm mt-1 mb-4">
                      File ini hanya tersedia untuk pengguna dengan email kampus. Silakan request akses jika Anda memiliki kebutuhan khusus.
                    </p>
                    
                    {!user ? (
                      <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium inline-block text-sm">
                        Login untuk Request Akses
                      </Link>
                    ) : accessStatus === 'pending' ? (
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-lg font-medium text-sm w-fit">
                        <Clock className="h-4 w-4" /> Menunggu Persetujuan Admin
                      </div>
                    ) : accessStatus === 'rejected' ? (
                      <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium text-sm w-fit">
                        <AlertCircle className="h-4 w-4" /> Permintaan Ditolak
                      </div>
                    ) : (
                      <form onSubmit={handleRequestAccess} className="space-y-4 max-w-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Request</label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Jelaskan untuk keperluan apa (misal: referensi penelitian dari kampus ...)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 text-sm"
                            value={requestReason}
                            onChange={(e) => setRequestReason(e.target.value)}
                          ></textarea>
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-bold text-sm transition"
                        >
                          {isSubmitting ? 'Mengirim...' : 'Kirim Request Akses'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
