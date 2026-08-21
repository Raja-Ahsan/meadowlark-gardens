<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\ApiFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\URL;

class InvoiceController extends Controller
{
    public function show(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request, $order);

        return $this->invoiceResponse($order);
    }

    public function packingSlip(Request $request, Order $order): Response
    {
        $this->authorizeOrderAccess($request, $order);

        return $this->packingSlipResponse($order);
    }

    /** Authenticated: return relative signed print URLs (works even if APP_URL is wrong). */
    public function printLinks(Request $request, Order $order): JsonResponse
    {
        $this->authorizeOrderAccess($request, $order);

        return response()->json([
            'invoiceUrl' => URL::temporarySignedRoute(
                'orders.print.invoice',
                now()->addMinutes(30),
                ['order' => $order->id],
                absolute: false,
            ),
            'packingSlipUrl' => URL::temporarySignedRoute(
                'orders.print.packing-slip',
                now()->addMinutes(30),
                ['order' => $order->id],
                absolute: false,
            ),
        ]);
    }

    /** Public signed link — opened in a new tab (no Bearer header needed). */
    public function showSigned(Request $request, Order $order): Response
    {
        return $this->invoiceResponse($order);
    }

    /** Public signed link — opened in a new tab (no Bearer header needed). */
    public function packingSlipSigned(Request $request, Order $order): Response
    {
        return $this->packingSlipResponse($order);
    }

    private function invoiceResponse(Order $order): Response
    {
        $order->load(['items.product', 'items.variation', 'user']);
        $formatted = ApiFormatter::order($order);
        $html = view('invoices.order', ['order' => $order, 'formatted' => $formatted])->render();

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'inline; filename="invoice-'.$order->order_number.'.html"',
        ]);
    }

    private function packingSlipResponse(Order $order): Response
    {
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
