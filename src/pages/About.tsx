import { Info, Shield, Users, Database } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Tentang Repository Kampus</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Platform digital untuk menyimpan, mengelola, dan mendistribusikan karya ilmiah civitas akademika.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 prose prose-indigo max-w-none text-gray-700 leading-relaxed">
        <p>
          Repository Kampus adalah sistem arsip digital institusional yang bertujuan untuk mengumpulkan, melestarikan, dan menyebarluaskan karya intelektual yang dihasilkan oleh mahasiswa dan dosen. Sistem ini dirancang untuk memfasilitasi akses terbuka terhadap pengetahuan dan mendukung kegiatan tridharma perguruan tinggi.
        </p>
        
        <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Tujuan Utama</h3>
        <ul className="space-y-2 list-disc pl-5">
          <li>Meningkatkan visibilitas dan dampak karya ilmiah institusi di tingkat nasional maupun internasional.</li>
          <li>Menyediakan akses jangka panjang yang aman terhadap aset digital kampus.</li>
          <li>Mendukung proses pembelajaran dengan menyediakan referensi yang relevan dan berkualitas.</li>
          <li>Mencegah plagiarisme dengan mendokumentasikan karya asli secara transparan.</li>
        </ul>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Penyimpanan Aman</h3>
          <p className="text-sm text-gray-500">Data dan dokumen disimpan dengan standar keamanan tinggi untuk mencegah kehilangan.</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Akses Terbuka</h3>
          <p className="text-sm text-gray-500">Memberikan kemudahan akses bagi seluruh civitas akademika dan masyarakat luas.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Integritas Data</h3>
          <p className="text-sm text-gray-500">Memastikan keaslian dokumen dengan sistem kode unik yang terverifikasi.</p>
        </div>
      </div>
    </div>
  );
}
