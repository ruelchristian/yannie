import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ReportModal from './components/ReportModal';
import Home from './pages/Home';
import CampusMapPage from './pages/CampusMapPage';
import Login from './pages/Login';
import Register from './pages/Register';
import MyDashboard from './pages/MyDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar onOpenReportModal={() => setIsReportModalOpen(true)} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
            <Routes>
              <Route
                path="/"
                element={<Home onOpenReportModal={() => setIsReportModalOpen(true)} />}
              />
              <Route
                path="/map"
                element={<CampusMapPage onOpenReportModal={() => setIsReportModalOpen(true)} />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/my-dashboard"
                element={<MyDashboard onOpenReportModal={() => setIsReportModalOpen(true)} />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          <Footer />

          {/* Global Report Item Modal */}
          <ReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            onItemCreated={(item) => {
              // Reload page or trigger feed refresh if needed
              window.location.reload();
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
