import { useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaBox } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

const ProductManagement = () => {
    // Dummy data for demonstration
    const [products, setProducts] = useState([
        { id: 1, name: "Laptop", price: 1200, description: "High-performance laptop.", image: "https://via.placeholder.com/150" },
        { id: 2, name: "Smartphone", price: 800, description: "Latest smartphone model.", image: "https://via.placeholder.com/150" },
        { id: 3, name: "Headphones", price: 150, description: "Noise-cancelling headphones.", image: "https://via.placeholder.com/150" },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", image: "" });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Open Add Product Modal
    const openAddModal = () => {
        setIsAddModalOpen(true);
        setErrors({}); // Clear errors when opening the modal
    };

    // Close Add Product Modal
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewProduct({ name: "", price: "", description: "", image: "" });
        setErrors({}); // Clear errors when closing the modal
    };

    // Open Edit Product Modal
    const openEditModal = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
        setErrors({}); // Clear errors when opening the modal
    };

    // Close Edit Product Modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        setErrors({}); // Clear errors when closing the modal
    };

    // Validate form fields
    const validateForm = (product) => {
        const errors = {};

        if (!product.name.trim()) {
            errors.name = "Name is required.";
        }
        if (!product.price || isNaN(product.price) || product.price <= 0) {
            errors.price = "Price must be a positive number.";
        }
        if (!product.description.trim()) {
            errors.description = "Description is required.";
        }
        if (!product.image) {
            errors.image = "Image is required.";
        }

        return errors;
    };

    // Handle Add Product
    const handleAddProduct = () => {
        const validationErrors = validateForm(newProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Prevent submission if there are errors
        }

        setProducts([...products, { ...newProduct, id: products.length + 1 }]);
        closeAddModal();
    };

    // Handle Edit Product
    const handleEditProduct = () => {
        const validationErrors = validateForm(selectedProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Prevent submission if there are errors
        }

        setProducts(products.map((product) => (product.id === selectedProduct.id ? selectedProduct : product)));
        closeEditModal();
    };

    // Handle Delete Product
    const handleDeleteProduct = (id) => {
        setProducts(products.filter((product) => product.id !== id));
    };

    // Block invalid characters in the Name field
    const handleNameKeyDown = (e) => {
        const key = e.key;
        // Allow letters, spaces, and backspace
        if (!/[A-Za-z\s]/.test(key) && key !== "Backspace") {
            e.preventDefault();
        }
    };

    // Block non-numeric characters in the Price field
    const handlePriceKeyDown = (e) => {
        const key = e.key;
        // Allow numbers, backspace, and decimal point
        if (!/[0-9.]/.test(key) && key !== "Backspace") {
            e.preventDefault();
        }
    };

    // Handle image upload
    const handleImageUpload = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit) {
                    setSelectedProduct({ ...selectedProduct, image: reader.result });
                } else {
                    setNewProduct({ ...newProduct, image: reader.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Topbar */}
                <Topbar />

                {/* Page Content */}
                <div className="p-4 sm:p-8">
                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Product Management</h1>
                        <button
                            onClick={openAddModal}
                            className="bg-[#745249] text-white px-4 sm:px-6 py-2 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
                        >
                            <FaPlus className="w-5 h-5" />
                            <span>Add Product</span>
                        </button>
                    </div>

                    {/* Product Table */}
                    <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                                {products.map((product) => (
                                    <tr key={product.id} className="transition-all">
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">{product.name}</td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">${product.price}</td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">
                                            <img src={product.image} alt={product.name} className="w-10 h-10 rounded-full object-cover" />
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-white">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => openEditModal(product)}
                                                    className="text-[#000000] transition-all cursor-pointer"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="text-red-800 transition-all cursor-pointer"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-70 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Add Product</h2>
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown} // Block invalid characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Price Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Price</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        onKeyDown={handlePriceKeyDown} // Block non-numeric characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                    )}
                                </div>

                                {/* Image Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, false)} // Handle image upload
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.image && (
                                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                                    )}
                                    {newProduct.image && (
                                        <img src={newProduct.image} alt="Preview" className="w-20 h-20 mt-2 rounded-lg object-cover" />
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Description"
                                        value={newProduct.description}
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                        rows="3"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closeAddModal}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    className="bg-[#351108] text-white px-4 py-2 rounded-lg cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditModalOpen && selectedProduct && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-70 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h2>
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={selectedProduct.name}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown} // Block invalid characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Price Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Price</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                                        onKeyDown={handlePriceKeyDown} // Block non-numeric characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                    )}
                                </div>

                                {/* Image Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Image</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, true)} // Handle image upload
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.image && (
                                        <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                                    )}
                                    {selectedProduct.image && (
                                        <img src={selectedProduct.image} alt="Preview" className="w-20 h-20 mt-2 rounded-lg object-cover" />
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Description"
                                        value={selectedProduct.description}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                        rows="3"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEditProduct}
                                    className="bg-[#745249] text-white px-4 py-2 rounded-lg cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;