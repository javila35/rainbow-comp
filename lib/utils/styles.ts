/**
 * CSS class constants for consistent styling across the app
 */

// Typography
export const HEADING_H1 = "text-4xl font-bold font-[family-name:var(--font-geist-sans)] text-[#333333]";
export const HEADING_H2 = "text-3xl font-bold font-[family-name:var(--font-geist-sans)] text-[#333333]";
export const HEADING_H3 = "text-2xl font-bold text-[#333333]";
export const HEADING_H4 = "text-xl font-bold text-[#333333]";
export const TEXT_BODY = "font-[family-name:var(--font-geist-sans)] text-[#333333]";

// Navigation
export const NAV_LINK = "font-[family-name:var(--font-geist-sans)] text-[#333333] hover:text-gray-600 transition-colors";
export const NAV_LINK_ACTIVE = "font-[family-name:var(--font-geist-sans)] text-[#333333] bg-purple-100 px-3 py-1 rounded-md border border-purple-200 hover:bg-purple-200 transition-colors";

// Layout
export const PAGE_CONTAINER = "min-h-screen flex flex-col items-center pt-8";
export const CONTENT_CONTAINER = "w-full max-w-6xl px-4";
export const GRID_CONTAINER = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

// Forms
export const INPUT_BASE = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
export const INPUT_ERROR = "w-full px-2 py-1 border-red-500";

// Buttons
export const BUTTON_PRIMARY = "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium";
export const BUTTON_SECONDARY = "px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors";
export const BUTTON_DANGER = "px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600";

// Tables
export const TABLE_HEADER = "bg-gray-300 border-2";
export const TABLE_CELL_ODD = "bg-gray-300 border-2 px-2";
export const TABLE_CELL_EVEN = "border-2 px-2";

// Status indicators
export const STATUS_ERROR = "bg-red-100 text-red-800";
export const STATUS_SUCCESS = "bg-green-100 text-green-800";
export const STATUS_PENDING = "bg-yellow-100 text-yellow-800";

// Compound utilities
export const createDropdownClasses = (isSelected: boolean = false) => 
  `w-full px-4 py-2 text-left focus:outline-none disabled:opacity-50 border-b border-gray-100 last:border-b-0 ${
    isSelected ? "bg-blue-100 text-blue-900" : "hover:bg-gray-100 focus:bg-gray-100"
  }`;

export const createStatusBadge = (status: 'error' | 'success' | 'pending') => 
  `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    status === 'error' ? STATUS_ERROR :
    status === 'success' ? STATUS_SUCCESS : STATUS_PENDING
  }`;

export const createTableRowClasses = (index: number) =>
  `${index % 2 === 1 ? TABLE_CELL_ODD : TABLE_CELL_EVEN}`;

// Legacy glassy styling (preserved for compatibility)
export const GLASSY_INPUT_CLASSES = 
  "w-full px-4 py-2 bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/70 focus:border-white/70 focus:bg-white/50 transition-all duration-200 placeholder-gray-700 text-gray-900 font-medium shadow-lg";

export const GLASSY_BUTTON_CLASSES = 
  "w-full px-4 py-2 bg-white/40 backdrop-blur-md border-2 border-white/60 text-gray-900 rounded-lg hover:bg-white/50 hover:border-white/70 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 transition-all duration-200 font-semibold shadow-xl";

export const GLASSY_CONTAINER_CLASSES = 
  "bg-white/40 backdrop-blur-md border-2 border-white/50 rounded-lg p-6 shadow-lg";

export const CARD_CLASSES = 
  "bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow";

export const CARD_LINK_CLASSES = 
  "text-[#333333] hover:text-blue-600 transition-colors font-medium block";
