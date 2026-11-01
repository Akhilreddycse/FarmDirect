import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  TrendingUp,
  User,
  Users,
  ShieldCheck,
  FolderTree,
  FileText,
  Home,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isFarmer, isAdmin } = useAuth();

  const farmerLinks = [
    { name: 'Dashboard', path: '/farmer/dashboard', icon: LayoutDashboard },
    { name: 'My Products', path: '/farmer/products', icon: Package },
    { name: 'Add Product', path: '/farmer/products/new', icon: PlusCircle },
    { name: 'Customer Orders', path: '/farmer/orders', icon: ShoppingBag },
    { name: 'Farm Profile', path: '/farmer/profile', icon: User },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users Control', path: '/admin/users', icon: Users },
    { name: 'Farmer Approvals', path: '/admin/farmers', icon: ShieldCheck },
    { name: 'Products Catalog', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Platform Orders', path: '/admin/orders', icon: ShoppingBag },
  ];

  const links = isFarmer ? farmerLinks : isAdmin ? adminLinks : [];

  return (
    <aside className="w-64 bg-white border-r border-stone-200/80 min-h-[calc(100vh-80px)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 py-3 mb-4 bg-stone-50 rounded-2xl border border-stone-200/60">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Portal</p>
          <p className="text-sm font-bold text-stone-800 flex items-center gap-1.5 mt-0.5">
            {isFarmer ? '🚜 Farmer Control Center' : '👨‍💼 Admin Console'}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/farmer/dashboard' || link.path === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-forest-700 text-white shadow-sm shadow-forest-900/10'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-stone-100">
        <NavLink
          to="/marketplace"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-forest-700 hover:bg-forest-50 transition"
        >
          <Home className="w-4 h-4" />
          Back to Marketplace
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
