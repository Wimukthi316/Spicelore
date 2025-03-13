import { useState } from "react";
import { FaUserPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaUsers } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";

const UserManagement = () => {
    // Dummy data for demonstration
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", email: "john@example.com", role: "Admin", status: "Active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User", status: "Inactive" },
        { id: 3, name: "Alice Johnson", email: "alice@example.com", role: "User", status: "Active" },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newUser, setNewUser] = useState({ name: "", email: "", role: "", status: "" });

    // Validation errors
    const [errors, setErrors] = useState({});

    // Calculate active and inactive users
    const activeUsersCount = users.filter((user) => user.status === "Active").length;
    const inactiveUsersCount = users.filter((user) => user.status === "Inactive").length;

    // Block invalid characters in the Name field
    const handleNameKeyDown = (e) => {
        const key = e.key;
        // Allow letters, spaces, and backspace
        if (!/[A-Za-z\s]/.test(key) && key !== "Backspace") {
            e.preventDefault();
        }
    };

    // Validate form fields
    const validateForm = (user) => {
        const errors = {};

        if (!user.name.trim()) {
            errors.name = "Name is required.";
        }
        if (!user.email.trim()) {
            errors.email = "Email is required.";
        } else if (!user.email.includes("@")) {
            errors.email = "Email must contain @.";
        }
        if (!user.role) {
            errors.role = "Role is required.";
        }
        if (!user.status) {
            errors.status = "Status is required.";
        }

        return errors;
    };

    // Open Add User Modal
    const openAddModal = () => {
        setIsAddModalOpen(true);
        setErrors({}); // Clear errors when opening the modal
    };

    // Close Add User Modal
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewUser({ name: "", email: "", role: "", status: "" });
        setErrors({}); // Clear errors when closing the modal
    };

    // Open Edit User Modal
    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
        setErrors({}); // Clear errors when opening the modal
    };

    // Close Edit User Modal
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUser(null);
        setErrors({}); // Clear errors when closing the modal
    };

    // Handle Add User
    const handleAddUser = () => {
        const validationErrors = validateForm(newUser);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Prevent submission if there are errors
        }

        setUsers([...users, { ...newUser, id: users.length + 1 }]);
        closeAddModal();
    };

    // Handle Edit User
    const handleEditUser = () => {
        const validationErrors = validateForm(selectedUser);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Prevent submission if there are errors
        }

        setUsers(users.map((user) => (user.id === selectedUser.id ? selectedUser : user)));
        closeEditModal();
    };

    // Handle Delete User
    const handleDeleteUser = (id) => {
        setUsers(users.filter((user) => user.id !== id));
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">User Management</h1>
                        <button
                            onClick={openAddModal}
                            className="bg-[#745249] text-white px-4 sm:px-6 py-2 rounded-2xl flex items-center space-x-2 transition-all cursor-pointer"
                        >
                            <FaUserPlus className="w-5 h-5" />
                            <span>Add User</span>
                        </button>
                    </div>

                    {/* Statistical Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                        {/* Total Users Card */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-600">Total Users</h3>
                                    <p className="text-2xl font-bold text-gray-800">{users.length}</p>
                                </div>
                                <div className="text-[#745249] text-3xl">
                                    <FaUsers />
                                </div>
                            </div>
                        </div>

                        {/* Active Users Card */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-600">Active Users</h3>
                                    <p className="text-2xl font-bold text-green-900">{activeUsersCount}</p>
                                </div>
                                <div className="text-green-900 text-3xl">
                                    <FaCheckCircle />
                                </div>
                            </div>
                        </div>

                        {/* Inactive Users Card */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-600">Inactive Users</h3>
                                    <p className="text-2xl font-bold text-red-900">{inactiveUsersCount}</p>
                                </div>
                                <div className="text-red-900 text-3xl">
                                    <FaTimesCircle />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Table */}
                    <div className="bg-white bg-opacity-50 backdrop-blur-md rounded-lg shadow-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                                    <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300">
                                {users.map((user) => (
                                    <tr key={user.id} className="transition-all">
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">{user.name}</td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">{user.email}</td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">{user.role}</td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-black">
                                            <span className={`px-2 py-1 rounded-full text-xs ${user.status === "Active" ? "bg-green-800 bg-opacity-20 text-white" : "bg-red-900 bg-opacity-20 text-white"}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-sm text-white">
                                            <div className="flex space-x-4">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-[#000000] transition-all cursor-pointer"
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
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

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-70 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96">
                        <h2 className="text-2xl font-bold text-gray-700 mb-6">Add User</h2>
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown} // Block invalid characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    >
                                        <option value="" disabled>
                                            Select Role
                                        </option>
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                    </select>
                                    {errors.role && (
                                        <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                                    )}
                                </div>

                                {/* Status Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Status</label>
                                    <select
                                        value={newUser.status}
                                        onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#351108]"
                                    >
                                        <option value="" disabled>
                                            Select Status
                                        </option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
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
                                    onClick={handleAddUser}
                                    className="bg-[#351108] text-white px-4 py-2 rounded-lg cursor-pointer"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white shadow-2xl bg-opacity-70 backdrop-blur-md p-6 sm:p-8 rounded-2xl w-11/12 sm:w-96">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit User</h2>
                        <form>
                            <div className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={selectedUser.name}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                        onKeyDown={handleNameKeyDown} // Block invalid characters
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={selectedUser.email}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Role Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Role</label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    >
                                        <option value="" disabled>
                                            Select Role
                                        </option>
                                        <option value="Admin">Admin</option>
                                        <option value="User">User</option>
                                    </select>
                                    {errors.role && (
                                        <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                                    )}
                                </div>

                                {/* Status Field */}
                                <div>
                                    <label className="block text-gray-700 mb-2">Status</label>
                                    <select
                                        value={selectedUser.status}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#745249]"
                                    >
                                        <option value="" disabled>
                                            Select Status
                                        </option>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                    {errors.status && (
                                        <p className="text-red-500 text-sm mt-1">{errors.status}</p>
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
                                    onClick={handleEditUser}
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

export default UserManagement;