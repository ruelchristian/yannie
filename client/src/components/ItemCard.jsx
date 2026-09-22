import React from 'react';
import { MapPin, Calendar, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const statusConfig = {
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CLAIMED: { label: 'Claim In Progress', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
  RETURNED: { label: 'Returned', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  CLOSED: { label: 'Closed', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const ItemCard = ({ item, onClick }) => {
  const hasImage = item.images && item.images.length > 0;
  const imageUrl = hasImage ? item.images[0].imageUrl : null;
  const status = statusConfig[item.status] || statusConfig.ACTIVE;
  const isLost = item.type === 'LOST';

  const formattedDate = new Date(item.dateIncident || item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-950/5 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Card Image Header */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            <Tag className="w-8 h-8 mb-1.5 opacity-40" />
            <span className="text-xs font-medium">No photo provided</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`text-xs font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-sm ${
              isLost
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {item.type}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border shadow-sm backdrop-blur-md bg-white/90 ${status.bg}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md w-fit mb-2">
            <Tag className="w-3 h-3" />
            <span>{item.category?.name || 'Uncategorized'}</span>
          </div>

          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-sky-600 transition-colors line-clamp-1 mb-1.5">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
            {item.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate font-medium text-slate-700">{item.locationName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            {item.user && (
              <span className="text-slate-500 font-medium truncate max-w-[120px]">
                By {item.user.fullName.split(' ')[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
