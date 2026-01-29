import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import {
  FiUsers,
  FiDollarSign,
  FiCheckCircle,
  FiTrendingUp,
  FiCalendar,
  FiPackage,
  FiShoppingBag,
  FiMapPin,
  FiRefreshCw,
  FiActivity,
  FiBarChart2,
  FiCreditCard,
  FiUserCheck,
  FiUserX,
  FiDownload,
} from "react-icons/fi";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get("/admin/dashboard/view-details");
      setStats(res.data.data);
      if (refreshing) {
        toast.success("Dashboard refreshed!");
      }
    } catch (err) {
      console.error("Dashboard fetch error", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 text-left">Dashboard</h1>
              {/* <p className="text-gray-600 mt-1">
                Welcome back! Here's what's happening with your platform.
              </p> */}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
              <FiRefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Date Info */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiCalendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-700 font-medium">
              Loading dashboard data...
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please wait while we gather the latest insights
            </p>
          </div>
        ) : (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-blue-700 mb-1">
                      Total Users
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(stats?.totalUsers || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FiUsers className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiActivity className="w-4 h-4 text-green-500" />
                  <span className="text-green-600 font-medium">
                    {stats?.activeUsers || 0} active
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {stats?.newUsersToday || 0} new today
                  </span>
                </div>
              </div>

              {/* Total Payments Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-emerald-700 mb-1">
                      Total Revenue
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(stats?.totalAmountReceived || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FiDollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiTrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 font-medium">
                    Avg: {formatCurrency(stats?.averagePayment || 0)}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    This month: {formatCurrency(stats?.monthlyRevenue || 0)}
                  </span>
                </div>
              </div>

              {/* Successful Payments Card */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Successful Payments
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatNumber(stats?.totalSuccessfulPayments || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">
                    {stats?.paymentSuccessRate || 0}% success rate
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    Pending: {stats?.pendingPayments || 0}
                  </span>
                </div>
              </div>

              {/* Business Types Card */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-purple-700 mb-1">
                      Business Types
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(stats?.manufacturers || 0)}
                      </div>
                      <span className="text-gray-500 text-sm">
                        manufacturers
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <div className="text-3xl font-bold text-gray-900">
                        {formatNumber(stats?.traders || 0)}
                      </div>
                      <span className="text-gray-500 text-sm">traders</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <FiPackage className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FiPackage className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">
                      {stats?.manufacturers || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiShoppingBag className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">{stats?.traders || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-700">
                      {stats?.statesCovered || 0} states
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Membership Stats */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <FiUserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Membership Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Approved</span>
                    <span className="font-bold text-gray-900">
                      {stats?.approvedMembers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-bold text-gray-900">
                      {stats?.pendingMembers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rejected</span>
                    <span className="font-bold text-gray-900">
                      {stats?.rejectedMembers || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FiActivity className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h3>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => (window.location.href = "/admin/users")}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center justify-between"
                  >
                    <span>View All Users</span>
                    <FiUsers className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => (window.location.href = "/admin/view-payments")}
                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center justify-between"
                  >
                    <span>Payment Reports</span>
                    <FiDownload className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() =>
                      (window.location.href = "/admin/post-notification")
                    }
                    className="w-full text-left px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 flex items-center justify-between"
                  >
                    <span>Send Notifications</span>
                    <FiActivity className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Last updated:{" "}
                {new Date().toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {" • "}
                Data updates in real-time
              </p>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
