'use client'

import { useEffect, useState } from 'react'
import { type CartItem, getCart, onCartChange } from '@/lib/cart'
import type { Product } from '@/lib/products'
import { getProductsByIdsBrowser } from '@/lib/products.client'

export type CartStatus = 'loading' | 'error' | 'empty' | 'ready'

export interface CartRow {
  product: Product
  qty: number
}

export interface CartViewModel {
  status: CartStatus
  rows: CartRow[]
  error?: string
}

const LOADING_VIEW: CartViewModel = { status: 'loading', rows: [] }

/**
 * Encapsulates the two-phase cart hydration: read items from sessionStorage,
 * then resolve those ids into full `Product` rows via the browser-side
 * Supabase wrapper. Always returns a usable view-model (Special Case Pattern,
 * Cap. 7 §7) so the page just matches on `status`.
 */
export function useCartWithProducts(): CartViewModel {
  const [items, setItems] = useState<CartItem[] | null>(null)
  const [productsById, setProductsById] = useState<Map<string, Product> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate cart items from sessionStorage post-mount; SSR renders the loading state to avoid hydration mismatch
    setItems(getCart())
    const unsubscribe = onCartChange(next => setItems(next))
    return unsubscribe
  }, [])

  useEffect(() => {
    if (items === null) return
    if (items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- empty cart short-circuit; products map mirrors items state
      setProductsById(new Map())
      return
    }

    let cancelled = false
    async function load(productIds: readonly string[]) {
      try {
        const rows = await getProductsByIdsBrowser(productIds)
        if (cancelled) return
        const map = new Map<string, Product>()
        for (const row of rows) map.set(row.id, row)
        setProductsById(map)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Unknown error'
        console.error('Failed to load cart products', { error: err })
        setError(`Failed to load cart products: ${message}`)
      }
    }

    void load(items.map(item => item.product_id))
    return () => {
      cancelled = true
    }
  }, [items])

  if (error !== null) {
    return { status: 'error', rows: [], error }
  }

  if (items === null || productsById === null) {
    return LOADING_VIEW
  }

  const rows: CartRow[] = items
    .map(item => {
      const product = productsById.get(item.product_id)
      return product ? { product, qty: item.qty } : null
    })
    .filter((row): row is CartRow => row !== null)

  if (rows.length === 0) {
    return { status: 'empty', rows: [] }
  }

  return { status: 'ready', rows }
}
