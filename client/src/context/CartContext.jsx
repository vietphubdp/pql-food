import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "pql_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const count = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  function addItem(product, qty = 1) {
    setItems((prev) => {
      const id = product._id;
      const existing = prev.find((p) => p.productId === id);
      const price = product.price;
      const image = (product.images && product.images[0]) || "";
      if (existing) {
        return prev.map((p) =>
          p.productId === id
            ? { ...p, quantity: p.quantity + qty }
            : p
        );
      }
      return [
        ...prev,
        {
          productId: id,
          slug: product.slug,
          name: product.name,
          price,
          image,
          quantity: qty,
        },
      ];
    });
  }

  function setQuantity(productId, quantity) {
    if (quantity < 1) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((p) => (p.productId === productId ? { ...p, quantity } : p))
    );
  }

  function removeItem(productId) {
    setItems((prev) => prev.filter((p) => p.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const value = {
    items,
    count,
    subtotal,
    addItem,
    setQuantity,
    removeItem,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart outside provider");
  return ctx;
}
