import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUserCircle } from "react-icons/fa";
import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import authService from "../../services/authService";

// Define the API URL
const API_URL = "http://localhost:5000/api/employees";

const EmployeeManagement = () => {
    // State Management
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({
        name: "",
        empid: "",
        role: "",
        contact: "",
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fetch Employees on Mount
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setIsLoading(true);
            const token = authService.getToken();
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch employees');
            }

            // Handle the response structure - check if data has a 'data' property
            const employeeList = data.data || data || [];
            setEmployees(Array.isArray(employeeList) ? employeeList : []);
            setError('');
            console.log("Employees fetched:", employeeList);
        } catch (error) {
            console.error("Error fetching employees:", error);
            setError(error.message || 'Failed to fetch employees');
            setEmployees([]); // Set empty array as fallback
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "name" && !/^[A-Za-z\s]*$/.test(value)) {
            return; // Prevents updating state if invalid characters are entered
        }

        if (name === "contact" && value && !value.includes("@")) {
            // Allow typing in the contact field but prevent invalid emails
            setFormState((prevState) => ({
                ...prevState,
                [name]: value,
            }));
            return;
        }

        setFormState((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    // Handle Employee Edit
    const handleEdit = (id) => {
        console.log("Editing ID:", id); // Debugging
        const employeeToEdit = employees.find((emp) => emp._id === id);
        console.log("Employee to Edit:", employeeToEdit); // Debugging
        if (employeeToEdit) {
            setFormState({
                name: employeeToEdit.name || "",
                empid: employeeToEdit.empid || "",
                role: employeeToEdit.role || "",
                contact: employeeToEdit.contact || "",
            });
            setEditId(id); // Set ID of the employee being edited
            setIsEditing(true); // Switch to editing mode
            setIsModalOpen(true); // Open modal
        } else {
            console.error(`Employee with ID ${id} not found.`);
        }
    };

    // Handle Save (Add / Update Employee)
    const handleSave = async () => {
        try {
            const token = authService.getToken();
            
            if (!token) {
                throw new Error('No authentication token found');
            }

            if (isEditing) {
                const response = await fetch(`${API_URL}/${editId}`, {
                    method: "PUT",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formState),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to update employee");
                }

                await fetchEmployees();
                setIsEditing(false);
                setEditId(null);
            } else {
                const response = await fetch(API_URL, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(formState),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to add employee");
                }

                await fetchEmployees();
            }

            setFormState({ name: "", empid: "", role: "", contact: "" });
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving employee:", error);
            alert(error.message || 'Failed to save employee');
        }
    };

    // Handle Employee Delete
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                const token = authService.getToken();
                
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`${API_URL}/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to delete employee");
                }

                await fetchEmployees();
            } catch (error) {
                console.error("Error deleting employee:", error);
                alert(error.message || 'Failed to delete employee');
            }
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-30">
                <Sidebar activated="employee" />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-64">
                {/* Topbar */}
                <div className="fixed top-0 left-64 right-0 z-20">
                    <Topbar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 p-6 mt-16 overflow-y-auto">
                    <header className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">
                            Employee Dashboard
                        </h1>
                        <button
                            className="bg-[#745249] text-white px-6 py-3 rounded-lg shadow-md transition-transform hover:scale-105 flex items-center cursor-pointer"
                            onClick={() => {
                                setFormState({ name: "", empid: "", role: "", contact: "" });
                                setIsEditing(false);
                                setIsModalOpen(true);
                            }}
                        >
                            Add Employee
                        </button>
                    </header>

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
                            <span className="ml-2 text-gray-600">Loading employees...</span>
                        </div>
                    ) : (
                        <>
                            {/* Employee Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {employees.length === 0 ? (
                                    <div className="col-span-full text-center py-12">
                                        <p className="text-gray-500 text-lg">No employees found</p>
                                        <p className="text-gray-400">Click "Add Employee" to get started</p>
                                    </div>
                                ) : (
                                    employees.map((employee) => (
                                        <div
                                            key={employee._id}
                                            className="bg-white shadow-xl rounded-2xl py-4"
                                        >
                                            <FaUserCircle className="w-24 h-24 text-[#745249] mx-auto mb-6" />
                                            <h2 className="text-2xl font-semibold text-gray-800 text-center mb-2">
                                                {employee.name}
                                            </h2>
                                            <p className="text-gray-600 text-center mb-1">{employee.empid}</p>
                                            <p className="text-gray-600 text-center mb-2">{employee.role}</p>
                                            <p className="text-gray-500 text-center mb-6">{employee.contact}</p>
                                            <div className="flex justify-center space-x-6">
                                                <button
                                                    onClick={() => handleEdit(employee._id)}
                                                    className="text-blue-700 text-2xl p-3 rounded-full transition duration-200 hover:text-blue-900"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(employee._id)}
                                                    className="text-red-800 p-3 text-2xl rounded-full transition duration-200 hover:text-red-900"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Add/Edit Employee Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-2xl max-w-sm w-full">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            {isEditing ? "Edit Employee" : "Add Employee"}
                        </h2>
                        <input
                            type="text"
                            placeholder="Name"
                            name="name"
                            value={formState.name}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Employee ID"
                            name="empid"
                            value={formState.empid}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Role"
                            name="role"
                            value={formState.role}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            name="contact"
                            value={formState.contact}
                            onChange={handleInputChange}
                            className="w-full mb-4 p-2 border rounded"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-[#745249] text-white px-4 py-2 rounded cursor-pointer"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeManagement;