import { useAuth } from '../../contexts/AuthContext';
import { IoPersonCircle } from 'react-icons/io5';

const Header = ({ title }) => {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-3xl shadow-lg px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {title}
            </h2>
          </div>
         
          {/* User Profile Section */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">{user?.nama}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <IoPersonCircle size={48} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;