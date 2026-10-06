<?php

namespace App\Exports;

use App\Models\Order;
use App\Models\OrderItem;
use Generator;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromGenerator;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

/**
 * One spreadsheet row per order line item (shipment-friendly).
 *
 * @implements WithMapping<array<string, mixed>>
 */
class ShipmentOrdersExport implements FromGenerator, WithHeadings, WithMapping, WithColumnFormatting, ShouldAutoSize, WithStyles, WithEvents
{
    public function __construct(
        private readonly Builder $ordersQuery,
    ) {}

    public function generator(): Generator
    {
        $query = (clone $this->ordersQuery)
            ->with(['items.product', 'items.variation']);

        foreach ($query->lazy(200) as $order) {
            /** @var Order $order */
            $items = $order->items;
            if ($items->isEmpty()) {
                yield $this->buildRow($order, null);
                continue;
            }

            foreach ($items as $item) {
                yield $this->buildRow($order, $item);
            }
        }
    }

    public function headings(): array
    {
        return [
            'Order Number',
            'Order Date',
            'Customer First Name',
            'Customer Last Name',
            'Customer Email',
            'Customer Phone',
            'Shipping Address Line 1',
            'Shipping Address Line 2',
            'Shipping City',
            'Shipping State',
            'Shipping Postal Code',
            'Shipping Country',
            'Billing Address Line 1',
            'Billing Address Line 2',
            'Billing City',
            'Billing State',
            'Billing Postal Code',
            'Billing Country',
            'Product Name',
            'SKU',
            'Quantity',
            'Unit Price',
            'Order Total',
            'Payment Status',
            'Order Status',
            'Order Type',
            'Payment Method',
        ];
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, mixed>
     */
    public function map($row): array
    {
        return [
            $row['order_number'],
            $row['order_date'],
            $row['first_name'],
            $row['last_name'],
            $row['email'],
            $row['phone'],
            $row['ship_line1'],
            $row['ship_line2'],
            $row['ship_city'],
            $row['ship_state'],
            $row['ship_postal'],
            $row['ship_country'],
            $row['bill_line1'],
            $row['bill_line2'],
            $row['bill_city'],
            $row['bill_state'],
            $row['bill_postal'],
            $row['bill_country'],
            $row['product_name'],
            $row['sku'],
            $row['quantity'],
            $row['unit_price'],
            $row['order_total'],
            $row['payment_status'],
            $row['order_status'],
            $row['order_type'],
            $row['payment_method'],
        ];
    }

    public function columnFormats(): array
    {
        return [
            'F' => NumberFormat::FORMAT_TEXT,
            'K' => NumberFormat::FORMAT_TEXT,
            'Q' => NumberFormat::FORMAT_TEXT,
            'T' => NumberFormat::FORMAT_TEXT,
            'V' => NumberFormat::FORMAT_NUMBER_00,
            'W' => NumberFormat::FORMAT_NUMBER_00,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        $sheet->freezePane('A2');

        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highest = (int) $sheet->getHighestRow();
                if ($highest < 2) {
                    return;
                }

                // Force ZIP / phone / SKU cells as explicit strings (preserve leading zeros).
                foreach (['F', 'K', 'Q', 'T'] as $col) {
                    for ($row = 2; $row <= $highest; $row++) {
                        $cell = $sheet->getCell("{$col}{$row}");
                        $value = (string) $cell->getValue();
                        $cell->setValueExplicit($value, DataType::TYPE_STRING);
                    }
                }
            },
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function buildRow(Order $order, ?OrderItem $item): array
    {
        $shipping = is_array($order->shipping_address) ? $order->shipping_address : [];
        $billing = is_array($order->billing_address) ? $order->billing_address : [];

        [$first, $last] = $this->splitName($order, $billing, $shipping);
        $phone = $this->str($shipping['phone'] ?? $billing['phone'] ?? '');

        $productName = '';
        $sku = '';
        $qty = '';
        $unitPrice = '';

        if ($item) {
            $productName = (string) ($item->product?->name ?? 'Product');
            if ($item->variation) {
                $attrs = $item->variation->attribute_values ?? [];
                if (is_array($attrs) && $attrs !== []) {
                    $parts = [];
                    foreach ($attrs as $key => $value) {
                        $parts[] = is_string($key) ? "{$key}: {$value}" : (string) $value;
                    }
                    if ($parts !== []) {
                        $productName .= ' ('.implode(', ', $parts).')';
                    }
                }
            }
            $sku = (string) ($item->variation?->sku ?: $item->product?->sku ?: '');
            $qty = (int) $item->quantity;
            $unitPrice = round((float) $item->unit_price, 2);
        }

        return [
            'order_number' => (string) $order->order_number,
            'order_date' => optional($order->created_at)->format('Y-m-d') ?: '',
            'first_name' => $first,
            'last_name' => $last,
            'email' => (string) ($order->customer_email ?: ($billing['email'] ?? '')),
            'phone' => $phone,
            'ship_line1' => $this->str($shipping['addressLine1'] ?? $shipping['address_line1'] ?? ''),
            'ship_line2' => $this->str($shipping['addressLine2'] ?? $shipping['address_line2'] ?? ''),
            'ship_city' => $this->str($shipping['city'] ?? ''),
            'ship_state' => $this->str($shipping['state'] ?? ''),
            'ship_postal' => $this->str($shipping['postalCode'] ?? $shipping['postal_code'] ?? ''),
            'ship_country' => $this->str($shipping['country'] ?? 'US') ?: 'US',
            'bill_line1' => $this->str($billing['addressLine1'] ?? $billing['address_line1'] ?? ''),
            'bill_line2' => $this->str($billing['addressLine2'] ?? $billing['address_line2'] ?? ''),
            'bill_city' => $this->str($billing['city'] ?? ''),
            'bill_state' => $this->str($billing['state'] ?? ''),
            'bill_postal' => $this->str($billing['postalCode'] ?? $billing['postal_code'] ?? ''),
            'bill_country' => $this->str($billing['country'] ?? 'US') ?: 'US',
            'product_name' => $productName,
            'sku' => $sku,
            'quantity' => $qty,
            'unit_price' => $unitPrice,
            'order_total' => round((float) $order->total, 2),
            'payment_status' => $this->paymentStatus($order),
            'order_status' => (string) $order->status,
            'order_type' => (string) $order->type,
            'payment_method' => (string) ($order->payment_method ?? ''),
        ];
    }

    /**
     * @param  array<string, mixed>  $billing
     * @param  array<string, mixed>  $shipping
     * @return array{0: string, 1: string}
     */
    private function splitName(Order $order, array $billing, array $shipping): array
    {
        $first = $this->str($billing['firstName'] ?? $shipping['firstName'] ?? '');
        $last = $this->str($billing['lastName'] ?? $shipping['lastName'] ?? '');

        if ($first === '' && $last === '') {
            $full = trim((string) ($order->customer_name ?? ''));
            if ($full !== '') {
                $parts = preg_split('/\s+/', $full, 2) ?: [];
                $first = $parts[0] ?? '';
                $last = $parts[1] ?? '';
            }
        }

        return [$first, $last];
    }

    private function paymentStatus(Order $order): string
    {
        if ($order->status === 'refunded') {
            return 'Refunded';
        }
        if ($order->status === 'cancelled') {
            return 'Cancelled';
        }
        if ($order->paid_at || in_array($order->status, [
            'paid', 'processing', 'packed', 'shipped', 'delivered', 'completed',
        ], true)) {
            return 'Paid';
        }

        return 'Unpaid';
    }

    private function str(mixed $value): string
    {
        if ($value === null) {
            return '';
        }

        return trim((string) $value);
    }
}
