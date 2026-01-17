import React, { useState, useEffect } from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCreditCard,
  FiFileText,
  FiSave,
  FiPackage,
  FiShoppingBag,
} from "react-icons/fi";
import api from "../../api/axios";

const EditMemberForm = ({ user, onClose, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    companyName: "",
    proprietors: "",
    address: {
      state: "",
      district: "",
      taluk: "",
      street: "",
      pin: "",
    },
    mobileNumber: "",
    email: "",
    businessCategory: "",
    businessNature: {
      manufacturer: {
        isManufacturer: false,
        scale: [],
      },
      trader: {
        isTrader: false,
        type: [],
      },
    },
    majorCommodities: "",
    gstNumber: "",
    bankDetails: {
      bankName: "",
      accountNumber: "",
      ifscCode: "",
    },
    membershipPlan: "",
    isActive: true,
  });

  const [businessCategories, setBusinessCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Business nature options
  const manufacturerScaleOptions = ["LARGE", "MSME"];
  const traderTypeOptions = ["WHOLESALE", "RETAIL"];

  // Populate form when user data changes
  useEffect(() => {
    if (user) {
      console.log("User data in edit modal:", user);

      setFormData({
        companyName: user.companyName || "",
        proprietors: user.proprietors || "",
        address: {
          state: user.address?.state || "",
          district: user.address?.district || "",
          taluk: user.address?.taluk || "",
          street: user.address?.street || "",
          pin: user.address?.pin || "",
        },
        mobileNumber: user.mobileNumber || "",
        email: user.email || "",
        businessCategory:
          typeof user.businessCategory === "object"
            ? user.businessCategory._id
            : user.businessCategory || "",
        businessNature: user.businessNature || {
          manufacturer: {
            isManufacturer: false,
            scale: [],
          },
          trader: {
            isTrader: false,
            type: [],
          },
        },
        majorCommodities: Array.isArray(user.majorCommodities)
          ? user.majorCommodities.join(", ")
          : user.majorCommodities || "",
        gstNumber: user.gstNumber || "",
        bankDetails: {
          bankName: user.bankDetails?.bankName || "",
          accountNumber: user.bankDetails?.accountNumber || "",
          ifscCode: user.bankDetails?.ifscCode || "",
        },
        membershipPlan: user.membership?.plan?._id || "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const fetchBusinessCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get("/admin/category/getCategories");
      if (res.data.success) {
        setBusinessCategories(res.data?.data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchMembershipPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await api.get(
        "/admin/businessplans/view-membershipplans/regform"
      );
      if (res.data.success) {
        setMembershipPlans(res.data?.data);
      }
    } catch (err) {
      console.error("Error fetching membership plans:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchBusinessCategories();
    fetchMembershipPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleBankDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value,
      },
    }));
  };

  // Handle manufacturer toggle
  const handleManufacturerToggle = () => {
    setFormData((prev) => ({
      ...prev,
      businessNature: {
        ...prev.businessNature,
        manufacturer: {
          ...prev.businessNature.manufacturer,
          isManufacturer: !prev.businessNature.manufacturer.isManufacturer,
          scale: !prev.businessNature.manufacturer.isManufacturer
            ? prev.businessNature.manufacturer.scale
            : [],
        },
      },
    }));
  };

  // Handle manufacturer scale selection
  const handleManufacturerScaleChange = (scale) => {
    setFormData((prev) => {
      const currentScales = [...prev.businessNature.manufacturer.scale];
      let newScales;

      if (currentScales.includes(scale)) {
        newScales = currentScales.filter((s) => s !== scale);
      } else {
        newScales = [...currentScales, scale];
      }

      return {
        ...prev,
        businessNature: {
          ...prev.businessNature,
          manufacturer: {
            ...prev.businessNature.manufacturer,
            scale: newScales,
          },
        },
      };
    });
  };

  // Handle trader toggle
  const handleTraderToggle = () => {
    setFormData((prev) => ({
      ...prev,
      businessNature: {
        ...prev.businessNature,
        trader: {
          ...prev.businessNature.trader,
          isTrader: !prev.businessNature.trader.isTrader,
          type: !prev.businessNature.trader.isTrader
            ? prev.businessNature.trader.type
            : [],
        },
      },
    }));
  };

  // Handle trader type selection
  const handleTraderTypeChange = (type) => {
    setFormData((prev) => {
      const currentTypes = [...prev.businessNature.trader.type];
      let newTypes;

      if (currentTypes.includes(type)) {
        newTypes = currentTypes.filter((t) => t !== type);
      } else {
        newTypes = [...currentTypes, type];
      }

      return {
        ...prev,
        businessNature: {
          ...prev.businessNature,
          trader: {
            ...prev.businessNature.trader,
            type: newTypes,
          },
        },
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      majorCommodities: formData.majorCommodities
        ? formData.majorCommodities.split(",").map((c) => c.trim())
        : [],
    };

    onSubmit(payload);
  };

  const validateForm = () => {
    if (!formData.companyName.trim()) {
      return "Company name is required";
    }
    if (!formData.proprietors.trim()) {
      return "Proprietor name is required";
    }
    if (!formData.mobileNumber.trim()) {
      return "Mobile number is required";
    }
    if (!formData.email.trim()) {
      return "Email is required";
    }
    if (!formData.businessCategory) {
      return "Business category is required";
    }

    // Business nature validation
    if (
      !formData.businessNature.manufacturer.isManufacturer &&
      !formData.businessNature.trader.isTrader
    ) {
      return "Select at least one business nature (Manufacturer or Trader)";
    }

    if (
      formData.businessNature.manufacturer.isManufacturer &&
      formData.businessNature.manufacturer.scale.length === 0
    ) {
      return "Select at least one manufacturer scale";
    }

    if (
      formData.businessNature.trader.isTrader &&
      formData.businessNature.trader.type.length === 0
    ) {
      return "Select at least one trader type";
    }

    if (!formData.address.pin) {
      return "PIN code is required";
    }
    if (!formData.address.state) {
      return "State is required";
    }
    if (!formData.address.district) {
      return "District is required";
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg text-left font-bold text-gray-900">
                Edit Member Details
              </h3>
              <p className="text-sm text-gray-500">
                Update information for {user?.companyName || "Member"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-emerald-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Basic Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proprietors *
                  </label>
                  <input
                    type="text"
                    name="proprietors"
                    value={formData.proprietors}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiMail className="w-5 h-5 text-blue-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Contact Information
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="w-5 h-5 text-green-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Address Details
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.address.state}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.address.district}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taluk
                  </label>
                  <input
                    type="text"
                    name="taluk"
                    value={formData.address.taluk}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    name="pin"
                    value={formData.address.pin}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address
                  </label>
                  <textarea
                    name="street"
                    value={formData.address.street}
                    onChange={handleAddressChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiBriefcase className="w-5 h-5 text-purple-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Business Information
                </h4>
              </div>
              <div className="space-y-6">
                {/* Business Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Category *
                  </label>
                  <select
                    name="businessCategory"
                    value={formData.businessCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                    disabled={loadingCategories}
                  >
                    <option value="">Select Category</option>
                    {businessCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {loadingCategories && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading categories...
                    </p>
                  )}
                </div>

                {/* Business Nature */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Nature *
                  </label>

                  {/* Manufacturer Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleManufacturerToggle}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                          formData.businessNature.manufacturer.isManufacturer
                            ? "bg-blue-100 text-blue-700 border-blue-300"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <FiPackage className="w-4 h-4" />
                        <span>Manufacturer</span>
                      </button>

                      {formData.businessNature.manufacturer.isManufacturer && (
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-2">
                            Scale:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {manufacturerScaleOptions.map((scale) => (
                              <button
                                key={scale}
                                type="button"
                                onClick={() =>
                                  handleManufacturerScaleChange(scale)
                                }
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                  formData.businessNature.manufacturer.scale.includes(
                                    scale
                                  )
                                    ? "bg-blue-500 text-white border-blue-600"
                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                }`}
                              >
                                {scale}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.businessNature.manufacturer.isManufacturer &&
                      formData.businessNature.manufacturer.scale.length ===
                        0 && (
                        <p className="text-sm text-red-500">
                          Select at least one manufacturer scale
                        </p>
                      )}
                  </div>

                  {/* Trader Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTraderToggle}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                          formData.businessNature.trader.isTrader
                            ? "bg-green-100 text-green-700 border-green-300"
                            : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        <FiShoppingBag className="w-4 h-4" />
                        <span>Trader</span>
                      </button>

                      {formData.businessNature.trader.isTrader && (
                        <div className="flex-1">
                          <div className="text-xs text-gray-500 mb-2">
                            Type:
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {traderTypeOptions.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleTraderTypeChange(type)}
                                className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                                  formData.businessNature.trader.type.includes(
                                    type
                                  )
                                    ? "bg-green-500 text-white border-green-600"
                                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {formData.businessNature.trader.isTrader &&
                      formData.businessNature.trader.type.length === 0 && (
                        <p className="text-sm text-red-500">
                          Select at least one trader type
                        </p>
                      )}
                  </div>

                  {/* Validation message */}
                  {!formData.businessNature.manufacturer.isManufacturer &&
                    !formData.businessNature.trader.isTrader && (
                      <p className="text-sm text-red-500">
                        Select at least one business nature (Manufacturer or
                        Trader)
                      </p>
                    )}
                </div>

                {/* Major Commodities */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major Commodities
                  </label>
                  <input
                    type="text"
                    name="majorCommodities"
                    value={formData.majorCommodities}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Comma separated list"
                  />
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="22ABCDE1234F1Z5"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard className="w-5 h-5 text-amber-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Bank Details
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankDetails.bankName}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.bankDetails.accountNumber}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.bankDetails.ifscCode}
                    onChange={handleBankDetailsChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="ABCD0123456"
                  />
                </div>
              </div>
            </div>

            {/* Membership Plan */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiCreditCard className="w-5 h-5 text-amber-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Membership Plan
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Plan *
                  </label>
                  <select
                    name="membershipPlan"
                    value={formData.membershipPlan}
                    onChange={handleInputChange}
                    disabled={loadingPlans}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  >
                    <option value="">Select Membership Plan</option>
                    {membershipPlans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} – ₹{plan.amount}
                        {plan.durationInDays
                          ? ` (${plan.durationInDays} days)`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {loadingPlans && (
                    <p className="text-sm text-gray-500 mt-1">
                      Loading membership plans...
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership Status
                  </label>
                  <input
                    type="text"
                    value={user?.membership?.status || "N/A"}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <FiUser className="w-5 h-5 text-gray-600" />
                <h4 className="text-lg font-bold text-gray-900">
                  Account Status
                </h4>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Member
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  {formData.isActive
                    ? "Member can access the system"
                    : "Member account is disabled"}
                </span>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium rounded-lg hover:shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || validateForm()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  Update Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberForm;
