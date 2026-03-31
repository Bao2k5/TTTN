import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  loading: false,

  addToCart: (product, qty = 1) => {
    const { items } = get();
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        ),
      });
    } else {
      set({ items: [...items, { ...product, quantity: qty }] });
    }
  },

  removeFromCart: (productId) => {
    const { items } = get();
    set({ items: items.filter(item => item.id !== productId) });
  },

  updateQuantity: (productId, qty) => {
    const { items } = get();
    set({
      items: items.map(item =>
        item.id === productId ? { ...item, quantity: qty } : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getCartCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },

  getCartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));

export default useCartStore;
