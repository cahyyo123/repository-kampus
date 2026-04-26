import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';

export default function DynamicPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/pages/slug/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setPage(data);
        setLoading(false);
      })
      .catch(() => {
        setPage(null);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-24">
        <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500">Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          {page.title}
        </h1>
      </div>
      
      <div className="text-gray-700 leading-relaxed w-full">
        <div 
          className="content-body w-full break-words"
          style={{ overflowWrap: 'anywhere' }}
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
      </div>
    </div>
  );
}
