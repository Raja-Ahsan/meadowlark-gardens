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
        $user = $request->user();

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            abort(403);
        }

        $order->load(['items.product', 'user']);
        $formatted = ApiFormatter::order($order);

        $html = view('invoices.order', ['order' => $order, 'formatted' => $formatted])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html',
            'Content-Disposition' => 'inline; filename="invoice-'.$order->order_number.'.html"',
        ]);
    }
}
