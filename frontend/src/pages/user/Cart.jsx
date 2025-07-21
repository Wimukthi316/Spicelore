import { useState, useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import cartService from "../../services/cartService";
import paymentService from "../../services/paymentService";

// Initialize Stripe with the provided test key
const stripePromise = loadStripe('pk_test_51RnNfCC0Ox8VLSE6FRgqoCAJfFLxZ2vvkYr9AODZJJfz4KO7c4UtSUDm1vc4EnQnymiKUKENr7Jaz1yTWT3LKpoP00T6Swfq09');

const CheckoutForm = ({ cart, onPaymentSuccess, onPaymentError, isProcessing, setIsProcessing }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
    });

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        try {
            // Create payment intent
            const intentResponse = await paymentService.createPaymentIntent();
            const { clientSecret, paymentIntentId } = intentResponse.data;

            // Confirm payment
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        address: {
                            line1: shippingAddress.street,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            postal_code: shippingAddress.zipCode,
                            country: shippingAddress.country,
                        },
                    },
                },
            });

            if (result.error) {
                onPaymentError(result.error.message);
            } else {
                // Payment succeeded, confirm with backend
                await paymentService.confirmPayment(paymentIntentId, shippingAddress);
                onPaymentSuccess();
            }
        } catch (error) {
            onPaymentError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] md:col-span-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Street Address"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108] md:col-span-2"
                        required
                    />
                    <input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                        required
                    />
                    <input
                        type="text"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                        required
                    />
                    <input
                        type="text"
                        placeholder="ZIP Code"
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({...shippingAddress, zipCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                        required
                    />
                </div>
            </div>

            {/* Payment Information */}
            <div>
                <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
                <div className="p-4 border border-gray-300 rounded-lg">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                            hidePostalCode: true, // This hides the ZIP field since we collect it above
                        }}
                    />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Your billing address will be the same as your shipping address above.
                </p>
            </div>

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className={`w-full py-3 rounded-lg font-semibold ${
                    isProcessing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#351108] hover:bg-[#2a0c06] text-white'
                } transition-colors`}
            >
                {isProcessing ? 'Processing...' : `Pay $${(cart.totalAmount + 5).toFixed(2)}`}
            </button>
        </form>
    );
};

const Cart = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        
        const fetchCartData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                setIsLoading(true);
                const response = await cartService.getCart();
                setCart(response.data);
                setError('');
            } catch (err) {
                setError(err.message || 'Failed to load cart');
                if (err.message.includes('Authentication')) {
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCartData();
    }, [navigate]);

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            setIsLoading(true);
            const response = await cartService.getCart();
            setCart(response.data);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to load cart');
            if (err.message.includes('Authentication')) {
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = async (productId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            const response = await cartService.updateCartItem(productId, newQuantity);
            setCart(response.data);
        } catch (err) {
            alert(err.message || 'Failed to update quantity');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const response = await cartService.removeFromCart(productId);
            setCart(response.data);
        } catch (err) {
            alert(err.message || 'Failed to remove item');
        }
    };

    const handlePaymentSuccess = () => {
        alert('Payment successful! Thank you for your purchase.');
        setShowPaymentForm(false);
        fetchCart(); // Refresh cart (should be empty now)
        navigate('/'); // Redirect to home
    };

    const handlePaymentError = (errorMessage) => {
        alert(`Payment failed: ${errorMessage}`);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#351108]"></div>
                    <span className="ml-2 text-gray-600">Loading cart...</span>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-600 text-lg mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-[#351108] text-white px-6 py-2 rounded-lg hover:bg-[#2a0c06]"
                        >
                            Go to Shop
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const shippingCost = 5.00;
    const totalAmount = cart?.totalAmount || 0;
    const finalAmount = totalAmount + shippingCost;

    return (
        <>
            <Navbar />

            {/* Cart Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl sm:text-5xl font-bold text-[#351108] mb-8">Your Cart</h1>

                {!cart || cart.items.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                        <button
                            onClick={() => navigate('/shop')}
                            className="bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-[#2a0c06] transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items List */}
                        <div className="lg:col-span-2">
                            {cart.items.map((item) => (
                                <div key={item.product._id} className="bg-white shadow-lg rounded-lg p-6 mb-6 flex flex-col sm:flex-row items-center justify-between">
                                    {/* Product Image */}
                                    <img
                                        src={item.product.images && item.product.images[0] ? item.product.images[0].url : '/src/assets/turmeric.jpg'}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0"
                                    />

                                    {/* Product Details */}
                                    <div className="flex-1 sm:ml-6">
                                        <h3 className="text-xl font-bold text-[#351108]">{item.product.name}</h3>
                                        <p className="text-gray-600">${item.price.toFixed(2)} per {item.product.unit}</p>
                                        <p className="text-sm text-gray-500">Stock: {item.product.stock} {item.product.unit}</p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center mt-4 sm:mt-0">
                                        <button
                                            className="bg-gray-200 text-[#351108] px-3 py-1 rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                            disabled={item.quantity === 1}
                                        >
                                            -
                                        </button>
                                        <span className="mx-4 text-lg font-semibold">{item.quantity}</span>
                                        <button
                                            className="bg-gray-200 text-[#351108] px-3 py-1 rounded-lg hover:bg-gray-300 transition-all cursor-pointer"
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                            disabled={item.quantity >= item.product.stock}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        className="text-red-600 hover:text-red-800 mt-4 sm:mt-0 sm:ml-6 cursor-pointer"
                                        onClick={() => handleRemoveItem(item.product._id)}
                                    >
                                        <MdDelete className="w-6 h-6" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="bg-white shadow-lg rounded-lg p-6 h-fit">
                            <h2 className="text-2xl font-bold text-[#351108] mb-6">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-2 mb-4">
                                {cart.items.map((item) => (
                                    <div key={item.product._id} className="flex justify-between text-sm">
                                        <span>{item.product.name} x {item.quantity}</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Subtotal */}
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                            </div>

                            {/* Shipping */}
                            <div className="flex justify-between mb-4">
                                <span className="text-gray-600">Shipping</span>
                                <span className="font-semibold">${shippingCost.toFixed(2)}</span>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between mb-6 text-lg">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-[#351108]">${finalAmount.toFixed(2)}</span>
                            </div>

                            {/* Checkout Button */}
                            <button
                                className="w-full bg-[#351108] text-white px-6 py-3 rounded-lg hover:bg-[#2a0c06] transition-all cursor-pointer"
                                onClick={() => setShowPaymentForm(true)}
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Stripe Payment Form Modal */}
            {showPaymentForm && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <h2 className="text-2xl font-bold text-[#351108]">Complete Your Purchase</h2>
                        </div>
                        
                        <div className="p-6">
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    cart={cart}
                                    onPaymentSuccess={handlePaymentSuccess}
                                    onPaymentError={handlePaymentError}
                                    isProcessing={isProcessing}
                                    setIsProcessing={setIsProcessing}
                                />
                            </Elements>
                        </div>

                        <div className="p-6 border-t">
                            <button
                                className="w-full text-[#351108] hover:text-[#2a0c06] font-medium"
                                onClick={() => setShowPaymentForm(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default Cart;
