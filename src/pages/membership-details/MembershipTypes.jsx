import AdminLayout from "../../components/layout/AdminLayout";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiEdit,
  FiTrash2,
  FiCheck,
  FiX,
  FiPlus,
  FiList,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import BenefitsModal from "./BenefitsModal";

export default function MembershipTypes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    durationDays: "",
    description: "",
    isActive: true,
    benefits: [{ title: "" }],
  });

  const [errors, setErrors] = useState({});

  // Fetch membership plans on component mount
  useEffect(() => {
    fetchMembershipPlans();
  }, []);

  const fetchMembershipPlans = async () => {
    setPlansLoading(true);
    try {
      const response = await api.get(
        "/admin/businessplans/view-membership-plans"
      );

      if (response.data.success) {
        setPlans(response.data.data || []);
      } else {
        toast.error("Failed to fetch membership plans");
      }
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      toast.error("Failed to load membership plans");
    } finally {
      setPlansLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.amount === "" || formData.amount === null) {
      newErrors.amount = "Amount is required";
    } else if (parseFloat(formData.amount) < 0) {
      newErrors.amount = "Amount must be greater than or equal to 0";
    }

    if (formData.durationDays && parseInt(formData.durationDays) < 1) {
      newErrors.durationDays = "Duration must be at least 1 day";
    }

    // Validate benefits
    const benefitErrors = [];
    formData.benefits.forEach((benefit, index) => {
      if (!benefit.title.trim()) {
        benefitErrors[index] = "Benefit title is required";
      }
    });
    if (benefitErrors.length > 0) {
      newErrors.benefits = benefitErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index].title = value;
    setFormData((prev) => ({ ...prev, benefits: newBenefits }));

    // Clear benefit error
    if (errors.benefits && errors.benefits[index]) {
      const newBenefitErrors = [...errors.benefits];
      newBenefitErrors[index] = "";
      setErrors((prev) => ({ ...prev, benefits: newBenefitErrors }));
    }
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, { title: "" }],
    }));
  };

  const removeBenefit = (index) => {
    if (formData.benefits.length > 1) {
      const newBenefits = formData.benefits.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, benefits: newBenefits }));

      // Remove benefit error if exists
      if (errors.benefits && errors.benefits[index]) {
        const newBenefitErrors = errors.benefits.filter((_, i) => i !== index);
        setErrors((prev) => ({ ...prev, benefits: newBenefitErrors }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        durationDays: formData.durationDays
          ? parseInt(formData.durationDays)
          : null,
        // Filter out empty benefits
        benefits: formData.benefits
          .filter((benefit) => benefit.title.trim() !== "")
          .map((benefit) => ({ title: benefit.title.trim() })),
      };

      const response = await api.post(
        "/admin/businessplans/membership-plans",
        payload
      );

      if (response.data.success) {
        toast.success("Membership plan created successfully!");

        // Reset form
        setFormData({
          name: "",
          amount: "",
          durationDays: "",
          description: "",
          isActive: true,
          benefits: [{ title: "" }],
        });
        setErrors({});

        // Refresh the plans list
        fetchMembershipPlans();
      } else {
        toast.error(
          response.data.message || "Failed to create membership plan"
        );
      }
    } catch (error) {
      console.error("Error creating membership plan:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          toast.error("Membership plan with this name already exists");
        } else if (status === 400) {
          toast.error(data.message || "Validation error");
        } else if (status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else {
          toast.error(data.message || "Failed to create membership plan");
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const viewBenefits = (plan) => {
    setSelectedPlan(plan);
    setShowBenefitsModal(true);
  };

  const closeBenefitsModal = () => {
    setShowBenefitsModal(false);
    setSelectedPlan(null);
  };

  const handleEdit = (planId) => {
    navigate(`/admin/edit-membership/${planId}`);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) {
      return;
    }

    try {
      // Note: You'll need to create a delete endpoint in backend
      const response = await api.delete(
        `/admin/businessplans/membership-plans/${planId}`
      );

      if (response.data.success) {
        toast.success("Membership plan deleted successfully!");
        fetchMembershipPlans();
      } else {
        toast.error(response.data.message || "Failed to delete plan");
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error("Failed to delete membership plan");
    }
  };

  const toggleActiveStatus = async (planId, currentStatus) => {
    const newStatus = !currentStatus;

    setUpdatingStatus((prev) => ({ ...prev, [planId]: true }));

    try {
      const response = await api.patch(
        `/admin/businessplans/membership-plans/${planId}/status`,
        { isActive: newStatus }
      );

      if (response.data.success) {
        toast.success(
          `Plan ${newStatus ? "activated" : "deactivated"} successfully!`
        );

        // Update the local state
        setPlans((prevPlans) =>
          prevPlans.map((plan) =>
            plan._id === planId ? { ...plan, isActive: newStatus } : plan
          )
        );
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error toggling plan status:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          toast.error(data.message || "Invalid status value");
        } else if (status === 404) {
          toast.error("Membership plan not found");
        } else {
          toast.error(data.message || "Failed to update status");
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [planId]: false }));
    }
  };

  return (
    <AdminLayout>
      {/* Benefits Modal */}
      <BenefitsModal
        isOpen={showBenefitsModal}
        onClose={closeBenefitsModal}
        plan={selectedPlan}
      />

      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Membership Plans
            </h1>
            <p className="mt-1 text-gray-600">
              Create and manage membership plans for your platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Create Form */}
            <div className="bg-white rounded-xl shadow p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-800">
                  Create New Plan
                </h2>
                <FiPlus className="text-blue-600" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name and Amount in one row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Plan Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="e.g., STANDARD, PREMIUM"
                      disabled={loading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Amount *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">₹</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                          errors.amount ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="0"
                        disabled={loading}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.amount}
                      </p>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="durationDays"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    id="durationDays"
                    name="durationDays"
                    value={formData.durationDays}
                    onChange={handleChange}
                    min="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                      errors.durationDays ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Leave empty for lifetime"
                    disabled={loading}
                  />
                  {errors.durationDays && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.durationDays}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Brief description..."
                    disabled={loading}
                  />
                </div>

                {/* Benefits Section */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Benefits *
                    </label>
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                      disabled={loading}
                    >
                      + Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={benefit.title}
                            onChange={(e) =>
                              handleBenefitChange(index, e.target.value)
                            }
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                              errors.benefits && errors.benefits[index]
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder={`Benefit ${index + 1}`}
                            disabled={loading}
                          />
                        </div>
                        {formData.benefits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBenefit(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={loading}
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    {errors.benefits &&
                      errors.benefits.map(
                        (error, index) =>
                          error && (
                            <p key={index} className="text-xs text-red-600">
                              {error}
                            </p>
                          )
                      )}
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Active plan
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full px-4 py-2.5 rounded-lg font-medium text-white transition-colors text-sm ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Create Membership Plan"
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Plans List */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Existing Plans ({plans.length})
                  </h2>
                  <button
                    onClick={fetchMembershipPlans}
                    disabled={plansLoading}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                {plansLoading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-sm text-gray-600">
                      Loading plans...
                    </p>
                  </div>
                ) : plans.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-3">
                      <FiPlus className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-600 mb-2">
                      No membership plans found
                    </p>
                    <p className="text-sm text-gray-500">
                      Create your first plan using the form on the left
                    </p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plans.map((plan) => (
                        <tr
                          key={plan._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-gray-900">
                                {plan.name}
                              </div>
                              {plan.description && (
                                <div className="text-xs text-gray-500 truncate max-w-[150px]">
                                  {plan.description}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(plan.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {plan.durationInDays ? (
                              <span className="text-sm text-gray-700">
                                {plan.durationInDays} days
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500 italic">
                                Lifetime
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={() =>
                                  toggleActiveStatus(plan._id, plan.isActive)
                                }
                                disabled={updatingStatus[plan._id]}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                  plan.isActive ? "bg-green-500" : "bg-gray-300"
                                } ${
                                  updatingStatus[plan._id]
                                    ? "opacity-70 cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                              >
                                <span className="sr-only">
                                  {plan.isActive ? "Deactivate" : "Activate"}
                                </span>
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    plan.isActive
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              </button>
                              {/* <span className="ml-3 text-sm font-medium text-gray-700">
                                {updatingStatus[plan._id] ? (
                                  <span className="text-gray-500">
                                    Updating...
                                  </span>
                                ) : plan.isActive ? (
                                  "Active"
                                ) : (
                                  "Inactive"
                                )}
                              </span> */}
                              <span
                                className={`ml-3 text-sm font-medium ${
                                  updatingStatus[plan._id]
                                    ? "text-gray-500"
                                    : plan.isActive
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {updatingStatus[plan._id]
                                  ? "Updating..."
                                  : plan.isActive
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => viewBenefits(plan)}
                                className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                  plan.benefits && plan.benefits.length > 0
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                              >
                                <FiEye className="mr-1.5" size={12} />
                                View
                              </button>
                              <button
                                onClick={() => handleEdit(plan._id)}
                                className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors"
                              >
                                <FiEdit className="mr-1.5" size={12} />
                                Edit
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(plan.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Stats Summary */}
              {!plansLoading && plans.length > 0 && (
                <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {plans.length}
                      </div>
                      <div className="text-gray-500">Total Plans</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {plans.filter((p) => p.isActive).length}
                      </div>
                      <div className="text-gray-500">Active Plans</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {plans.reduce(
                          (total, plan) => total + (plan.benefits?.length || 0),
                          0
                        )}
                      </div>
                      <div className="text-gray-500">Total Benefits</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
