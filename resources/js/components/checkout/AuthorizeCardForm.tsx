import { useEffect, useState } from 'react'

declare global {
  interface Window {
    Accept?: {
      dispatchData: (
        secureData: {
          authData: { clientKey: string; apiLoginID: string }
          cardData: {
            cardNumber: string
            month: string
            year: string
            cardCode: string
            zip?: string
            fullName?: string
          }
        },
        callback: (response: {
          messages: { resultCode: string; message?: { code: string; text: string }[] }
          opaqueData?: { dataDescriptor: string; dataValue: string }
        }) => void,
      ) => void
    }
  }
}

export type AuthorizeOpaqueData = {
  dataDescriptor: string
  dataValue: string
}

export type AuthorizeCardData = {
  cardNumber: string
  expMonth: string
  expYear: string
  cardCode: string
}

export type AuthorizePaymentPayload =
  | { authorizeOpaqueData: AuthorizeOpaqueData }
  | { authorizeCard: AuthorizeCardData }

interface Props {
  apiLoginId: string
  clientKey: string
  sandbox: boolean
  /** When true (sandbox + HTTP), skip Accept.js and send card to the API. */
  directCard?: boolean
  billingZip?: string
  billingName?: string
  onReadyChange?: (ready: boolean) => void
}

const inputClass = 'w-full px-4 py-3 rounded-xl border border-forest-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500/30'
const labelClass = 'block text-xs font-sans font-600 text-forest-700 mb-1.5'

/** Authorize.net creditCard.cardNumber max length is 16 digits (13–16 accepted). */
const AUTHORIZE_CARD_MAX_DIGITS = 16

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, AUTHORIZE_CARD_MAX_DIGITS)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** Accept.js refuses non-HTTPS pages — use server-side sandbox charge instead. */
export function needsAuthorizeDirectCard(sandbox: boolean): boolean {
  if (!sandbox || typeof window === 'undefined') return false
  return window.location.protocol !== 'https:'
}

function loadAcceptJs(sandbox: boolean): Promise<void> {
  const src = sandbox
    ? 'https://jstest.authorize.net/v1/Accept.js'
    : 'https://js.authorize.net/v1/Accept.js'

  const existing = document.querySelector<HTMLScriptElement>(`script[data-authorize-accept="1"]`)
  if (existing) {
    if (window.Accept) return Promise.resolve()
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load Accept.js')))
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.authorizeAccept = '1'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Accept.js'))
    document.body.appendChild(script)
  })
}

