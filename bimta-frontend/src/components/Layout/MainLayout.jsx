import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import LoadingSpinner from '../Common/LoadingSpinner';

const MainLayout = ({ children, title }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white relative overflow-hidden">
        {/* Animated Background Shapes for Loading */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#407549] opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#FCE8AB] opacity-40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#407549] opacity-30 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10">
          <LoadingSpinner size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-white relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#407549] opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-[#FCE8AB] opacity-40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-[#407549] opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-20 right-1/3 w-64 h-64 bg-[#FCE8AB] opacity-30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-[#407549] opacity-25 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header title={title} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;