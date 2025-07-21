import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaBox, FaChartBar, FaClipboardList, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import productService from "../../services/productService";

// Register Chart.js elements
ChartJS.register(ArcElement, Tooltip, Legend);

const InventoryManagement = () => {
  // State Management
  const [inventoryData, setInventoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockUpdate, setStockUpdate] = useState({ stock: '', operation: 'set' });

  // Fetch inventory data from the backend
  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await productService.getProducts('', 1, 100); // Get all products
      setInventoryData(response.data || []);
    } catch (error) {
      setError(error.message || 'Failed to fetch inventory data');
      console.error('Error fetching inventory data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stock update
  const handleStockUpdate = async () => {
    if (!selectedProduct || !stockUpdate.stock) return;

    try {
      await productService.updateProductStock(selectedProduct._id, {
        stock: parseInt(stockUpdate.stock),
        operation: stockUpdate.operation
      });
      await fetchInventoryData(); // Refresh data
      setShowModal(false);
      setSelectedProduct(null);
      setStockUpdate({ stock: '', operation: 'set' });
    } catch (error) {
      alert(error.message || 'Failed to update stock');
    }
  };

  // Open stock update modal
  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockUpdate({ stock: product.stock.toString(), operation: 'set' });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setStockUpdate({ stock: '', operation: 'set' });
  };

  // Pie Chart Data
  const pieChartData = {
    labels: inventoryData.map((item) => item.name),
    datasets: [
      {
        data: inventoryData.map((item) => item.stock),
        backgroundColor: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
          '#F8C471', '#82E0AA', '#F1948A', '#AED6F1', '#A9DFBF',
          '#FAD7A0', '#D7BDE2', '#A3E4D7', '#F9E79F', '#D5A6BD'
        ],
        hoverBackgroundColor: [
          '#FF5252', '#26A69A', '#2196F3', '#66BB6A', '#FFD54F',
          '#BA68C8', '#4DB6AC', '#FDD835', '#9C27B0', '#42A5F5',
          '#FFB74D', '#66BB6A', '#EF5350', '#64B5F6', '#81C784',
          '#FFCC02', '#CE93D8', '#80CBC4', '#FFF176', '#C48B9F'
        ],
      },
    ],
  };

  // Low Stock Items
  const lowStockItems = inventoryData.filter((item) => item.stock <= item.threshold);

  // Statistics
  const totalItems = inventoryData.length;
  const totalStock = inventoryData.reduce((sum, item) => sum + item.stock, 0);
  const lowStockCount = lowStockItems.length;

  return (
    <div className="flex bg-white font-kulim">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar activated="inventory" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col font-kulim ml-64">
        {/* Topbar */}
        <div className="fixed top-0 left-64 right-0 z-20">
          <Topbar />
        </div>

        {/* Content */}
        <div className="flex-1 pt-20 px-8 py-8 bg-gray-50 overflow-y-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Inventory Management</h1>

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
              <span className="ml-2 text-gray-600">Loading inventory...</span>
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center">
                    <FaBox className="text-blue-500 text-2xl mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
                      <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                  <div className="flex items-center">
                    <FaChartBar className="text-green-500 text-2xl mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Total Stock</h3>
                      <p className="text-2xl font-bold text-green-600">{totalStock}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                  <div className="flex items-center">
                    <FaExclamationTriangle className="text-red-500 text-2xl mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700">Low Stock Items</h3>
                      <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Low Stock Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FaChartBar className="mr-2" />
                    Stock Distribution
                  </h2>
                  {inventoryData.length > 0 ? (
                    <div className="h-64">
                      <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No data available for chart</p>
                  )}
                </div>

                {/* Low Stock Alert */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    Low Stock Alerts
                  </h2>
                  <div className="max-h-64 overflow-y-auto">
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-2"
                        >
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              Stock: {item.stock} {item.unit} | Threshold: {item.threshold}
                            </p>
                          </div>
                          <button
                            onClick={() => openStockModal(item)}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                          >
                            Update
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">No low stock items</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <FaClipboardList className="mr-2" />
                    Inventory List
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryData.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {item.images && item.images[0] ? (
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={item.images[0].url}
                                    alt={item.name}
                                  />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                    <FaBox className="text-gray-500" />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.stock} {item.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.stock > item.threshold
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.stock > item.threshold ? 'In Stock' : 'Low Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openStockModal(item)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                            >
                              <FaEdit className="mr-1" />
                              Update Stock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Stock: {selectedProduct.name}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
                <select
                  value={stockUpdate.operation}
                  onChange={(e) => setStockUpdate(prev => ({ ...prev, operation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="set">Set Stock To</option>
                  <option value="add">Add To Stock</option>
                  <option value="subtract">Subtract From Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {stockUpdate.operation === 'set' ? 'New Stock Level' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={stockUpdate.stock}
                  onChange={(e) => setStockUpdate(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-sm text-gray-600">
                Current Stock: {selectedProduct.stock} {selectedProduct.unit}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
