import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiOutlinePlus, HiOutlineUser } from 'react-icons/hi';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/brain.svg" alt="logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-gray-100 hidden sm:block">
              FindYourSecondBrain
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              to="/submit"
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <HiOutlinePlus size={18} />
              <span className="hidden sm:inline">Submit App</span>
            </Link>

            {user && (
              <div className="w-8 h-8 rounded-full ring-2 ring-brand-700 bg-brand-900/40 flex items-center justify-center">
                <HiOutlineUser size={18} className="text-brand-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
