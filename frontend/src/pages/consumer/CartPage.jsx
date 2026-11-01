import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-forest-50 text-forest-700 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-stone-900">Your Farm Cart is Empty</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Add fresh, organically grown crops directly from verified local farmers to support ethical agriculture.
        </p>
        <Link
          to="/marketplace"
          className="px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold inline-block shadow-md transition"
        >
          Explore Produce Catalog
        </Link>
      </div>
    );
  }

  // Group items by farm for transparent multi-farm cart visualization
  const groupedByFarmer = cart.items.reduce((acc, item) => {
    const farmerId = item.farmer?._id || item.farmer || 'unknown';
    const farmName =
      item.farmerProfile?.farmName ||
      item.product?.farmerProfile?.farmName ||
      'Direct Farm';
    if (!acc[farmerId]) {
      acc[farmerId] = {
        name: farmName,
        items: [],
      };
    }
    acc[farmerId].items.push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Shopping Cart</span>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display mt-1">
          Review Direct Farm Order
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Items will be directly packed at the respective farms upon confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items grouped by farmer */}
        <div className="lg:col-span-8 space-y-6">
          {Object.entries(groupedByFarmer).map(([farmerId, group]) => (
            <div
              key={farmerId}
              className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4"
            >
              {/* Farmer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-forest-950 font-display">
                    🚜 {group.name}
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-forest-800 font-bold px-2 py-0.5 rounded-full">
                    Direct Producer
                  </span>
                </div>
                <span className="text-xs text-stone-400">{group.items.length} produce item(s)</span>
              </div>

              {/* Items in this farm */}
              <div className="divide-y divide-stone-100">
                {group.items.map((item) => (
                  <div key={item._id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.product?.images && item.product.images.length > 0
                            ? item.product.images[0]
                            : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.product?.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-stone-200 shrink-0"
                      />
                      <div>
                        <Link
                          to={`/products/${item.product?._id}`}
                          className="font-bold text-stone-900 text-sm hover:text-forest-700 transition"
                        >
                          {item.product?.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                          <span>₹{item.price} / {item.product?.unit || 'kg'}</span>
                          {item.product?.isOrganic && (
                            <span className="badge-organic text-[10px] py-0">Organic</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quantity Control & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-2 hover:bg-stone-200 rounded-l-xl transition"
                        >
                          <Minus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                        <span className="px-3 text-xs font-bold text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxAvailable}
                          className="p-2 hover:bg-stone-200 rounded-r-xl transition disabled:opacity-30"
                        >
                          <Plus className="w-3.5 h-3.5 text-stone-600" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-forest-900 font-display min-w-[70px] text-right">
                        ₹{item.subtotal}
                      </span>

                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-stone-400 hover:text-rose-600 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <Link to="/marketplace" className="text-xs font-bold text-forest-700 hover:underline">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-xs text-stone-400 hover:text-rose-600 font-medium"
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6 sticky top-28">
          <h3 className="font-bold text-stone-900 text-base font-display">Order Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal</span>
              <span className="font-bold text-stone-900">₹{cart.subtotal}</span>
            </div>

            <div className="flex justify-between text-stone-600">
              <span>Direct Farm Logistics</span>
              <span className="font-bold text-stone-900">
                {cart.deliveryFee === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `₹${cart.deliveryFee}`
                )}
              </span>
            </div>

            {cart.subtotal < 500 && (
              <p className="text-[11px] text-stone-400 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                Add <span className="font-bold text-forest-800">₹{500 - cart.subtotal}</span> more to get <strong>Free Delivery</strong>!
              </p>
            )}

            <div className="pt-3 border-t border-stone-100 flex justify-between text-sm">
              <span className="font-bold text-stone-900">Total Payable</span>
              <span className="font-extrabold text-forest-900 text-lg font-display">
                ₹{cart.totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-forest-900/10 flex items-center justify-center gap-2 active:scale-98"
          >
            Proceed to Delivery & Checkout
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 text-[11px] text-stone-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Secure Checkout with Razorpay / COD</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-forest-600 shrink-0" />
              <span>Delivered in sanitized farm boxes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
