import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductsByCollection } from '../services/productService';
import { getProductImage } from '../utils/helpers';
import HorizontalFilterBar from '../components/HorizontalFilterBar';

const CollectionProducts = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    categories: [],
    priceMin: 0,
    priceMax: 50000000,
    materials: [],
    sort: 'newest'
  });

  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const categoryOptions = [
    { value: 'nhan', label: 'Nhẫn' },
    { value: 'day-chuyen', label: 'Dây chuyền' },
    { value: 'bong-tai', label: 'Bông tai' },
    { value: 'lac-tay', label: 'Lắc tay' }
  ];
  const materialOptions = ['Bạc 925', 'Bạc Ý'];
  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá tăng dần' },
    { value: 'price_desc', label: 'Giá giảm dần' }
  ];

  useEffect(() => {
    console.log('🔥 CollectionProducts LOADED - Horizontal Filter Bar Active! v2.0');
    console.log('📊 Layout: HORIZONTAL (not sidebar)');
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const filterParams = {
          ...(filters.categories.length > 0 && { categories: filters.categories.join(',') }),
          ...(filters.priceMin > 0 && { priceMin: filters.priceMin }),
          ...(filters.priceMax < 50000000 && { priceMax: filters.priceMax }),
          ...(filters.materials.length > 0 && { materials: filters.materials.join(',') }),
          ...(filters.sort && { sort: filters.sort })
        };
        const data = await getProductsByCollection(slug, null, filterParams);
        setProducts(data.products || []);
        setCollection(data.collection || null);
      } catch (err) {
        console.error('Failed to load collection products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug, filters]);

  const handleCategoryToggle = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleMaterialToggle = (material) => {
    setFilters(prev => ({
      ...prev,
      materials: prev.materials.includes(material)
        ? prev.materials.filter(m => m !== material)
        : [...prev.materials, material]
    }));
  };

  const handlePriceChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  const handleSortChange = (value) => {
    setFilters(prev => ({
      ...prev,
      sort: value
    }));
    setShowSortDropdown(false);
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceMin: 0,
      priceMax: 50000000,
      materials: [],
      sort: 'newest'
    });
  };

  const activeFiltersCount =
    filters.categories.length +
    filters.materials.length +
    (filters.priceMin > 0 || filters.priceMax < 50000000 ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-charcoal mx-auto mb-4"></div>
          <p className="text-luxury-brown">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      { }
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-light mb-4 text-gray-900 tracking-wider">
              {collection?.name || 'Bộ sưu tập'}
            </h1>
            <div className="w-16 h-px bg-gray-300 mx-auto mb-4"></div>
            {collection?.description && (
              <p className="text-gray-600 text-sm md:text-base font-light max-w-2xl mx-auto">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>

      { }
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          { }
          <HorizontalFilterBar
            filters={filters}
            categoryOptions={categoryOptions}
            materialOptions={materialOptions}
            sortOptions={sortOptions}
            onCategoryToggle={handleCategoryToggle}
            onMaterialToggle={handleMaterialToggle}
            onPriceChange={handlePriceChange}
            onSortChange={handleSortChange}
            onClearAll={clearAllFilters}
            activeFiltersCount={activeFiltersCount}
          />

          { }
          <div className="mb-6">
            <p className="text-sm text-[#4a4033] font-light">
              Hiển thị <span className="font-semibold">{products.length}</span> sản phẩm
            </p>
          </div>

          { }

          { }
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0b5c5f] mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải sản phẩm...</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm phù hợp</p>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-[#0b5c5f] hover:text-[#094a4d] font-medium text-sm"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-square relative overflow-hidden bg-white mb-3 rounded-lg border border-gray-100">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {product.priceSale && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded">
                        -{Math.round((1 - product.priceSale / product.price) * 100)}%
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm md:text-base font-light text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0b5c5f] transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {product.priceSale ? (
                      <>
                        <span className="text-gray-900 font-semibold text-sm md:text-base">
                          {product.priceSale.toLocaleString('vi-VN')}₫
                        </span>
                        <span className="text-gray-400 line-through text-xs md:text-sm">
                          {product.price.toLocaleString('vi-VN')}₫
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-900 font-semibold text-sm md:text-base">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CollectionProducts;