import { FcGoogle } from 'react-icons/fc';
import { HiX } from 'react-icons/hi';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose, message }) {
  const { loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      // user closed popup or error
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-[fadeIn_0.2s_ease]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <HiX size={20} />
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Sign in required</h3>
          <p className="text-gray-500 text-sm mb-6">
            {message || 'Please sign in with Google to continue.'}
          </p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <FcGoogle size={22} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
