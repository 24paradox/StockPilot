'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  PackageX,
  Truck,
} from 'lucide-react';
import DataTable, { Column } from '@/components/DataTable';
import StockBadge from '@/components/StockBadge';
import { useToast } from '@/components/Toast';
import { LowStockProduct } from '@/src/types';

interface LowStockItemWithMeta extends LowStockProduct {
  deficit: number;
}

export default function LowStockPage() {
  const [items, setItems] = useState<LowStockItemWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchLowStock = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/low-stock');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch low stock alerts');
      }
    } catch {
      toast.error('Network error loading low stock products');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLowStock();
  }, [fetchLowStock]);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category_name.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier.toLowerCase().includes(search.toLowerCase())
  );

  const outOfStockCount = items.filter((i) => i.stock_qty <= 0).length;
  const lowStockCount = items.length;

  const columns: Column<LowStockItemWithMeta>[] = [
    {
      header: 'SKU',
      accessorKey: 'sku',
      cell: (item) => (
        <span className="font-mono text-xs font-semibold text-amber-500">
          {item.sku}
        </span>
      ),
    },
    {
      header: 'Product',
      accessorKey: 'name',
      cell: (item) => (
        <div>
          <div className="font-medium text-theme">{item.name}</div>
          <div className="text-[11px] text-muted-theme">{item.category_name}</div>
        </div>
      ),
    },
    {
      header: 'Supplier',
      accessorKey: 'supplier',
      cell: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-theme">
          <Truck className="w-3.5 h-3.5 shrink-0" />
          <span>{item.supplier}</span>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      accessorKey: 'stock_qty',
      align: 'center',
      cell: (item) => (
        <span className={`font-mono text-xs font-bold ${item.stock_qty <= 0 ? 'text-rose-500' : 'text-amber-500'}`}>
          {item.stock_qty}
        </span>
      ),
    },
    {
      header: 'Reorder Level',
      accessorKey: 'reorder_level',
      align: 'center',
      cell: (item) => (
        <span className="font-mono text-xs text-muted-theme">
          {item.reorder_level}
        </span>
      ),
    },
    {
      header: 'Stock Deficit',
      align: 'center',
      sortFn: (a, b) => (a.reorder_level - a.stock_qty) - (b.reorder_level - b.stock_qty),
      cell: (item) => (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-mono font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">
          -{Math.max(1, item.reorder_level - item.stock_qty)} units
        </span>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      sortFn: (a, b) => a.stock_qty - b.stock_qty,
      cell: (item) => (
        <StockBadge stockQty={item.stock_qty} reorderLevel={item.reorder_level} showQty={false} />
      ),
    },
    {
      header: 'Action',
      align: 'right',
      sortable: false,
      cell: (item) => (
        <Link
          href={`/purchases/new?product_id=${item.product_id}&supplier_id=${item.supplier_id || ''}`}
          className="btn-primary text-xs !py-1 !px-3 shadow-xs"
          title={`Generate purchase order for ${item.name}`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Restock</span>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-theme mb-1">
            Low Stock Alerts
          </h1>
          <p className="text-xs text-muted-theme">
            Products that have reached or fallen below their minimum reorder threshold
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLowStock}
            disabled={loading}
            className="btn-secondary text-xs !py-2 cursor-pointer"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-theme p-4 flex items-center justify-between border-amber-500/30">
          <div>
            <span className="text-xs text-muted-theme uppercase font-medium">
              Products Requiring Restock
            </span>
            <div className="text-2xl font-bold text-amber-500 font-mono mt-0.5">
              {loading ? '-' : lowStockCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="card-theme p-4 flex items-center justify-between border-rose-500/30">
          <div>
            <span className="text-xs text-muted-theme uppercase font-medium">
              Critical Shortages (0 Stock)
            </span>
            <div className="text-2xl font-bold text-rose-500 font-mono mt-0.5">
              {loading ? '-' : outOfStockCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <PackageX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filtered}
        isLoading={loading}
        rowKey={(item) => item.product_id}
        searchPlaceholder="Search low stock products by name, SKU, supplier..."
        searchValue={search}
        onSearchChange={setSearch}
        emptyMessage="Warehouse is fully stocked! No products below reorder level."
        emptyAction={
          <Link href="/products" className="btn-secondary text-xs">
            Inspect All Products
          </Link>
        }
      />
    </div>
  );
}
