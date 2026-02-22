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
import AuthModal from '../components/AuthModal';
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
  'Note-taking': 'bg-blue-100 text-blue-700',
  PKM: 'bg-purple-100 text-purple-700',
  'Task Management': 'bg-green-100 text-green-700',
  Whiteboard: 'bg-orange-100 text-orange-700',
  Writing: 'bg-pink-100 text-pink-700',
  'All-in-one': 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-600',
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
  const [authModal, setAuthModal] = useState({ open: false, message: '' });
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
    if (!user) {
      setAuthModal({ open: true, message: 'Sign in with Google to rate this app.' });
      return;
    }

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
    if (!user) {
      setAuthModal({ open: true, message: 'Sign in with Google to leave a comment.' });
      return;
    }
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
    if (!user) {
      setAuthModal({ open: true, message: 'Sign in with Google to edit this app.' });
      return;
    }
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
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" />
        <div className="flex gap-5">
          <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <div className="h-7 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😵</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">App not found</h2>
        <Link to="/" className="text-brand-600 hover:underline text-sm">
          Back to home
        </Link>
      </div>
    );
  }

  const avgRating = app.ratingCount > 0 ? app.ratingSum / app.ratingCount : 0;
  const categoryColor = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <AuthModal
        isOpen={authModal.open}
        onClose={() => setAuthModal({ open: false, message: '' })}
        message={authModal.message}
      />
      <EditAppModal
        app={app}
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onUpdated={handleEditUpdated}
      />

      {/* Back */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6 transition-colors"
      >
        <HiOutlineArrowLeft size={16} />
        Back to all apps
      </Link>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
        <div className="flex items-start gap-5">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-20 h-20 rounded-2xl object-cover bg-gray-100 shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-20 h-20 rounded-2xl bg-brand-100 shrink-0 items-center justify-center text-brand-600 font-bold text-3xl ${app.logoUrl ? 'hidden' : 'flex'}`}
          >
            {app.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900">{app.name}</h1>
              {user?.uid === app.submittedBy && (
                <button
                  onClick={handleEditClick}
                  className="shrink-0 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-300 transition-colors"
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
                <span className="text-sm text-gray-500 font-medium">
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
        <p className="mt-6 text-gray-600 leading-relaxed">{app.description}</p>

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
          <span className="text-sm text-gray-400">
            Pricing: <span className="font-medium text-gray-600">{app.pricing}</span>
          </span>
          {app.submittedByName && (
            <span className="text-sm text-gray-400">
              Submitted by <span className="font-medium text-gray-600">{app.submittedByName}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {app.tags && app.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {app.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-100 text-brand-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Rate this app */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Rate this app</h2>
        <div className="flex items-center gap-4">
          <StarRating
            rating={userRating}
            size={32}
            interactive
            onRate={handleRate}
          />
          {userRating > 0 && (
            <span className="text-sm text-gray-500">
              Your rating: {userRating}/5
            </span>
          )}
        </div>
        {!user && (
          <p className="text-xs text-gray-400 mt-2">
            Sign in to rate this app
          </p>
        )}
      </div>

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <HiOutlineChatAlt2 size={20} />
          Comments ({comments.length})
        </h2>

        {/* Comment form */}
        <form onSubmit={handleComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user ? 'Share your thoughts about this app...' : 'Sign in to leave a comment...'}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 transition placeholder:text-gray-400"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submittingComment || !newComment.trim()}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">
            No comments yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <img
                  src={comment.userPhoto || `https://ui-avatars.com/api/?name=${comment.userName}&background=3b6cf7&color=fff&size=40`}
                  alt={comment.userName}
                  className="w-9 h-9 rounded-full shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">
                      {comment.userName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
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
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete comment"
                        >
                          <HiOutlineTrash size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">
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
