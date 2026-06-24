<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\WholesaleApplication;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $totalRevenue = Order::where('status', '!=', 'cancelled')->sum('total');
        $totalOrders = Order::count();
        $pendingApplications = WholesaleApplication::where('status', 'pending')->count();
        $activeWholesalers = User::where('role', 'wholesale')->where('approved', true)->count();

        return response()->json([
            'stats' => [
                'totalRevenue' => (float) $totalRevenue,
                'totalOrders' => $totalOrders,
                'pendingApplications' => $pendingApplications,
                'activeWholesalers' => $activeWholesalers,
            ],
        ]);
    }
}
