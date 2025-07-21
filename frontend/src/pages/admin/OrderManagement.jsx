import { useState, useEffect, useMemo } from "react";
import { FaEdit, FaTrash, FaBox, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaSearch, FaShoppingCart } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [userOrders, setUserOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("admin");
    const [formState, setFormState] = useState({
        customerId: "",
        product: "",
        quantity: "",
        status: "Pending",
        date: "",
    });
    const [editing, setEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [errors, setErrors] = useState({});

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/orders", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log("Fetched all orders:", data); // Debug log
            if (data.success) {
                const allOrders = data.orders || data.data || [];
                // Filter to get admin-created orders (those without customer info from payments)
                const adminOrders = allOrders.filter(order => {
                    // Include orders that are manually created by admin (have customerId but no customer object)
                    return order.customerId && !order.customer && !order.items?.length && !order.totalAmount;
                });
                console.log("Filtered admin orders:", adminOrders); // Debug log
                setOrders(adminOrders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    const fetchUserOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/orders", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            console.log("Fetched orders data:", data); // Debug log
            if (data.success) {
                // Filter to get real user orders (those with customer info or items from cart/payment)
                const allOrders = data.orders || data.data || [];
                const realUserOrders = allOrders.filter(order => {
                    // Include orders that have customer field (from Stripe payments) or items array (from cart)
                    return (order.customer && (order.customer.name || order.customer.email)) || 
                           (order.items && order.items.length > 0) ||
                           order.totalAmount || order.subtotal;
                });
                console.log("Filtered user orders:", realUserOrders); // Debug log
                setUserOrders(realUserOrders);
            }
        } catch (error) {
            console.error("Error fetching user orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchUserOrders();
    }, []);

    const addOrder = async (order) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(order)
            });
            const data = await response.json();
            if (data.success) {
                setOrders([...orders, data.order]);
            }
        } catch (error) {
            console.error("Error adding order:", error);
        }
    };

    const updateOrder = async (id, updatedOrder) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedOrder)
            });
            const data = await response.json();
            if (data.success) {
                setOrders(orders.map(order => (order._id === id ? data.order : order)));
                setUserOrders(userOrders.map(order => (order._id === id ? data.order : order)));
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const deleteOrder = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setOrders(orders.filter(order => order._id !== id));
                setUserOrders(userOrders.filter(order => order._id !== id));
            }
        } catch (error) {
            console.error("Error deleting order:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let errorMsg = "";
        if (name === "customerId" && !/^[A-Z0-9]*$/.test(value)) {
            errorMsg = "Only capital letters and numbers allowed!";
        }
        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleEdit = (id) => {
        const ordersList = activeTab === "admin" ? orders : userOrders;
        const order = ordersList.find(order => order._id === id);
        if (order) {
            if (activeTab === "user") {
                // For user orders, only allow status updates
                setFormState({ 
                    customerId: order.customer?.name || 'User Order',
                    product: order.items?.length > 0 ? `${order.items.length} items` : order.product || 'Order Items',
                    quantity: order.items?.length || order.quantity || 1,
                    status: order.status || 'Pending',
                    date: order.date ? new Date(order.date).toISOString().split('T')[0] : 
                          order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : 
                          new Date().toISOString().split('T')[0]
                });
            } else {
                // For admin orders, allow full editing
                setFormState({ 
                    customerId: order.customerId || '',
                    product: order.product || '',
                    quantity: order.quantity || '',
                    status: order.status || 'Pending',
                    date: order.date ? new Date(order.date).toISOString().split('T')[0] : ''
                });
            }
            setEditing(true);
            setEditId(id);
        }
    };

    const handleAddOrUpdate = () => {
        if (!formState.customerId || !formState.product || formState.quantity <= 0 || !formState.date) {
            alert("Please fill all fields correctly.");
            return;
        }
        if (errors.customerId) {
            alert("Please correct the errors before submitting.");
            return;
        }
        if (editing) {
            updateOrder(editId, formState);
            setEditing(false);
            setEditId(null);
        } else {
            addOrder({ ...formState, quantity: Number(formState.quantity) });
        }
        setFormState({ customerId: "", product: "", quantity: "", status: "Pending", date: "" });
        setErrors({});
    };

    const getCurrentOrders = () => {
        return activeTab === "admin" ? orders : userOrders;
    };

    const filteredOrders = getCurrentOrders().filter(order => {
        const matchesSearch = 
            (order.customerId && order.customerId.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.product && order.product.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.customer?.name && order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.customer?.email && order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.items && order.items.some(item => 
                item.productName && item.productName.toLowerCase().includes(searchQuery.toLowerCase())
            ));
        const matchesStatus = filterStatus === "All" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const orderStats = useMemo(() => {
        const currentOrders = activeTab === "admin" ? orders : userOrders;
        return currentOrders.reduce(
            (acc, order) => {
                acc.total += 1;
                acc[order.status] = (acc[order.status] || 0) + 1;
                return acc;
            },
            { total: 0, Pending: 0, Processing: 0, Shipped: 0, Delivered: 0, Cancelled: 0 }
        );
    }, [orders, userOrders, activeTab]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="fixed inset-y-0 left-0 z-30">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col ml-64">
                <div className="fixed top-0 left-64 right-0 z-20">
                    <Topbar />
                </div>

                <main className="flex-1 p-6 mt-16 overflow-y-auto">
                    <div className="bg-white p-1 rounded-lg shadow-md mb-6">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab("admin")}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    activeTab === "admin"
                                        ? 'bg-[#745249] text-white shadow-lg'
                                        : 'text-gray-600 hover:text-[#745249] hover:bg-gray-50'
                                }`}
                            >
                                <FaClipboardList className="w-4 h-4" />
                                <span>Admin Orders</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("user")}
                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                                    activeTab === "user"
                                        ? 'bg-[#745249] text-white shadow-lg'
                                        : 'text-gray-600 hover:text-[#745249] hover:bg-gray-50'
                                }`}
                            >
                                <FaShoppingCart className="w-4 h-4" />
                                <span>User Orders</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mb-6">
                        {[
                            { label: "Total Orders", count: orderStats.total, icon: <FaClipboardList />, color: "bg-white" },
                            { label: "Pending", count: orderStats.Pending || 0, icon: <FaHourglassHalf />, color: "bg-white" },
                            { label: "Processing", count: orderStats.Processing || 0, icon: <FaBox />, color: "bg-white" },
                            { label: "Shipped", count: orderStats.Shipped || 0, icon: <FaCheckCircle />, color: "bg-white" },
                            { label: "Delivered", count: orderStats.Delivered || 0, icon: <FaCheckCircle />, color: "bg-white" },
                        ].map((stat, index) => (
                            <div key={index} className={`p-5 rounded-lg shadow-md flex items-center ${stat.color}`}>
                                <div className="text-[#745249] text-2xl mr-4">{stat.icon}</div>
                                <div>
                                    <h3 className="text-lg font-semibold text-[#745249]">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-[#745249]">{stat.count}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add/Edit Form - Show for admin orders or when editing user order status */}
                    {(activeTab === "admin" || editing) && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                {editing ? 
                                    (activeTab === "user" ? "Update Order Status" : "Edit Order") : 
                                    "Add Order"
                                }
                            </h2>
                            
                            {activeTab === "user" && editing ? (
                                // Simplified form for user orders - only status update
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Order Details
                                        </label>
                                        <div className="p-3 bg-gray-50 rounded border text-gray-700">
                                            {formState.customerId} - {formState.product}
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                            Order Status *
                                        </label>
                                        <select
                                            name="status"
                                            id="status"
                                            value={formState.status}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full text-black"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ) : (
                                // Full form for admin orders
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    <div>
                                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                                            Customer ID
                                        </label>
                                        <input
                                            type="text"
                                            name="customerId"
                                            id="customerId"
                                            placeholder="Enter customer ID"
                                            value={formState.customerId}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full"
                                            disabled={activeTab === "user"}
                                        />
                                        {errors.customerId && (
                                            <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
                                            Product
                                        </label>
                                        <input
                                            type="text"
                                            name="product"
                                            id="product"
                                            placeholder="Enter product name"
                                            value={formState.product}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full"
                                            disabled={activeTab === "user"}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                                            Quantity
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            id="quantity"
                                            placeholder="Enter quantity"
                                            value={formState.quantity}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full"
                                            min="0"
                                            disabled={activeTab === "user"}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            id="status"
                                            value={formState.status}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full text-black"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="date" className="block text-sm font-medium mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            id="date"
                                            value={formState.date}
                                            onChange={handleInputChange}
                                            className="p-3 border rounded w-full text-black"
                                            disabled={activeTab === "user"}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleAddOrUpdate}
                                    className="bg-[#745249] text-white px-6 py-3 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center"
                                >
                                    {editing ? "Update" : "Add Order"}
                                </button>
                                {editing && (
                                    <button
                                        onClick={() => {
                                            setEditing(false);
                                            setEditId(null);
                                            setFormState({ customerId: "", product: "", quantity: "", status: "Pending", date: "" });
                                            setErrors({});
                                        }}
                                        className="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md transition-colors hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder={`Search ${activeTab} orders...`}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="p-3 border rounded w-full pl-10"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                                <div>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="p-3 border rounded"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    fetchOrders();
                                    fetchUserOrders();
                                }}
                                className="bg-[#745249] text-white px-4 py-3 rounded-lg hover:bg-[#634339] transition-colors flex items-center gap-2"
                                title="Refresh Orders"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            {activeTab === "admin" ? "Admin Orders List" : "User Orders List"}
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-200 text-black text-base leading-normal">
                                        {activeTab === "admin" ? (
                                            <>
                                                <th className="py-3 px-6">Customer ID</th>
                                                <th className="py-3 px-6">Product</th>
                                                <th className="py-3 px-6">Quantity</th>
                                                <th className="py-3 px-6">Status</th>
                                                <th className="py-3 px-6">Date</th>
                                                <th className="py-3 px-6">Actions</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="py-3 px-6">Order ID</th>
                                                <th className="py-3 px-6">Customer</th>
                                                <th className="py-3 px-6">Items</th>
                                                <th className="py-3 px-6">Total</th>
                                                <th className="py-3 px-6">Status</th>
                                                <th className="py-3 px-6">Date</th>
                                                <th className="py-3 px-6">Actions</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="text-black text-sm font-semibold">
                                    {filteredOrders.map((order) => (
                                        <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-100">
                                            {activeTab === "admin" ? (
                                                <>
                                                    <td className="py-3 px-6">{order.customerId}</td>
                                                    <td className="py-3 px-6">{order.product}</td>
                                                    <td className="py-3 px-6">{order.quantity}</td>
                                                    <td className="py-3 px-6">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm ${
                                                                order.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : order.status === "Processing"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : order.status === "Shipped"
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : order.status === "Delivered"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : "bg-red-100 text-red-800"
                                                            }`}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6">{new Date(order.date).toLocaleDateString("en-CA")}</td>
                                                    <td className="py-3 px-6 flex space-x-3">
                                                        <button
                                                            onClick={() => handleEdit(order._id)}
                                                            className="text-blue-800 hover:underline flex items-center"
                                                        >
                                                            <FaEdit className="mr-2" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteOrder(order._id)}
                                                            className="text-red-900 hover:underline flex items-center"
                                                        >
                                                            <FaTrash className="mr-2" />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-3 px-6">
                                                        <span className="font-mono text-sm">
                                                            {order.orderNumber || order._id?.slice(-8).toUpperCase() || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div>
                                                            <div className="font-semibold text-gray-900">
                                                                {order.customer?.name || order.shippingAddress?.name || 'Guest User'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {order.customer?.email || order.shippingAddress?.email || 'No email'}
                                                            </div>
                                                            {order.customer?.phone && (
                                                                <div className="text-xs text-gray-400">
                                                                    {order.customer.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="max-w-xs">
                                                            {order.items && order.items.length > 0 ? (
                                                                <div>
                                                                    {order.items.slice(0, 2).map((item, index) => (
                                                                        <div key={index} className="text-xs mb-1">
                                                                            <span className="font-medium">{item.productName || item.name}</span>
                                                                            <span className="text-gray-500"> (x{item.quantity})</span>
                                                                            {item.price && (
                                                                                <span className="text-green-600 ml-1">
                                                                                    ${item.price}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {order.items.length > 2 && (
                                                                        <div className="text-xs text-gray-500 italic">
                                                                            +{order.items.length - 2} more items
                                                                        </div>
                                                                    )}
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        Total Items: {order.items.length}
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-gray-500">
                                                                    {order.product ? `${order.product} (x${order.quantity})` : 'No items'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="font-semibold text-lg text-green-600">
                                                            {formatPrice(order.totalAmount || order.subtotal || 0)}
                                                        </div>
                                                        {order.shippingCost && (
                                                            <div className="text-xs text-gray-500">
                                                                Shipping: {formatPrice(order.shippingCost)}
                                                            </div>
                                                        )}
                                                        {order.tax && (
                                                            <div className="text-xs text-gray-500">
                                                                Tax: {formatPrice(order.tax)}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                                order.status === "Pending"
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : order.status === "Processing"
                                                                    ? "bg-blue-100 text-blue-800"
                                                                    : order.status === "Shipped"
                                                                    ? "bg-purple-100 text-purple-800"
                                                                    : order.status === "Delivered"
                                                                    ? "bg-green-100 text-green-800"
                                                                    : order.status === "Cancelled"
                                                                    ? "bg-red-100 text-red-800"
                                                                    : "bg-gray-100 text-gray-800"
                                                            }`}
                                                        >
                                                            {order.status || 'Pending'}
                                                        </span>
                                                        {order.paymentStatus && (
                                                            <div className="text-xs mt-1">
                                                                <span className={`px-2 py-1 rounded text-xs ${
                                                                    order.paymentStatus === 'paid' 
                                                                        ? 'bg-green-100 text-green-700'
                                                                        : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="text-sm">
                                                            {order.date ? new Date(order.date).toLocaleDateString("en-CA") : 
                                                             order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-CA") :
                                                             'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {order.date ? new Date(order.date).toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'}) :
                                                             order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-US", {hour: '2-digit', minute:'2-digit'}) :
                                                             ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(order._id)}
                                                                className="text-blue-600 hover:text-blue-800 transition-colors p-1 hover:bg-blue-50 rounded"
                                                                title="Update Order Status"
                                                            >
                                                                <FaEdit className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if(window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                                                        deleteOrder(order._id);
                                                                    }
                                                                }}
                                                                className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                                                                title="Delete Order"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {filteredOrders.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No {activeTab} orders found.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrderManagement;