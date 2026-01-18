import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../../api/axios";
import AdminLayout from "../../components/layout/AdminLayout";

const AddMemberAdminForm = () => {
  const navigate = useNavigate();

  /* =========================
     ADDRESS STATES
  ========================= */
  const [pin, setPin] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [street, setStreet] = useState("");
  const [pinLoading, setPinLoading] = useState(false);

  /* =========================
     FORM STATES
  ========================= */
  const [companyName, setCompanyName] = useState("");
  const [proprietors, setProprietors] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [majorCommodities, setMajorCommodities] = useState(["", ""]);

  /* =========================
     BUSINESS STATES
  ========================= */
  const [categories, setCategories] = useState([]);
  const [businessCategory, setBusinessCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [businessNature, setBusinessNature] = useState({
    manufacturer: {
      isManufacturer: false,
      scale: [],
    },
    trader: {
      isTrader: false,
      type: [],
    },
  });

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  /* =========================
     MEMBERSHIP PLAN STATES
  ========================= */
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [membershipAmount, setMembershipAmount] = useState("");
  const [planLoading, setPlanLoading] = useState(false);
  const [showPlanBenefits, setShowPlanBenefits] = useState(false);
  const [selectedPlanBenefits, setSelectedPlanBenefits] = useState([]);

  /* =========================
     PAYMENT SOURCE STATES
  ========================= */
  const [paymentSource, setPaymentSource] = useState("ADMIN");
  const [transactionId, setTransactionId] = useState("");
  const [referrerId, setReferrerId] = useState("");
  const [referrerCompany, setReferrerCompany] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categoryOptions = categories.map((cat) => ({
    value: cat._id,
    label: cat.name,
  }));

  const selectedCategoryOptions =
    categoryOptions.find((opt) => opt.value === businessCategory) || null;

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

  /* =========================
     FETCH CATEGORIES & MEMBERSHIP PLANS
  ========================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);
        const res = await api.get("/admin/category/getCategories");
        console.log("res categories", res);
        if (res.data.success) setCategories(res.data.data);
      } catch (err) {
        toast.error("Failed to load categories");
      } finally {
        setCategoryLoading(false);
      }
    };

    const fetchMembershipPlans = async () => {
      try {
        setPlanLoading(true);
        const response = await api.get(
          "/admin/businessplans/view-membershipplans/regform"
        );
        console.log("response business plans", response);
        if (response.data.success) {
          setMembershipPlans(response.data?.data || []);
        } else {
          toast.error("Failed to load membership plans");
        }
      } catch (error) {
        console.error("Error fetching membership plans:", error);
        toast.error("Failed to load membership plans");
      } finally {
        setPlanLoading(false);
      }
    };

    fetchCategories();
    fetchMembershipPlans();
  }, []);

  /* =========================
     FETCH REFERRER DETAILS
  ========================= */
  const fetchReferrerDetails = async () => {
    if (!referrerId) {
      setReferrerCompany("");
      return;
    }

    // 🚨 allow ONLY 6-digit numeric IDs
    if (!/^\d{6}$/.test(referrerId)) {
      toast.error("Referrer ID must be 6 digits");
      setReferrerCompany("");
      return;
    }

    try {
      const res = await api.get(`/users/referral/${referrerId}`);
      console.log("referral id", res);
      if (res.data?.success) {
        setReferrerCompany(res.data?.data?.companyName);
      } else {
        setReferrerCompany("");
        toast.error("Referrer not found");
      }
    } catch {
      setReferrerCompany("");
      toast.error("Failed to fetch referrer details");
    }
  };

  /* =========================
     FETCH ADDRESS BY PIN
  ========================= */
  const fetchAddressByPin = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      setPinLoading(true);
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0]?.Status === "Success") {
        const info = data[0].PostOffice[0];
        setState(info.State);
        setDistrict(info.District);
        setTaluk(info.Block || "");
      } else {
        resetAddress();
        toast.error("Invalid PIN Code");
      }
    } catch {
      resetAddress();
      toast.error("Failed to fetch address");
    } finally {
      setPinLoading(false);
    }
  };

  const resetAddress = () => {
    setState("");
    setDistrict("");
    setTaluk("");
  };

  /* =========================
     BUSINESS NATURE HANDLERS
  ========================= */
  const toggleManufacturerScale = (value) => {
    setBusinessNature((prev) => {
      const scale = prev.manufacturer.scale.includes(value)
        ? prev.manufacturer.scale.filter((v) => v !== value)
        : [...prev.manufacturer.scale, value];

      return {
        ...prev,
        manufacturer: { ...prev.manufacturer, scale },
      };
    });
  };

  const toggleTraderType = (value) => {
    setBusinessNature((prev) => {
      const type = prev.trader.type.includes(value)
        ? prev.trader.type.filter((v) => v !== value)
        : [...prev.trader.type, value];

      return {
        ...prev,
        trader: { ...prev.trader, type },
      };
    });
  };

  /* =========================
     MEMBERSHIP PLAN HANDLERS
  ========================= */
  const handlePlanChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedPlan(null);
      setMembershipAmount("");
      setSelectedPlanBenefits([]);
      setShowPlanBenefits(false);
      return;
    }

    const plan = selectedOption.data;

    setSelectedPlan(plan);
    setMembershipAmount(Number(plan.amount));
    setSelectedPlanBenefits(plan.benefits || []);
    setShowPlanBenefits(true);
    setErrors((prev) => ({ ...prev, selectedPlan: null }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderPlanOption = (plan) => {
    return (
      <div className="py-2">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-800">{plan.name}</span>
          <span className="font-bold text-blue-600">
            {formatCurrency(plan.amount)}
          </span>
        </div>
        {plan.description && (
          <p className="text-xs text-gray-600 mt-1 truncate">
            {plan.description}
          </p>
        )}
        {plan.benefits && plan.benefits.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            Benefits: {plan.benefits.length} included
          </div>
        )}
      </div>
    );
  };

  const planOptions = membershipPlans.map((plan) => ({
    value: plan._id,
    label: plan.name,
    data: plan,
  }));

  const selectedPlanOption = planOptions.find(
    (opt) => opt.value === selectedPlan?._id
  );

  /* =========================
     VALIDATION & SUBMIT HANDLER
  ========================= */
  const validateForm = () => {
    const newErrors = {};

    /* =========================
       BUSINESS NATURE VALIDATION
    ========================= */
    const isManufacturer = businessNature.manufacturer.isManufacturer;
    const isTrader = businessNature.trader.isTrader;

    if (!isManufacturer && !isTrader) {
      newErrors.businessNature = "Please select Manufacturer and/or Trader";
    }

    if (isManufacturer && businessNature.manufacturer.scale.length === 0) {
      newErrors.businessNature =
        "Please select Manufacturer type (Large / MSME)";
    }

    if (isTrader && businessNature.trader.type.length === 0) {
      newErrors.businessNature =
        "Please select Trader type (Wholesale / Retail)";
    }

    if (!companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!proprietors.trim())
      newErrors.proprietors = "Proprietor / Partner name is required";

    if (!pin) newErrors.pin = "PIN Code is required";
    else if (pin.length !== 6) newErrors.pin = "PIN Code must be 6 digits";

    if (!state) newErrors.state = "State is required";
    if (!district) newErrors.district = "District is required";

    if (!mobileNumber) newErrors.mobileNumber = "Mobile number is required";
    else if (mobileNumber.length !== 10)
      newErrors.mobileNumber = "Mobile number must be 10 digits";

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Invalid email address";

    if (!businessCategory)
      newErrors.businessCategory = "Business category is required";

    if (!selectedPlan)
      newErrors.selectedPlan = "Please select a membership plan";

    if (!majorCommodities.some((c) => c.trim())) {
      newErrors.majorCommodities = "At least one major commodity is required";
    }

    // GST
    if (gstNumber) {
      if (gstNumber.length !== 15)
        newErrors.gstNumber = "GST must be 15 characters";
      else if (
        !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstNumber)
      )
        newErrors.gstNumber = "Invalid GST format";
    }

    // BANK DETAILS
    if (bankName || accountNumber || ifscCode) {
      if (!bankName) newErrors.bankName = "Bank name is required";
      if (!accountNumber)
        newErrors.accountNumber = "Account number is required";
      else if (accountNumber.length < 9)
        newErrors.accountNumber = "Invalid account number";

      if (!ifscCode) newErrors.ifscCode = "IFSC code is required";
      else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode))
        newErrors.ifscCode = "Invalid IFSC code";
    }

    // Transaction ID required for certain payment sources
    if (paymentSource !== "ADMIN" && paymentSource !== "CASH") {
      if (!transactionId.trim()) {
        newErrors.transactionId = `Transaction ID is required for ${paymentSource}`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return Object.values(newErrors)[0];
    }

    return null;
  };

  const resetForm = () => {
    // Address
    setPin("");
    setState("");
    setDistrict("");
    setTaluk("");
    setStreet("");

    // Company/Contact
    setCompanyName("");
    setProprietors("");
    setMobileNumber("");
    setEmail("");
    setGstNumber("");

    // Business
    setBusinessCategory("");
    setMajorCommodities(["", ""]);

    // Business Nature
    setBusinessNature({
      manufacturer: {
        isManufacturer: false,
        scale: [],
      },
      trader: {
        isTrader: false,
        type: [],
      },
    });

    // Bank
    setBankName("");
    setAccountNumber("");
    setIfscCode("");

    // Membership
    setSelectedPlan("");
    setMembershipAmount("");
    setShowPlanBenefits("");
    setSelectedPlanBenefits("");

    // Payment
    setPaymentSource("ADMIN");
    setTransactionId("");
    setReferrerId("");
    setReferrerCompany("");

    // Errors
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        companyName,
        proprietors,
        address: {
          street,
          pin,
          state,
          district,
          taluk,
        },
        mobileNumber,
        email,
        businessCategory,
        businessNature,
        majorCommodities: majorCommodities.filter(Boolean),
        gstNumber,
        bankName,
        accountNumber,
        ifscCode,
        referredByUserId: referrerId || undefined,
        membershipPlan: selectedPlan._id,
        paymentSource,
        transactionId: transactionId || undefined,
        amount: membershipAmount,
      };

      console.log("Submitting data:", registrationData);

      const response = await api.post("/users/create-user", registrationData);
      console.log("response handle submit", response);

      if (response.data?.success) {
        toast.success(response.data?.message || "Member added successfully!");
        resetForm();
        navigate("/admin/users"); // Redirect to members list
      } else {
        toast.error(response.data?.message || "Failed to add member");
      }
    } catch (err) {
      console.error("Add member error:", err);
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="bg-slate-100 min-h-screen py-10 font-sans">
        {/* <ToastContainer position="top-right" autoClose={3000} /> */}

        <div className="max-w-4xl mx-auto bg-[#FFFBE6] shadow-2xl border border-gray-300">
          {/* HEADER */}
          <div className="bg-[#0054A6] text-white p-6 text-center">
            <h1 className="text-3xl md:text-5xl font-black uppercase">
              Federation of Trade and Industry of India
            </h1>
            <p className="font-bold text-yellow-300 mt-2">
              (Karnataka Chapter)
            </p>
            <p className="text-xl font-bold mt-4">Admin - Add New Member</p>
          </div>

          {/* TITLE */}
          <div className="relative -mt-6 text-center mb-12">
            <span className="bg-[#ED1C24] text-white font-bold text-xl px-10 py-3 rounded-full border-4 border-white">
              Add New Member Form
            </span>
          </div>

          {/* FORM */}
          <div className="px-8 md:px-16 pb-16">
            <form
              onSubmit={handleSubmit}
              className="space-y-10 text-lg font-bold"
            >
              {/* COMPANY NAME */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">1. COMPANY NAME</span>
                <input
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    setErrors((prev) => ({ ...prev, companyName: null }));
                  }}
                  className={`flex-1 border-b-2 px-2 uppercase ${
                    errors.companyName ? "border-red-500" : "border-dotted"
                  }`}
                  placeholder="Enter company name"
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* PROPRIETORS */}
              <div className="flex flex-col gap-2">
                <span>2. NAME OF THE PROPRIETOR / PARTNERS</span>
                <textarea
                  rows={3}
                  value={proprietors}
                  onChange={(e) => {
                    setProprietors(e.target.value);
                    setErrors((prev) => ({ ...prev, proprietors: null }));
                  }}
                  className={`border-b-2 px-2 uppercase resize-none ${
                    errors.proprietors ? "border-red-500" : "border-dotted"
                  }`}
                  placeholder="Enter proprietor/partner names"
                />
                {errors.proprietors && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.proprietors}
                  </p>
                )}
              </div>

              {/* ADDRESS */}
              <div className="flex flex-col gap-6">
                <span>3. ADDRESS</span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span>PIN</span>
                    <input
                      value={pin}
                      maxLength={6}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setPin(v);
                        setErrors((prev) => ({ ...prev, pin: null }));
                        if (v.length === 6) fetchAddressByPin(v);
                      }}
                      className={`border-b-2 px-2 ${
                        errors.pin ? "border-red-500" : "border-dotted"
                      }`}
                      placeholder="Enter 6-digit PIN"
                    />
                    {pinLoading && (
                      <p className="text-xs text-gray-500">Fetching address…</p>
                    )}
                    {errors.pin && (
                      <p className="text-red-500 text-sm mt-1">{errors.pin}</p>
                    )}
                  </div>

                  <div>
                    <span>STATE</span>
                    <input
                      value={state}
                      readOnly
                      className="border-b-2 border-dotted px-2 uppercase bg-gray-50"
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <span>DISTRICT</span>
                    <input
                      value={district}
                      readOnly
                      className="border-b-2 border-dotted px-2 uppercase bg-gray-50"
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.district}
                      </p>
                    )}
                  </div>

                  <div>
                    <span>TALUK</span>
                    <input
                      value={taluk}
                      onChange={(e) => setTaluk(e.target.value)}
                      className="border-b-2 border-dotted px-2 uppercase"
                      placeholder="Enter taluk"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street, Area"
                  className="border-b-2 border-dotted px-2 uppercase resize-none"
                />
              </div>

              {/* MOBILE */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">4. MOBILE NUMBER</span>
                <div className="flex-1">
                  <input
                    value={mobileNumber}
                    maxLength={10}
                    onChange={(e) => {
                      setMobileNumber(e.target.value.replace(/\D/g, ""));
                      setErrors((prev) => ({ ...prev, mobileNumber: null }));
                    }}
                    className={`border px-2 h-10 w-full ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 10-digit mobile number"
                  />
                  {errors.mobileNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.mobileNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* BUSINESS NATURE */}
              <div className="flex flex-col gap-6">
                <span className="font-bold">5. BUSINESS NATURE</span>

                {/* Manufacturer */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={businessNature.manufacturer.isManufacturer}
                    onChange={(e) =>
                      setBusinessNature((prev) => ({
                        ...prev,
                        manufacturer: {
                          ...prev.manufacturer,
                          isManufacturer: e.target.checked,
                          scale: [],
                        },
                      }))
                    }
                  />
                  MANUFACTURER
                </label>

                {businessNature.manufacturer.isManufacturer && (
                  <div className="ml-6 flex gap-6">
                    <label>
                      <input
                        type="checkbox"
                        checked={businessNature.manufacturer.scale.includes(
                          "LARGE"
                        )}
                        onChange={() => toggleManufacturerScale("LARGE")}
                      />{" "}
                      LARGE
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={businessNature.manufacturer.scale.includes(
                          "MSME"
                        )}
                        onChange={() => toggleManufacturerScale("MSME")}
                      />{" "}
                      MSME
                    </label>
                  </div>
                )}

                {/* Trader */}
                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={businessNature.trader.isTrader}
                    onChange={(e) =>
                      setBusinessNature((prev) => ({
                        ...prev,
                        trader: {
                          ...prev.trader,
                          isTrader: e.target.checked,
                          type: [],
                        },
                      }))
                    }
                  />
                  TRADER
                </label>

                {businessNature.trader.isTrader && (
                  <div className="ml-6 flex gap-6">
                    <label>
                      <input
                        type="checkbox"
                        checked={businessNature.trader.type.includes(
                          "WHOLESALE"
                        )}
                        onChange={() => toggleTraderType("WHOLESALE")}
                      />{" "}
                      WHOLESALE
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={businessNature.trader.type.includes("RETAIL")}
                        onChange={() => toggleTraderType("RETAIL")}
                      />{" "}
                      RETAIL
                    </label>
                  </div>
                )}
                {errors.businessNature && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.businessNature}
                  </p>
                )}
              </div>

              {/* BUSINESS CATEGORY */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">6. BUSINESS CATEGORY</span>
                <div className="flex-1">
                  <Select
                    options={categoryOptions}
                    isLoading={categoryLoading}
                    placeholder="Search & select category"
                    value={selectedCategoryOptions}
                    onChange={(opt) => {
                      setBusinessCategory(opt ? opt.value : "");
                      setErrors((prev) => ({
                        ...prev,
                        businessCategory: null,
                      }));
                    }}
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        backgroundColor: "white",
                        border: "none",
                        borderBottom: errors.businessCategory
                          ? "2px solid #ef4444"
                          : "2px dotted #000",
                        borderRadius: 0,
                        boxShadow: "none",
                      }),
                    }}
                  />
                  {errors.businessCategory && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessCategory}
                    </p>
                  )}
                </div>
              </div>

              {/* MEMBERSHIP PLAN SELECTION */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">7. SELECT MEMBERSHIP PLAN</span>
                <div className="flex-1">
                  <Select
                    options={planOptions}
                    isLoading={planLoading}
                    placeholder="Select a membership plan"
                    onChange={handlePlanChange}
                    value={selectedPlanOption || null}
                    formatOptionLabel={({ data }) => renderPlanOption(data)}
                    styles={{
                      control: (base) => ({
                        ...base,
                        backgroundColor: "white",
                        border: "none",
                        borderBottom: errors.selectedPlan
                          ? "2px solid #ef4444"
                          : "2px dotted #000",
                        borderRadius: 0,
                        boxShadow: "none",
                        minHeight: "44px",
                      }),
                      menu: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />

                  {errors.selectedPlan && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.selectedPlan}
                    </p>
                  )}

                  {/* Selected Plan Benefits Preview */}
                  {showPlanBenefits && selectedPlan && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-blue-900">
                          {selectedPlan.name} Plan Details
                        </h4>
                        <span className="font-bold text-blue-700">
                          {formatCurrency(selectedPlan.amount)}
                          {selectedPlan.durationInDays
                            ? ` / ${selectedPlan.durationInDays} days`
                            : " / Lifetime"}
                        </span>
                      </div>

                      {selectedPlan.description && (
                        <p className="text-gray-700 mb-3">
                          {selectedPlan.description}
                        </p>
                      )}

                      {selectedPlanBenefits.length > 0 && (
                        <div>
                          <h5 className="font-medium text-gray-800 mb-2">
                            Benefits Included:
                          </h5>
                          <ul className="space-y-1">
                            {selectedPlanBenefits.map((benefit, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                <span className="text-gray-700">
                                  {benefit.title}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* MEMBERSHIP AMOUNT */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">8. MEMBERSHIP AMOUNT</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={
                      typeof membershipAmount === "number"
                        ? formatCurrency(membershipAmount)
                        : ""
                    }
                    readOnly
                    className="w-full border-b-2 border-dotted px-2 bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Amount auto-filled based on selected plan
                  </p>
                </div>
              </div>

              {/* MAJOR COMMODITY */}
              <div className="flex flex-col gap-2">
                <span>9. MAJOR COMMODITY</span>
                <input
                  value={majorCommodities[0]}
                  onChange={(e) => {
                    setMajorCommodities([e.target.value, majorCommodities[1]]);
                    setErrors((prev) => ({ ...prev, majorCommodities: null }));
                  }}
                  className={`border h-10 px-2 uppercase ${
                    errors.majorCommodities
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="First major commodity"
                />

                <input
                  value={majorCommodities[1]}
                  onChange={(e) => {
                    setMajorCommodities([majorCommodities[0], e.target.value]);
                    setErrors((prev) => ({ ...prev, majorCommodities: null }));
                  }}
                  className={`border h-10 px-2 uppercase ${
                    errors.majorCommodities
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Second major commodity (optional)"
                />
                {errors.majorCommodities && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.majorCommodities}
                  </p>
                )}
              </div>

              {/* GST */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">10. GST NO</span>
                <div className="flex-1">
                  <input
                    value={gstNumber}
                    onChange={(e) => {
                      setGstNumber(e.target.value.toUpperCase());
                      setErrors((prev) => ({ ...prev, gstNumber: null }));
                    }}
                    maxLength={15}
                    className={`border h-10 px-2 uppercase w-full ${
                      errors.gstNumber ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter 15-digit GST (optional)"
                  />
                  {errors.gstNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.gstNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* EMAIL */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">11. EMAIL</span>
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    className={`border h-10 px-2 w-full ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* REFERRER ID */}
              <div className="flex flex-col md:flex-row gap-4">
                <span className="md:w-1/3">12. REFERRER ID (Optional)</span>
                <div className="flex-1 flex flex-col md:flex-row gap-2">
                  <input
                    value={referrerId}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      setReferrerId(v);
                      if (v.length === 6) {
                        fetchReferrerDetails();
                      } else {
                        setReferrerCompany("");
                      }
                    }}
                    maxLength={6}
                    className="border h-10 px-2 w-full md:w-48"
                    placeholder="6-digit Referrer ID"
                  />
                  <button
                    type="button"
                    onClick={fetchReferrerDetails}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Verify Referrer
                  </button>
                </div>
              </div>

              {referrerCompany && (
                <div className="flex flex-col md:flex-row gap-4 bg-green-50 p-3 rounded">
                  <span className="md:w-1/3">Verified Referrer:</span>
                  <input
                    value={referrerCompany}
                    readOnly
                    className="flex-1 border-b-2 border-dotted bg-transparent px-2 uppercase font-semibold text-green-700"
                  />
                </div>
              )}

              {/* PAYMENT DETAILS */}
              <div className="flex flex-col gap-6 border-t pt-6">
                <span className="font-bold text-xl">PAYMENT DETAILS</span>

                <div className="flex flex-col md:flex-row gap-4">
                  <span className="md:w-1/3">PAYMENT SOURCE</span>
                  <div className="flex-1">
                    <Select
                      options={paymentSourceOptions}
                      value={paymentSourceOptions.find(
                        (opt) => opt.value === paymentSource
                      )}
                      onChange={(opt) => {
                        setPaymentSource(opt.value);
                        setErrors((prev) => ({ ...prev, transactionId: null }));
                      }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          backgroundColor: "white",
                          border: "none",
                          borderBottom: "2px dotted #000",
                          borderRadius: 0,
                          boxShadow: "none",
                          minHeight: "44px",
                        }),
                      }}
                    />
                  </div>
                </div>

                {(paymentSource === "UPI" ||
                  paymentSource === "NEFT" ||
                  paymentSource === "IMPS" ||
                  paymentSource === "CHEQUE") && (
                  <div className="flex flex-col md:flex-row gap-4">
                    <span className="md:w-1/3">TRANSACTION ID</span>
                    <div className="flex-1">
                      <input
                        value={transactionId}
                        onChange={(e) => {
                          setTransactionId(e.target.value);
                          setErrors((prev) => ({
                            ...prev,
                            transactionId: null,
                          }));
                        }}
                        className={`border h-10 px-2 w-full ${
                          errors.transactionId
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={`Enter ${paymentSource} transaction ID`}
                      />
                      {errors.transactionId && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.transactionId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* BANK DETAILS */}
              <div className="flex flex-col gap-6">
                <span>13. BANK DETAILS (FOR MONEY BACK OFFER - Optional)</span>

                <div className="flex flex-col md:flex-row gap-4">
                  <span className="md:w-1/3">BANK NAME</span>
                  <input
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      setErrors((prev) => ({ ...prev, bankName: null }));
                    }}
                    className={`flex-1 border-b-2 px-2 uppercase ${
                      errors.bankName ? "border-red-500" : "border-dotted"
                    }`}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <span className="md:w-1/3">A/C NO</span>
                  <input
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value.replace(/\D/g, ""));
                      setErrors((prev) => ({ ...prev, accountNumber: null }));
                    }}
                    className={`flex-1 border-b-2 px-2 ${
                      errors.accountNumber ? "border-red-500" : "border-dotted"
                    }`}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  <span className="md:w-1/3">IFSC CODE</span>
                  <input
                    value={ifscCode}
                    onChange={(e) => {
                      setIfscCode(e.target.value.toUpperCase());
                      setErrors((prev) => ({ ...prev, ifscCode: null }));
                    }}
                    maxLength={11}
                    className={`flex-1 border-b-2 px-2 uppercase ${
                      errors.ifscCode ? "border-red-500" : "border-dotted"
                    }`}
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>

              {/* SUBMIT BUTTONS */}
              <div className="flex justify-center gap-4 pt-8">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-700"
                >
                  RESET FORM
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-10 py-3 text-white font-bold rounded ${
                    loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {loading ? "ADDING MEMBER..." : "ADD MEMBER"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AddMemberAdminForm;
