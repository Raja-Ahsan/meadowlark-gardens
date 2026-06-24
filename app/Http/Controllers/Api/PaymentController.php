<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\AuditService;
use App\Services\PaymentMethodService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaymentController extends Controller
{
    public function config(): JsonResponse
    {
        return response()->json([
            'stripeEnabled' => Setting::get('stripe_enabled') === 'true',
            'stripeKey' => Setting::get('stripe_key'),
            'paypalEnabled' => Setting::get('paypal_enabled') === 'true',
            'paypalClientId' => Setting::get('paypal_client_id'),
            'bankTransferEnabled' => Setting::get('bank_transfer_enabled') === 'true',
            'codEnabled' => Setting::get('cod_enabled') === 'true',
            'methods' => PaymentMethodService::enabledLabels(),
        ]);
    }

    public function createStripeIntent(Request $request): JsonResponse
    {
        if (Setting::get('stripe_enabled') !== 'true') {
            return response()->json(['message' => 'Stripe is not enabled.'], 422);
        }

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.5'],
            'orderId' => ['nullable', 'exists:orders,id'],
        ]);

        $secret = Setting::get('stripe_secret');
        if (! $secret) {
            return response()->json(['message' => 'Stripe is not configured.'], 422);
        }

        $response = Http::withToken($secret)
            ->asForm()
            ->post('https://api.stripe.com/v1/payment_intents', [
                'amount' => (int) round($data['amount'] * 100),
                'currency' => strtolower(Setting::get('currency', 'usd')),
                'automatic_payment_methods[enabled]' => 'true',
            ]);

        if (! $response->successful()) {
            return response()->json(['message' => 'Payment initialization failed.'], 422);
        }

        $intent = $response->json();

        if (! empty($data['orderId'])) {
            Order::where('id', $data['orderId'])->update(['payment_id' => $intent['id']]);
        }

        AuditService::log('stripe.payment_intent_created', null, null, ['intent_id' => $intent['id']]);

        return response()->json([
            'clientSecret' => $intent['client_secret'],
            'paymentIntentId' => $intent['id'],
        ]);
    }

    public function confirmPaypal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'orderId' => ['required', 'exists:orders,id'],
            'paypalOrderId' => ['required', 'string'],
        ]);

        $order = Order::findOrFail($data['orderId']);
        $order->update([
            'payment_id' => $data['paypalOrderId'],
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        AuditService::log('paypal.payment_confirmed', $order);

        return response()->json(['message' => 'Payment confirmed.', 'order' => $order->order_number]);
    }
}
