import { NavLink } from 'react-router-dom';
import { IoHome, IoPeople, IoSchool, IoDocument, IoStatsChart, IoLogOut } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/BIMTALOGO.svg'; // Sesuaikan path logo Anda

const Sidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', icon: IoHome, label: 'Dashboard' },
    { path: '/akun-mahasiswa', icon: IoPeople, label: 'Akun Mahasiswa' },
    { path: '/akun-dosen', icon: IoSchool, label: 'Akun Dosen' },
    { path: '/referensi-ta', icon: IoDocument, label: 'Referensi TA' },
    { path: '/generate-laporan', icon: IoStatsChart, label: 'Generate Laporan' },
  ];

  return (
    <div className="h-screen p-4 bg-gradient-to-br from-gray to-gray">
      <div className="flex flex-col h-full w-64 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Logo Section */}
        <div className="flex items-center justify-center px-6 py-8 bg-gradient-to-r from-blue-100 to-purple-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <img 
                src={logo} 
                alt="BIMTA Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BIMTA
              </h1>
              <p className="text-xs text-gray-500 font-medium">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    <item.icon size={22} />
                  </div>
                  <span className="ml-3 font-semibold text-sm">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        {/* Logout Button */}
        <div className="px-4 py-4">
          <button
            onClick={logout}
            className="group flex items-center w-full px-4 py-3.5 text-gray-600 hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 hover:text-white rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105"
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              <IoLogOut size={22} />
            </div>
            <span className="ml-3 font-semibold text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;