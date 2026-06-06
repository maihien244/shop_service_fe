import { useState, useMemo, useEffect } from 'react'
import type { CartItem, CreateCartRequest } from '../dto'
import { CartService } from '../serivce/card-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '#/module/auth/context/auth-context'
import { useToast } from '#/lib/toast/use-toast'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const cartService = useMemo(() => new CartService(), [])
  const queryClient = useQueryClient()
  const { auth } = useAuth()
  const { toastSuccess } = useToast()

  const { data } = useQuery({
    queryKey: ['carts'],
    queryFn: () => cartService.getMyCart(),
    enabled: auth.isAuthenticated
  })

  useEffect(() => {
    if (auth.isAuthenticated) {
      if (data?.results) {
        setCartItems(data.results)
      } else {
        setCartItems([])
      }
    } else {
      const localCart = localStorage.getItem('guest_cart')
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart))
        } catch (e) {
          setCartItems([])
        }
      } else {
        setCartItems([])
      }
    }
  }, [auth.isAuthenticated, data])

  // Sync guest cart to server on successful login
  useEffect(() => {
    if (auth.isAuthenticated) {
      const localCartStr = localStorage.getItem('guest_cart')
      if (localCartStr) {
        try {
          const localCart: CartItem[] = JSON.parse(localCartStr)
          if (localCart.length > 0) {
            const syncCart = async () => {
              try {
                for (const item of localCart) {
                  const request: CreateCartRequest = {
                    optionId: item.optionId,
                    quantity: item.quantity
                  }
                  await cartService.addToCart(request)
                }
                localStorage.removeItem('guest_cart')
                await queryClient.invalidateQueries({ queryKey: ['carts'] })
                toastSuccess('Đã đồng bộ giỏ hàng của bạn!')
              } catch (e) {
                console.error('Failed to sync guest cart to server:', e)
              }
            }
            syncCart()
          }
        } catch (e) {
          console.error('Error parsing guest cart:', e)
        }
      }
    }
  }, [auth.isAuthenticated, cartService, queryClient])

  const addToCart = async (
    newItem: {
      optionId: number
      quantity: number
    },
    guestDetails?: {
      laptopId: number
      laptopName: string
      laptopSlug: string
      optionName: string
      price: number
      originalPrice: number
      imageKey: string
      brandName?: string
    }
  ) => {
    if (auth.isAuthenticated) {
      const request: CreateCartRequest = {
        optionId: newItem.optionId,
        quantity: newItem.quantity
      }
      await cartService.addToCart(request)
      await queryClient.invalidateQueries({ queryKey: ['carts'] })
    } else {
      if (!guestDetails) {
        console.error('guestDetails is required for guest cart')
        return
      }
      const localCartStr = localStorage.getItem('guest_cart')
      let localCart: CartItem[] = []
      if (localCartStr) {
        try {
          localCart = JSON.parse(localCartStr)
        } catch (e) {
          localCart = []
        }
      }

      const existingItemIndex = localCart.findIndex(item => item.optionId === newItem.optionId)
      if (existingItemIndex !== -1) {
        localCart[existingItemIndex].quantity += newItem.quantity
        localCart[existingItemIndex].total = localCart[existingItemIndex].price * localCart[existingItemIndex].quantity
      } else {
        const cartItem: CartItem = {
          id: newItem.optionId,
          laptopId: guestDetails.laptopId,
          laptopName: guestDetails.laptopName,
          laptopSlug: guestDetails.laptopSlug,
          optionId: newItem.optionId,
          optionName: guestDetails.optionName,
          price: guestDetails.price,
          originalPrice: guestDetails.originalPrice,
          imageKey: guestDetails.imageKey,
          quantity: newItem.quantity,
          brandName: guestDetails.brandName,
          total: guestDetails.price * newItem.quantity
        }
        localCart.push(cartItem)
      }

      localStorage.setItem('guest_cart', JSON.stringify(localCart))
      setCartItems(localCart)
      toastSuccess('Đã thêm sản phẩm vào giỏ hàng')
    }
  }

  const removeFromCart = async (cartId: number) => {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?`)) {
      if (auth.isAuthenticated) {
        await cartService.deleteCart(cartId)
        await queryClient.invalidateQueries({ queryKey: ['carts'] })
      } else {
        const localCartStr = localStorage.getItem('guest_cart')
        if (localCartStr) {
          try {
            const localCart: CartItem[] = JSON.parse(localCartStr)
            const updatedCart = localCart.filter(item => item.id !== cartId)
            localStorage.setItem('guest_cart', JSON.stringify(updatedCart))
            setCartItems(updatedCart)
          } catch (e) {
            console.error(e)
          }
        }
      }
      toastSuccess('Đã xóa sản phẩm khỏi giỏ hàng')
    }
  }

  const updateQuantity = async (cartId: number, quantity: number) => {
    if (quantity <= 0) {
      if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        await removeFromCart(cartId)
      }
      return
    }

    if (auth.isAuthenticated) {
      await updateQuantityMu.mutateAsync({ cartId, quantity })
    } else {
      const localCartStr = localStorage.getItem('guest_cart')
      if (localCartStr) {
        try {
          const localCart: CartItem[] = JSON.parse(localCartStr)
          const itemIndex = localCart.findIndex(item => item.id === cartId)
          if (itemIndex !== -1) {
            localCart[itemIndex].quantity = quantity
            localCart[itemIndex].total = localCart[itemIndex].price * quantity
            localStorage.setItem('guest_cart', JSON.stringify(localCart))
            setCartItems(localCart)
          }
        } catch (e) {
          console.error(e)
        }
      }
    }
  }

  const updateQuantityMu = useMutation({
    mutationFn: ({ cartId, quantity }: { cartId: number, quantity: number }) => cartService.updateCart(cartId, { quantity }),
    onSuccess: ({ id, quantity }) => {
      const newCart: CartItem[] = cartItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity }
        }
        return item
      })

      setCartItems(newCart)
    }
  })

  const clearCart = async () => {
    if (auth.isAuthenticated) {
      try {
        await Promise.all(cartItems.map(item => cartService.deleteCart(item.id)))
        await queryClient.invalidateQueries({ queryKey: ['carts'] })
      } catch (e) {
        console.error('Failed to clear server cart', e)
      }
    } else {
      localStorage.removeItem('guest_cart')
      setCartItems([])
    }
  }

  const invalidateCarts = () => {
    if (auth.isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['carts'] })
    }
  }

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalOriginalAmount = cartItems.reduce((acc, item) => acc + item.originalPrice * item.quantity, 0)
  const totalDiscount = totalOriginalAmount - totalAmount
  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalOriginalAmount,
    totalDiscount,
    totalItemsCount,
    invalidateCarts
  }
}


