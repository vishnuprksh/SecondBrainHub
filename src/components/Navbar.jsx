import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import { HiOutlineLogout, HiOutlinePlus } from 'react-icons/hi';

export default function Navbar() {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/brain.svg" alt="logo" className="w-8 h-8 group-hover:scale-110 transition-transform" />
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              Second<span className="text-brand-600">Brain</span>Hub
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

            {user ? (
              <div className="flex items-center gap-3">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full ring-2 ring-brand-200"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-red-500 transition-colors"
                  title="Sign out"
                >
                  <HiOutlineLogout size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-2 border border-gray-300 hover:border-gray-400 bg-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <FcGoogle size={18} />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
