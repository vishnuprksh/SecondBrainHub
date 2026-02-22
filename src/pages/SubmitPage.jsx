import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePhotograph, HiOutlineGlobe } from 'react-icons/hi';

const CATEGORIES = ['Note-taking', 'PKM', 'Task Management', 'Whiteboard', 'Writing', 'All-in-one', 'Other'];
const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid'];

export default function SubmitPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authModal, setAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    logoUrl: '',
    category: 'Note-taking',
    pricing: 'Free',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setAuthModal(true);
      return;
    }

    if (!form.name.trim() || !form.description.trim()) {
      toast.error('Name and description are required.');
      return;
    }

    setSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, 'apps'), {
        name: form.name.trim(),
        description: form.description.trim(),
        websiteUrl: form.websiteUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        category: form.category,
        pricing: form.pricing,
        ratingSum: 0,
        ratingCount: 0,
        commentCount: 0,
        submittedBy: user.uid,
        submittedByName: user.displayName,
        submittedByPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });

      toast.success('App submitted successfully!');
      navigate(`/app/${docRef.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit app. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        message="Sign in with Google to submit a new second brain app."
      />

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Submit a Second Brain App</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share a tool with the community. Fill in the details below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            App Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Obsidian"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Briefly describe what this app does and why it's great for building a second brain..."
            rows={4}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlineGlobe size={14} />
              Website URL
            </span>
          </label>
          <input
            type="url"
            name="websiteUrl"
            value={form.websiteUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <HiOutlinePhotograph size={14} />
              Logo URL
            </span>
          </label>
          <input
            type="url"
            name="logoUrl"
            value={form.logoUrl}
            onChange={handleChange}
            placeholder="https://example.com/logo.png"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
          />
          {form.logoUrl && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={form.logoUrl}
                alt="Preview"
                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                onError={(e) => (e.target.style.display = 'none')}
              />
              <span className="text-xs text-gray-400">Logo preview</span>
            </div>
          )}
        </div>

        {/* Category & Pricing row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Pricing
            </label>
            <select
              name="pricing"
              value={form.pricing}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition"
            >
              {PRICING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-sm"
        >
          <HiOutlinePlus size={18} />
          {submitting ? 'Submitting...' : 'Submit App'}
        </button>
      </form>
    </div>
  );
}
