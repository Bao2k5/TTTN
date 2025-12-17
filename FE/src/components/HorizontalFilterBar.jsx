import React from 'react';

const HorizontalFilterBar = ({ 
  filters, 
  categoryOptions, 
  materialOptions,
  sortOptions,
  onCategoryToggle,
  onMaterialToggle,
  onPriceChange,
  onSortChange,
  onClearAll,
  activeFiltersCount 
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-teal-50 to-blue-50 border-4 border-teal-600 rounded-2xl p-6 mb-8 shadow-lg">
      <div className="flex flex-wrap items-center gap-6">

        {}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-teal-700 uppercase">📋 Danh mục</span>
          {categoryOptions.map((category) => (
            <label key={category.value} className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <input
                type="checkbox"
                checked={filters.categories.includes(category.value)}
                onChange={() => onCategoryToggle(category.value)}
                className="w-5 h-5 accent-teal-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{category.label}</span>
            </label>
          ))}
        </div>

        {}
        <div className="w-0.5 h-12 bg-teal-400"></div>

        {}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-teal-700 uppercase">💰 Giá</span>
          <input
            type="range"
            min="0"
            max="50000000"
            step="500000"
            value={filters.priceMax}
            onChange={(e) => onPriceChange('priceMax', parseInt(e.target.value))}
            className="w-48 h-3 bg-teal-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <span className="text-sm font-semibold text-gray-800 min-w-[130px]">
            {filters.priceMax.toLocaleString()} ₫
          </span>
        </div>

        {}
        <div className="w-0.5 h-12 bg-teal-400"></div>

        {}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
          <span className="text-sm font-bold text-teal-700 uppercase">💎 Chất liệu</span>
          {materialOptions.map((material) => (
            <label key={material} className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform">
              <input
                type="checkbox"
                checked={filters.materials.includes(material)}
                onChange={() => onMaterialToggle(material)}
                className="w-5 h-5 accent-teal-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">{material}</span>
            </label>
          ))}
        </div>

        {}
        <div className="flex-grow"></div>

        {}
        <div className="flex items-center gap-3">
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearAll}
              className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-md transition-all"
            >
              🗑️ Xóa bộ lọc ({activeFiltersCount})
            </button>
          )}

          <select
            value={filters.sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-4 py-2 text-sm font-medium border-2 border-teal-600 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default HorizontalFilterBar;
