'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  RefreshCw,
  Plus,
  Users,
  Truck,
  History,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import StockBadge from '@/components/StockBadge';
import { useToast } from '@/components/Toast';
import { DashboardStats } from '@/src/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Sorting states for dashboard tables
  const [lowStockSortKey, setLowStockSortKey] = useState<'name' | 'category_name' | 'supplier' | 'stock_qty'>('stock_qty');
  const [lowStockSortDir, setLowStockSortDir] = useState<'asc' | 'desc'>('asc');

  const [salesSortKey, setSalesSortKey] = useState<'sale_id' | 'customer' | 'sale_date' | 'total_amount'>('sale_date');
  const [salesSortDir, setSalesSortDir] = useState<'asc' | 'desc'>('desc');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch dashboard metrics');
      }
    } catch {
      toast.error('Network error loading dashboard data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const formatCurrency = (val: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  const totalCatSales = stats?.salesByCategory.reduce((acc, curr) => acc + Number(curr.total_sales), 0) || 1;

  const sortedLowStock = useMemo(() => {
    if (!stats?.lowStockItems) return [];
    return [...stats.lowStockItems].sort((a, b) => {
      let aVal: any = a[lowStockSortKey];
      let bVal: any = b[lowStockSortKey];
      if (lowStockSortKey === 'stock_qty') {
        return lowStockSortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      aVal = String(aVal || '').toLowerCase();
      bVal = String(bVal || '').toLowerCase();
      if (aVal < bVal) return lowStockSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return lowStockSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stats?.lowStockItems, lowStockSortKey, lowStockSortDir]);

  const toggleLowStockSort = (key: 'name' | 'category_name' | 'supplier' | 'stock_qty') => {
    if (lowStockSortKey === key) {
      setLowStockSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setLowStockSortKey(key);
      setLowStockSortDir('asc');
    }
  };

  const sortedRecentSales = useMemo(() => {
    if (!stats?.recentSales) return [];
    return [...stats.recentSales].sort((a, b) => {
      if (salesSortKey === 'sale_id' || salesSortKey === 'total_amount') {
        const aVal = Number(a[salesSortKey]);
        const bVal = Number(b[salesSortKey]);
        return salesSortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (salesSortKey === 'sale_date') {
        const aTime = new Date(a.sale_date).getTime();
        const bTime = new Date(b.sale_date).getTime();
        return salesSortDir === 'asc' ? aTime - bTime : bTime - aTime;
      }
      const aVal = String(a.customer || '').toLowerCase();
      const bVal = String(b.customer || '').toLowerCase();
      if (aVal < bVal) return salesSortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return salesSortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [stats?.recentSales, salesSortKey, salesSortDir]);

  const toggleSalesSort = (key: 'sale_id' | 'customer' | 'sale_date' | 'total_amount') => {
    if (salesSortKey === key) {
      setSalesSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSalesSortKey(key);
      setSalesSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme">
            Warehouse Dashboard
          </h1>
          <p className="text-xs text-muted-theme mt-1">
            Real-time inventory levels, recent sales activity, and stock alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary text-xs !py-1.5 cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link href="/purchases/new" className="btn-secondary text-xs !py-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>New Purchase</span>
          </Link>

          <Link href="/sales/new" className="btn-primary text-xs !py-1.5">
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (4 balanced cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Stock Value"
          value={loading ? '-' : formatCurrency(stats?.totalStockValue)}
          icon={<IndianRupee className="w-5 h-5" />}
          subtitle="Inventory valuation"
          variant="info"
        />

        <StatCard
          title="Today's Sales"
          value={loading ? '-' : formatCurrency(stats?.todaySales)}
          icon={<TrendingUp className="w-5 h-5" />}
          subtitle="Today's revenue"
          variant="success"
        />

        <StatCard
          title="Today's Purchases"
          value={loading ? '-' : formatCurrency(stats?.todayPurchases)}
          icon={<ShoppingBag className="w-5 h-5" />}
          subtitle="Today's received orders"
          variant="default"
        />

        <StatCard
          title="Total Products"
          value={loading ? '-' : stats?.totalProducts ?? 0}
          icon={<Package className="w-5 h-5" />}
          subtitle="Active catalog items"
          variant="default"
        />
      </div>

      {/* Stock Health Status / Low Stock Attention Banner */}
      {!loading && stats && (
        stats.lowStockCount > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-theme">
                  {stats.lowStockCount} product{stats.lowStockCount > 1 ? 's require' : ' requires'} attention!
                </span>
                <span className="text-muted-theme ml-1 hidden sm:inline">
                  Stock is currently at or below minimum reorder thresholds.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <a
                href="#low-stock-section"
                className="btn-primary text-xs !py-1 !px-3 shadow-xs"
              >
                Review Items ({stats.lowStockCount})
              </a>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-medium">All inventory items are healthy and above minimum reorder thresholds.</span>
            </div>
            <Link href="/products" className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              View Catalog &rarr;
            </Link>
          </div>
        )
      )}

      {/* Quick Operations Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/sales/new"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-amber-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-amber-500 transition-colors">Record Sale</span>
          <span className="text-[10px] text-muted-theme mt-0.5">Customer order</span>
        </Link>

        <Link
          href="/purchases/new"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-sky-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-sky-500 transition-colors">Purchase Order</span>
          <span className="text-[10px] text-muted-theme mt-0.5">Restock items</span>
        </Link>

        <Link
          href="/products"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-emerald-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-emerald-500 transition-colors">Products</span>
          <span className="text-[10px] text-muted-theme mt-0.5">Catalog & stock</span>
        </Link>

        <Link
          href="/customers"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-indigo-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-indigo-500 transition-colors">Customers</span>
          <span className="text-[10px] text-muted-theme mt-0.5">Directory & CRM</span>
        </Link>

        <Link
          href="/suppliers"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-rose-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-rose-500 transition-colors">Suppliers</span>
          <span className="text-[10px] text-muted-theme mt-0.5">Vendors directory</span>
        </Link>

        <Link
          href="/history"
          className="flex flex-col items-center justify-center p-3 rounded-xl border border-theme bg-surface hover:bg-surface-hover hover:border-purple-500/50 transition-all text-center group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <History className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-theme group-hover:text-purple-500 transition-colors">Order History</span>
          <span className="text-[10px] text-muted-theme mt-0.5">All transactions</span>
        </Link>
      </div>

      {/* Middle Section: Balanced Visual Insights (Recent Sales + Category Revenue Breakdown side by side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Table */}
        <div className="card-theme overflow-hidden flex flex-col">
          <div className="p-4 border-b border-theme flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-theme">Recent Sales Activity</h3>
              <p className="text-xs text-muted-theme mt-0.5">
                Latest customer orders and revenue
              </p>
            </div>

            <Link
              href="/history"
              className="text-xs font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1"
            >
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-theme bg-surface-hover/50 text-xs font-semibold text-muted-theme uppercase tracking-wider">
                  <th
                    onClick={() => toggleSalesSort('sale_id')}
                    className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Order #</span>
                      {salesSortKey === 'sale_id' ? (
                        salesSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSalesSort('customer')}
                    className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Customer</span>
                      {salesSortKey === 'customer' ? (
                        salesSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSalesSort('sale_date')}
                    className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>Date</span>
                      {salesSortKey === 'sale_date' ? (
                        salesSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-2.5">Payment</th>
                  <th
                    onClick={() => toggleSalesSort('total_amount')}
                    className="px-4 py-2.5 text-right cursor-pointer hover:text-theme select-none transition-colors"
                  >
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <span>Amount</span>
                      {salesSortKey === 'total_amount' ? (
                        salesSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-30" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-4 bg-surface-hover rounded w-3/4" />
                      </td>
                    </tr>
                  ))
                ) : sortedRecentSales.length > 0 ? (
                  sortedRecentSales.map((sale) => (
                    <tr key={sale.sale_id} className="hover:bg-surface-hover/60 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-amber-500">
                        #{sale.sale_id}
                      </td>
                      <td className="px-4 py-3 font-medium text-theme text-xs">
                        {sale.customer}
                      </td>
                      <td className="px-4 py-3 text-muted-theme text-xs">
                        {new Date(sale.sale_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-surface-hover text-theme border border-theme">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-theme text-xs">
                        {formatCurrency(sale.total_amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-theme">
                      No sales recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Category Card */}
        <div className="card-theme p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-theme">Revenue by Category</h3>
              <span className="text-[11px] text-muted-theme font-medium">Performance</span>
            </div>
            <p className="text-xs text-muted-theme mb-5">
              Sales distribution across product categories
            </p>

            <div className="space-y-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-1.5">
                    <div className="h-3 bg-surface-hover rounded w-1/2" />
                    <div className="h-2.5 bg-surface-hover rounded w-full" />
                  </div>
                ))
              ) : stats?.salesByCategory && stats.salesByCategory.length > 0 ? (
                stats.salesByCategory.map((cat, idx) => {
                  const percentage = Math.round((Number(cat.total_sales) / totalCatSales) * 100);
                  const colors = [
                    'bg-amber-500',
                    'bg-sky-500',
                    'bg-emerald-500',
                    'bg-indigo-500',
                    'bg-rose-500',
                  ];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={cat.category_name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-theme">{cat.category_name}</span>
                        <span className="font-semibold text-theme">
                          {formatCurrency(cat.total_sales)}{' '}
                          <span className="text-muted-theme font-normal text-[10px]">
                            ({percentage}%)
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-surface-hover overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.max(percentage, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-muted-theme text-center py-6">No category sales recorded yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-theme flex items-center justify-between text-xs text-muted-theme">
            <span>Total Category Revenue</span>
            <span className="font-bold text-theme">{formatCurrency(totalCatSales)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Low Stock & Reorder Watchlist (Full Width) */}
      <div id="low-stock-section" className="card-theme overflow-hidden shadow-xs">
        <div className="p-4 border-b border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-theme">Low Stock &amp; Reorder Watchlist</h3>
              {stats && stats.lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {stats.lowStockCount} {stats.lowStockCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-theme mt-0.5">
              Items requiring procurement to maintain minimum warehouse inventory
            </p>
          </div>

          <Link
            href="/low-stock"
            className="text-xs font-medium text-amber-500 hover:text-amber-400 flex items-center gap-1 self-start sm:self-auto"
          >
            Manage Low Stock <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-theme bg-surface-hover/50 text-xs font-semibold text-muted-theme uppercase tracking-wider">
                <th
                  onClick={() => toggleLowStockSort('name')}
                  className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Product &amp; SKU</span>
                    {lowStockSortKey === 'name' ? (
                      lowStockSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleLowStockSort('category_name')}
                  className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Category</span>
                    {lowStockSortKey === 'category_name' ? (
                      lowStockSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleLowStockSort('supplier')}
                  className="px-4 py-2.5 cursor-pointer hover:text-theme select-none transition-colors"
                >
                  <div className="inline-flex items-center gap-1.5">
                    <span>Primary Supplier</span>
                    {lowStockSortKey === 'supplier' ? (
                      lowStockSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => toggleLowStockSort('stock_qty')}
                  className="px-4 py-2.5 text-center cursor-pointer hover:text-theme select-none transition-colors"
                >
                  <div className="inline-flex items-center gap-1.5 justify-center">
                    <span>Current Stock / Reorder Threshold</span>
                    {lowStockSortKey === 'stock_qty' ? (
                      lowStockSortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-amber-500" /> : <ArrowDown className="w-3 h-3 text-amber-500" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-30" />
                    )}
                  </div>
                </th>
                <th className="px-4 py-2.5 text-right">Procure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 bg-surface-hover rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : sortedLowStock.length > 0 ? (
                sortedLowStock.map((item) => (
                  <tr key={item.product_id} className="hover:bg-surface-hover/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-theme">{item.name}</div>
                      <div className="text-[11px] font-mono text-muted-theme">{item.sku}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-theme text-xs">{item.category_name}</td>
                    <td className="px-4 py-3 text-muted-theme text-xs">{item.supplier}</td>
                    <td className="px-4 py-3 text-center">
                      <StockBadge stockQty={item.stock_qty} reorderLevel={item.reorder_level} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/purchases/new?product_id=${item.product_id}&supplier_id=${item.supplier_id}`}
                        className="btn-primary text-xs !py-1 !px-3"
                      >
                        Restock
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-theme">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span className="font-medium text-theme">All products are healthy!</span>
                      <span>No items are currently below their reorder threshold.</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
