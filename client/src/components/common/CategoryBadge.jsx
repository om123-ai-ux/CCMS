import React from 'react';
import { Wifi, Zap, Building2, Home, Sparkles, HelpCircle } from 'lucide-react';

export default function CategoryBadge({ category, className = '' }) {
  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'IT and Wi-Fi':
        return {
          icon: Wifi,
          color: 'text-sky-600 bg-sky-50 border-sky-200'
        };
      case 'Electrical':
        return {
          icon: Zap,
          color: 'text-amber-600 bg-amber-50 border-amber-200'
        };
      case 'Infrastructure':
        return {
          icon: Building2,
          color: 'text-orange-600 bg-orange-50 border-orange-200'
        };
      case 'Hostel':
        return {
          icon: Home,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200'
        };
      case 'Cleaning':
        return {
          icon: Sparkles,
          color: 'text-teal-600 bg-teal-50 border-teal-200'
        };
      case 'Other':
      default:
        return {
          icon: HelpCircle,
          color: 'text-slate-600 bg-slate-50 border-slate-200'
        };
    }
  };

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.color} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{category}</span>
    </span>
  );
}
