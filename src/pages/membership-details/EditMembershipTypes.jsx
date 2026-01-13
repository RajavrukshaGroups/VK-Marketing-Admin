import AdminLayout from "../../components/layout/AdminLayout";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { FiSave, FiX, FiPlus, FiTrash2 } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";

export default function EditMembershipTypes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    durationDays: "",
    description: "",
    isActive: true,
    benefits: [{ title: "" }],
  });

  const [errors, setErrors] = useState({});

  // Fetch membership plan data
  useEffect(() => {
    fetchMembershipPlan();
  }, [id]);

  const fetchMembershipPlan = async () => {
    setFetching(true);
    try {
      const response = await api.get(
        `/admin/businessplans/membership-plans/${id}`
      );
      console.log("response", response);

      if (response.data.success) {
        const plan = response.data.data;
        setFormData({
          name: plan.name || "",
          amount: plan.amount || "",
          durationDays: plan.durationInDays || "",
          description: plan.description || "",
          isActive: plan.isActive ?? true,
          benefits:
            plan.benefits?.length > 0
              ? plan.benefits.map((b) => ({ title: b.title || "" }))
              : [{ title: "" }],
        });
      } else {
        toast.error("Failed to fetch membership plan");
        navigate("/admin/membership-types");
      }
    } catch (error) {
      console.error("Error fetching membership plan:", error);
      toast.error("Failed to load membership plan");
      navigate("/admin/membership-types");
    } finally {
      setFetching(false);
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

      const response = await api.patch(
        `/admin/businessplans/membership-plans/${id}`,
        payload
      );

      if (response.data.success) {
        toast.success("Membership plan updated successfully!");
        navigate("/admin/membership-types");
      } else {
        toast.error(
          response.data.message || "Failed to update membership plan"
        );
      }
    } catch (error) {
      console.error("Error updating membership plan:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (status === 409) {
          toast.error("Another membership plan with this name already exists");
        } else if (status === 400) {
          toast.error(data.message || "Validation error");
        } else if (status === 404) {
          toast.error("Membership plan not found");
          navigate("/admin/membership-types");
        } else if (status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else {
          toast.error(data.message || "Failed to update membership plan");
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

  const handleCancel = () => {
    navigate("/admin/membership-types");
  };

  if (fetching) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="ml-4 text-gray-600">Loading membership plan...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Membership Plan
                </h1>
                <p className="mt-1 text-gray-600">
                  Update the membership plan details
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FiX className="mr-2" />
                Cancel
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Amount in one row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="e.g., STANDARD, PREMIUM"
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.amount ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      disabled={loading}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label
                  htmlFor="durationDays"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.durationDays ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Leave empty for lifetime access"
                  disabled={loading}
                />
                {errors.durationDays && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.durationDays}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Brief description of the membership plan..."
                  disabled={loading}
                />
              </div>

              {/* Benefits Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Benefits *
                  </label>
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="inline-flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <FiPlus className="mr-1.5" />
                    Add Benefit
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={(e) =>
                            handleBenefitChange(index, e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.benefits && errors.benefits[index]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder={`Benefit ${index + 1}`}
                          disabled={loading}
                        />
                        {errors.benefits && errors.benefits[index] && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.benefits[index]}
                          </p>
                        )}
                      </div>
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="inline-flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          disabled={loading}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
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
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label
                  htmlFor="isActive"
                  className="ml-3 text-sm text-gray-700"
                >
                  Plan is active and available for purchase
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-3 sm:mt-0 w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full sm:w-auto px-8 py-3 rounded-lg font-medium text-white transition-colors ${
                      loading
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        Updating...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FiSave className="mr-2" />
                        Update Membership Plan
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
