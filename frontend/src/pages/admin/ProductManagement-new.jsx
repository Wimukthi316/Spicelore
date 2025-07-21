import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaImage } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import productService from "../../services/productService";

const ProductManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [newProduct, setNewProduct] = useState({ 
        name: "", 
        price: "", 
        description: "", 
        image: "",
        category: "powder",
        stock: "",
        threshold: "10",
        weight: "",
        unit: "g",
        sku: ""
    });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const data = await productService.getProducts('', 1, 100); // Get all products for admin
            setProducts(data.data || []);
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to fetch products');
            console.error('Error fetching products:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Open Add Product Modal
    const openAddModal = () => {
        setIsAddModalOpen(true);
        setErrors({}); // Clear errors when opening the modal
    };

    // Close Add Product Modal
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewProduct({ 
            name: "", 
            price: "", 
            description: "", 
            image: "",
            category: "powder",
            stock: "",
            threshold: "10",
            weight: "",
            unit: "g",
            sku: ""
        });
        setErrors({}); // Clear errors when closing the modal
    };

    // Open Edit Product Modal
    const openEditModal = (product) => {
        setSelectedProduct({
            ...product, 
            price: product.price?.toString() || "",
            stock: product.stock?.toString() || "",
            threshold: product.threshold?.toString() || "",
            weight: product.weight?.toString() || "",
            image: product.images && product.images[0] ? product.images[0].url : ""
        });
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

        if (!product.name?.trim()) {
            errors.name = "Product name is required.";
        }
        if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0) {
            errors.price = "Please enter a valid price greater than 0.";
        }
        if (!product.description?.trim()) {
            errors.description = "Description is required.";
        }
        if (!product.stock || isNaN(product.stock) || parseInt(product.stock) < 0) {
            errors.stock = "Please enter a valid stock quantity.";
        }
        if (!product.weight || isNaN(product.weight) || parseFloat(product.weight) <= 0) {
            errors.weight = "Please enter a valid weight.";
        }
        if (!product.sku?.trim()) {
            errors.sku = "SKU is required.";
        }

        return errors;
    };

    // Generate SKU automatically
    const generateSKU = (name, category) => {
        const nameCode = name.slice(0, 3).toUpperCase();
        const categoryCode = category.slice(0, 2).toUpperCase();
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${nameCode}${categoryCode}${randomNum}`;
    };

    // Handle Add Product
    const handleAddProduct = async () => {
        // Auto-generate SKU if not provided
        if (!newProduct.sku) {
            newProduct.sku = generateSKU(newProduct.name, newProduct.category);
        }

        const validationErrors = validateForm(newProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await productService.createProduct({
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock),
                threshold: parseInt(newProduct.threshold),
                weight: parseFloat(newProduct.weight),
                images: newProduct.image ? [{ url: newProduct.image, alt: newProduct.name }] : []
            });
            await fetchProducts(); // Refresh the products list
            closeAddModal();
        } catch (err) {
            setErrors({ general: err.message || 'Failed to create product' });
        }
    };

    // Handle Edit Product
    const handleEditProduct = async () => {
        const validationErrors = validateForm(selectedProduct);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            await productService.updateProduct(selectedProduct._id, {
                ...selectedProduct,
                price: parseFloat(selectedProduct.price),
                stock: parseInt(selectedProduct.stock),
                threshold: parseInt(selectedProduct.threshold),
                weight: parseFloat(selectedProduct.weight),
                images: selectedProduct.image ? [{ url: selectedProduct.image, alt: selectedProduct.name }] : selectedProduct.images
            });
            await fetchProducts(); // Refresh the products list
            closeEditModal();
        } catch (err) {
            setErrors({ general: err.message || 'Failed to update product' });
        }
    };

    // Handle Delete Product
    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                await fetchProducts(); // Refresh the products list
            } catch (err) {
                alert(err.message || 'Failed to delete product');
            }
        }
    };

    // Block invalid characters in the Name field
    const handleNameKeyDown = (e) => {
        const key = e.key;
        // Allow letters, spaces, numbers, and backspace
        if (!/[A-Za-z0-9\s]/.test(key) && key !== "Backspace") {
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

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#745249]"></div>
                            <span className="ml-2 text-gray-600">Loading products...</span>
                        </div>
                    ) : (
                        /* Product Table */
                        <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Stock</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Image</th>
                                        <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-4 sm:px-6 py-8 text-center text-gray-500">
                                                No products found. Click "Add Product" to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product._id} className="transition-all">
                                                <td className="px-4 sm:px-6 py-4 text-sm text-black">{product.name}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-black">${product.price}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-black">
                                                    <span className={`px-2 py-1 rounded text-xs ${product.stock > product.threshold ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {product.stock} {product.unit}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-black capitalize">{product.category}</td>
                                                <td className="px-4 sm:px-6 py-4 text-sm text-black">
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0].url} alt={product.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                            <FaImage className="text-gray-400" />
                                                        </div>
                                                    )}
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
                                                            onClick={() => handleDeleteProduct(product._id)}
                                                            className="text-red-800 transition-all cursor-pointer"
                                                        >
                                                            <FaTrash className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-90 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96 max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Add Product</h2>
                        
                        {/* General Error Display */}
                        {errors.general && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {errors.general}
                            </div>
                        )}
                        
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* SKU Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">SKU (Leave empty to auto-generate)</label>
                                    <input
                                        type="text"
                                        placeholder="SKU"
                                        value={newProduct.sku}
                                        onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.sku && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                                    )}
                                </div>

                                {/* Category Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Category</label>
                                    <select
                                        value={newProduct.category}
                                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    >
                                        <option value="powder">Powder</option>
                                        <option value="whole">Whole</option>
                                        <option value="blends">Blends</option>
                                        <option value="organic">Organic</option>
                                        <option value="exotic">Exotic</option>
                                    </select>
                                </div>

                                {/* Price Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        onKeyDown={handlePriceKeyDown}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                    )}
                                </div>

                                {/* Stock Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.stock && (
                                        <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                                    )}
                                </div>

                                {/* Threshold Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        placeholder="Threshold"
                                        value={newProduct.threshold}
                                        onChange={(e) => setNewProduct({ ...newProduct, threshold: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                </div>

                                {/* Weight and Unit Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Weight</label>
                                        <input
                                            type="number"
                                            placeholder="Weight"
                                            value={newProduct.weight}
                                            onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                        />
                                        {errors.weight && (
                                            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Unit</label>
                                        <select
                                            value={newProduct.unit}
                                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                        >
                                            <option value="g">Grams (g)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="oz">Ounces (oz)</option>
                                            <option value="lb">Pounds (lb)</option>
                                            <option value="piece">Piece</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="Image URL"
                                        value={newProduct.image}
                                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {newProduct.image && (
                                        <img src={newProduct.image} alt="Preview" className="w-20 h-20 mt-2 rounded-lg object-cover" />
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Product Description"
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
                                    Add Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditModalOpen && selectedProduct && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-90 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96 max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Product</h2>
                        
                        {/* General Error Display */}
                        {errors.general && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                                {errors.general}
                            </div>
                        )}
                        
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        placeholder="Product Name"
                                        value={selectedProduct.name}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* SKU Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">SKU</label>
                                    <input
                                        type="text"
                                        placeholder="SKU"
                                        value={selectedProduct.sku}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.sku && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sku}</p>
                                    )}
                                </div>

                                {/* Category Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Category</label>
                                    <select
                                        value={selectedProduct.category}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    >
                                        <option value="powder">Powder</option>
                                        <option value="whole">Whole</option>
                                        <option value="blends">Blends</option>
                                        <option value="organic">Organic</option>
                                        <option value="exotic">Exotic</option>
                                    </select>
                                </div>

                                {/* Price Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={selectedProduct.price}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, price: e.target.value })}
                                        onKeyDown={handlePriceKeyDown}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.price && (
                                        <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                                    )}
                                </div>

                                {/* Stock Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        placeholder="Stock"
                                        value={selectedProduct.stock}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, stock: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.stock && (
                                        <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
                                    )}
                                </div>

                                {/* Threshold Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Low Stock Threshold</label>
                                    <input
                                        type="number"
                                        placeholder="Threshold"
                                        value={selectedProduct.threshold}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, threshold: e.target.value })}
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                </div>

                                {/* Weight and Unit Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-700 mb-2">Weight</label>
                                        <input
                                            type="number"
                                            placeholder="Weight"
                                            value={selectedProduct.weight}
                                            onChange={(e) => setSelectedProduct({ ...selectedProduct, weight: e.target.value })}
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                        />
                                        {errors.weight && (
                                            <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 mb-2">Unit</label>
                                        <select
                                            value={selectedProduct.unit}
                                            onChange={(e) => setSelectedProduct({ ...selectedProduct, unit: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                        >
                                            <option value="g">Grams (g)</option>
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="oz">Ounces (oz)</option>
                                            <option value="lb">Pounds (lb)</option>
                                            <option value="piece">Piece</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Image Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="Image URL"
                                        value={selectedProduct.image}
                                        onChange={(e) => setSelectedProduct({ ...selectedProduct, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {selectedProduct.image && (
                                        <img src={selectedProduct.image} alt="Preview" className="w-20 h-20 mt-2 rounded-lg object-cover" />
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Product Description"
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
                                    Save Changes
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
