import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  MapPin,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import ProductCard from '../../components/common/ProductCard';

const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters State
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [isOrganic, setIsOrganic] = useState(searchParams.get('organic') === 'true');
  const [qualityGrade, setQualityGrade] = useState(searchParams.get('grade') || '');
  const [stateFilter, setStateFilter] = useState(searchParams.get('state') || '');
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('district') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    setKeyword(searchParams.get('keyword') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setIsOrganic(searchParams.get('organic') === 'true');
    setPage(parseInt(searchParams.get('page'), 10) || 1);
  }, [searchParams]);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort: sortBy,
      };

      if (keyword) params.keyword = keyword;
      if (selectedCategory) params.category = selectedCategory;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (isOrganic) params.organic = true;
      if (qualityGrade) params.qualityGrade = qualityGrade;
      if (stateFilter) params.state = stateFilter;
      if (districtFilter) params.district = districtFilter;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, selectedCategory, isOrganic, qualityGrade, stateFilter, districtFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearAllFilters = () => {
    setKeyword('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setIsOrganic(false);
    setQualityGrade('');
    setStateFilter('');
    setDistrictFilter('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">
          Direct Farm Harvests
        </span>
        <h1 className="text-3xl font-extrabold text-stone-900 mt-1 font-display">
          Agricultural Produce Marketplace
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Browse seasonal vegetables, fruits, staples, and farm-processed goods directly from growers across India.
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search produce name, district, or description..."
            className="w-full bg-stone-50 text-sm pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-forest-600 focus:bg-white"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
        </form>

        {/* Sorting & Filter Trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-stone-50 text-xs font-semibold text-stone-800 py-2.5 px-3 rounded-xl border border-stone-200 focus:outline-none focus:border-forest-600"
            >
              <option value="newest">Newest Harvest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-stone-200/80 shadow-sm space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-forest-700" />
              Filter Catalog
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-forest-700 hover:text-forest-900 font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* Organic Only Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              100% Organic Only
            </span>
            <input
              type="checkbox"
              checked={isOrganic}
              onChange={(e) => {
                setIsOrganic(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-forest-600 rounded border-stone-300 focus:ring-forest-500 cursor-pointer"
            />
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Category
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPage(1);
                }}
                className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition ${
                  !selectedCategory
                    ? 'bg-forest-700 text-white font-bold'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Categories ({total})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left text-xs font-medium px-3 py-2 rounded-xl transition ${
                    selectedCategory === cat.slug || selectedCategory === cat._id
                      ? 'bg-forest-700 text-white font-bold'
                      : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Price Range (₹)
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min ₹"
                className="w-full bg-stone-50 text-xs p-2 rounded-xl border border-stone-200 focus:outline-none"
              />
              <span className="text-stone-400 text-xs">-</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max ₹"
                className="w-full bg-stone-50 text-xs p-2 rounded-xl border border-stone-200 focus:outline-none"
              />
              <button
                onClick={() => {
                  setPage(1);
                  fetchProducts();
                }}
                className="px-3 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Quality Grade */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Quality Grade
            </h4>
            <select
              value={qualityGrade}
              onChange={(e) => {
                setQualityGrade(e.target.value);
                setPage(1);
              }}
              className="w-full bg-stone-50 text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none"
            >
              <option value="">All Quality Grades</option>
              <option value="Grade A (Premium)">Grade A (Premium)</option>
              <option value="Grade B (Standard)">Grade B (Standard)</option>
              <option value="Certified Organic Export">Certified Organic Export</option>
            </select>
          </div>

          {/* Location / District Filter */}
          <div>
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
              Farm Location / District
            </h4>
            <div className="relative">
              <input
                type="text"
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                placeholder="e.g. Pune, Shimla, Mandya"
                className="w-full bg-stone-50 text-xs pl-8 pr-3 py-2.5 rounded-xl border border-stone-200 focus:outline-none"
              />
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-stone-200 p-4 flex flex-col justify-between">
                  <div className="bg-stone-200 rounded-xl aspect-[4/3] w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-stone-200 rounded w-3/4" />
                    <div className="h-3 bg-stone-200 rounded w-1/2" />
                  </div>
                  <div className="h-8 bg-stone-200 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-display">
                No matching produce found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Try loosening your filters, selecting a different category, or checking back later as farmers upload new harvests daily.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-stone-200 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-stone-700 px-4">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2.5 rounded-xl border border-stone-200 text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Marketplace;
