import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Home, XCircle } from 'lucide-react';

const OrderTimeline = ({ status = 'Confirmed', timeline = [] }) => {
  const steps = [
    { label: 'Confirmed', icon: CheckCircle2, desc: 'Order registered directly with farmer' },
    { label: 'Packed', icon: Package, desc: 'Harvested and packed at farm' },
    { label: 'Shipped', icon: Truck, desc: 'Handed to cold-chain delivery' },
    { label: 'Delivered', icon: Home, desc: 'Delivered fresh at your doorstep' },
  ];

  if (status === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-800 text-sm">
        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <span className="font-bold">This order was cancelled.</span>
          <p className="text-xs text-rose-600">Reserved stock was returned to the farmer.</p>
        </div>
      </div>
    );
  }

  const getStepIndex = (st) => {
    switch (st) {
      case 'Pending':
      case 'Confirmed':
        return 0;
      case 'Processing':
      case 'Packed':
        return 1;
      case 'Shipped':
      case 'Out for Delivery':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const currentIdx = getStepIndex(status);

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between max-w-2xl mx-auto">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-0" />
        {/* Active Progress Bar */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-forest-600 -z-0 transition-all duration-500"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={step.label} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? 'bg-forest-700 text-white border-forest-700 shadow-md shadow-forest-900/10'
                    : 'bg-white text-stone-400 border-stone-300'
                } ${isCurrent ? 'ring-4 ring-forest-600/20 scale-110' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`mt-2 text-xs font-semibold ${
                  isDone ? 'text-forest-900' : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
