import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiSearch,
  FiUsers,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiMapPin,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMap,
  FiX,
  FiUser,
  FiLink,
  FiShare2,
  FiDollarSign,
  FiCreditCard,
  FiCalendar,
  FiHome,
  FiFileText,
  FiEdit,
  FiSave,
} from "react-icons/fi";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";
import AdminLayout from "../../components/layout/AdminLayout";
import UserDetailsModal from "./userDetailsModal";
import EditMemberForm from "./editMemberForm";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState({});
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [showReferrerModal, setShowReferrerModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log("users", users);
  console.log("selectedReferrer", selectedReferrer);

  /* =========================
     FETCH USERS
  ========================= */
  const fetchUsers = async (pageNo = 1, searchText = "") => {
    try {
      setLoading(true);
      const res = await api.get("/users/fetch-user-details", {
        params: {
          page: pageNo,
          search: searchText,
        },
      });

      if (res.data.success) {
        setUsers(res.data.data);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      toast.error(err || "Error fetching users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      setLoadingUserDetails(true);
      const res = await api.get(`/users/user/${userId}`);
      console.log("response", res);

      if (res.data.success) {
        setUserDetails(res.data.data);
        setShowUserModal(true);
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      toast.error(
        err?.response?.data?.message || "Failed to fetch user details"
      );
    } finally {
      setLoadingUserDetails(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, search]);

  const handleSearch = (e) => {
    setPage(1);
    setSearch(e.target.value);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user._id);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  // Function to handle form submission
  const handleUpdateUser = async (updatedData) => {
    try {
      setIsSubmitting(true);
      const res = await api.patch(
        `/users/edit-user/${editingUser._id}`,
        updatedData
      );

      if (res.data.success) {
        toast.success("Member details updated successfully");
        setShowEditModal(false);
        setEditingUser(null);

        // Refresh the user list
        fetchUsers(page, search);
      } else {
        toast.error(res.data.message || "Failed to update member");
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update member details"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setShowPassword((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FiCheckCircle className="w-4 h-4" />,
        };
      case "REJECTED":
        return {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          icon: <FiXCircle className="w-4 h-4" />,
        };
      default:
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <FiClock className="w-4 h-4" />,
        };
    }
  };

  // Function to handle address view
  const handleViewAddress = (user) => {
    setSelectedAddress({
      state: user.address?.state || "Not provided",
      district: user.address?.district || "Not provided",
      taluk: user.address?.taluk || "Not provided",
      street: user.address?.street || "Not provided",
      companyName: user.companyName || "N/A",
      userId: user.userId || "N/A",
    });
    setShowAddressModal(true);
  };

  // Function to handle referrer view
  // const handleViewReferrer = (user) => {
  //   if (user.referral?.referredByUser) {
  //     setSelectedReferrer({
  //       referrer: user.referral.referredByUser,
  //       referredUserId: user.referredByUserId,
  //       source: user.referral.source,
  //       currentUser: {
  //         userId: user.userId,
  //         companyName: user.companyName,
  //       },
  //     });
  //     setShowReferrerModal(true);
  //   } else {
  //     toast.info("This user was referred by Admin directly");
  //   }
  // };
  const handleViewReferrer = (user) => {
    if (user.referral?.referredByUser) {
      setSelectedReferrer({
        referrer: user.referral.referredByUser,
        referredUserId: user.referral.referredByUserId,
        source: user.referral.source,
        currentUser: {
          userId: user.userId,
          companyName: user.companyName,
        },
      });
      setShowReferrerModal(true);
    } else {
      toast.info("This user was referred by Admin directly");
    }
  };

  // Function to close modals
  const closeAddressModal = () => {
    setShowAddressModal(false);
    setSelectedAddress(null);
  };

  const closeReferrerModal = () => {
    setShowReferrerModal(false);
    setSelectedReferrer(null);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          className="!z-[9999]"
          toastClassName="!bg-white !text-gray-800 !border !border-gray-200 !rounded-xl !shadow-lg"
        />

        {/* Address Modal */}
        {showAddressModal && selectedAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <FiMap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Complete Address
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedAddress.companyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAddressModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">User ID</div>
                      <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedAddress.userId}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Company</div>
                      <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                        {selectedAddress.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Address Details
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs text-gray-500 pt-1">
                          State:
                        </div>
                        <div className="flex-1 text-sm font-medium text-gray-900 bg-blue-50 px-3 py-2 rounded-lg">
                          {selectedAddress.state}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs text-gray-500 pt-1">
                          District:
                        </div>
                        <div className="flex-1 text-sm font-medium text-gray-900 bg-blue-50 px-3 py-2 rounded-lg">
                          {selectedAddress.district}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs text-gray-500 pt-1">
                          Taluk:
                        </div>
                        <div className="flex-1 text-sm font-medium text-gray-900 bg-blue-50 px-3 py-2 rounded-lg">
                          {selectedAddress.taluk}
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-24 text-xs text-gray-500 pt-1">
                          Full Address:
                        </div>
                        <div className="flex-1 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg whitespace-pre-wrap">
                          {selectedAddress.street}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => {
                    const fullAddress = `${selectedAddress.street}, ${selectedAddress.taluk}, ${selectedAddress.district}, ${selectedAddress.state}`;
                    copyToClipboard(fullAddress, "Full address");
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                >
                  <FiCopy className="w-4 h-4" />
                  Copy Full Address
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Referrer Modal */}
        {showReferrerModal && selectedReferrer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
                    <FiUser className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Referrer Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      Referral information for{" "}
                      {selectedReferrer.currentUser.companyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeReferrerModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5">
                <div className="space-y-6">
                  {/* Current User */}
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-xs text-blue-600 font-semibold mb-2">
                      CURRENT USER
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedReferrer.currentUser.companyName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {selectedReferrer.currentUser.userId}
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedReferrer.source === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {selectedReferrer.source === "ADMIN"
                          ? "Admin Referral"
                          : "User Referral"}
                      </div>
                    </div>
                  </div>

                  {/* Referrer Details */}
                  <div>
                    <div className="text-sm font-semibold text-gray-700 mb-3">
                      Referred By
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-green-100 to-green-50 rounded-lg">
                          <FiUser className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900">
                            {selectedReferrer.referrer.companyName || "N/A"}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            User ID: {selectedReferrer.referrer.userId || "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Email
                          </div>
                          <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg truncate">
                            {selectedReferrer.referrer.email || "Not available"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">
                            Mobile
                          </div>
                          <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                            {selectedReferrer.referrer.mobileNumber ||
                              "Not available"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referral Info */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Referral Source
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedReferrer.source === "ADMIN" ? (
                        <>
                          <div className="p-1.5 bg-purple-100 rounded-md">
                            <FiUsers className="w-4 h-4 text-purple-600" />
                          </div>
                          <span className="text-sm text-gray-700">
                            Directly registered by Admin
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-green-100 rounded-md">
                            <FiLink className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700">
                            Referred by another member
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    copyToClipboard(
                      selectedReferrer.referrer.userId,
                      "Referrer User ID"
                    );
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium rounded-lg hover:shadow-sm transition-all duration-200 flex items-center gap-2"
                >
                  <FiCopy className="w-4 h-4" />
                  Copy Referrer ID
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {showUserModal && userDetails && (
          <UserDetailsModal
            userDetails={userDetails}
            onClose={() => {
              setShowUserModal(false);
              setUserDetails(null);
            }}
            onCopyToClipboard={copyToClipboard}
            loading={loadingUserDetails}
            getStatusConfig={getStatusConfig}
          />
        )}

        {/* Edit Member Modal */}
        {showEditModal && editingUser && (
          <EditMemberForm
            user={editingUser}
            onClose={() => {
              setShowEditModal(false);
              setEditingUser(null);
            }}
            onSubmit={handleUpdateUser}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Registered Members
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage and monitor all registered business accounts
                </p>
              </div>
            </div>

            <div className="hidden md:block bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Total Records:</span>
                <span className="font-bold text-blue-600">{users.length}</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-8">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by company, email, mobile, or user ID..."
              value={search}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3.5 text-sm bg-white border border-gray-200 rounded-xl 
                shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
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
                  <FiBriefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Member Directory
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  Page {page} of {totalPages}
                </div>
              </div>

              {!loading && users.length > 0 && (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {users.length} results
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-700 font-medium">
                Loading member data...
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Please wait while we fetch the records
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && users.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Members Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md text-center mb-6">
                {search
                  ? "No results match your search criteria."
                  : "There are no registered users in the system yet."}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Users Table */}
          {!loading && users.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-blue-50 rounded-md"></div>
                          <span>User Details</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <span>Company Info</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiMail className="w-4 h-4" />
                          <span>Contact</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiBriefcase className="w-4 h-4" />
                          <span>Business</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>Location</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiShare2 className="w-4 h-4" />
                          <span>Referral</span>
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
                    {users.map((user) => {
                      const statusConfig = getStatusConfig(
                        user.membership.status
                      );
                      const hasReferrer = user.referral?.referredByUser;
                      const isAdminReferral = user.referral?.source === "ADMIN";

                      return (
                        <tr
                          key={user._id}
                          className="group hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-white transition-all duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm font-bold text-gray-900">
                                      {user.userId}
                                    </span>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(user.userId, "User ID")
                                      }
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Copy User ID"
                                    >
                                      <FiCopy className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="relative">
                                      <input
                                        type={
                                          showPassword[user._id]
                                            ? "text"
                                            : "password"
                                        }
                                        value={user.password}
                                        readOnly
                                        className="font-mono text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 pr-8 w-32"
                                      />
                                      <button
                                        onClick={() =>
                                          togglePasswordVisibility(user._id)
                                        }
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600"
                                      >
                                        {showPassword[user._id] ? (
                                          <FiEyeOff className="w-3 h-3" />
                                        ) : (
                                          <FiEye className="w-3 h-3" />
                                        )}
                                      </button>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full ${
                                        user.isActive
                                          ? "bg-emerald-100 text-emerald-700"
                                          : "bg-rose-100 text-rose-700"
                                      }`}
                                    >
                                      {user.isActive ? "Active" : "Inactive"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Company Info Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="font-medium text-gray-900 uppercase tracking-wide text-sm text-left">
                                {user.companyName}
                              </div>
                              {user.mobileNumber && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                                  <span>{user.mobileNumber}</span>
                                </div>
                              )}
                              {user.bankDetails && (
                                <div className="space-y-2 pt-2">
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-left">
                                      Bank:
                                    </span>
                                    <span className="text-sm text-gray-900">
                                      {user.bankDetails?.bankName || "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-left">
                                      Account:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-900 font-mono">
                                        {user.bankDetails?.accountNumber ||
                                          "N/A"}
                                      </span>
                                      {user.bankDetails?.accountNumber && (
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              user.bankDetails.accountNumber,
                                              "Account Number"
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                                          title="Copy Account Number"
                                        >
                                          <FiCopy className="w-3 h-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-left">
                                      IFSC:
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-900 font-mono">
                                        {user.bankDetails?.ifscCode || "N/A"}
                                      </span>
                                      {user.bankDetails?.ifscCode && (
                                        <button
                                          onClick={() =>
                                            copyToClipboard(
                                              user.bankDetails.ifscCode,
                                              "IFSC Code"
                                            )
                                          }
                                          className="p-1 hover:bg-gray-100 rounded transition-colors"
                                          title="Copy IFSC Code"
                                        >
                                          <FiCopy className="w-3 h-3 text-gray-500 hover:text-blue-600" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Contact Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* Mail Icon */}
                              <div className="p-1.5 bg-blue-50 rounded-md">
                                <FiMail className="w-3.5 h-3.5 text-blue-600" />
                              </div>

                              {/* Email Address */}
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {user.email || "-"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  Email address
                                </div>
                              </div>

                              {/* Copy to Clipboard */}
                              {user.email && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(user.email, "Email")
                                  }
                                  className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                                  title="Copy Email Address"
                                >
                                  <FiCopy className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Business Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-1.5">
                                  Category
                                </div>
                                <div className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1.5 rounded-lg">
                                  {user.businessCategory?.name || "—"}
                                </div>
                              </div>
                              {user.businessType?.length > 0 && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1.5">
                                    Business Type
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {user.businessType
                                      .slice(0, 2)
                                      .map((type, index) => (
                                        <span
                                          key={index}
                                          className="inline-block px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs font-medium rounded-full border border-gray-200"
                                        >
                                          {type}
                                        </span>
                                      ))}
                                    {user.businessType.length > 2 && (
                                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                        +{user.businessType.length - 2}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Location Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              {user.address?.state && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    State
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.address.state}
                                  </div>
                                </div>
                              )}
                              {user.address?.district && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    District
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.address.district}
                                  </div>
                                </div>
                              )}
                              {user.address?.taluk && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-1">
                                    Taluk
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.address.taluk}
                                  </div>
                                </div>
                              )}

                              {(user.address?.state ||
                                user.address?.district ||
                                user.address?.taluk ||
                                user.address?.street) && (
                                <div className="pt-2">
                                  <button
                                    onClick={() => handleViewAddress(user)}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:text-blue-800 hover:from-blue-100 hover:to-blue-200 text-sm font-medium rounded-lg transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                                  >
                                    <FiMap className="w-3.5 h-3.5" />
                                    View Address
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* NEW: Referral Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Referral Source
                                </div>
                                <div
                                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                    isAdminReferral
                                      ? "bg-purple-50 border-purple-200"
                                      : "bg-green-50 border-green-200"
                                  }`}
                                >
                                  {isAdminReferral ? (
                                    <>
                                      <FiUsers className="w-4 h-4 text-purple-600" />
                                      <span className="text-sm font-medium text-purple-700">
                                        Admin
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <FiUser className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-green-700">
                                        Member
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {hasReferrer && (
                                <div>
                                  <div className="text-xs text-gray-500 mb-2">
                                    Referred By
                                  </div>
                                  <button
                                    onClick={() => handleViewReferrer(user)}
                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-green-100 text-green-700 hover:text-green-800 hover:from-green-100 hover:to-green-200 text-sm font-medium rounded-lg transition-all duration-200 border border-green-200 hover:border-green-300 hover:shadow-sm w-full text-left"
                                  >
                                    <FiUser className="w-3.5 h-3.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium truncate">
                                        {user.referral.referredByUser
                                          .companyName || "Unknown"}
                                      </div>
                                      <div className="text-xs text-green-600 truncate">
                                        ID: {user.referral.referredByUserId}
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Plan Status
                                </div>
                                <div className="space-y-3">
                                  <div
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                  >
                                    {statusConfig.icon}
                                    <span className="font-semibold text-sm">
                                      {user.membership.status}
                                    </span>
                                  </div>
                                  <div
                                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                  >
                                    <span className="font-semibold text-sm">
                                      {user.membership?.plan?.name || "No Plan"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* View Button Column */}
                          {/* <td className="px-6 py-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 border border-blue-600 hover:border-blue-700"
                              >
                                <FiEye className="w-4 h-4" />
                                View
                              </button>
                            </div>
                          </td> */}

                          {/* Actions Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 border border-blue-600 hover:border-blue-700"
                                title="View Details"
                              >
                                <FiEye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 border border-emerald-600 hover:border-emerald-700"
                                title="Edit Member"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages >= 1 && (
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
                        {users.length} records
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
      </div>
    </AdminLayout>
  );
};

export default RegisteredUsers;