export default function AuthorizeCardForm({
  apiLoginId,
  clientKey,
  sandbox,
  directCard = false,
  billingZip = '',
  billingName = '',
  onReadyChange,
}: Props) {
  const useDirect = directCard || needsAuthorizeDirectCard(sandbox)
  const [scriptReady, setScriptReady] = useState(useDirect)
  const [scriptError, setScriptError] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cardCode, setCardCode] = useState('')

  useEffect(() => {
    if (useDirect) {
      setScriptReady(true)
      onReadyChange?.(true)
      return
    }

    let cancelled = false
    loadAcceptJs(sandbox)
      .then(() => {
        if (!cancelled) {
          setScriptReady(true)
          onReadyChange?.(true)
        }
      })
      .catch(err => {
        if (!cancelled) {
          setScriptError(err instanceof Error ? err.message : 'Payment form failed to load')
          onReadyChange?.(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [sandbox, useDirect, onReadyChange])

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-forest-100 bg-cream-50/60 p-4">
      <p className="text-sm font-sans font-600 text-forest-800">Card details</p>
      {scriptError && <p className="text-sm text-terra-600">{scriptError}</p>}
      {!scriptReady && !scriptError && (
        <p className="text-sm text-sage-500">Loading secure card form…</p>
      )}
      <div>
        <label className={labelClass}>Card number</label>
        <input
          className={inputClass}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4111 1111 1111 1111"
          maxLength={19}
          value={cardNumber}
          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
          disabled={!scriptReady}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Month</label>
          <input
            className={inputClass}
            inputMode="numeric"
            autoComplete="cc-exp-month"
            placeholder="MM"
            maxLength={2}
            value={expMonth}
            onChange={e => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
            disabled={!scriptReady}
          />
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            className={inputClass}
            inputMode="numeric"
            autoComplete="cc-exp-year"
            placeholder="YYYY"
            maxLength={4}
            value={expYear}
            onChange={e => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
            disabled={!scriptReady}
          />
        </div>
        <div>
          <label className={labelClass}>CVV</label>
          <input
            className={inputClass}
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            maxLength={4}
            value={cardCode}
            onChange={e => setCardCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            disabled={!scriptReady}
          />
        </div>
      </div>
      {/* <p className="text-xs text-sage-500">
        {useDirect
          ? 'Sandbox local mode: card is charged via Authorize.net API (not for production).'
          : 'Card data is tokenized by Authorize.net and never stored on our servers.'}
        {sandbox ? ' (Sandbox mode)' : ''}
      </p> */}

      <input type="hidden" data-authorize-card="1" data-ready={scriptReady ? '1' : '0'} />
      <AuthorizeCardBridge
        apiLoginId={apiLoginId}
        clientKey={clientKey}
        useDirect={useDirect}
        cardNumber={cardNumber}
        expMonth={expMonth}
        expYear={expYear}
        cardCode={cardCode}
        billingZip={billingZip}
        billingName={billingName}
      />
    </div>
  )
}

function AuthorizeCardBridge(props: {
  apiLoginId: string
  clientKey: string
  useDirect: boolean
  cardNumber: string
  expMonth: string
  expYear: string
  cardCode: string
  billingZip: string
  billingName: string
}) {
  useEffect(() => {
    const collect = (): Promise<AuthorizePaymentPayload> => {
      const number = props.cardNumber.replace(/\s+/g, '')
      if (number.length < 13 || props.expMonth.length < 2 || props.expYear.length < 2 || props.cardCode.length < 3) {
        return Promise.reject(new Error('Please enter a valid card number, expiry, and CVV.'))
      }

      if (props.useDirect) {
        return Promise.resolve({
          authorizeCard: {
            cardNumber: number,
            expMonth: props.expMonth.padStart(2, '0'),
            expYear: props.expYear.length === 2 ? `20${props.expYear}` : props.expYear,
            cardCode: props.cardCode,
          },
        })
      }

      return new Promise((resolve, reject) => {
        if (!window.Accept) {
          reject(new Error('Authorize.net Accept.js is not loaded.'))
          return
        }

        window.Accept.dispatchData(
          {
            authData: {
              clientKey: props.clientKey,
              apiLoginID: props.apiLoginId,
            },
            cardData: {
              cardNumber: number,
              month: props.expMonth.padStart(2, '0'),
              year: props.expYear.length === 2 ? `20${props.expYear}` : props.expYear,
              cardCode: props.cardCode,
              zip: props.billingZip || undefined,
              fullName: props.billingName || undefined,
            },
          },
          response => {
            if (response.messages.resultCode === 'Error') {
              const msg = response.messages.message?.map(m => m.text).join(' ') || 'Card tokenization failed.'
              reject(new Error(msg))
              return
            }
            if (!response.opaqueData?.dataDescriptor || !response.opaqueData?.dataValue) {
              reject(new Error('Card tokenization returned no payment nonce.'))
              return
            }
            resolve({
              authorizeOpaqueData: {
                dataDescriptor: response.opaqueData.dataDescriptor,
                dataValue: response.opaqueData.dataValue,
              },
            })
          },
        )
      })
    }

    ;(window as unknown as { __authorizeCollectPayment?: typeof collect }).__authorizeCollectPayment = collect
    return () => {
      delete (window as unknown as { __authorizeCollectPayment?: typeof collect }).__authorizeCollectPayment
    }
  }, [props])

  return null
}

/** @deprecated use collectAuthorizePayment */
export async function tokenizeAuthorizeCard(): Promise<AuthorizeOpaqueData> {
  const payload = await collectAuthorizePayment()
  if (!('authorizeOpaqueData' in payload)) {
    throw new Error('Direct card mode is active; use collectAuthorizePayment().')
  }
  return payload.authorizeOpaqueData
}

export async function collectAuthorizePayment(): Promise<AuthorizePaymentPayload> {
  const fn = (window as unknown as { __authorizeCollectPayment?: () => Promise<AuthorizePaymentPayload> }).__authorizeCollectPayment
  if (!fn) {
    throw new Error('Card form is not ready. Please wait a moment and try again.')
  }
  return fn()
}
