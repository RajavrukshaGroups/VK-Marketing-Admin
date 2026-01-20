import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import api from "../../api/axios";
import { toast } from "react-toastify";

export default function PostNotification() {
  /* =========================
     FORM STATE
  ========================= */
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [url, setURL] = useState("");
  const [loading, setLoading] = useState(false);

  /* =========================
     DATA STATE
  ========================= */
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const [selectAllCategories, setSelectAllCategories] = useState(false);
  const [selectAllCompanies, setSelectAllCompanies] = useState(false);

  /* =========================
     FETCH BUSINESS CATEGORIES
  ========================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/admin/notification/business-categories");
        if (res.data.success) {
          setCategories(res.data.data);
          console.log("Categories loaded:", res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        toast.error("Failed to load business categories");
      }
    };

    fetchCategories();
  }, []);

  /* =========================
     CATEGORY CHANGE HANDLER
  ========================= */
  const handleCategoryChange = async (id) => {
    let updatedCategories = [];

    if (id === "ALL") {
      if (selectAllCategories) {
        updatedCategories = [];
        setSelectAllCategories(false);
      } else {
        updatedCategories = categories.map((c) => c._id);
        setSelectAllCategories(true);
      }
    } else {
      updatedCategories = selectedCategories.includes(id)
        ? selectedCategories.filter((x) => x !== id)
        : [...selectedCategories, id];

      setSelectAllCategories(updatedCategories.length === categories.length);
    }

    console.log("Selected categories:", updatedCategories);

    // Reset company selections when categories change
    setSelectedCategories(updatedCategories);
    setSelectedCompanies([]);
    setSelectAllCompanies(false);
    setCompanies([]);

    // Fetch companies based on selected categories
    if (updatedCategories.length > 0) {
      setLoading(true);
      try {
        const res = await api.post(
          "/admin/notification/companies-by-category",
          {
            categoryIds: updatedCategories,
          }
        );

        console.log("Companies by category API Response:", res.data);

        if (res.data.success) {
          console.log(
            `Found ${res.data.data.length} companies for selected categories`
          );

          // Debug: Log each company with its category - MORE DETAILED
          if (res.data.data.length > 0) {
            res.data.data.forEach((company, index) => {
              console.log(`Company ${index + 1}:`, {
                name: company.companyName,
                userId: company.userId,
                businessCategory: company.businessCategory,
                businessCategoryType: typeof company.businessCategory,
                hasName: !!company.businessCategory?.name,
                fullCompanyData: company,
              });
            });
          } else {
            console.log("No companies found for selected categories");
          }

          setCompanies(res.data.data);
        } else {
          toast.error("Failed to fetch companies");
          setCompanies([]);
        }
      } catch (error) {
        console.error("Error fetching companies by category:", error);
        console.error("Error details:", error.response?.data);
        toast.error("Failed to fetch companies for selected categories");
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }
  };

  /* =========================
     COMPANY CHANGE HANDLER
  ========================= */
  const handleCompanyChange = (id) => {
    let updatedCompanies = [];

    if (id === "ALL") {
      if (selectAllCompanies) {
        updatedCompanies = [];
        setSelectAllCompanies(false);
      } else {
        updatedCompanies = companies.map((c) => c._id);
        setSelectAllCompanies(true);
      }
    } else {
      updatedCompanies = selectedCompanies.includes(id)
        ? selectedCompanies.filter((x) => x !== id)
        : [...selectedCompanies, id];

      setSelectAllCompanies(updatedCompanies.length === companies.length);
    }

    setSelectedCompanies(updatedCompanies);
    console.log("Selected companies:", updatedCompanies);
  };

  /* =========================
     FETCH ALL COMPANIES (For debugging)
  ========================= */
  const fetchAllCompanies = async () => {
    try {
      const res = await api.get("/admin/notification/companies");
      if (res.data.success) {
        console.log("All companies in database:", res.data.data);
        // Check categories of all companies - MORE DETAILED
        res.data.data.forEach((company) => {
          console.log("Company details:", {
            name: company.companyName,
            userId: company.userId,
            businessCategory: company.businessCategory,
            businessCategoryType: typeof company.businessCategory,
            hasName: !!company.businessCategory?.name,
            isObject:
              company.businessCategory &&
              typeof company.businessCategory === "object",
            isString:
              company.businessCategory &&
              typeof company.businessCategory === "string",
          });
        });
        toast.info(`Total companies: ${res.data.data.length}`);
      }
    } catch (error) {
      console.error("Error fetching all companies:", error);
      toast.error("Failed to fetch all companies");
    }
  };

  /* =========================
     CLEAR ALL SELECTIONS
  ========================= */
  const clearAllSelections = () => {
    setSelectedCategories([]);
    setSelectedCompanies([]);
    setSelectAllCategories(false);
    setSelectAllCompanies(false);
    setCompanies([]);
    toast.info("All selections cleared");
  };

  /* =========================
     SUBMIT HANDLER
  ========================= */
  const handleSubmit = async () => {
    // Basic validation
    if (!title.trim()) {
      return toast.error("Title is required");
    }
    if (!message.trim()) {
      return toast.error("Message is required");
    }

    const payload = {
      title: title.trim(),
      message: message.trim(),
      url: url.trim(),
      type,
    };

    // Determine target type
    if (selectedCompanies.length > 0) {
      payload.targetType = "SELECTED_COMPANIES";
      payload.targetUsers = selectedCompanies;
    } else if (selectedCategories.length > 0) {
      payload.targetType = "BUSINESS_CATEGORY";
      payload.businessCategories = selectedCategories;
    } else {
      payload.targetType = "ALL";
    }

    console.log("Sending notification with payload:", payload);

    try {
      const res = await api.post(
        "/admin/notification/post-notification",
        payload
      );

      if (res.data.success) {
        toast.success("Notification sent successfully");

        // Reset form
        setTitle("");
        setURL("");
        setMessage("");
        setType("INFO");
        setSelectedCategories([]);
        setSelectedCompanies([]);
        setSelectAllCategories(false);
        setSelectAllCompanies(false);
        setCompanies([]);
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to send notification"
      );
    }
  };

  // Helper function to display category name
  const getCategoryName = (company) => {
    if (!company.businessCategory) {
      return "No category";
    }

    // If businessCategory is a string (ID)
    if (typeof company.businessCategory === "string") {
      // Try to find the category name from the categories list
      const category = categories.find(
        (cat) => cat._id === company.businessCategory
      );
      return category ? category.name : `ID: ${company.businessCategory}`;
    }

    // If businessCategory is an object with name property
    if (company.businessCategory.name) {
      return company.businessCategory.name;
    }

    // If businessCategory is an object with _id
    if (company.businessCategory._id) {
      const category = categories.find(
        (cat) => cat._id === company.businessCategory._id
      );
      return category ? category.name : `ID: ${company.businessCategory._id}`;
    }

    return "Unknown category";
  };

  const handleViewNotifications = () => {
    navigate("/admin/list-notification");
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Post Notification</h1>
          <div className="flex gap-2">
            {/* <button
              onClick={fetchAllCompanies}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded border"
              title="Debug: View all companies and their categories in console"
            >
              Debug Companies
            </button> */}
            <button
              onClick={handleViewNotifications}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border"
            >
              View Notifications
            </button>
            <button
              onClick={clearAllSelections}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded border"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notification Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Notification Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notification Type
          </label>
          <select
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="INFO">Info</option>
            <option value="WISH">Wish</option>
            <option value="ALERT">Alert</option>
            <option value="ANNOUNCEMENT">Announcement</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="URL"
            value={url}
            onChange={(e) => setURL(e.target.value)}
          />
        </div>

        {/* CATEGORY SELECTION */}
        <div className="border border-gray-300 p-4 rounded mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-700">Business Categories</h3>
            <span className="text-sm text-gray-600">
              {selectedCategories.length} selected
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
            <label className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded hover:bg-gray-100">
              <input
                type="checkbox"
                checked={selectAllCategories}
                onChange={() => handleCategoryChange("ALL")}
                className="w-4 h-4 text-blue-600"
              />
              <span className="font-medium">Select All Categories</span>
            </label>

            {categories.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-2 mb-2 p-2 rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat._id)}
                  onChange={() => handleCategoryChange(cat._id)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>
                  {cat.name} ({cat._id})
                </span>
                {selectedCategories.includes(cat._id) && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Selected
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* COMPANY SELECTION */}
        {loading ? (
          <div className="border border-gray-300 p-4 rounded mb-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading companies...</span>
            </div>
          </div>
        ) : companies.length > 0 ? (
          <div className="border border-gray-300 p-4 rounded mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                Companies ({companies.length} found)
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedCompanies.length} selected
                </span>
                {companies.length > 0 && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectAllCompanies}
                      onChange={() => handleCompanyChange("ALL")}
                      className="w-4 h-4 text-blue-600"
                    />
                    Select All
                  </label>
                )}
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
              {companies.map((c) => (
                <label
                  key={c._id}
                  className="flex items-center gap-3 mb-3 p-3 rounded border border-gray-100 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(c._id)}
                    onChange={() => handleCompanyChange(c._id)}
                    className="w-4 h-4 text-blue-600 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">
                      {c.companyName}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        ID: {c.userId}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Category: {getCategoryName(c)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Type: {typeof c.businessCategory}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Full businessCategory data:{" "}
                      {JSON.stringify(c.businessCategory)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : selectedCategories.length > 0 ? (
          <div className="border border-gray-300 p-4 rounded mb-6">
            <div className="text-center py-6 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              No companies found for the selected categories
            </div>
          </div>
        ) : null}

        {/* SUBMIT BUTTON */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Notification"}
          </button>

          <button
            onClick={clearAllSelections}
            className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium"
          >
            Reset Form
          </button>
        </div>

        {/* DEBUG INFO SECTION */}
        {/* <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
            Debug Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="p-3 bg-white rounded border">
              <div className="font-medium mb-1">Categories</div>
              <div>Total: {categories.length}</div>
              <div>Selected: {selectedCategories.length}</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium mb-1">Companies</div>
              <div>Loaded: {companies.length}</div>
              <div>Selected: {selectedCompanies.length}</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium mb-1">Form Status</div>
              <div>Title: {title ? "✓" : "✗"}</div>
              <div>Message: {message ? "✓" : "✗"}</div>
            </div>
          </div>
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="font-medium mb-1">Selected Category IDs:</div>
            <code className="text-xs bg-gray-100 p-2 rounded block overflow-x-auto">
              {selectedCategories.length > 0
                ? JSON.stringify(selectedCategories)
                : "None"}
            </code>
          </div>
        </div> */}
      </div>
    </AdminLayout>
  );
}
