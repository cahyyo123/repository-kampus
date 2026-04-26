import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Detail from './pages/Detail';
import About from './pages/About';
import Login from './pages/Login';
import DynamicPage from './pages/DynamicPage';
import AdminDashboard from './pages/admin/Dashboard';
import AddDocument from './pages/admin/AddDocument';
import EditDocument from './pages/admin/EditDocument';
import PageEditor from './pages/admin/PageEditor';
import StudentDashboard from './pages/student/Dashboard';
import StudentAddDocument from './pages/student/AddDocument';
import StudentEditDocument from './pages/student/EditDocument';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/document/:id" element={<Detail />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/p/:slug" element={<DynamicPage />} />
            <Route path="/admin/login" element={<Navigate to="/login" replace />} />
            
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/add" element={<AddDocument />} />
            <Route path="/admin/edit/:id" element={<EditDocument />} />
            <Route path="/admin/pages/add" element={<PageEditor />} />
            <Route path="/admin/pages/edit/:id" element={<PageEditor />} />

            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/add" element={<StudentAddDocument />} />
            <Route path="/student/edit/:id" element={<StudentEditDocument />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
