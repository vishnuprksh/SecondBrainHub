import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import EditAppModal from '../components/EditAppModal';
import StarRating from '../components/StarRating';
import {
  HiOutlineExternalLink,
  HiOutlineArrowLeft,
  HiOutlineChatAlt2,
  HiOutlineTrash,
  HiOutlinePencil,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const CATEGORY_COLORS = {
  'Note-taking': 'bg-blue-900/50 text-blue-300',
  PKM: 'bg-purple-900/50 text-purple-300',
  'Task Management': 'bg-green-900/50 text-green-300',
  Whiteboard: 'bg-orange-900/50 text-orange-300',
  Writing: 'bg-pink-900/50 text-pink-300',
  'All-in-one': 'bg-indigo-900/50 text-indigo-300',
  Other: 'bg-gray-800 text-gray-400',
};

export default function AppDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [editModal, setEditModal] = useState(false);

  // Fetch app
  useEffect(() => {
    const fetchApp = async () => {
      const docRef = doc(db, 'apps', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setApp({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    };
    fetchApp();
  }, [id]);

  // Listen to comments
  useEffect(() => {
    const q = query(
      collection(db, 'apps', id, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, [id]);

  // Fetch user's existing rating
  useEffect(() => {
    if (!user) {
      setUserRating(0);
      return;
    }
    const fetchRating = async () => {
      const ratingDoc = await getDoc(doc(db, 'apps', id, 'ratings', user.uid));
      if (ratingDoc.exists()) {
        setUserRating(ratingDoc.data().rating);
      }
    };
    fetchRating();
  }, [user, id]);

  const handleRate = async (rating) => {
    try {
      const appRef = doc(db, 'apps', id);
      const ratingRef = doc(db, 'apps', id, 'ratings', user.uid);

      await runTransaction(db, async (transaction) => {
        const appDoc = await transaction.get(appRef);
        const ratingDoc = await transaction.get(ratingRef);

        if (!appDoc.exists()) throw new Error('App not found');

        const data = appDoc.data();
        let newSum = data.ratingSum || 0;
        let newCount = data.ratingCount || 0;

        if (ratingDoc.exists()) {
          // Update existing rating
          const oldRating = ratingDoc.data().rating;
          newSum = newSum - oldRating + rating;
        } else {
          // New rating
          newSum += rating;
          newCount += 1;
        }

        transaction.update(appRef, {
          ratingSum: newSum,
          ratingCount: newCount,
        });

        transaction.set(ratingRef, {
          rating,
          userId: user.uid,
          userName: user.displayName,
          updatedAt: serverTimestamp(),
        });
      });

      setUserRating(rating);
      // Refresh app data
      const docSnap = await getDoc(doc(db, 'apps', id));
      if (docSnap.exists()) {
        setApp({ id: docSnap.id, ...docSnap.data() });
      }
      toast.success('Rating submitted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit rating.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addDoc(collection(db, 'apps', id, 'comments'), {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        createdAt: serverTimestamp(),
      });

      // Update comment count on app
      const appRef = doc(db, 'apps', id);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        await updateDoc(appRef, {
          commentCount: (appSnap.data().commentCount || 0) + 1,
        });
      }

      setNewComment('');
      toast.success('Comment posted!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to post comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditUpdated = (updatedApp) => {
    setApp(updatedApp);
  };

  const handleEditClick = () => {
    setEditModal(true);
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'apps', id, 'comments', commentId));
      const appRef = doc(db, 'apps', id);
      const appSnap = await getDoc(appRef);
      if (appSnap.exists()) {
        await updateDoc(appRef, {
          commentCount: Math.max((appSnap.data().commentCount || 1) - 1, 0),
        });
      }
      toast.success('Comment deleted.');
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-6 bg-gray-800 rounded w-1/4 mb-6" />
        <div className="flex gap-5">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-800 rounded w-1/2" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 bg-gray-800 rounded" />
          <div className="h-4 bg-gray-800 rounded w-5/6" />
          <div className="h-4 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😵</div>
        <h2 className="text-xl font-bold text-gray-300 mb-2">App not found</h2>
        <Link to="/" className="text-brand-400 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const avgRating = app.ratingCount > 0 ? app.ratingSum / app.ratingCount : 0;
  const categoryColor = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <EditAppModal
        app={app}
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onUpdated={handleEditUpdated}
      />

      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-brand-400 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft size={16} />
        Back to all apps
      </Link>

      {/* Hero / Webframe */}
      <div className="mb-8 group">
        <div className="bg-gray-900 border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
          {/* Mock Browser Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-500/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            </div>
            <div className="flex-1 max-w-md mx-4 bg-gray-950/50 border border-gray-700/50 rounded-lg px-3 py-1 text-xs text-gray-400 truncate text-center">
              {app.websiteUrl ? app.websiteUrl.replace('https://', '') : 'No URL provided'}
            </div>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Screenshot preview */}
          <div className="aspect-video bg-gray-950 relative">
            {app.websiteUrl ? (
              <img
                src={`https://api.microlink.io/?url=${encodeURIComponent(app.websiteUrl)}&screenshot=true&embed=screenshot.url&viewport.width=1920&viewport.height=1080`}
                alt={`${app.name} preview`}
                className="w-full h-full object-cover object-top"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-700">
                <HiOutlineExternalLink size={60} />
              </div>
            )}
            
            {/* View live site button overlay */}
            {app.websiteUrl && (
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-gray-950/80 to-transparent flex justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <a
                  href={app.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105"
                >
                  Visit Live Website
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 sm:p-8">
        <div className="flex items-start gap-5">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-20 h-20 rounded-2xl object-cover bg-gray-800 shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-20 h-20 rounded-2xl bg-brand-900/40 shrink-0 items-center justify-center text-brand-400 font-bold text-3xl ${app.logoUrl ? 'hidden' : 'flex'}`}
          >
            {app.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-gray-100">{app.name}</h1>
              {user?.uid === app.submittedBy && (
                <button
                  onClick={handleEditClick}
                  className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-brand-400 hover:bg-brand-900/30 px-3 py-1.5 rounded-lg border border-gray-700 hover:border-brand-700 transition-colors"
                  title="Edit this app"
                >
                  <HiOutlinePencil size={15} />
                  Edit
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <StarRating rating={avgRating} size={20} />
                <span className="text-sm text-gray-400 font-medium">
                  {avgRating.toFixed(1)} ({app.ratingCount || 0} ratings)
                </span>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}>
                {app.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-6 text-gray-300 leading-relaxed">{app.description}</p>

        {/* Meta */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {app.websiteUrl && (
            <a
              href={app.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Visit Website <HiOutlineExternalLink size={16} />
            </a>
          )}
          <span className="text-sm text-gray-500">
            Pricing: <span className="font-medium text-gray-300">{app.pricing}</span>
          </span>
          {app.submittedByName && (
            <span className="text-sm text-gray-500">
              Submitted by <span className="font-medium text-gray-300">{app.submittedByName}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-900/40 text-brand-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rate this app */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-100 mb-3">
          {userRating > 0 ? 'Your Rating' : 'Rate this app'}
        </h2>
        <div className="flex items-center gap-4">
          <StarRating
            rating={userRating}
            size={32}
            interactive
            onRate={handleRate}
          />
          {userRating > 0 && (
            <span className="text-sm font-medium text-brand-400">
              You rated this {userRating}/5
            </span>
          )}
        </div>
        {!user && (
          <p className="text-xs text-gray-500 mt-2">
            Sign in to rate this app
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="bg-gray-900 rounded-2xl border border-gray-700/50 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-100 mb-4 flex items-center gap-2">
          <HiOutlineChatAlt2 size={20} />
          Comments ({comments.length})
        </h2>

        {/* Comment form */}
        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this app..."
            rows={3}
            className="w-full border border-gray-700 rounded-xl px-4 py-3 bg-gray-800 text-gray-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition placeholder:text-gray-500"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-6">
            No comments yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-gray-800/60 rounded-xl"
              >
                <img
                  src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=3b6cf7&color=fff&size=40`}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-200">
                      {comment.userName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {comment.createdAt?.toDate
                          ? comment.createdAt.toDate().toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Just now'}
                      </span>
                      {user?.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                          title="Delete comment"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
