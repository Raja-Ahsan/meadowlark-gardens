<?php

namespace App\Services;

use App\Exceptions\UpsShipmentException;
use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderUpsFulfillmentService
{
    public function __construct(private UpsShipmentService $shipments) {}

    public function triggerStatus(): string
    {
        return strtolower((string) config('ups.shipment_trigger_status', 'shipped'));
    }

    public function shouldCreateShipment(Order $order, string $newStatus): bool
    {
        if (strtolower($newStatus) !== $this->triggerStatus()) {
            return false;
        }

        if (strtolower((string) $order->shipping_carrier) !== 'ups') {
            return false;
        }

        if ($this->hasUpsShipment($order)) {
            return false;
        }

        return true;
    }

    public function hasUpsShipment(Order $order): bool
    {
        return filled($order->ups_shipment_created_at)
            || filled($order->ups_shipment_id)
            || (filled($order->tracking_number) && strtolower((string) $order->shipping_carrier) === 'ups');
    }

    /**
     * Create UPS shipment if needed for the status transition.
     * Returns shipment details when created, null when skipped (not UPS / already shipped / wrong status).
     *
     * @return array<string, mixed>|null
     */
    public function createShipmentIfNeeded(Order $order, string $newStatus): ?array
    {
        if (! $this->shouldCreateShipment($order, $newStatus)) {
            return null;
        }

        $this->assertEligible($order);

        $lock = Cache::lock('ups.shipment.order.'.$order->id, 90);

        if (! $lock->get()) {
            throw new UpsShipmentException(
                'Could not acquire shipment lock',
                'A UPS shipment is already being created for this order. Please wait and refresh.',
            );
        }

        try {
            $fresh = Order::query()->findOrFail($order->id);
            if ($this->hasUpsShipment($fresh)) {
                Log::info('UPS shipment skipped — already exists', [
                    'order_id' => $fresh->id,
                    'tracking_number' => $fresh->tracking_number,
                ]);

                return null;
            }

            $result = $this->shipments->createShipmentForOrder($fresh);

            DB::transaction(function () use ($fresh, $result) {
                $locked = Order::query()->lockForUpdate()->findOrFail($fresh->id);
                if ($this->hasUpsShipment($locked)) {
                    return;
                }

                $locked->update([
                    'tracking_number' => $result['trackingNumber'],
                    'ups_shipment_id' => $result['shipmentId'],
                    'ups_label_path' => $result['labelPath'],
                    'ups_shipment_environment' => $result['environment'],
                    'ups_shipment_created_at' => now(),
                ]);
            });

            return $result;
        } finally {
            $lock->release();
        }
    }

    public function assertEligible(Order $order): void
    {
        if (in_array(strtolower((string) $order->status), ['cancelled', 'refunded'], true)) {
            throw new UpsShipmentException(
                'Order not eligible',
                'Cannot create a UPS shipment for a cancelled or refunded order.',
            );
        }

        $paid = filled($order->paid_at)
            || filled($order->payment_id)
            || in_array(strtolower((string) $order->status), ['paid', 'processing', 'packed'], true);

        if (! $paid) {
            throw new UpsShipmentException(
                'Order not paid',
                'Cannot create a UPS shipment until the order is paid.',
            );
        }

        if (empty($order->shipping_address) || ! is_array($order->shipping_address)) {
            throw new UpsShipmentException(
                'Missing shipping address',
                'Order is missing a shipping address.',
            );
        }

        if (strtolower((string) $order->shipping_carrier) !== 'ups' || ! filled($order->shipping_method_code)) {
            throw new UpsShipmentException(
                'Not a UPS order',
                'This order does not have a UPS shipping method from checkout.',
            );
        }
    }
}
