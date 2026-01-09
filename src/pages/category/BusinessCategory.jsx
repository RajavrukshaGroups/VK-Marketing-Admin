import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { BsToggleOff, BsToggleOn } from "react-icons/bs";

const BusinessCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // 🔹 Fetch categories (paginated + search)
  const fetchCategories = async (pageNumber = 1, searchText = search) => {
    try {
      setListLoading(true);
      const res = await api.get(
        `/admin/category/fetch?page=${pageNumber}&limit=10&search=${encodeURIComponent(
          searchText
        )}`
      );

      setCategories(res.data.data || []);
      setTotalPages(res.data.pagination.totalPages);
      setTotalRecords(res.data.pagination.totalRecords);
      setPage(res.data.pagination.currentPage);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setListLoading(false);
    }
  };

  // 🔹 Search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchCategories(1, search);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // 🔹 Pagination change
  useEffect(() => {
    fetchCategories(page, search);
  }, [page]);

  // 🔹 Create category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);
      await api.post("/admin/category/create", { name, description });
      toast.success("Category added successfully");

      setName("");
      setDescription("");
      setPage(1);
      fetchCategories(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Toggle active / inactive
  const toggleStatus = async (id) => {
    try {
      await api.patch(`/admin/category/toggle/${id}`);
      toast.success("Category status updated");
      fetchCategories(page);
    } catch {
      toast.error("Failed to update category status");
    }
  };

  const openEditModal = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await api.put(`/admin/category/edit/${editId}`, {
        name: editName,
        description: editDescription,
      });

      toast.success("Category updated successfully");
      setEditOpen(false);
      fetchCategories(page, search); // ✅ IMPORTANT: keeps pagination
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Business Categories
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage business classifications used across the system
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FiPlus className="w-4 h-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                New Category
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Hotel, Garments, Cottage"
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a brief description..."
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200 resize-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 
                  text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50
                  transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-4 h-4" />
                    Add Category
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* List Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Category List
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {totalRecords} categories found
                  </p>
                </div>

                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      w-full sm:w-64 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="relative">
              {listLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                    <span className="text-sm font-medium text-gray-600">
                      Loading categories...
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {!listLoading && categories.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-2 text-gray-400">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <FiSearch className="w-5 h-5" />
                            </div>
                            <p className="font-medium text-gray-500">
                              No categories found
                            </p>
                            <p className="text-sm">
                              Try adjusting your search terms
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr
                          key={cat._id}
                          className="hover:bg-gray-50/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <span className="font-medium text-gray-900">
                                {cat.name}
                              </span>
                              {/* Optional: Show slug */}
                              {/* <p className="text-xs text-gray-500 mt-0.5">{cat.slug}</p> */}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {cat.description || (
                                <span className="text-gray-400 italic">
                                  No description
                                </span>
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span
                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  cat.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {cat.isActive ? "Active" : "Inactive"}
                              </span>

                              <button
                                onClick={() => toggleStatus(cat._id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full 
                                  transition-colors duration-300 focus:outline-none focus:ring-2 
                                  focus:ring-offset-2 focus:ring-blue-500 ${
                                    cat.isActive ? "bg-blue-600" : "bg-gray-300"
                                  }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white 
                                    shadow-sm transition-transform duration-300 ${
                                      cat.isActive
                                        ? "translate-x-6"
                                        : "translate-x-1"
                                    }`}
                                />
                              </button>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
                                text-blue-600 hover:text-blue-800 hover:bg-blue-50 
                                rounded-lg transition-all duration-200"
                            >
                              <FiEdit2 className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing page{" "}
                    <span className="font-semibold text-gray-900">{page}</span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-900">
                      {totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(1)}
                      disabled={page === 1}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white 
                        rounded-lg disabled:opacity-40 disabled:cursor-not-allowed 
                        transition-all duration-200 border border-transparent hover:border-gray-200"
                      title="First page"
                    >
                      <FiChevronsLeft className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white 
                        rounded-lg disabled:opacity-40 disabled:cursor-not-allowed 
                        transition-all duration-200 border border-transparent hover:border-gray-200"
                      title="Previous page"
                    >
                      <FiChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="px-3 py-1 text-sm font-medium text-gray-700">
                      {page}
                    </div>

                    <button
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white 
                        rounded-lg disabled:opacity-40 disabled:cursor-not-allowed 
                        transition-all duration-200 border border-transparent hover:border-gray-200"
                      title="Next page"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white 
                        rounded-lg disabled:opacity-40 disabled:cursor-not-allowed 
                        transition-all duration-200 border border-transparent hover:border-gray-200"
                      title="Last page"
                    >
                      <FiChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiEdit2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Category
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update category details
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setEditOpen(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 
                  rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSave}
                className="px-5 py-2.5 text-sm font-medium bg-blue-600 text-white 
                  rounded-lg hover:bg-blue-700 transition-all duration-200 
                  shadow-sm hover:shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default BusinessCategory;
