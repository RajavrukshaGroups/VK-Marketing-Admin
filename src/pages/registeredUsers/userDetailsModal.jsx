import React from "react";
import {
  FiX,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCreditCard,
  FiCalendar,
  FiLink,
  FiFileText,
  FiCopy,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiShoppingBag,
  FiPackage,
} from "react-icons/fi";

const UserDetailsModal = ({
  userDetails,
  onClose,
  onCopyToClipboard,
  loading = false,
  getStatusConfig,
}) => {
  if (!userDetails) return null;
  console.log("user details modal", userDetails);

  const statusConfig = getStatusConfig
    ? getStatusConfig(userDetails.membership?.status)
    : {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: <FiClock className="w-4 h-4" />,
      };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function to render business nature section
  const renderBusinessNature = () => {
    const { manufacturer, trader } = userDetails.businessNature || {};

    return (
      <div className="space-y-4">
        {/* Manufacturer Section */}
        {manufacturer?.isManufacturer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-sm font-medium rounded-lg border border-blue-200 flex items-center gap-2">
                <FiPackage className="w-4 h-4" />
                Manufacturer
              </div>
            </div>

            {manufacturer.scale && manufacturer.scale.length > 0 && (
              <div className="ml-1">
                <div className="text-xs text-gray-500 mb-1">Scale:</div>
                <div className="flex flex-wrap gap-1.5">
                  {manufacturer.scale.map((scale, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 text-xs font-medium rounded-full border border-blue-200"
                    >
                      {scale}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trader Section */}
        {trader?.isTrader && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-sm font-medium rounded-lg border border-green-200 flex items-center gap-2">
                <FiShoppingBag className="w-4 h-4" />
                Trader
              </div>
            </div>

            {trader.type && trader.type.length > 0 && (
              <div className="ml-1">
                <div className="text-xs text-gray-500 mb-1">Type:</div>
                <div className="flex flex-wrap gap-1.5">
                  {trader.type.map((type, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gradient-to-r from-green-100 to-green-50 text-green-800 text-xs font-medium rounded-full border border-green-200"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Display if neither manufacturer nor trader */}
        {!manufacturer?.isManufacturer && !trader?.isTrader && (
          <div className="text-sm text-gray-400 italic">
            No business nature specified
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 text-left">
                User Details
              </h3>
              <p className="text-sm text-gray-500">
                Complete information for {userDetails.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <div className="relative mb-4">
                <div className="w-12 h-12 border-4 border-blue-100 rounded-full"></div>
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-700 font-medium">
                Loading user details...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User ID & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard
                  title="USER ID"
                  value={userDetails.userId}
                  icon={<FiUser className="w-4 h-4" />}
                  onCopy={() =>
                    onCopyToClipboard(userDetails.userId, "User ID")
                  }
                  copyable
                  className="from-gray-50 to-gray-100 border-gray-200"
                />
                <InfoCard
                  title="COMPANY NAME"
                  value={userDetails.companyName}
                  className="from-blue-50 to-blue-100 border-blue-200 text-blue-600"
                />
                <InfoCard
                  title="STATUS"
                  className="from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600"
                >
                  <div className="flex items-center gap-2 min-h-[48px]">
                    <StatusBadge
                      text={userDetails.isActive ? "Active" : "Inactive"}
                      isActive={userDetails.isActive}
                    />
                    <StatusBadge
                      text={userDetails.membership?.status || "PENDING"}
                      config={statusConfig}
                    />
                  </div>
                </InfoCard>
              </div>

              {/* Contact Information */}
              <Section
                title="Contact Information"
                icon={<FiUser className="w-5 h-5 text-blue-600" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Field
                      label="Proprietors"
                      value={userDetails.proprietors}
                    />
                    <Field
                      label="Email"
                      value={userDetails.email}
                      onCopy={() =>
                        onCopyToClipboard(userDetails.email, "Email")
                      }
                      copyable
                    />
                  </div>
                  <div className="space-y-4">
                    <Field
                      label="Mobile Number"
                      value={userDetails.mobileNumber}
                      onCopy={() =>
                        onCopyToClipboard(
                          userDetails.mobileNumber,
                          "Mobile Number"
                        )
                      }
                      copyable
                    />
                    <Field
                      label="Registration Date"
                      value={formatDate(userDetails.createdAt)}
                    />
                  </div>
                </div>
              </Section>

              {/* Address Information */}
              <Section
                title="Address Details"
                icon={<FiMapPin className="w-5 h-5 text-green-600" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Field label="State" value={userDetails.address?.state} />
                    <Field
                      label="District"
                      value={userDetails.address?.district}
                    />
                  </div>
                  <div className="space-y-4">
                    <Field label="Taluk" value={userDetails.address?.taluk} />
                    <Field
                      label="Street Address"
                      value={userDetails.address?.street}
                      multiLine
                    />
                  </div>
                </div>
              </Section>

              {/* Business Information */}
              <Section
                title="Business Information"
                icon={<FiBriefcase className="w-5 h-5 text-purple-600" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Field
                      label="Business Category"
                      value={
                        userDetails.businessCategoryName ||
                        userDetails.businessCategory?.name ||
                        userDetails.businessCategory
                      }
                      className="from-purple-50 to-purple-100 border-purple-200"
                    />

                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Business Nature
                      </div>
                      {renderBusinessNature()}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Field
                      label="Major Commodities"
                      value={
                        Array.isArray(userDetails.majorCommodities)
                          ? userDetails.majorCommodities.join(", ")
                          : userDetails.majorCommodities
                      }
                      multiLine
                    />
                    <Field
                      label="GST Number"
                      value={userDetails.gstNumber}
                      onCopy={() =>
                        onCopyToClipboard(userDetails.gstNumber, "GST Number")
                      }
                      copyable
                      monospace
                    />
                  </div>
                </div>
              </Section>

              {/* Bank Details */}
              {userDetails.bankDetails && (
                <Section
                  title="Bank Details"
                  icon={<FiCreditCard className="w-5 h-5 text-amber-600" />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field
                      label="Bank Name"
                      value={userDetails.bankDetails.bankName}
                      className="from-amber-50 to-amber-100 border-amber-200"
                    />
                    <Field
                      label="Account Number"
                      value={userDetails.bankDetails.accountNumber}
                      onCopy={() =>
                        onCopyToClipboard(
                          userDetails.bankDetails.accountNumber,
                          "Account Number"
                        )
                      }
                      copyable
                      monospace
                    />
                    <Field
                      label="IFSC Code"
                      value={userDetails.bankDetails.ifscCode}
                      onCopy={() =>
                        onCopyToClipboard(
                          userDetails.bankDetails.ifscCode,
                          "IFSC Code"
                        )
                      }
                      copyable
                      monospace
                    />
                  </div>
                </Section>
              )}

              {/* Referral Information */}
              <Section
                title="Referral Information"
                icon={<FiLink className="w-5 h-5 text-green-600" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-2">
                      Referral Source
                    </div>
                    <ReferralBadge source={userDetails.referral?.source} />
                  </div>
                  {userDetails.referral?.referredByUser && (
                    <div>
                      <div className="text-xs text-gray-500 mb-2">
                        Referred By
                      </div>
                      <ReferrerCard
                        companyName={
                          userDetails.referral.referredByUser.companyName
                        }
                        userId={userDetails.referral.referredByUser.userId}
                      />
                    </div>
                  )}
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => {
              const textToCopy = `
User ID: ${userDetails.userId}
Company: ${userDetails.companyName}
Email: ${userDetails.email}
Mobile: ${userDetails.mobileNumber}
Address: ${userDetails.address?.street}, ${userDetails.address?.taluk}, ${
                userDetails.address?.district
              }, ${userDetails.address?.state}
Business Category: ${
                userDetails.businessCategoryName ||
                userDetails.businessCategory?.name ||
                userDetails.businessCategory
              }
Business Nature: ${
                userDetails.businessNature?.manufacturer?.isManufacturer
                  ? "Manufacturer" +
                    (userDetails.businessNature.manufacturer.scale?.length > 0
                      ? ` (${userDetails.businessNature.manufacturer.scale.join(
                          ", "
                        )})`
                      : "")
                  : ""
              }${
                userDetails.businessNature?.manufacturer?.isManufacturer &&
                userDetails.businessNature?.trader?.isTrader
                  ? ", "
                  : ""
              }${
                userDetails.businessNature?.trader?.isTrader
                  ? "Trader" +
                    (userDetails.businessNature.trader.type?.length > 0
                      ? ` (${userDetails.businessNature.trader.type.join(
                          ", "
                        )})`
                      : "")
                  : ""
              }
GST: ${userDetails.gstNumber || "N/A"}
Bank: ${userDetails.bankDetails?.bankName || "N/A"} - ${
                userDetails.bankDetails?.accountNumber || "N/A"
              }
Status: ${userDetails.isActive ? "Active" : "Inactive"} - ${
                userDetails.membership?.status || "PENDING"
              }
              `.trim();
              onCopyToClipboard(textToCopy, "User Details");
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium rounded-lg hover:shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <FiCopy className="w-4 h-4" />
            Copy All Details
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Sub-components

const InfoCard = ({
  title,
  value,
  children,
  icon,
  onCopy,
  copyable = false,
  className,
}) => (
  <div
    className={`bg-gradient-to-br ${className} p-4 rounded-xl border flex flex-col justify-between`}
  >
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide h-[18px]">
      {title}
    </div>

    <div className="flex items-center gap-2 min-h-[48px] leading-none">
      {children || (
        <>
          {icon && <span className="text-gray-500 text-center">{icon}</span>}
          <span className="font-mono text-lg font-bold text-gray-900 truncate leading-none">
            {value}
          </span>
          {copyable && onCopy && (
            <button
              onClick={onCopy}
              className="ml-auto p-1.5 rounded-md hover:bg-gray-200 transition"
            >
              <FiCopy className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </>
      )}
    </div>
  </div>
);

const StatusBadge = ({ text, isActive, config }) => {
  if (isActive !== undefined) {
    return (
      <span
        className={`inline-flex items-center justify-center h-[28px] px-10 rounded-full text-sm font-semibold ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon}
      {text}
    </span>
  );
};

const Section = ({ title, icon, children }) => (
  <section className="border border-gray-200 rounded-xl p-5 space-y-4">
    <div className="flex items-center gap-2">
      {icon}
      <h4 className="text-lg font-bold text-gray-900">{title}</h4>
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  value,
  children,
  icon,
  onCopy,
  copyable = false,
  multiLine = false,
  monospace = false,
  className,
}) => (
  <div className="flex flex-col gap-1">
    {/* Label */}
    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide h-[18px]">
      {label}
    </div>

    {/* Value Wrapper */}
    <div className="relative flex items-start gap-2">
      {icon && <span className="mt-2 text-gray-400 flex-shrink-0">{icon}</span>}

      <div
        className={`
          flex-1 min-h-[48px] px-3 py-2 rounded-lg
          ${className || "bg-gray-50 border border-gray-200"}
          text-sm font-medium text-gray-900
          ${multiLine ? "whitespace-pre-wrap items-start" : "flex items-center"}
          ${monospace ? "font-mono" : ""}
        `}
      >
        {children || value || "Not provided"}
      </div>

      {copyable && onCopy && value && (
        <button
          onClick={onCopy}
          className="absolute right-2 top-2 p-1.5 rounded-md hover:bg-gray-100 transition"
        >
          <FiCopy className="w-3.5 h-3.5 text-gray-500" />
        </button>
      )}
    </div>
  </div>
);

const ReferralBadge = ({ source }) => (
  <div
    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
      source === "ADMIN"
        ? "bg-purple-100 text-purple-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {source === "ADMIN" ? (
      <>
        <FiUser className="w-4 h-4" />
        <span className="font-medium">Admin Referral</span>
      </>
    ) : (
      <>
        <FiUsers className="w-4 h-4" />
        <span className="font-medium">User Referral</span>
      </>
    )}
  </div>
);

const ReferrerCard = ({ companyName, userId }) => (
  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
    <div className="p-2 bg-white rounded-md flex-shrink-0">
      <FiUser className="w-4 h-4 text-green-600" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-bold text-gray-900 truncate">
        {companyName}
      </div>
      <div className="text-xs text-gray-600 truncate">ID: {userId}</div>
    </div>
  </div>
);

export default UserDetailsModal;
