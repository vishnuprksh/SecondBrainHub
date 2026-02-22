import { Link } from 'react-router-dom';
import StarRating from './StarRating';
import { HiOutlineExternalLink, HiOutlineChatAlt2 } from 'react-icons/hi';

const CATEGORY_COLORS = {
  'Note-taking': 'bg-blue-900/50 text-blue-300',
  PKM: 'bg-purple-900/50 text-purple-300',
  'Task Management': 'bg-green-900/50 text-green-300',
  Whiteboard: 'bg-orange-900/50 text-orange-300',
  Writing: 'bg-pink-900/50 text-pink-300',
  'All-in-one': 'bg-indigo-900/50 text-indigo-300',
  Other: 'bg-gray-800 text-gray-400',
};

const PRICING_BADGE = {
  Free: 'bg-emerald-900/50 text-emerald-300',
  Freemium: 'bg-amber-900/50 text-amber-300',
  Paid: 'bg-red-900/50 text-red-300',
};

export default function AppCard({ app }) {
  const avgRating = app.ratingCount > 0 ? app.ratingSum / app.ratingCount : 0;
  const categoryColor = CATEGORY_COLORS[app.category] || CATEGORY_COLORS.Other;
  const pricingColor = PRICING_BADGE[app.pricing] || PRICING_BADGE.Paid;

  return (
    <Link
      to={`/app/${app.id}`}
      className="group block bg-gray-900 rounded-2xl border border-gray-700/50 hover:border-brand-500/60 hover:shadow-lg hover:shadow-brand-900/20 transition-all duration-300 overflow-hidden"
    >
      {/* Website Preview / Webframe */}
      <div className="h-44 w-full bg-gray-950 relative overflow-hidden group-hover:bg-gray-800 transition-colors">
        {/* Mock Browser Header */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/30 flex items-center px-3 gap-1.5 z-10 transition-colors group-hover:bg-gray-700/80">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
          <div className="ml-2 flex-1 bg-gray-900/50 rounded h-3.5 flex items-center px-2">
            <div className="w-20 h-1.5 bg-gray-700/50 rounded-full" />
          </div>
        </div>

        {app.websiteUrl ? (
          <img
            src={`https://api.microlink.io/?url=${encodeURIComponent(app.websiteUrl)}&screenshot=true&embed=screenshot.url&viewport.width=1280&viewport.height=800`}
            alt={`${app.name} preview`}
            className="w-full h-full object-cover object-top opacity-50 group-hover:opacity-100 transition-opacity duration-700 ease-in-out scale-100 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 hidden">
           <HiOutlineExternalLink size={40} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-100 group-hover:opacity-40 transition-opacity" />
      </div>

      <div className="p-5 relative -mt-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {app.logoUrl ? (
            <img
              src={app.logoUrl}
              alt={app.name}
              className="w-14 h-14 rounded-xl object-cover bg-gray-950 ring-4 ring-gray-900 shrink-0"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`w-14 h-14 rounded-xl bg-brand-900/40 ring-4 ring-gray-900 shrink-0 items-center justify-center text-brand-400 font-bold text-xl ${app.logoUrl ? 'hidden' : 'flex'}`}
          >
            {app.name?.charAt(0)?.toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-gray-100 group-hover:text-brand-400 transition-colors truncate">
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
        <p className="mt-3 text-sm text-gray-400 line-clamp-2 leading-relaxed">
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
          {app.tags && app.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-900/30 text-brand-400 border border-brand-800/60"
            >
              {tag}
            </span>
          ))}
          {app.tags && app.tags.length > 3 && (
            <span className="text-xs text-gray-500 font-medium">
              +{app.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700/50">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <HiOutlineChatAlt2 size={14} />
            <span>{app.commentCount || 0} comments</span>
          </div>
          {app.websiteUrl && (
            <span className="flex items-center gap-1 text-xs text-brand-400 font-medium">
              Visit <HiOutlineExternalLink size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
