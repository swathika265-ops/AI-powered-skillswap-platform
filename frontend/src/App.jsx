import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Public Pages
import Landing from './pages/Landing/Landing';
import NotFound from './pages/NotFound';
import AccessDenied from './pages/AccessDenied';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SkillDiscovery from './pages/Skills/SkillDiscovery';

// Protected Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Profile from './pages/Profile/Profile';
import MySkills from './pages/Skills/MySkills';
import ProofSubmission from './pages/Verification/ProofSubmission';
import Assessment from './pages/Assessment/Assessment';
import Matching from './pages/Matching/Matching';
import Bookings from './pages/Bookings/Bookings';
import Messages from './pages/Messages/Messages';
import Credits from './pages/Credits/Credits';
import Challenges from './pages/Challenges/Challenges';
import Roadmaps from './pages/Roadmaps/Roadmaps';
import Notifications from './pages/Notifications/Notifications';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main className="main-content" style={{ paddingTop: '64px', flex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/skills" element={<SkillDiscovery />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/my-skills" element={<ProtectedRoute><MySkills /></ProtectedRoute>} />
              <Route path="/proofs" element={<ProtectedRoute><ProofSubmission /></ProtectedRoute>} />
              <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
              <Route path="/matching" element={<ProtectedRoute><Matching /></ProtectedRoute>} />
              <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/credits" element={<ProtectedRoute><Credits /></ProtectedRoute>} />
              <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
              <Route path="/roadmaps" element={<ProtectedRoute><Roadmaps /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

              {/* Error Pages */}
              <Route path="/access-denied" element={<AccessDenied />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
