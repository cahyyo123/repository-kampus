import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (isRegister) {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, name, email, password }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccess('Registrasi berhasil! Silakan login.');
          setIsRegister(false);
          setPassword('');
        } else {
          setError(data.message);
        }
      } else {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem('repo_user', JSON.stringify(data.user));
          if (data.user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/student/dashboard');
          }
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      setError('Terjadi kesalahan pada server');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${!isRegister ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => { setIsRegister(false); setError(''); setSuccess(''); }}
            >
              Login
            </button>
            <button
              type="button"
              className={`px-6 py-2 rounded-lg text-sm font-bold transition ${isRegister ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-900'}`}
              onClick={() => { setIsRegister(true); setError(''); setSuccess(''); }}
            >
              Daftar Mahasiswa
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isRegister ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
            {isRegister ? <UserPlus className="h-8 w-8 text-emerald-600" /> : <Lock className="h-8 w-8 text-indigo-600" />}
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Registrasi Akun' : 'Selamat Datang'}
          </h2>
          <p className="text-gray-500 mt-2">
            {isRegister ? 'Buat akun mahasiswa untuk unggah karya' : 'Masuk untuk mengelola repositori'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium text-center border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium text-center border border-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-6">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Nama lengkap Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Kampus</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    placeholder="Contoh: nama@mhs.kampus.ac.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username / NIM</label>
            <div className="relative">
              <input
                type="text"
                required
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 transition ${isRegister ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder={isRegister ? "Masukkan NIM" : "Masukkan username/NIM"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 transition ${isRegister ? 'focus:ring-emerald-500 focus:border-emerald-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full text-white py-3 px-4 rounded-xl transition font-bold text-lg shadow-lg ${
              isRegister 
              ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>
        
        {!isRegister && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Admin Login:</p>
            <p className="font-mono mt-1">admin / admin123</p>
          </div>
        )}
      </div>
    </div>
  );
}
