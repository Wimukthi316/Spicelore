import Sidebar from "../../components/admin/Sidebar";
import Topbar from "../../components/admin/Topbar";
import { FaBox, FaShoppingCart, FaUsers, FaChartLine, FaBell, FaCalendarAlt, FaUserPlus, FaExclamationCircle } from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const DashboardCard = ({ title, icon, value, link }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                <div className="text-[#745249] text-3xl">{icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-4">{value}</p>
            <a href={link} className="bg-[#745249] text-white px-4 py-2 rounded-full text-sm transition-all">Visit</a>
        </div>
    );
};

const AdminDashboard = () => {
    // Dummy data for demonstration
    const dashboardCards = [
        { id: 1, title: 'Total Orders', icon: <FaShoppingCart />, value: '1,234', link: '/admin/orders' },
        { id: 2, title: 'Active Users', icon: <FaUsers />, value: '567', link: '/admin/users' },
        { id: 3, title: 'Total Revenue', icon: <FaChartLine />, value: '$45,678', link: '/admin/sales' },
        { id: 4, title: 'Products', icon: <FaBox />, value: '89', link: '/admin/products' },
    ];

    // Recent Activity Data
    const recentActivities = [
        { id: 1, type: 'order', message: 'New order #1234 placed', time: '2 mins ago', icon: <FaShoppingCart className="w-5 h-5 text-blue-500" /> },
        { id: 2, type: 'user', message: 'User John Doe signed up', time: '10 mins ago', icon: <FaUserPlus className="w-5 h-5 text-green-500" /> },
        { id: 3, type: 'alert', message: 'Low stock for Cinnamon Sticks', time: '30 mins ago', icon: <FaExclamationCircle className="w-5 h-5 text-red-500" /> },
        { id: 4, type: 'order', message: 'Order #1235 shipped', time: '1 hour ago', icon: <FaShoppingCart className="w-5 h-5 text-blue-500" /> },
    ];

    // Chart data
    const salesData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Sales',
                data: [12000, 19000, 3000, 5000, 2000, 3000, 45000],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    const revenueData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Revenue',
                data: [5000, 15000, 10000, 20000, 12000, 18000, 25000],
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="lg:ml-64">
                {/* Topbar */}
                <Topbar />

                {/* Dashboard Cards */}
                <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {dashboardCards.map((card) => (
                        <DashboardCard key={card.id} title={card.title} icon={card.icon} value={card.value} link={card.link} />
                    ))}
                </div>

                {/* Charts Section */}
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Sales Overview</h2>
                        <Bar data={salesData} />
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Revenue Trends</h2>
                        <Line data={revenueData} />
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="p-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
                        <ul className="space-y-4">
                            {recentActivities.map((activity) => (
                                <li key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-all">
                                    <div className="flex-shrink-0">
                                        {activity.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-700">{activity.message}</p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;