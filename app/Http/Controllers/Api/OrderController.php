<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\User;
use App\Support\ApiFormatter;
use App\Services\AuditService;
use App\Services\AuthorizeNetService;
use App\Services\EmailService;
use App\Services\PaymentMethodService;
use App\Services\ShippingQuoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function storeRetail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customerName' => ['required', 'string', 'max:255'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'authorizeOpaqueData' => ['nullable', 'array'],
            'authorizeOpaqueData.dataDescriptor' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeOpaqueData.dataValue' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeCard' => ['nullable', 'array'],
            'authorizeCard.cardNumber' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expMonth' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expYear' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.cardCode' => ['required_with:authorizeCard', 'string'],
        ]);

        $account = $this->resolveGuestCustomerAccount(
            $data['customerName'],
            $data['customerEmail'],
            is_array($data['billingAddress'] ?? null) ? ($data['billingAddress']['phone'] ?? null) : null
        );

        $order = $this->createOrder(
            $data,
            'retail',
            $account['user']?->id,
            $data['customerName'],
            $data['customerEmail'],
            false,
            $account['emailVars']
        );

        $payload = [
            'message' => 'Order placed successfully!',
            'order' => ApiFormatter::order($order),
            'accountCreated' => (bool) $account['created'],
            'accountCredentialsSent' => (bool) $account['credentialsSent'],
        ];

        if ($account['user'] && $account['token']) {
            $payload['token'] = $account['token'];
            $payload['user'] = ApiFormatter::user($account['user']);
        }

        return response()->json($payload, 201);
    }

    public function wholesaleIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product'])
            ->where('user_id', $request->user()->id)
            ->where('type', 'wholesale')
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function customerIndex(Request $request): JsonResponse
    {
        $orders = Order::with(['items.product', 'items.variation', 'statusHistories'])
            ->where('user_id', $request->user()->id)
            ->where('type', 'retail')
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders->map(fn ($o) => ApiFormatter::order($o))->values(),
        ]);
    }

    public function storeCustomer(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'customer') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'authorizeOpaqueData' => ['nullable', 'array'],
            'authorizeOpaqueData.dataDescriptor' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeOpaqueData.dataValue' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeCard' => ['nullable', 'array'],
            'authorizeCard.cardNumber' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expMonth' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expYear' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.cardCode' => ['required_with:authorizeCard', 'string'],
        ]);

        $order = $this->createOrder($data, 'retail', $user->id, $user->name, $user->email);

        return response()->json([
            'message' => 'Order placed successfully!',
            'order' => ApiFormatter::order($order),
        ], 201);
    }

    public function storeWholesale(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'paymentMethod' => ['required', 'string', Rule::in(PaymentMethodService::enabledLabels())],
            'couponCode' => ['nullable', 'string'],
            'orderNotes' => ['nullable', 'string'],
            'billingAddress' => ['nullable', 'array'],
            'shippingAddress' => ['nullable', 'array'],
            'shippingMethod' => ['required', 'array'],
            'shippingMethod.carrier' => ['required', 'string', 'max:32'],
            'shippingMethod.code' => ['required', 'string', 'max:32'],
            'shippingMethod.name' => ['required', 'string', 'max:255'],
            'shippingMethod.cost' => ['required', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'exists:products,id'],
            'items.*.variationId' => ['nullable', 'exists:product_variations,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'authorizeOpaqueData' => ['nullable', 'array'],
            'authorizeOpaqueData.dataDescriptor' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeOpaqueData.dataValue' => ['required_with:authorizeOpaqueData', 'string'],
            'authorizeCard' => ['nullable', 'array'],
            'authorizeCard.cardNumber' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expMonth' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.expYear' => ['required_with:authorizeCard', 'string'],
            'authorizeCard.cardCode' => ['required_with:authorizeCard', 'string'],
        ]);

        $order = $this->createOrder(
            $data,
            'wholesale',
            $user->id,
            $user->business_name ?? $user->name,
            $user->email,
            true
        );

        return response()->json([
            'message' => 'Wholesale order placed successfully!',
            'order' => ApiFormatter::order($order),
        ], 201);
    }

    private function createOrder(
        array $data,
        string $type,
        ?int $userId,
        string $customerName,
        string $customerEmail,
        bool $enforceWholesaleMin = false,
        array $extraEmailVars = []
    ): Order {
        return DB::transaction(function () use ($data, $type, $userId, $customerName, $customerEmail, $enforceWholesaleMin, $extraEmailVars) {
            $subtotal = 0;
            $lineItems = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['productId']);

                $variation = null;
                if (! empty($item['variationId'])) {
                    $variation = ProductVariation::where('id', $item['variationId'])
                        ->where('product_id', $product->id)
                        ->firstOrFail();
                }

                if ($variation) {
                    if ($product->manage_stock && $variation->stock_quantity < $item['quantity'] && ! $product->allow_backorder) {
                        abort(422, "{$product->name} ({$variation->sku}) does not have enough stock.");
                    }
                } elseif (! $product->isInStock()) {
                    abort(422, "{$product->name} is out of stock.");
                }

                if ($enforceWholesaleMin && $item['quantity'] < $product->min_wholesale_qty) {
                    abort(422, "Minimum wholesale quantity for {$product->name} is {$product->min_wholesale_qty}.");
                }

                if ($variation) {
                    $unitPrice = $type === 'wholesale'
                        ? (float) ($variation->sale_wholesale_price ?? $variation->wholesale_price ?? $product->getEffectivePrice(true))
                        : (float) ($variation->sale_price ?? $variation->price);
                } else {
                    $unitPrice = $type === 'wholesale'
                        ? $product->getEffectivePrice(true)
                        : $product->getEffectivePrice(false);
                }
                $subtotal += $unitPrice * $item['quantity'];

                $lineItems[] = [
                    'product' => $product,
                    'variation' => $variation,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                ];
            }

            $discount = 0;
            $freeShipping = false;
            $couponCode = $data['couponCode'] ?? null;
            if ($couponCode) {
                $couponRes = app(CouponController::class)->validateCode(new Request([
                    'code' => $couponCode,
                    'cartTotal' => $subtotal,
                    'type' => $type === 'wholesale' ? 'wholesale' : 'retail',
                ]));
                if ($couponRes->getStatusCode() === 200) {
                    $couponData = json_decode($couponRes->getContent(), true);
                    $discount = $couponData['coupon']['discount'] ?? 0;
                    $freeShipping = (bool) ($couponData['coupon']['freeShipping'] ?? false);
                }
            }

            $shipping = app(ShippingQuoteService::class)->resolveShippingCost([
                'shippingAddress' => $data['shippingAddress'] ?? [],
                'items' => $data['items'],
                'subtotal' => $subtotal,
                'type' => $type,
                'freeShipping' => $freeShipping,
                'shippingMethod' => $data['shippingMethod'],
            ]);

            $taxRate = (float) (\App\Models\Setting::get('tax_rate', 9.25));
            $taxable = max(0, $subtotal - $discount);
            $tax = round($taxable * ($taxRate / 100), 2);
            $shippingCost = $shipping['cost'];
            $total = max(0, $subtotal - $discount + $tax + $shippingCost);

            $order = Order::create([
                'order_number' => 'ORD-'.now()->format('Y').'-'.str_pad((string) (Order::count() + 1), 3, '0', STR_PAD_LEFT),
                'user_id' => $userId,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'business_name' => $type === 'wholesale' ? $customerName : null,
                'type' => $type,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'shipping_cost' => $shippingCost,
                'shipping_carrier' => $shipping['carrier'],
                'shipping_method_code' => $shipping['code'],
                'shipping_method_name' => $shipping['name'],
                'total' => $total,
                'coupon_code' => $couponCode,
                'billing_address' => $data['billingAddress'] ?? null,
                'shipping_address' => $data['shippingAddress'] ?? null,
                'order_notes' => $data['orderNotes'] ?? null,
                'status' => 'pending',
                'payment_method' => $data['paymentMethod'],
            ]);

            foreach ($lineItems as $line) {
                $order->items()->create([
                    'product_id' => $line['product']->id,
                    'variation_id' => $line['variation']?->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $line['unit_price'],
                ]);

                if ($line['variation'] && $line['product']->manage_stock) {
                    $line['variation']->decrement('stock_quantity', $line['quantity']);
                } elseif ($line['product']->manage_stock) {
                    $line['product']->decrement('stock_quantity', $line['quantity']);
                    if ($line['product']->fresh()->stock_quantity <= 0) {
                        $line['product']->update(['in_stock' => false]);
                    }
                }
            }

            $order->statusHistories()->create(['status' => 'pending', 'note' => 'Order placed']);

            if (($data['paymentMethod'] ?? '') === PaymentMethodService::LABEL_AUTHORIZE) {
                $authorize = app(AuthorizeNetService::class);
                $opaque = $data['authorizeOpaqueData'] ?? null;
                $card = $data['authorizeCard'] ?? null;
                $hasOpaque = is_array($opaque) && ! empty($opaque['dataDescriptor']) && ! empty($opaque['dataValue']);
                $hasCard = is_array($card) && ! empty($card['cardNumber']) && ! empty($card['expMonth'])
                    && ! empty($card['expYear']) && ! empty($card['cardCode']);

                if ($hasOpaque) {
                    $charge = $authorize->chargeOpaqueData(
                        (float) $order->total,
                        (string) $opaque['dataDescriptor'],
                        (string) $opaque['dataValue'],
                        (string) $order->order_number,
                        $customerEmail
                    );
                } elseif ($hasCard) {
                    if (! $authorize->allowsDirectCard()) {
                        throw ValidationException::withMessages([
                            'payment' => 'Card payments require HTTPS. Use a secure connection or sandbox mode.',
                        ]);
                    }
                    $charge = $authorize->chargeCard(
                        (float) $order->total,
                        $card,
                        (string) $order->order_number,
                        $customerEmail
                    );
                } else {
                    throw ValidationException::withMessages([
                        'authorizeOpaqueData' => 'Card payment details are required for Credit Card checkout.',
                    ]);
                }

                if (! ($charge['success'] ?? false)) {
                    throw ValidationException::withMessages([
                        'payment' => $charge['message'] ?? 'Card payment failed. Please try again.',
                    ]);
                }

                $order->update([
                    'status' => 'paid',
                    'payment_id' => $charge['transId'] ?? null,
                    'paid_at' => now(),
                ]);
                $order->statusHistories()->create([
                    'status' => 'paid',
                    'note' => 'Paid via Authorize.net',
                ]);
            }

            EmailService::sendOrder('order_confirmation', $customerEmail, $order, [
                'name' => $customerName,
                'account_email' => $extraEmailVars['account_email'] ?? null,
                'account_password' => $extraEmailVars['account_password'] ?? null,
                'account_is_new' => (bool) ($extraEmailVars['account_is_new'] ?? false),
                'credentials_sent' => (bool) ($extraEmailVars['credentials_sent'] ?? false),
            ]);

            $adminEmail = \App\Models\Setting::get('site_email', 'admin@meadowlarkgardens.com');
            EmailService::sendOrder('new_order_admin', $adminEmail, $order, [
                'name' => 'Admin',
            ]);

            AuditService::log('order.created', $order, null, ['total' => $order->total], $userId);

            return $order->load(['items.product', 'items.variation', 'user', 'statusHistories']);
        });
    }

    /**
     * Create or attach a customer account for guest retail checkout.
     * Always issues a one-time password + Sanctum token so the shopper is signed in
     * and receives login credentials in the confirmation email.
     *
     * @return array{user: ?User, token: ?string, created: bool, credentialsSent: bool, emailVars: array<string, string>}
     */
    private function resolveGuestCustomerAccount(string $name, string $email, ?string $phone = null): array
    {
        $email = strtolower(trim($email));
        $existing = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if ($existing && $existing->role !== 'customer') {
            // Do not attach admin/wholesale accounts to guest retail orders.
            return [
                'user' => null,
                'token' => null,
                'created' => false,
                'credentialsSent' => false,
                'emailVars' => [
                    'account_credentials' => '',
                    'account_email' => '',
                    'account_password' => '',
                    'account_is_new' => false,
                    'credentials_sent' => false,
                ],
            ];
        }

        $password = Str::password(12);
        $created = false;

        if ($existing) {
            $existing->update([
                'name' => $existing->name ?: $name,
                'phone' => $phone ?: $existing->phone,
                'password' => $password,
            ]);
            $user = $existing->fresh();
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'phone' => $phone,
                'password' => $password,
                'role' => 'customer',
                'approved' => true,
            ]);
            $created = true;
        }

        Order::whereNull('user_id')
            ->where('type', 'retail')
            ->whereRaw('LOWER(customer_email) = ?', [$email])
            ->update(['user_id' => $user->id]);

        $token = $user->createToken('auth')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'created' => $created,
            'credentialsSent' => true,
            'emailVars' => [
                'account_email' => $email,
                'account_password' => $password,
                'account_is_new' => $created,
                'credentials_sent' => true,
            ],
        ];
    }
}
