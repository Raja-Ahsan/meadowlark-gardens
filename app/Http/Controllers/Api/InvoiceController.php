<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ApiFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class InvoiceController extends Controller
{
    public function show(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request, $order);

        $order->load(['items.product', 'items.variation', 'user']);
        $formatted = ApiFormatter::order($order);
        $html = view('invoices.order', ['order' => $order, 'formatted' => $formatted])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="invoice-'.$order->order_number.'.html"',
        ]);
    }

    public function packingSlip(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request, $order);

        $order->load(['items.product', 'items.variation', 'user']);
        $html = view('invoices.packing-slip', ['order' => $order])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="packing-slip-'.$order->order_number.'.html"',
        ]);
    }

    private function authorizeOrderAccess(Request $request, Order $order): void
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            abort(403);
        }
    }
}
