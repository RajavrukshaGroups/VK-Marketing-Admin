import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCopy,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiCalendar,
  FiEye,
  FiExternalLink,
  FiEdit,
  FiX,
  FiSave,
  FiLoader,
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";

export default function ListAllPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [totalPayments, setTotalPayments] = useState(0);

  // Edit modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    paymentSource: "",
    transactionId: "",
    amount: "",
    status: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [fetchingPayment, setFetchingPayment] = useState(false);

  /* =========================
     FETCH PAYMENTS
  ========================= */
  const fetchPayments = async (pageNo = 1, searchText = "") => {
    try {
      setLoading(true);
      const res = await api.get("/admin/payment/get-payment-records", {
        params: {
          page: pageNo,
          limit: 15,
          search: searchText,
        },
      });

      if (res.data.success) {
        setPayments(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalPayments(res.data.pagination?.totalPayments || 0);
      } else {
        toast.error("Failed to fetch payment records");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(
        err?.response?.data?.message || "Error fetching payment records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "SUCCESS":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FiCheckCircle className="w-4 h-4" />,
        };
      case "FAILED":
      case "CANCELLED":
        return {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          icon: <FiXCircle className="w-4 h-4" />,
        };
      case "PENDING":
      default:
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <FiClock className="w-4 h-4" />,
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  /* =========================
     EDIT PAYMENT HANDLERS
  ========================= */
  const handleEditClick = async (paymentId) => {
    try {
      setFetchingPayment(true);
      const res = await api.get(
        `/admin/payment/admin/view-payment/${paymentId}`
      );
      console.log("response edit", res);

      if (res.data.success) {
        const paymentData = res.data.data;

        // Check if payment is from Razorpay (cannot be edited)
        if (paymentData.razorpay?.paymentId) {
          toast.error("Razorpay payments cannot be edited");
          return;
        }

        // Prepare form data
        setEditFormData({
          paymentSource:
            paymentData.adminPanelPayment?.source ||
            paymentData.paymentSource ||
            "",
          transactionId:
            paymentData.adminPanelPayment?.transactionId ||
            paymentData.transactionId ||
            "",
          amount: paymentData.amount || "",
          status: paymentData.status || "",
        });

        setEditingPayment(paymentData);
        setEditModalOpen(true);
      } else {
        toast.error("Failed to fetch payment details");
      }
    } catch (err) {
      console.error("Fetch payment error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch payment details"
      );
    } finally {
      setFetchingPayment(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      setEditLoading(true);

      const res = await api.put(
        `/admin/payment/admin/payment/edit/${editingPayment._id}`,
        editFormData
      );

      if (res.data.success) {
        toast.success("Payment record updated successfully");
        setEditModalOpen(false);
        setEditingPayment(null);
        fetchPayments(page, search); // Refresh the list
      } else {
        toast.error(res.data.message || "Failed to update payment");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update payment record"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingPayment(null);
    setEditFormData({
      paymentSource: "",
      transactionId: "",
      amount: "",
      status: "",
    });
  };

  /* =========================
     PAYMENT SOURCE OPTIONS
  ========================= */
  const paymentSourceOptions = [
    { value: "ADMIN", label: "Admin Added" },
    { value: "CASH", label: "Cash" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "UPI", label: "UPI" },
    { value: "NEFT", label: "NEFT" },
    { value: "IMPS", label: "IMPS" },
  ];

  const statusOptions = [
    { value: "SUCCESS", label: "Success" },
    { value: "PENDING", label: "Pending" },
    { value: "FAILED", label: "Failed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* <ToastContainer
          position="top-right"
          autoClose={3000}
          className="!z-[9999]"
          toastClassName="!bg-white !text-gray-800 !border !border-gray-200 !rounded-xl !shadow-lg"
        /> */}

        {/* Edit Payment Modal */}
        {editModalOpen && editingPayment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                    <FiEdit className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Edit Payment Record
                    </h3>
                    <p className="text-sm text-gray-500">
                      {editingPayment.companyName ||
                        editingPayment.user?.companyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <form onSubmit={handleEditSubmit} className="space-y-6">
                  {/* Payment ID */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Payment ID
                    </label>
                    <input
                      type="text"
                      value={editingPayment._id}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>

                  {/* Company Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={
                          editingPayment.companyName ||
                          editingPayment.user?.companyName ||
                          "N/A"
                        }
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        User ID
                      </label>
                      <input
                        type="text"
                        value={editingPayment.user?.userId || "N/A"}
                        readOnly
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Payment Source */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Payment Source *
                    </label>
                    <select
                      name="paymentSource"
                      value={editFormData.paymentSource}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select Payment Source</option>
                      {paymentSourceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transaction ID */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={editFormData.transactionId}
                      onChange={handleEditFormChange}
                      placeholder="Enter transaction ID if available"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Required for UPI, NEFT, IMPS, CHEQUE payments
                    </p>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Amount (₹) *
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={editFormData.amount}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                      min="0"
                      step="1"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={editFormData.status}
                      onChange={handleEditFormChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Select Status</option>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Current Membership Plan */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Membership Plan
                    </label>
                    <input
                      type="text"
                      value={editingPayment.membershipPlan?.name || "N/A"}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500 text-sm"
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {editLoading ? (
                        <>
                          <FiLoader className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiSave className="w-4 h-4" />
                          Update Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiCreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-left font-bold text-gray-900">
                  Payment Records
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View and manage all membership payment transactions
                </p>
              </div>
            </div>

            <div className="hidden md:block bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Total Transactions:</span>
                <span className="font-bold text-emerald-600">
                  {totalPayments}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, email, order ID, or payment ID..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl 
                shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                transition-all duration-200 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FiCreditCard className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Payment Transactions
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                  Page {page} of {totalPages}
                </div>
              </div>

              {!loading && payments.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {payments.length} records
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-700 font-medium">
                Loading payment records...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait while we fetch the transactions
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && payments.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FiCreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Payment Records Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md text-center mb-6">
                {search
                  ? "No results match your search criteria."
                  : "There are no payment records in the system yet."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Payments Table */}
          {!loading && payments.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>Customer Details</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span className="w-4 h-4 text-center">₹</span>
                          <span>Payment Info</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-4 h-4" />
                          <span>Transaction</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>Referral Info</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          <span>Date & Time</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {payments.map((payment) => {
                      const isRazorpay = !!payment.razorpay;
                      const isAdminPayment = !!payment.adminPanelPayment;
                      const statusConfig = getStatusConfig(payment.status);
                      const isSuccess = payment.status === "SUCCESS";
                      const canEdit = !isRazorpay && isAdminPayment;

                      return (
                        <tr
                          key={payment._id}
                          className="group hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-white transition-all duration-150"
                        >
                          {/* Customer Details Column - Compact with Referral */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {/* Company Info */}
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Company
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 bg-emerald-50 rounded-md">
                                    <FiUser className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {payment.companyName.toUpperCase() ||
                                        payment.user?.companyName.toUpperCase() ||
                                        "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-500">
                                        ID: {payment.user?.userId || "N/A"}
                                      </span>
                                      <div
                                        className={`px-1.5 py-0.5 rounded text-xs ${
                                          payment.referral?.source === "ADMIN"
                                            ? "bg-purple-100 text-purple-700"
                                            : payment.referral?.source ===
                                              "USER"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                      >
                                        {payment.referral?.source === "ADMIN"
                                          ? "Admin"
                                          : payment.referral?.source === "USER"
                                          ? "Referred"
                                          : "Unknown"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Contact and Referral */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FiMail className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600 truncate">
                                    {payment.email ||
                                      payment.user?.email ||
                                      "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FiPhone className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-600">
                                    {payment.mobileNumber ||
                                      payment.user?.mobileNumber ||
                                      "N/A"}
                                  </span>
                                </div>

                                {/* Referral Details */}
                                {payment.referral?.referredByUserId && (
                                  <div className="pt-1 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                      Referred by:
                                    </div>
                                    <div className="text-xs font-medium text-gray-900 truncate">
                                      {payment.referral?.referredByCompanyName}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      ID: {payment.referral?.referredByUserId}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Payment Info Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Amount
                                </div>
                                <div className="text-lg font-bold text-emerald-700">
                                  {formatCurrency(payment.amount)}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Membership Plan
                                  </div>
                                  <div
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-block ${
                                      payment.membershipPlan?.name === "GOLD"
                                        ? "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-300 shadow-sm"
                                        : payment.membershipPlan?.name ===
                                          "PREMIUM"
                                        ? "bg-gradient-to-r from-indigo-100 to-purple-50 text-indigo-800 border border-indigo-300 shadow-sm"
                                        : payment.membershipPlan?.name ===
                                          "STANDARD"
                                        ? "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-300 shadow-sm"
                                        : "bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-300 shadow-sm"
                                    }`}
                                  >
                                    {payment.membershipPlan?.name || "N/A"}
                                  </div>
                                </div>
                                {payment.membershipPlan?.durationInDays && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Duration
                                    </div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {payment.membershipPlan.durationInDays}{" "}
                                      days
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Transaction Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {/* ================= RAZORPAY FLOW ================= */}
                              {isRazorpay && (
                                <>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Order ID
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded truncate flex-1">
                                        {payment.razorpay.orderId}
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            payment.razorpay.orderId,
                                            "Order ID"
                                          )
                                        }
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Payment ID
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded truncate flex-1">
                                        {payment.razorpay.paymentId}
                                      </span>
                                      <button
                                        onClick={() =>
                                          copyToClipboard(
                                            payment.razorpay.paymentId,
                                            "Payment ID"
                                          )
                                        }
                                        className="p-1 hover:bg-gray-100 rounded"
                                      >
                                        <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                                      </button>
                                    </div>
                                  </div>

                                  {payment.status === "SUCCESS" && (
                                    <button
                                      onClick={() =>
                                        window.open(
                                          `https://dashboard.razorpay.com/app/payments/${payment.razorpay.paymentId}`,
                                          "_blank"
                                        )
                                      }
                                      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                                    >
                                      <FiExternalLink className="w-3 h-3" />
                                      View on Razorpay
                                    </button>
                                  )}
                                </>
                              )}

                              {/* ================= ADMIN PANEL FLOW ================= */}
                              {isAdminPayment && !isRazorpay && (
                                <>
                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Payment Source
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 border border-purple-200 text-sm font-semibold">
                                      {payment.adminPanelPayment.source}
                                    </div>
                                  </div>

                                  <div>
                                    <div className="text-xs text-gray-500 mb-1">
                                      Transaction ID
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded flex-1">
                                        {payment.adminPanelPayment
                                          .transactionId || "N/A"}
                                      </span>

                                      {payment.adminPanelPayment
                                        .transactionId && (
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              payment.adminPanelPayment
                                                .transactionId,
                                              "Transaction ID"
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <FiCopy className="w-3.5 h-3.5 text-gray-500" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-xs italic text-gray-500">
                                    Recorded via Admin Panel
                                  </div>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Referral Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {/* Referral Source */}
                              <div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Source
                                </div>
                                <div
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                    payment.referral?.source === "ADMIN"
                                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                                      : payment.referral?.source === "USER"
                                      ? "bg-green-100 text-green-700 border border-green-200"
                                      : "bg-gray-100 text-gray-700 border border-gray-200"
                                  }`}
                                >
                                  {payment.referral?.source === "ADMIN"
                                    ? "Admin Referral"
                                    : payment.referral?.source === "USER"
                                    ? "User Referral"
                                    : "Unknown"}
                                </div>
                              </div>

                              {/* Referred By Details */}
                              {payment.referral?.referredByUserId && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Referred By
                                  </div>
                                  <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                    <div className="space-y-1">
                                      <div className="text-xs font-medium text-gray-900 truncate">
                                        {payment.referral
                                          ?.referredByCompanyName || "Unknown"}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-600 font-mono">
                                          {payment.referral?.referredByUserId}
                                        </span>
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              payment.referral
                                                ?.referredByUserId,
                                              "Referrer ID"
                                            )
                                          }
                                          className="p-0.5 hover:bg-blue-200 rounded transition-colors ml-auto"
                                          title="Copy Referrer ID"
                                        >
                                          <FiCopy className="w-3 h-3 text-blue-600" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* If no referral (Admin referral) */}
                              {payment.referral?.source === "ADMIN" &&
                                !payment.referral?.referredByUserId && (
                                  <div className="text-xs text-gray-500 italic">
                                    Directly registered by Admin
                                  </div>
                                )}
                            </div>
                          </td>

                          {/* Date & Time Column */}
                          <td className="px-6 py-4 min-w-[200px]">
                            <div className="space-y-4">
                              {/* Payment Date Section */}
                              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-3 rounded-xl border border-emerald-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="p-1.5 bg-emerald-100 rounded-md">
                                    <FiCalendar className="w-3.5 h-3.5 text-emerald-600" />
                                  </div>
                                  <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                    Payment Date
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-sm font-bold text-gray-900">
                                    {payment.paidAt
                                      ? new Date(
                                          payment.paidAt
                                        ).toLocaleDateString("en-IN", {
                                          weekday: "short",
                                          day: "2-digit",
                                          month: "short",
                                          year: "numeric",
                                        })
                                      : "N/A"}
                                  </div>
                                  {payment.paidAt && (
                                    <div className="text-sm text-gray-700">
                                      {new Date(
                                        payment.paidAt
                                      ).toLocaleTimeString("en-IN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                      })}
                                    </div>
                                  )}
                                  {payment.paidAt && (
                                    <div className="text-xs text-emerald-600 font-medium">
                                      {formatDate(payment.paidAt)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Payment Status
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                >
                                  {statusConfig.icon}
                                  <span className="font-semibold text-sm">
                                    {payment.status}
                                  </span>
                                </div>
                              </div>
                              {isSuccess && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">
                                    Receipt
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Generate and download receipt
                                      const receiptText = `
Payment Receipt
================
Order ID: ${payment.razorpay?.orderId || "N/A"}
Payment ID: ${payment.razorpay?.paymentId || "N/A"}
Amount: ${formatCurrency(payment.amount)}
Status: ${payment.status}
Date: ${formatDate(payment.paidAt)}
Company: ${payment.companyName || payment.user?.companyName || "N/A"}
Email: ${payment.email || payment.user?.email || "N/A"}
Plan: ${payment.membershipPlan?.name || "N/A"}
                                      `.trim();
                                      copyToClipboard(receiptText, "Receipt");
                                    }}
                                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium rounded-lg hover:shadow-sm transition-all duration-200 border border-gray-200 hover:border-gray-300"
                                  >
                                    <FiCopy className="w-3.5 h-3.5" />
                                    Copy Receipt
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col items-center gap-2">
                              {/* Edit Button (only for admin panel payments) */}
                              {canEdit && (
                                <button
                                  onClick={() => handleEditClick(payment._id)}
                                  disabled={fetchingPayment}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 border border-emerald-600 hover:border-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit Payment"
                                >
                                  <FiEdit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Disabled Edit Button for Razorpay */}
                              {isRazorpay && (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-300 text-gray-500 font-medium rounded-lg border border-gray-400 cursor-not-allowed"
                                  title="Razorpay payments cannot be edited"
                                >
                                  <FiEdit className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Copy Receipt Button */}
                              {isSuccess && (
                                <button
                                  onClick={() => {
                                    const receiptText = `
Payment Receipt
================
${
  isRazorpay
    ? `Order ID: ${payment.razorpay.orderId}`
    : `Payment Source: ${payment.adminPanelPayment?.source}`
}
${
  isRazorpay
    ? `Payment ID: ${payment.razorpay.paymentId}`
    : `Transaction ID: ${payment.adminPanelPayment?.transactionId || "N/A"}`
}
Amount: ${formatCurrency(payment.amount)}
Status: ${payment.status}
Date: ${formatDate(payment.paidAt)}
Company: ${payment.companyName || payment.user?.companyName || "N/A"}
Email: ${payment.email || payment.user?.email || "N/A"}
Plan: ${payment.membershipPlan?.name || "N/A"}
                                      `.trim();
                                    copyToClipboard(receiptText, "Receipt");
                                  }}
                                  className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-medium rounded-lg hover:shadow-sm transition-all duration-200 border border-blue-200 hover:border-blue-300"
                                  title="Copy Receipt"
                                >
                                  <FiCopy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="text-sm text-gray-600">
                      Page{" "}
                      <span className="font-bold text-gray-900">{page}</span> of{" "}
                      <span className="font-bold text-gray-900">
                        {totalPages}
                      </span>
                      {" • "}
                      <span className="text-gray-500">
                        {totalPayments} total payments
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl 
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                          transition-all duration-200 border border-transparent hover:border-gray-200
                          hover:shadow-sm flex items-center justify-center"
                        title="First page"
                      >
                        <FiChevronsLeft className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl 
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                          transition-all duration-200 border border-transparent hover:border-gray-200
                          hover:shadow-sm flex items-center justify-center"
                        title="Previous page"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>

                      <div className="px-4 py-2 text-sm font-bold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl border border-gray-200">
                        {page}
                      </div>

                      <button
                        onClick={() =>
                          setPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={page === totalPages}
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl 
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                          transition-all duration-200 border border-transparent hover:border-gray-200
                          hover:shadow-sm flex items-center justify-center"
                        title="Next page"
                      >
                        <FiChevronRight className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages}
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl 
                          disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent
                          transition-all duration-200 border border-transparent hover:border-gray-200
                          hover:shadow-sm flex items-center justify-center"
                        title="Last page"
                      >
                        <FiChevronsRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stats Summary */}
        {!loading && payments.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatCurrency(
                  payments.reduce((sum, p) => sum + (p.amount || 0), 0)
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">
                Successful Payments
              </div>
              <div className="text-2xl font-bold text-emerald-700">
                {payments.filter((p) => p.status === "SUCCESS").length}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Average Payment</div>
              <div className="text-2xl font-bold text-emerald-700">
                {formatCurrency(
                  payments.length > 0
                    ? payments.reduce((sum, p) => sum + (p.amount || 0), 0) /
                        payments.length
                    : 0
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
