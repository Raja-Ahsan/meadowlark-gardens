<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use App\Models\WholesaleApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $validOrders = Order::whereNotIn('status', ['cancelled', 'refunded']);

        $totalRevenue = (float) (clone $validOrders)->sum('total');
        $totalOrders = Order::count();
        $pendingApplications = WholesaleApplication::where('status', 'pending')->count();
        $activeWholesalers = User::where('role', 'wholesale')->where('approved', true)->count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalProducts = Product::where('is_active', true)->count();
        $lowStockProducts = Product::where('manage_stock', true)
            ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
            ->where('stock_quantity', '>', 0)
            ->count();
        $outOfStock = Product::where('manage_stock', true)->where('stock_quantity', 0)->count();
        $pendingReviews = Review::where('status', 'pending')->count();

        $revenueThisMonth = (float) (clone $validOrders)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('total');

        $revenueLastMonth = (float) (clone $validOrders)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->sum('total');

        $ordersThisMonth = (clone $validOrders)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $ordersLastMonth = (clone $validOrders)
            ->whereMonth('created_at', now()->subMonth()->month)
            ->whereYear('created_at', now()->subMonth()->year)
            ->count();

        $monthlyRevenue = (clone $validOrders)
            ->where('created_at', '>=', now()->subMonths(11)->startOfMonth())
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month"),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($r) => [
                'month' => $r->month,
                'revenue' => (float) $r->revenue,
                'orders' => (int) $r->orders,
            ]);

        $dailyRevenue = (clone $validOrders)
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as orders')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn ($r) => [
                'date' => $r->date,
                'revenue' => (float) $r->revenue,
                'orders' => (int) $r->orders,
            ]);

        $ordersByStatus = Order::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $ordersByType = Order::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type');

        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select('products.name', DB::raw('SUM(order_items.quantity) as sold'), DB::raw('SUM(order_items.quantity * order_items.unit_price) as revenue'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('sold')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'name' => $r->name,
                'sold' => (int) $r->sold,
                'revenue' => (float) $r->revenue,
            ]);

        $recentOrders = Order::latest()
            ->limit(8)
            ->get()
            ->map(fn ($o) => [
                'id' => (string) $o->id,
                'orderNumber' => $o->order_number,
                'customer' => $o->customer_name ?? $o->business_name ?? 'Guest',
                'type' => $o->type,
                'total' => (float) $o->total,
                'status' => $o->status,
                'createdAt' => $o->created_at->toIso8601String(),
            ]);

        return response()->json([
            'stats' => [
                'totalRevenue' => $totalRevenue,
                'totalOrders' => $totalOrders,
                'pendingApplications' => $pendingApplications,
                'activeWholesalers' => $activeWholesalers,
                'totalCustomers' => $totalCustomers,
                'totalProducts' => $totalProducts,
                'lowStockProducts' => $lowStockProducts,
                'outOfStock' => $outOfStock,
                'pendingReviews' => $pendingReviews,
                'revenueThisMonth' => $revenueThisMonth,
                'revenueLastMonth' => $revenueLastMonth,
                'ordersThisMonth' => $ordersThisMonth,
                'ordersLastMonth' => $ordersLastMonth,
                'monthlyRevenue' => $monthlyRevenue,
                'dailyRevenue' => $dailyRevenue,
                'ordersByStatus' => $ordersByStatus,
                'ordersByType' => $ordersByType,
                'topProducts' => $topProducts,
                'recentOrders' => $recentOrders,
            ],
        ]);
    }

    public function export(Request $request): JsonResponse
    {
        $type = $request->validate(['type' => ['required', 'in:orders,products,customers']])['type'];

        $data = match ($type) {
            'orders' => Order::with('items.product')->latest()->limit(1000)->get()->map(fn ($o) => [
                'order_number' => $o->order_number,
                'customer' => $o->customer_name,
                'email' => $o->customer_email,
                'type' => $o->type,
                'total' => $o->total,
                'status' => $o->status,
                'date' => $o->created_at->format('Y-m-d'),
            ]),
            'products' => Product::all()->map(fn ($p) => [
                'name' => $p->name,
                'sku' => $p->sku,
                'price' => $p->price,
                'stock' => $p->stock_quantity,
                'category' => $p->category,
            ]),
            'customers' => User::whereIn('role', ['customer', 'wholesale'])->get()->map(fn ($u) => [
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'orders' => $u->orders()->count(),
            ]),
        };

        return response()->json(['data' => $data, 'type' => $type]);
    }
}
