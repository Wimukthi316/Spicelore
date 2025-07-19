import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

const SalesManagement = () => {
  const [sales, setSales] = useState([]);
  const [formState, setFormState] = useState({ product: '', quantity: '', amount: '', date: '' });
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fetch sales from backend
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/Sale');
        const data = await response.json();
        setSales(data);
      } catch (error) {
        console.error('Error fetching sales:', error);
      }
    };
    fetchSales();
  }, []);

  // Add sale
  const addSale = async (sale) => {
    try {
      const response = await fetch('http://localhost:5000/api/Sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });
      const data = await response.json();
      setSales([...sales, data]);
    } catch (error) {
      console.error('Error adding sale:', error);
    }
  };

  // Update sale
  const updateSale = async (id, sale) => {
    try {
      const response = await fetch(`http://localhost:5000/api/Sale/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
      });
      const data = await response.json();
      setSales(sales.map((sale) => (sale._id === id ? data : sale)));
    } catch (error) {
      console.error('Error updating sale:', error);
    }
  };

  // Delete sale
  const deleteSale = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/Sale/${id}`, {
        method: 'DELETE',
      });
      setSales(sales.filter((sale) => sale._id !== id));
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState({ ...formState, [name]: value });
  };

  const handleEdit = (id) => {
    const sale = sales.find((sale) => sale._id === id);
    setFormState({ product: sale.product, quantity: sale.quantity, amount: sale.amount, date: sale.date });
    setEditing(true);
    setEditId(id);
  };

  const handleAddOrUpdate = () => {
    if (!formState.product || formState.quantity <= 0 || formState.amount <= 0 || !formState.date) {
      alert('Please enter valid product details. Quantity, amount, and date are required.');
      return;
    }

    try {
      if (editing) {
        updateSale(editId, formState);
        setEditing(false);
        setEditId(null);
      } else {
        addSale({ ...formState, quantity: Number(formState.quantity), amount: Number(formState.amount) });
      }
      setFormState({ product: '', quantity: '', amount: '', date: '' });
    } catch (error) {
      console.error('Error adding/updating sale:', error);
    }
  };

  // Pie chart data
  const pieChartData = {
    labels: sales.map((sale) => sale.product),
    datasets: [
      {
        data: sales.map((sale) => sale.amount),
        backgroundColor: [
          '#6A994E', // Tea Leaf Green
          '#A7C957', // Lime Green
          '#386641', // Dark Forest Green
          '#BFD200', // Bright Yellow-Green
          '#D4E157', // Light Olive Green
        ],
        hoverBackgroundColor: [
          '#558647', // Darker Tea Leaf Green
          '#94B845', // Darker Lime Green
          '#2F5734', // Darker Forest Green
          '#A5B200', // Darker Bright Yellow-Green
          '#BFD64B', // Darker Light Olive Green
        ],
      },
    ],
  };

  return (
    <div className="flex bg-white font-kulim">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30">
        <Sidebar activated="sale" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64"> {/* Add margin-left to avoid overlap with Sidebar */}
        {/* Topbar */}
        <div className="fixed top-0 left-64 right-0 z-20"> {/* Fixed positioning for Topbar */}
          <Topbar />
        </div>

        {/* Main Dashboard Content */}
        <div className="p-6 space-y-10 bg-white flex-1 overflow-y-auto mt-16"> {/* Add margin-top to avoid overlap with Topbar */}
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">Sales Dashboard</h1>
          </header>

          {/* Add/Edit Form */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {editing ? 'Edit Sale' : 'Add Sale'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="product"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name
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
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  placeholder="Enter Price"
                  value={formState.amount}
                  onChange={handleInputChange}
                  className="p-3 border rounded w-full"
                  min="0"
                />
              </div>
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  id="date"
                  value={new Date(formState.date).toLocaleDateString('en-CA')}
                  onChange={handleInputChange}
                  className="p-3 border rounded w-full"
                  min={new Date().toISOString().split('T')[0]} // Restrict to today and beyond
                />
              </div>
            </div>
            <button
              onClick={handleAddOrUpdate}
              className="bg-[#745249] text-white px-6 py-3 rounded-lg shadow-md mt-9 transition-transform hover:scale-105 flex items-center"
            >
              {editing ? 'Update Sale' : 'Add Sale'}
            </button>
          </div>

          {/* Sales List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales List</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200 text-black text-base leading-normal">
                  <th className="py-3 px-6">Product</th>
                  <th className="py-3 px-6">Quantity</th>
                  <th className="py-3 px-6">Price</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="text-black text-sm font-semibold">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6">{sale.product}</td>
                    <td className="py-3 px-6">{sale.quantity}</td>
                    <td className="py-3 px-6">${sale.amount}</td>
                    <td className="py-3 px-6">{new Date(sale.date).toLocaleDateString('en-CA')}</td>
                    <td className="py-3 px-6 flex space-x-3">
                      <button
                        onClick={() => handleEdit(sale._id)}
                        className="text-blue-800 hover:underline flex items-center"
                      >
                        <FaEdit className="mr-2" />
                      </button>
                      <button
                        onClick={() => deleteSale(sale._id)}
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

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Distribution</h2>
            <div className="flex justify-center items-center">
              {/* Small Pie Chart */}
              <div style={{ width: '300px', height: '300px' }}>
                <Pie data={pieChartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesManagement;