import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import AppCard from '../components/AppCard';
import SearchBar from '../components/SearchBar';
import { HiOutlineFilter } from 'react-icons/hi';

const CATEGORIES = ['All', 'Note-taking', 'PKM', 'Task Management', 'Whiteboard', 'Writing', 'All-in-one', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Top Rated', value: 'top-rated' },
  { label: 'Most Reviewed', value: 'most-reviewed' },
];

export default function HomePage() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const q = query(collection(db, 'apps'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApps(appList);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Filter & sort
  let filtered = apps;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }

  if (category !== 'All') {
    filtered = filtered.filter((a) => a.category === category);
  }

  if (sortBy === 'top-rated') {
    filtered = [...filtered].sort((a, b) => {
      const avgA = a.ratingCount > 0 ? a.ratingSum / a.ratingCount : 0;
      const avgB = b.ratingCount > 0 ? b.ratingSum / b.ratingCount : 0;
      return avgB - avgA;
    });
  } else if (sortBy === 'most-reviewed') {
    filtered = [...filtered].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
          Discover Your Perfect{' '}
          <span className="text-brand-600">Second Brain</span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
          A community-driven directory of the best personal knowledge management tools. 
          Find, rate, and review apps that help you think better.
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <div className="max-w-lg mx-auto">
          <SearchBar value={search} onChange={setSearch} placeholder="Search apps by name or description..." />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  category === cat
                    ? 'bg-brand-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 text-sm shrink-0">
            <HiOutlineFilter className="text-gray-400" size={16} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* App Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No apps found</h3>
          <p className="text-gray-400 text-sm">
            {search || category !== 'All'
              ? 'Try adjusting your search or filters.'
              : 'Be the first to submit a second brain app!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}

      {/* Stats footer */}
      {!loading && apps.length > 0 && (
        <div className="text-center mt-10 text-sm text-gray-400">
          Showing {filtered.length} of {apps.length} apps
        </div>
      )}
    </div>
  );
}
