import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import toast from 'react-hot-toast';
import {
  HiOutlineX,
  HiOutlineSave,
  HiOutlinePlus,
} from 'react-icons/hi';

const CATEGORIES = [
  'Note-taking',
  'PKM',
  'Task Management',
  'Whiteboard',
  'Writing',
  'All-in-one',
  'Other',
];
const PRICING_OPTIONS = ['Free', 'Freemium', 'Paid'];

const SUGGESTED_TAGS = [
  'AI',
  'Mobile',
  'Desktop',
  'Web',
  'Open Source',
  'Offline',
  'Collaboration',
  'Markdown',
  'Templates',
  'API',
  'Plugin Support',
  'Cross-platform',
  'Cloud Sync',
  'Privacy-focused',
  'Minimal',
  'Visual',
  'Database',
  'Spaced Repetition',
  'Graph View',
  'Kanban',
];

export default function EditAppModal({ app, isOpen, onClose, onUpdated }) {
  const { user } = useAuth();
  const [authModal, setAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    category: 'Note-taking',
    pricing: 'Free',
    tags: [],
  });

  // Sync form state when app changes or modal opens
  useEffect(() => {
    if (app && isOpen) {
      setForm({
        name: app.name || '',
        description: app.description || '',
        websiteUrl: app.websiteUrl || '',
        category: app.category || 'Note-taking',
        pricing: app.pricing || 'Free',
        tags: app.tags || [],
      });
      setTagInput('');
    }
  }, [app, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (!trimmed || form.tags.includes(trimmed)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
  };

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    }
  };

  const handleTagInputBlur = () => {
    if (tagInput.trim()) {
      addTag(tagInput);
      setTagInput('');
    }
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

    setSaving(true);
    try {
      await updateDoc(doc(db, 'apps', app.id), {
        name: form.name.trim(),
        description: form.description.trim(),
        websiteUrl: form.websiteUrl.trim(),
        category: form.category,
        pricing: form.pricing,
        tags: form.tags,
        updatedAt: serverTimestamp(),
      });
      toast.success('App updated successfully!');
      onUpdated?.({
        ...app,
        name: form.name.trim(),
        description: form.description.trim(),
        websiteUrl: form.websiteUrl.trim(),
        category: form.category,
        pricing: form.pricing,
        tags: form.tags,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update app. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const availableSuggestions = SUGGESTED_TAGS.filter(
    (t) => !form.tags.includes(t)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        message="Sign in with Google to edit this app."
      />

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-xl font-extrabold text-gray-900">Edit App</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
              required
              placeholder="e.g. Obsidian"
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
              rows={4}
              required
              placeholder="Briefly describe what this app does..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Website URL
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

          {/* Category & Pricing */}
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
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
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
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Tags
              <span className="text-xs font-normal text-gray-400 ml-2">
                Press Enter or comma to add custom tags
              </span>
            </label>

            {/* Current tags */}
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-brand-100 text-brand-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-brand-900 transition-colors ml-0.5"
                    >
                      <HiOutlineX size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={handleTagInputBlur}
                placeholder="Type a tag and press Enter..."
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => {
                  addTag(tagInput);
                  setTagInput('');
                }}
                disabled={!tagInput.trim()}
                className="px-3 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                <HiOutlinePlus size={16} />
              </button>
            </div>

            {/* Suggested tags */}
            {availableSuggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestions.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <HiOutlineSave size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
