import Swal from 'sweetalert2'

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3200,
  timerProgressBar: true,
  didOpen: toast => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})

export function showAddedToCartToast(
  productName: string,
  quantity: number,
  variationLabel?: string | null,
) {
  const label = variationLabel ? `${productName} (${variationLabel})` : productName
  const qtyText = quantity === 1 ? '1 unit' : `${quantity} units`

  Toast.fire({
    icon: 'success',
    title: 'Added to cart',
    text: `${label} · ${qtyText}`,
  })
}

export function showToastError(message: string) {
  Toast.fire({
    icon: 'error',
    title: message,
  })
}

export function showToastSuccess(message: string) {
  Toast.fire({
    icon: 'success',
    title: message,
  })
}
