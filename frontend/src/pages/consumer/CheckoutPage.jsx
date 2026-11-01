import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Plus,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { addToast } = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(false);

  // New Address Modal State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    houseBuilding: '',
    street: '',
    villageCity: '',
    district: '',
    state: 'Maharashtra',
    pincode: '',
    landmark: '',
    addressType: 'Home',
    isDefault: true,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/addresses');
        if (res.data.success) {
          setAddresses(res.data.addresses);
          const defaultAddr = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
          if (defaultAddr) setSelectedAddressId(defaultAddr._id);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddresses();
  }, []);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-900">Your cart is empty</h2>
        <Link to="/marketplace" className="px-6 py-2.5 bg-forest-700 text-white rounded-xl text-xs font-bold inline-block">
          Explore Marketplace
        </Link>
      </div>
    );
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/addresses', newAddress);
      if (res.data.success) {
        addToast('Delivery address saved!', 'success');
        setAddresses([res.data.address, ...addresses]);
        setSelectedAddressId(res.data.address._id);
        setShowAddressForm(false);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save address', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);
    if (!selectedAddr) {
      addToast('Please select or add a delivery address', 'error');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order on backend (automatically validates stock & splits per farmer)
      const orderRes = await api.post('/orders', {
        shippingAddress: selectedAddr,
        paymentMethod,
      });

      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to place order');
      }

      const order = orderRes.data.order;

      // 2. If Online payment selected, initiate payment verification
      if (paymentMethod === 'ONLINE') {
        const payRes = await api.post('/payments/create-order', {
          amount: order.totalAmount,
          orderId: order._id,
        });

        if (payRes.data.success) {
          // Verify payment transaction
          await api.post('/payments/verify', {
            orderId: order._id,
            razorpayOrderId: payRes.data.razorpayOrderId,
            razorpayPaymentId: `sim_pay_${Date.now()}`,
            razorpaySignature: 'sim_sig_verified',
            paymentMethod: 'ONLINE',
          });
        }
      }

      await refreshCart();
      addToast('Order placed successfully directly with the farmers! 🌾', 'success');
      navigate(`/orders/${order._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || err.message || 'Order failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-forest-700">Checkout</span>
        <h1 className="text-3xl font-extrabold text-stone-900 font-display mt-1">
          Delivery & Payment
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Addresses & Payment method selection */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Address Section */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-stone-900 text-base font-display flex items-center gap-2">
                <MapPin className="w-5 h-5 text-forest-700" />
                1. Select Delivery Address
              </h3>
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </button>
            </div>

            {/* Address Form Dropdown */}
            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold text-stone-900">Add New Delivery Location</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Recipient Full Name"
                    value={newAddress.fullName}
                    onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Flat / House / Building"
                    value={newAddress.houseBuilding}
                    onChange={(e) => setNewAddress({ ...newAddress, houseBuilding: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Street / Road"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City / Village"
                    value={newAddress.villageCity}
                    onChange={(e) => setNewAddress({ ...newAddress, villageCity: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="District"
                    value={newAddress.district}
                    onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="PIN Code"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    className="bg-white p-2.5 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-forest-700 text-white rounded-xl text-xs font-bold"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* Address Cards Selection */}
            {addresses.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800">
                Please add a delivery address to complete your order.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <label
                    key={addr._id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                      selectedAddressId === addr._id
                        ? 'border-forest-600 bg-forest-50/40 ring-2 ring-forest-600/10'
                        : 'border-stone-200 bg-stone-50 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900">{addr.fullName}</span>
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="text-forest-600 focus:ring-forest-500"
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1">
                        {addr.houseBuilding}, {addr.street}, {addr.villageCity}, {addr.district}, {addr.state} - {addr.pincode}
                      </p>
                    </div>
                    <span className="text-[10px] text-stone-400 font-semibold mt-2">
                      📞 {addr.phone}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-display flex items-center gap-2 pb-3 border-b border-stone-100">
              <CreditCard className="w-5 h-5 text-forest-700" />
              2. Select Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'ONLINE'
                    ? 'border-forest-600 bg-forest-50/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="ONLINE"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 text-forest-600 focus:ring-forest-500"
                />
                <div>
                  <span className="font-bold text-xs text-stone-900 block">
                    Online Payment (UPI, Cards, NetBanking)
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Instant zero-touch payment via Razorpay / Secured gateway
                  </span>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  paymentMethod === 'COD'
                    ? 'border-forest-600 bg-forest-50/40'
                    : 'border-stone-200 bg-stone-50 hover:bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-forest-600 focus:ring-forest-500"
                />
                <div>
                  <span className="font-bold text-xs text-stone-900 block">
                    Cash on Delivery (COD)
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5 block">
                    Pay in cash directly upon receiving your farm box
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Preview Summary */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6 sticky top-28">
          <h3 className="font-bold text-stone-900 text-base font-display">Items in Farm Order</h3>

          <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 pr-1 text-xs">
            {cart.items.map((item) => (
              <div key={item._id} className="py-2.5 flex items-center justify-between gap-2">
                <div className="truncate">
                  <p className="font-bold text-stone-800 truncate">{item.product?.name}</p>
                  <p className="text-[11px] text-stone-400">
                    {item.quantity} × ₹{item.price}
                  </p>
                </div>
                <span className="font-bold text-stone-900 shrink-0">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Items Total</span>
              <span className="font-bold text-stone-900">₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Charges</span>
              <span className="font-bold text-stone-900">
                {cart.deliveryFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${cart.deliveryFee}`}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-100 flex justify-between text-sm">
              <span className="font-bold text-stone-900">Final Amount</span>
              <span className="font-extrabold text-forest-900 text-lg font-display">
                ₹{cart.totalAmount}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || addresses.length === 0}
            className="w-full py-4 bg-forest-700 hover:bg-forest-800 text-white rounded-2xl text-xs font-bold transition shadow-md shadow-forest-900/10 flex items-center justify-center gap-2 disabled:opacity-40 active:scale-98"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Confirm & Place Order (₹{cart.totalAmount})
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
