import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [itemCount, setItemCount] = useState(0);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            // Load from localStorage for guest users
            const savedCart = localStorage.getItem('guestCart');
            if (savedCart) {
                const parsed = JSON.parse(savedCart);
                setCartItems(parsed.items || []);
                setCartTotal(parsed.total || 0);
                setItemCount(parsed.count || 0);
            }
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            const response = await axios.get('/api/cart');
            setCartItems(response.data.items || []);
            setCartTotal(parseFloat(response.data.subtotal) || 0);
            setItemCount(response.data.itemCount || 0);
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        if (!isAuthenticated) {
            // Guest cart - save to localStorage
            const existingItem = cartItems.find(item => item.product_id === productId);
            let newItems;
            if (existingItem) {
                newItems = cartItems.map(item =>
                    item.product_id === productId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                // Need to fetch product details for guest
                try {
                    const response = await axios.get(`/api/products/${productId}`);
                    const product = response.data;
                    newItems = [...cartItems, {
                        _id: productId,
                        quantity,
                        name: product.name,
                        image: product.image,
                        price: product.price,
                        sale_price: product.sale_price,
                        current_price: product.sale_price || product.price
                    }];
                } catch (error) {
                    console.error('Failed to add to cart:', error);
                    return;
                }
            }
            setCartItems(newItems);
            updateGuestCartTotals(newItems);
            setIsCartOpen(true);
            return;
        }

        try {
            await axios.post('/api/cart/add', { productId, quantity });
            await fetchCart();
            setIsCartOpen(true);
        } catch (error) {
            console.error('Failed to add to cart:', error);
            throw error;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (!isAuthenticated) {
            const newItems = cartItems.map(item =>
                item.product_id === productId ? { ...item, quantity } : item
            );
            setCartItems(newItems);
            updateGuestCartTotals(newItems);
            return;
        }

        try {
            await axios.put('/api/cart/update', { productId, quantity });
            await fetchCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    };

    const removeItem = async (productId) => {
        if (!isAuthenticated) {
            const newItems = cartItems.filter(item => item.product_id !== productId);
            setCartItems(newItems);
            updateGuestCartTotals(newItems);
            return;
        }

        try {
            await axios.delete(`/api/cart/remove/${productId}`);
            await fetchCart();
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            setCartTotal(0);
            setItemCount(0);
            localStorage.removeItem('guestCart');
            return;
        }

        try {
            await axios.delete('/api/cart/clear');
            await fetchCart();
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const updateGuestCartTotals = (items) => {
        const total = items.reduce((sum, item) => sum + (item.current_price * item.quantity), 0);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartTotal(total);
        setItemCount(count);
        localStorage.setItem('guestCart', JSON.stringify({
            items,
            total,
            count
        }));
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    return (
        <CartContext.Provider value={{
            cartItems,
            cartTotal,
            itemCount,
            isCartOpen,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            openCart,
            closeCart,
            toggleCart,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
