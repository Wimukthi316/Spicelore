import { useState, useEffect, useMemo } from "react";
import { FaPlus, FaEdit, FaTrash, FaBox, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle, FaSearch } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
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

    // Fetch orders from backend API on mount
    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/orders");
            const data = await response.json();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const addOrder = async (order) => {
        try {
            const response = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedOrder)
            });
            const data = await response.json();
            if (data.success) {
                setOrders(orders.map(order => (order._id === id ? data.order : order)));
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const deleteOrder = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                setOrders(orders.filter(order => order._id !== id));
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
        const order = orders.find(order => order._id === id);
        if (order) {
            setFormState({ ...order });
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

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.product.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === "All" || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const orderStats = useMemo(() => {
        return orders.reduce(
            (acc, order) => {
                acc.total += 1;
                acc[order.status] += 1;
                return acc;
            },
            { total: 0, Pending: 0, Delivered: 0, Cancelled: 0 }
        );
    }, [orders]);

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-30">
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Topbar */}
                <div className="fixed top-0 left-64 right-0 z-20">
                    <Topbar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 mt-16 overflow-y-auto">

                    {/* Order Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        {[
                            { label: "Total Orders", count: orderStats.total, icon: <FaClipboardList />, color: "bg-white" },
                            { label: "Pending", count: orderStats.Pending, icon: <FaHourglassHalf />, color: "bg-white" },
                            { label: "Delivered", count: orderStats.Delivered, icon: <FaCheckCircle />, color: "bg-white" },
                            { label: "Cancelled", count: orderStats.Cancelled, icon: <FaTimesCircle />, color: "bg-white" },
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

                    {/* Add/Edit Form */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            {editing ? "Edit Order" : "Add Order"}
                        </h2>
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
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleAddOrUpdate}
                            className="bg-[#745249] text-white px-6 py-3 rounded-lg shadow-md mt-9 transition-transform hover:scale-105 flex items-center"
                        >
                            {editing ? "Update Order" : "Add Order"}
                        </button>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Search orders..."
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
                                    <option value="All">All</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Orders List</h2>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-200 text-black text-base leading-normal">
                                    <th className="py-3 px-6">Customer ID</th>
                                    <th className="py-3 px-6">Product</th>
                                    <th className="py-3 px-6">Quantity</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Date</th>
                                    <th className="py-3 px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-black text-sm font-semibold">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="border-b border-gray-200 hover:bg-gray-100">
                                        <td className="py-3 px-6">{order.customerId}</td>
                                        <td className="py-3 px-6">{order.product}</td>
                                        <td className="py-3 px-6">{order.quantity}</td>
                                        <td className="py-3 px-6">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm ${order.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800"
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default OrderManagement;
