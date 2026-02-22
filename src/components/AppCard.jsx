import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { HiOutlineExternalLink, HiOutlineChatAlt2 } from 'react-icons/hi';

const CATEGORY_COLORS = {
  'Note-taking': 'bg-blue-100 text-blue-700',
  PKM: 'bg-purple-100 text-purple-700',
  'Task Management': 'bg-green-100 text-green-700',
  Whiteboard: 'bg-orange-100 text-orange-700',
  Writing: 'bg-pink-100 text-pink-700',
  'All-in-one': 'bg-indigo-100 text-indigo-700',
  Other: 'bg-gray-100 text-gray-600',
};

const PRICING_BADGE = {
  Free: 'bg-emerald-100 text-emerald-700',
  Freemium: 'bg-amber-100 text-amber-700',
  Paid: 'bg-red-100 text-red-700',
};

export default function AppCard({ app }) {
  const avgRating = app.ratingCount > 0 ? app.ratingSum / app.ratingCount : 0;
  const categoryColor = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other;
  const pricingColor = PRICING_BADGE[app.pricing] || PRICING_BADGE.Paid;

  return (
    <Link
      to={`/app/${app.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-brand-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-14 h-14 rounded-xl object-cover bg-gray-100 shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-14 h-14 rounded-xl bg-brand-100 shrink-0 items-center justify-center text-brand-600 font-bold text-xl ${app.logoUrl ? 'hidden' : 'flex'}`}
          >
            {app.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-900 group-hover:text-brand-600 transition-colors truncate">
              {app.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={avgRating} size={14} />
              <span className="text-xs text-gray-400">
                ({app.ratingCount || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">
          {app.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColor}`}>
            {app.category}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${pricingColor}`}>
            {app.pricing}
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <HiOutlineChatAlt2 size={14} />
            <span>{app.commentCount || 0} comments</span>
          </div>
          {app.websiteUrl && (
            <span className="flex items-center gap-1 text-xs text-brand-600 font-medium">
              Visit <HiOutlineExternalLink size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
