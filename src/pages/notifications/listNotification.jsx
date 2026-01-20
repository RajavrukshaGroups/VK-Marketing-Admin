import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  Bell,
  ExternalLink,
  Filter,
  Search,
  Calendar,
  Users,
  Trash2,
  Copy,
  AlertCircle,
  Info,
  Building,
  Download,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function ListNotification() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    companiesReached: 0,
    recent7Days: 0,
    active: 0,
    inactive: 0,
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "/admin/notification/companies/notifications"
      );

      if (response.data.success) {
        const data = response.data.data;
        const notificationsWithStatus = data.map((notification) => ({
          ...notification,
          isActive:
            notification.isActive !== undefined ? notification.isActive : true,
        }));
        setNotifications(notificationsWithStatus);

        let totalCompanies = 0;
        let activeCount = 0;
        let inactiveCount = 0;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        notificationsWithStatus.forEach((notification) => {
          totalCompanies += notification.companies?.length || 0;
          if (notification.isActive) {
            activeCount++;
          } else {
            inactiveCount++;
          }
        });

        setStats({
          total: notificationsWithStatus.length,
          companiesReached: totalCompanies,
          recent7Days: notificationsWithStatus.filter(
            (n) => new Date(n.sentAt) > sevenDaysAgo
          ).length,
          active: activeCount,
          inactive: inactiveCount,
        });

        toast.success(`Loaded ${notificationsWithStatus.length} notifications`);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };

  const handleDeleteNotification = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this notification? This action cannot be undone."
      )
    ) {
      try {
        const deleteToast = toast.loading("Deleting notification...");
        await api.delete(`/admin/notification/delete/notification/${id}`);

        setNotifications(notifications.filter((n) => n._id !== id));
        setSelectedNotifications(
          selectedNotifications.filter((nId) => nId !== id)
        );

        toast.update(deleteToast, {
          render: "Notification deleted successfully",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        fetchNotifications();
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedNotifications.length} notification(s)? This action cannot be undone.`
      )
    ) {
      try {
        const deleteToast = toast.loading(
          `Deleting ${selectedNotifications.length} notification(s)...`
        );

        const deletePromises = selectedNotifications.map((id) =>
          api.delete(`/admin/notification/delete/notification/${id}`)
        );

        await Promise.all(deletePromises);
        setNotifications(
          notifications.filter((n) => !selectedNotifications.includes(n._id))
        );
        setSelectedNotifications([]);

        toast.update(deleteToast, {
          render: `${selectedNotifications.length} notification(s) deleted successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        fetchNotifications();
      } catch (error) {
        console.error("Error deleting notifications:", error);
        toast.error("Failed to delete notifications");
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const notification = notifications.find((n) => n._id === id);
      const newStatus = !notification?.isActive;
      const statusToast = toast.loading(
        newStatus
          ? "Activating notification..."
          : "Deactivating notification..."
      );

      const response = await api.patch(
        `/admin/notification/toggle/notification/${id}`
      );

      if (response.data.success) {
        setNotifications(
          notifications.map((notification) =>
            notification._id === id
              ? { ...notification, isActive: response.data.data.isActive }
              : notification
          )
        );

        const activeCount = notifications.filter((n) =>
          n._id === id ? response.data.data.isActive : n.isActive
        ).length;

        setStats((prev) => ({
          ...prev,
          active: activeCount,
          inactive: notifications.length - activeCount,
        }));

        toast.update(statusToast, {
          render: `Notification ${
            response.data.data.isActive ? "activated" : "deactivated"
          } successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error toggling notification status:", error);
      toast.error("Failed to update notification status");
    }
  };

  const handleToggleSelectedStatus = async (status) => {
    if (selectedNotifications.length === 0) return;

    const confirmMessage = status
      ? `Are you sure you want to activate ${selectedNotifications.length} notification(s)?`
      : `Are you sure you want to deactivate ${selectedNotifications.length} notification(s)?`;

    if (window.confirm(confirmMessage)) {
      try {
        const toggleToast = toast.loading(
          status
            ? `Activating ${selectedNotifications.length} notification(s)...`
            : `Deactivating ${selectedNotifications.length} notification(s)...`
        );

        const togglePromises = selectedNotifications.map((id) =>
          api.patch(`/admin/notification/toggle/notification/${id}`)
        );

        const results = await Promise.all(togglePromises);

        setNotifications(
          notifications.map((notification) => {
            if (selectedNotifications.includes(notification._id)) {
              const result = results.find(
                (r) => r.data.data._id === notification._id
              );
              return result
                ? { ...notification, isActive: result.data.data.isActive }
                : notification;
            }
            return notification;
          })
        );

        toast.update(toggleToast, {
          render: `${selectedNotifications.length} notification(s) ${
            status ? "activated" : "deactivated"
          } successfully`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        fetchNotifications();
      } catch (error) {
        console.error("Error toggling selected notifications:", error);
        toast.error("Failed to update notification status");
      }
    }
  };

  const copyNotificationLink = (url) => {
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case "ALERT":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
      toast.info("Selection cleared");
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n._id));
      toast.info(`${filteredNotifications.length} notification(s) selected`);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id)
        ? prev.filter((notificationId) => notificationId !== id)
        : [...prev, id]
    );
  };

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      searchTerm === "" ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || notification.type === filterType;

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && notification.isActive) ||
      (filterStatus === "inactive" && !notification.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const formatDate = (dateString) => {
    return format(new Date(dateString), "PPpp");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all sent notifications
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Companies Reached
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.companiesReached}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Building className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.active}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-full">
                <Eye className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stats.inactive}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <EyeOff className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="INFO">Info</option>
                  <option value="ALERT">Alert</option>
                  <option value="SUCCESS">Success</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {selectedNotifications.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleSelectedStatus(true)}
                    className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleToggleSelectedStatus(false)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <EyeOff className="h-4 w-4" />
                    Deactivate
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotifications([]);
                      toast.info("Selection cleared");
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex items-center gap-4">
              <div className="grid grid-cols-12 gap-4 flex-1">
                <div className="col-span-4 text-sm font-medium text-gray-700">
                  Notification
                </div>
                <div className="col-span-1 text-sm font-medium text-gray-700">
                  Type
                </div>
                <div className="col-span-1 text-sm font-medium text-gray-700">
                  Status
                </div>
                <div className="col-span-2 text-sm font-medium text-gray-700">
                  Recipients
                </div>
                <div className="col-span-3 text-sm font-medium text-gray-700">
                  Sent Date
                </div>
                <div className="col-span-1 text-sm font-medium text-gray-700 text-right">
                  Actions
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredNotifications.length === 0 && (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications found
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filter terms"
                  : "No notifications have been sent yet"}
              </p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && filteredNotifications.length > 0 && (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="grid grid-cols-12 gap-4 flex-1">
                        {/* Notification Content */}
                        <div className="col-span-4">
                          <div className="flex items-start gap-3">
                            {getNotificationTypeIcon(notification.type)}
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {notification.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.url && (
                                <button
                                  onClick={() =>
                                    copyNotificationLink(notification.url)
                                  }
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                  <Copy className="h-3 w-3" />
                                  Copy Link
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              notification.type === "INFO"
                                ? "bg-blue-100 text-blue-800"
                                : notification.type === "ALERT"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {notification.type}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <button
                            onClick={() => handleToggleStatus(notification._id)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              notification.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            }`}
                            title={
                              notification.isActive
                                ? "Active - Click to deactivate"
                                : "Inactive - Click to activate"
                            }
                          >
                            {notification.isActive ? (
                              <>
                                <Eye className="h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Inactive
                              </>
                            )}
                          </button>
                        </div>

                        {/* Recipients */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {notification.companies?.length || 0} companies
                            </span>
                          </div>
                          <button
                            onClick={() => toggleExpand(notification._id)}
                            className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {expandedNotification === notification._id
                              ? "Hide details"
                              : "View companies"}
                          </button>
                        </div>

                        {/* Sent Date */}
                        <div className="col-span-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">
                              {formatDate(notification.sentAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            By: {notification.createdBy}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center justify-end gap-2">
                          {notification.url && (
                            <button
                              onClick={() =>
                                window.open(notification.url, "_blank")
                              }
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Open Link"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Company List */}
                    {expandedNotification === notification._id &&
                      notification.companies && (
                        <div className="mt-4 ml-10 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Recipient Companies ({notification.companies.length}
                            )
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {notification.companies.map((company, index) => (
                              <div
                                key={company.id}
                                className="bg-white p-3 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Building className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {company.companyName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      ID: {company.userId}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                Showing {filteredNotifications.length} of {notifications.length}{" "}
                notifications
              </span>
              {(searchTerm ||
                filterType !== "all" ||
                filterStatus !== "all") && (
                <span className="text-blue-600">Filtered results</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  // Export functionality can be added here
                  toast.info("Export functionality coming soon!");
                }}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
