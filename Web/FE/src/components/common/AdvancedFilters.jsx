
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const AdvancedFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    material: initialFilters.material || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    inStock: initialFilters.inStock ?? true,
    onSale: initialFilters.onSale || false,
    sortBy: initialFilters.sortBy || 'newest'
  });

  const categories = [
    'Tất cả',
    'Nhẫn',
    'Lắc Tay',
    'Dây Chuyền',
    'Bông Tai',
    'Lắc Chân',
    'Charm'
  ];

  const materials = [
    'Tất cả',
    'Bạc 925',
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'price-asc', label: 'Giá thấp đến cao' },
    { value: 'price-desc', label: 'Giá cao đến thấp' },
    { value: 'name-asc', label: 'Tên A-Z' },
    { value: 'name-desc', label: 'Tên Z-A' }
  ];

  const priceRanges = [
    { label: 'Dưới 500k', min: 0, max: 500000 },
    { label: '500k - 1tr', min: 500000, max: 1000000 },
    { label: '1tr - 2tr', min: 1000000, max: 2000000 },
    { label: '2tr - 5tr', min: 2000000, max: 5000000 },
    { label: 'Trên 5tr', min: 5000000, max: 999999999 }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeSelect = (min, max) => {
    setFilters(prev => ({
      ...prev,
      minPrice: min,
      maxPrice: max
    }));
  };

  const handleApplyFilters = () => {
    const activeFilters = {};

    if (filters.category && filters.category !== 'Tất cả') {
      activeFilters.category = filters.category;
    }
    if (filters.material && filters.material !== 'Tất cả') {
      activeFilters.material = filters.material;
    }
    if (filters.minPrice) {
      activeFilters.minPrice = parseInt(filters.minPrice);
    }
    if (filters.maxPrice) {
      activeFilters.maxPrice = parseInt(filters.maxPrice);
    }
    if (filters.inStock !== undefined) {
      activeFilters.inStock = filters.inStock;
    }
    if (filters.onSale) {
      activeFilters.onSale = filters.onSale;
    }
    if (filters.sortBy) {
      activeFilters.sortBy = filters.sortBy;
    }

    onFilterChange(activeFilters);
    setIsOpen(false);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      category: '',
      material: '',
      minPrice: '',
      maxPrice: '',
      inStock: true,
      onSale: false,
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category && filters.category !== 'Tất cả') count++;
    if (filters.material && filters.material !== 'Tất cả') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.onSale) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <>
      { }
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-600" />
        <span className="font-medium text-gray-700">Bộ lọc</span>
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      { }
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            { }
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black bg-opacity-25"
            />

            { }
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto"
            >
              <div className="flex flex-col h-full">
                { }
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <FunnelIcon className="w-6 h-6 text-amber-600" />
                    <h2 className="text-xl font-bold text-gray-900">Bộ lọc nâng cao</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                { }
                <div className="flex-1 px-6 py-6 space-y-6">
                  { }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Sắp xếp theo
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  { }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Danh mục
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleFilterChange('category', cat)}
                          className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${filters.category === cat || (cat === 'Tất cả' && !filters.category)
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  { }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Chất liệu
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {materials.map(mat => (
                        <button
                          key={mat}
                          onClick={() => handleFilterChange('material', mat)}
                          className={`px-4 py-2.5 rounded-lg border-2 font-medium transition-all ${filters.material === mat || (mat === 'Tất cả' && !filters.material)
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                  </div>

                  { }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Khoảng giá
                    </label>
                    <div className="space-y-2">
                      {priceRanges.map((range, index) => (
                        <button
                          key={index}
                          onClick={() => handlePriceRangeSelect(range.min, range.max)}
                          className={`w-full px-4 py-2.5 rounded-lg border-2 font-medium text-left transition-all ${filters.minPrice === range.min && filters.maxPrice === range.max
                            ? 'bg-amber-50 border-amber-500 text-amber-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                            }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  { }
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Hoặc nhập khoảng giá tùy chỉnh
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Từ (₫)</label>
                        <input
                          type="number"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Đến (₫)</label>
                        <input
                          type="number"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                          placeholder="999999999"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  { }
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-gray-700 font-medium">Chỉ sản phẩm còn hàng</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                        className="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-gray-700 font-medium">Chỉ sản phẩm đang giảm giá</span>
                    </label>
                  </div>
                </div>

                { }
                <div className="sticky bottom-0 bg-white border-t px-6 py-4 space-y-3">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full bg-amber-600 text-white py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-lg"
                  >
                    Áp dụng bộ lọc
                  </button>
                  <button
                    onClick={handleResetFilters}
                    className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdvancedFilters;
