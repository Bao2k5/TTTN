import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ProductCard from '../components/common/ProductCard';
import { categories, materials, STYLES } from '../utils/constants';
import api from '../services/api';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const Products = () => {
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();
  const location = useLocation();

  // Product data state
  const [products, setProducts] = useState([]);
  const [showQuickView, setShowQuickView] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Custom hook for managing filter state
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Initialize filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let categoryParam = params.get('category');

    if (categoryParam) {
      // Handle alias mapping
      if (categoryParam.toLowerCase() === 'vòng tay') {
        categoryParam = 'Lắc Tay';
      }

      // Case-insensitive match to find the correct category format
      const matchedCategory = categories.find(
        c => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (matchedCategory) {
        setSelectedCategories([matchedCategory]);
      }
    }
  }, [location.search]);

  // Toggle functions for filters - my custom implementation
  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleStyle = (style) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const togglePriceRange = (range) => {
    setSelectedPriceRange(prev => {
      const exists = prev.some(r => r.label === range.label);
      if (exists) {
        return prev.filter(r => r.label !== range.label);
      } else {
        return [...prev, range];
      }
    });
  };

  // Format price with VND - custom formatter
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Fetch products from API - my custom implementation
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: 1, limit: 100 };

        // Pass category to API if only one is selected (for server-side filtering optimization if supported)
        // if (selectedCategories.length === 1) params.category = selectedCategories[0];

        const res = await api.get('/products', { params });
        const data = res.data || {};

        const fetched = (data.products || []).map(p => ({
          id: p._id,
          name: p.name,
          price: p.price,
          priceSale: p.priceSale,
          images: (p.images || []).map(i => typeof i === 'string' ? i : (i.url || i)),
          category: (p.category || (p.collection && p.collection.name) || '').toLowerCase() === 'vòng tay' ? 'Lắc Tay' : (p.category || (p.collection && p.collection.name) || ''),
          style: p.style || '', // Ensure style is captured
          material: p.attributes?.material || '',
          rating: p.ratingsAvg || 0,
          reviews: p.ratingsCount || 0
        }));

        setProducts(fetched);
        setTotal(data.total || fetched.length);
      } catch (err) {
        console.error('Failed loading products', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedPriceRange, selectedStyles]);

  // Filter logic - my implementation
  const filteredProducts = products.filter(product => {
    // Search filter check
    const searchMatch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter check - Case Insensitive
    const categoryMatch = selectedCategories.length === 0 || selectedCategories.some(cat =>
      product.category && product.category.toLowerCase() === cat.toLowerCase()
    );

    // Style filter check - Case Insensitive
    const styleMatch = selectedStyles.length === 0 || selectedStyles.some(style =>
      product.style && product.style.toLowerCase() === style.toLowerCase()
    );

    // Price filter check
    const priceMatch = selectedPriceRange.length === 0 || selectedPriceRange.some(range =>
      (product.priceSale || product.price) >= range.min && (product.priceSale || product.price) <= range.max
    );

    return searchMatch && categoryMatch && styleMatch && priceMatch;
  });

  // Sort products - custom sort implementation
  if (sortBy === 'price-asc') filteredProducts.sort((a, b) => (a.priceSale || a.price) - (b.priceSale || b.price));
  if (sortBy === 'price-desc') filteredProducts.sort((a, b) => (b.priceSale || b.price) - (a.priceSale || a.price));
  if (sortBy === 'name-asc') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === 'name-desc') filteredProducts.sort((a, b) => b.name.localeCompare(a.name));

  // Pagination logic - my custom implementation
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  // Clear all filters - helper function
  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedStyles([]);
    setSelectedPriceRange([]);
    setPriceRange([0, 50000000]);
  };

  // Quick add to cart handler - my implementation
  const handleQuickAddToCart = async () => {
    if (!showQuickView) return;

    setAddingToCart(true);
    try {
      if (user) {
        await api.post('/cart', {
          productId: showQuickView.id,
          qty: 1
        });
      }

      addToCart(showQuickView, 1);

      alert(`Đã thêm ${showQuickView.name} vào giỏ hàng!`);

      setShowQuickView(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại!');
    } finally {
      setAddingToCart(false);
    }
  };

  // Component return - main render
  return (
    <div className="min-h-screen bg-luxury-cream">

      {/* HEADER BANNER */}
      <div className="bg-gradient-to-b from-white to-luxury-cream py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-light mb-4 text-luxury-deepBlack tracking-wide text-center">SẢN PHẨM</h1>
          <div className="w-20 h-1 bg-luxury-platinumGrey mx-auto mb-6"></div>
          <p className="text-luxury-steelGrey text-lg font-light text-center">Khám phá bộ sưu tập trang sức cao cấp</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">

        {/* ------- FILTERS -------- */}
        <div className="pb-6 mb-8">
          <div className="flex flex-wrap items-center gap-8 mb-4">
            {/* SEARCH BAR */}
            <div className="flex-1 min-w-[300px] relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-luxury-silverPearlLight border border-luxury-metallicSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-platinumGrey focus:border-luxury-platinumGrey"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-steelGrey" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>

              {/* SEARCH SUGGESTIONS */}
              {searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-luxury-silverPearl border border-luxury-metallicSilver rounded-lg shadow-silver-lg z-20 max-h-60 overflow-y-auto">
                  {filteredProducts
                    .filter(product =>
                      product.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(product => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="block px-4 py-3 hover:bg-luxury-silverPearlDark border-b border-luxury-metallicSilver last:border-b-0"
                        onClick={() => setSearchTerm('')}
                      >
                        <div className="flex items-center gap-3">
                          <img src={product.images?.[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-luxury-steelDark">{product.name}</p>
                            <p className="text-xs text-luxury-steelGrey">
                              {product.priceSale ? product.priceSale.toLocaleString() : product.price.toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  {filteredProducts.filter(product =>
                    product.name.toLowerCase().includes(searchTerm.toLowerCase())
                  ).length === 0 && (
                      <div className="px-4 py-3 text-sm text-luxury-steelGrey">
                        Không tìm thấy sản phẩm nào
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* CATEGORY FILTER */}
            <div
              className="relative"
              onMouseLeave={() => {
                const element = document.getElementById('category-filter');
                if (element) {
                  element.classList.add('hidden');
                }
              }}
            >
              <button
                className="flex items-center gap-2 py-3 text-left bg-luxury-silverPearlLight hover:bg-luxury-silverPearlDark px-4 border border-luxury-metallicSilver rounded-lg cursor-pointer"
                onClick={() => document.getElementById('category-filter').classList.toggle('hidden')}
                onMouseEnter={() => {
                  const element = document.getElementById('category-filter');
                  if (element && element.classList.contains('hidden')) {
                    element.classList.remove('hidden');
                  }
                }}
              >
                <span className="text-sm font-medium text-luxury-deepBlack">LOẠI TRANG SỨC</span>
                <svg className="w-4 h-4 text-luxury-steelGrey transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="category-filter" className="hidden absolute top-full left-0 mt-1 bg-luxury-silverPearl border border-luxury-metallicSilver rounded-lg shadow-silver-lg z-10 min-w-[200px]">
                <div className="p-3 space-y-2">
                  {categories.map(cat => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 text-luxury-deepBlack border-luxury-metallicSilver rounded focus:ring-luxury-platinumGrey"
                      />
                      <span className="ml-2 text-sm text-luxury-steelDark">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* MATERIAL FILTER */}
            <div
              className="relative"
              onMouseLeave={() => {
                const element = document.getElementById('material-filter');
                if (element) {
                  element.classList.add('hidden');
                }
              }}
            >
              <button
                className="flex items-center gap-2 py-3 text-left bg-luxury-silverPearlLight hover:bg-luxury-silverPearlDark px-4 border border-luxury-metallicSilver rounded-lg cursor-pointer"
                onClick={() => document.getElementById('material-filter').classList.toggle('hidden')}
                onMouseEnter={() => {
                  const element = document.getElementById('material-filter');
                  if (element && element.classList.contains('hidden')) {
                    element.classList.remove('hidden');
                  }
                }}
              >
                <span className="text-sm font-medium text-luxury-deepBlack">CHẤT LIỆU</span>
                <svg className="w-4 h-4 text-luxury-steelGrey transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="material-filter" className="hidden absolute top-full left-0 mt-1 bg-luxury-silverPearl border border-luxury-metallicSilver rounded-lg shadow-silver-lg z-10 min-w-[200px]">
                <div className="p-3 space-y-2">
                  {materials.map(mat => (
                    <label key={mat} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        disabled
                        className="w-4 h-4 text-luxury-deepBlack border-luxury-metallicSilver rounded focus:ring-luxury-platinumGrey opacity-50 cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-luxury-steelDark">{mat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* STYLE FILTER */}
            <div
              className="relative"
              onMouseLeave={() => {
                const element = document.getElementById('style-filter');
                if (element) {
                  element.classList.add('hidden');
                }
              }}
            >
              <button
                className="flex items-center gap-2 py-3 text-left bg-luxury-silverPearlLight hover:bg-luxury-silverPearlDark px-4 border border-luxury-metallicSilver rounded-lg cursor-pointer"
                onClick={() => document.getElementById('style-filter').classList.toggle('hidden')}
                onMouseEnter={() => {
                  const element = document.getElementById('style-filter');
                  if (element && element.classList.contains('hidden')) {
                    element.classList.remove('hidden');
                  }
                }}
              >
                <span className="text-sm font-medium text-luxury-deepBlack">PHONG CÁCH</span>
                <svg className="w-4 h-4 text-luxury-steelGrey transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div id="style-filter" className="hidden absolute top-full left-0 mt-1 bg-luxury-silverPearl border border-luxury-metallicSilver rounded-lg shadow-silver-lg z-10 min-w-[200px]">
                <div className="p-3 space-y-2">
                  {STYLES.map(style => (
                    <label key={style} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStyles.includes(style)}
                        onChange={() => toggleStyle(style)}
                        className="w-4 h-4 text-luxury-deepBlack border-luxury-metallicSilver rounded focus:ring-luxury-platinumGrey"
                      />
                      <span className="ml-2 text-sm text-luxury-steelDark">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* PRICE FILTER */}
            <div
              className="relative"
              onMouseLeave={() => {
                const element = document.getElementById('price-filter');
                if (element) {
                  element.classList.add('hidden');
                }
              }}
            >
              <button
                className="flex items-center gap-2 py-3 text-left bg-luxury-silverPearlLight hover:bg-luxury-silverPearlDark px-4 border border-luxury-metallicSilver rounded-lg cursor-pointer"
                onClick={() => document.getElementById('price-filter').classList.toggle('hidden')}
                onMouseEnter={() => {
                  const element = document.getElementById('price-filter');
                  if (element && element.classList.contains('hidden')) {
                    element.classList.remove('hidden');
                  }
                }}
              >
                <span className="text-sm font-medium text-luxury-deepBlack">KHOẢNG GIÁ</span>
                <svg className="w-4 h-4 text-luxury-steelGrey transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div id="price-filter" className="hidden absolute top-full left-0 mt-1 bg-luxury-silverPearl border border-luxury-metallicSilver rounded-lg shadow-silver-lg z-10 min-w-[200px]">
                <div className="p-3 space-y-2">
                  {[
                    { label: 'Dưới 500k', min: 0, max: 500000 },
                    { label: '500k - 1 triệu', min: 500000, max: 1000000 },
                    { label: '1 triệu - 1.5 triệu', min: 1000000, max: 1500000 },
                    { label: '1.5 triệu - 2 triệu', min: 1500000, max: 2000000 }
                  ].map(range => (
                    <label key={range.label} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPriceRange.some(r => r.label === range.label)}
                        onChange={() => togglePriceRange(range)}
                        className="w-4 h-4 text-luxury-deepBlack border-luxury-metallicSilver rounded focus:ring-luxury-platinumGrey"
                      />
                      <span className="ml-2 text-sm text-luxury-steelDark">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SORT OPTIONS */}
            <div
              className="relative"
              onMouseLeave={() => {
                const element = document.getElementById('sort-select');
                if (element) {
                  element.blur();
                }
              }}
            >
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-3 px-4 border border-luxury-metallicSilver rounded-lg text-sm text-luxury-steelDark bg-luxury-silverPearlLight hover:bg-luxury-silverPearlDark focus:outline-none focus:ring-2 focus:ring-luxury-platinumGrey cursor-pointer"
                onMouseEnter={(e) => e.target.focus()}
              >
                <option value="name-asc">Tên: A-Z</option>
                <option value="name-desc">Tên: Z-A</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
              </select>
            </div>
          </div>

          {/* SELECTED FILTERS */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-luxury-steelGrey">Đã chọn:</span>
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-luxury-silverPearlDark text-luxury-steelDark rounded-full text-sm border border-luxury-metallicSilver">
                {cat}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="ml-1 text-luxury-steelGrey hover:text-luxury-deepBlack"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {selectedStyles.map(style => (
              <span key={style} className="inline-flex items-center gap-1 px-3 py-1 bg-luxury-silverPearlDark text-luxury-steelDark rounded-full text-sm border border-luxury-metallicSilver">
                {style}
                <button
                  onClick={() => toggleStyle(style)}
                  className="ml-1 text-luxury-steelGrey hover:text-luxury-deepBlack"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {selectedPriceRange.map(range => (
              <span key={range.label} className="inline-flex items-center gap-1 px-3 py-1 bg-luxury-silverPearlDark text-luxury-steelDark rounded-full text-sm border border-luxury-metallicSilver">
                {range.label}
                <button
                  onClick={() => togglePriceRange(range)}
                  className="ml-1 text-luxury-steelGrey hover:text-luxury-deepBlack"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
            {(selectedCategories.length > 0 || selectedStyles.length > 0 || selectedPriceRange.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-luxury-steelGrey hover:text-luxury-deepBlack underline"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* ---------- PRODUCT LIST ---------- */}
        <div className={
          viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6"
            : "space-y-6"
        }>
          {loading ? (
            <div className="col-span-full text-center">Đang tải sản phẩm...</div>
          ) : (
            currentProducts.map((product) =>
              viewMode === 'grid' ? (
                <ProductCard key={product.id} product={product} />
              ) : (
                <div key={product.id} className="group bg-luxury-silverPearl hover:shadow-silver-xl transition-all duration-500 border border-luxury-metallicSilver flex gap-6">
                  <div className="w-64 h-64 flex-shrink-0 relative overflow-hidden bg-luxury-silverPearlDark">
                    <img
                      src={product.images?.[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-xl font-light text-luxury-deepBlack mb-3 group-hover:text-luxury-steelDark transition">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < product.rating ? 'text-luxury-taupe' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-luxury-steelGrey ml-2">({product.reviews} đánh giá)</span>
                      </div>

                      <p className="text-luxury-steelGrey font-light mb-3">
                        <span className="text-sm">Chất liệu:</span> {product.material}
                      </p>

                      <p className="text-luxury-steelGrey font-light mb-3">
                        <span className="text-sm">Danh mục:</span> {product.category}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        {product.priceSale && product.priceSale < product.price && (
                          <span className="text-luxury-steelGrey line-through text-sm block mb-1">{formatPrice(product.price)}</span>
                        )}
                        <p className="text-luxury-deepBlack font-light text-2xl">{formatPrice(product.priceSale || product.price)}</p>
                      </div>

                      <Link
                        to={`/products/${product.id}`}
                        className="border-2 border-luxury-deepBlack text-luxury-deepBlack px-8 py-3 text-xs font-light tracking-wider hover:bg-luxury-deepBlack hover:text-luxury-silverPearl transition-all duration-300"
                      >
                        XEM CHI TIẾT
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {/* ---------- PAGINATION ---------- */}
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 border ${currentPage === page ? 'bg-luxury-deepBlack text-luxury-silverPearl' : 'border-luxury-metallicSilver text-luxury-steelDark'} hover:bg-luxury-silverPearlDark transition-colors`}
            >
              {page}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Products;
