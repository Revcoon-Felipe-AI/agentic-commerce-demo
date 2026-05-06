/**
 * Cart helpers — sessionStorage-backed.
 *
 * The cart lives in the browser only (no auth, no server persistence).
 * Mutations dispatch a `cart:changed` event so the header badge can react.
 */

/** sessionStorage key shared with the AI SDK tool that confirms intent. */
export const CART_STORAGE_KEY = 'linden_cart_v1'
const CHANGE_EVENT = 'cart:changed'

export type CartItem = { product_id: string; qty: number }

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch (err) {
    // sessionStorage corrupted, parse failed, or storage disabled (private mode).
    // Returning an empty cart is the safe fallback, but we log so the failure
    // shows up in production observability instead of becoming silent data loss.
    console.warn('[cart] failed to read cart from sessionStorage', { err })
    return []
  }
}

export function setCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: items }))
}

export function addToCart(productId: string, qty = 1): CartItem[] {
  const cart = getCart()
  const existing = cart.find(i => i.product_id === productId)
  if (existing) existing.qty += qty
  else cart.push({ product_id: productId, qty })
  setCart(cart)
  return cart
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter(i => i.product_id !== productId)
  setCart(cart)
  return cart
}

export function setQty(productId: string, qty: number): CartItem[] {
  if (qty <= 0) return removeFromCart(productId)
  const cart = getCart()
  const existing = cart.find(i => i.product_id === productId)
  if (existing) existing.qty = qty
  setCart(cart)
  return cart
}

export function clearCart(): void {
  setCart([])
}

export function cartCount(items?: CartItem[]): number {
  return (items ?? getCart()).reduce((sum, item) => sum + item.qty, 0)
}

/** Subscribe to cart changes. Returns unsubscribe function. */
export function onCartChange(handler: (items: CartItem[]) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const listener = (e: Event) => handler((e as CustomEvent<CartItem[]>).detail)
  window.addEventListener(CHANGE_EVENT, listener)
  return () => window.removeEventListener(CHANGE_EVENT, listener)
}
