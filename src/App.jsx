import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AppDetailPage from './pages/AppDetailPage';
import SubmitPage from './pages/SubmitPage';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '14px',
          },
        }}
      />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/app/:id" element={<AppDetailPage />} />
          <Route path="/submit" element={<SubmitPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-sm text-gray-400">
            Built with ❤️ for the{' '}
            <a
              href="https://reddit.com/r/SecondBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              r/SecondBrain
            </a>{' '}
            community
          </p>
        </div>
      </footer>
    </div>
  );
}
