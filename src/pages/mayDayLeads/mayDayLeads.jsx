import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import {
  FiCreditCard,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiX,
} from "react-icons/fi";

const MayDayLeads = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/payment/mayday/list", {
        params: {
          page,
          search,
        },
      });
      console.log("response", res);
      if (res.data?.success) {
        setData(res.data.data || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [page, search]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "SUCCESS":
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: <FiDollarSign className="w-3.5 h-3.5" />,
        };
      case "FAILED":
      case "CANCELLED":
        return {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          icon: <FiDollarSign className="w-3.5 h-3.5" />,
        };
      default:
        return {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: <FiDollarSign className="w-3.5 h-3.5" />,
        };
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <FiCreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-gray-900"
                  style={{ textAlign: "left" }}
                >
                  May Day Leads
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  View all registered leads from the May Day campaign
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by company, proprietor, mobile..."
                value={search}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-gray-200 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 
                  transition-all duration-200"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Lead Registrations
                  </span>
                </div>
                {!loading && data.length > 0 && (
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                    {data.length} records
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-16 h-16 border-4 border-emerald-100 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-700 font-medium">Loading leads...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && data.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4">
                <FiCreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Leads Found
              </h3>
              <p className="text-gray-500 text-sm max-w-md text-center">
                {search
                  ? "No results match your search criteria. Try a different keyword."
                  : "There are no May Day campaign registrations yet."}
              </p>
              {search && (
                <button
                  onClick={clearSearch}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Leads Table */}
          {!loading && data.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4" />
                          <span>Company / Proprietor</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiPhone className="w-4 h-4" />
                          <span>Contact</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiMapPin className="w-4 h-4" />
                          <span>Address</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-4 h-4" />
                          <span>Plan & Amount</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="w-4 h-4" />
                          <span>Date</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        <div className="flex items-center gap-2">
                          <FiCreditCard className="w-4 h-4" />
                          <span>Unique ID</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.map((item) => {
                      const statusConfig = getStatusConfig(item.status);
                      return (
                        <tr
                          key={item._id}
                          className="group hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-white transition-all duration-150"
                        >
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900">
                                {item.companyName || "N/A"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {item.proprietors || "N/A"}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FiPhone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-sm text-gray-700">
                                {item.mobileNumber || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {item.formData?.address ? (
                              <div className="text-xs text-gray-600 space-y-0.5">
                                {item.formData.address.street && (
                                  <div>{item.formData.address.street}</div>
                                )}
                                {item.formData.address.taluk && (
                                  <div>{item.formData.address.taluk}</div>
                                )}
                                {item.formData.address.district && (
                                  <div>{item.formData.address.district}</div>
                                )}
                                {item.formData.address.state && (
                                  <div>{item.formData.address.state}</div>
                                )}
                                {item.formData.address.pin && (
                                  <div className="font-mono text-emerald-700 font-medium mt-1">
                                    PIN: {item.formData.address.pin}
                                  </div>
                                )}
                                {item.formData?.nearbyShop && (
                                  <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                    🏪 Nearby Shop: {item.formData.nearbyShop}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-900">
                                {item.isLuckyDraw ? (
                                  <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs">
                                    🎁 Lucky Draw
                                  </span>
                                ) : (
                                  item.selectedPlans
                                    ?.map((p) => p.name)
                                    .join(", ")
                                )}
                              </div>
                              <div className="text-lg font-bold text-emerald-700">
                                {item.isLuckyDraw
                                  ? "FREE"
                                  : formatCurrency(item.amount)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(item.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            {item.uniqueId ? (
                              <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold inline-block tracking-wide">
                                {item.uniqueId}
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                            >
                              {statusConfig.icon}
                              <span className="font-semibold text-sm">
                                {item.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Professional Style */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-bold text-gray-900">{page}</span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {totalPages}
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
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default MayDayLeads;
