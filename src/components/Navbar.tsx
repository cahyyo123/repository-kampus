import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('repo_user') || localStorage.getItem('admin_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const [menus, setMenus] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/menus')
      .then(res => res.json())
      .then(data => {
        // Hanya tampilkan menu yang tidak di-hide
        setMenus(data.filter((m: any) => m.is_hidden === 0));
      })
      .catch(() => {});
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        if (data.site_title) {
          document.title = data.site_title;
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('repo_user');
    localStorage.removeItem('admin_user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 pr-6">
              {settings.site_logo ? (
                <img src={settings.site_logo} alt="Logo" className="h-8 max-w-[120px] object-contain" />
              ) : (
                <div className="bg-indigo-600 p-2 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              )}
              <span className="font-bold text-xl text-gray-900 hidden sm:block">
                {settings.site_title || 'RepoKampus'}
              </span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {menus.map((menu) => (
                <Link
                  key={menu.id}
                  to={menu.url}
                  className="border-transparent text-gray-500 hover:border-indigo-500 hover:text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition"
                >
                  {menu.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
                  {user.role === 'admin' ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  Dashboard {user.role === 'admin' ? 'Admin' : 'Mahasiswa'}
                </Link>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm font-medium">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-gray-500 hover:text-gray-900 flex items-center gap-1 text-sm font-medium">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
