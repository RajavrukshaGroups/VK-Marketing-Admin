// components/filters/UserFilters.js
import React, { useState, useEffect, useRef } from "react";
import {
  FiFilter,
  FiX,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiSearch,
} from "react-icons/fi";
import api from "../../api/axios";

const UserFilters = ({
  filters,
  setFilters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [filterData, setFilterData] = useState({
    businessCategories: [],
    businessTypes: [],
    states: [],
    districts: [],
    taluks: [],
    membershipPlans: [],
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Temporary filter state (only applied when user clicks "Apply Filters")
  const [tempFilters, setTempFilters] = useState({
    businessCategories: [],
    businessTypes: [],
    states: [],
    districts: [],
    taluks: [],
    membershipPlans: [],
  });

  const [searchQueries, setSearchQueries] = useState({
    businessCategory: "",
    businessType: "",
    state: "",
    district: "",
    taluk: "",
    membershipPlan: "",
  });

  const filterRef = useRef(null);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/user-filters");

      if (res.data.success) {
        setFilterData(res.data.data);

        // Initialize temp filters with current active filters
        const initialTempFilters = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key]) {
            // Convert single value to array for multi-select
            if (typeof filters[key] === "string") {
              initialTempFilters[key] = [filters[key]];
            } else if (Array.isArray(filters[key])) {
              initialTempFilters[key] = filters[key];
            } else {
              initialTempFilters[key] = [];
            }
          } else {
            initialTempFilters[key] = [];
          }
        });

        setTempFilters(initialTempFilters);
      }
    } catch (err) {
      console.error("Error fetching filters:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (filterType, value, checked) => {
    setTempFilters((prev) => {
      const currentValues = prev[filterType] || [];

      if (checked) {
        return {
          ...prev,
          [filterType]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [filterType]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const handleApplyFilters = () => {
    // Convert tempFilters to the format expected by the API
    const appliedFilters = {};

    Object.keys(tempFilters).forEach((key) => {
      if (tempFilters[key] && tempFilters[key].length > 0) {
        // For single select fields (if needed), take first value
        // For multi-select, join with comma or keep as array based on your API
        if (tempFilters[key].length === 1) {
          appliedFilters[key] = tempFilters[key][0];
        } else {
          // For multiple values, you might need to adjust based on your API
          appliedFilters[key] = tempFilters[key];
        }
      }
    });

    onApplyFilters(appliedFilters);
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    const clearedTempFilters = {
      businessCategories: [],
      businessTypes: [],
      states: [],
      districts: [],
      taluks: [],
      membershipPlans: [],
    };
    setTempFilters(clearedTempFilters);
    setSearchQueries({
      businessCategory: "",
      businessType: "",
      state: "",
      district: "",
      taluk: "",
      membershipPlan: "",
    });
    onClearFilters();
  };

  const removeFilter = (filterType, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: prev[filterType].filter((v) => v !== value),
    }));
  };

  const clearFilterGroup = (filterType) => {
    setTempFilters((prev) => ({
      ...prev,
      [filterType]: [],
    }));
  };

  const getActiveFilterCount = () => {
    return Object.values(tempFilters).reduce(
      (total, arr) => total + arr.length,
      0
    );
  };

  const getFilterLabel = (filterType, value) => {
    if (!value) return "";

    switch (filterType) {
      case "businessCategories":
        const category = filterData.businessCategories.find(
          (c) => c._id === value
        );
        return category?.name || value;
      case "membershipPlans":
        const plan = filterData.membershipPlans.find((p) => p._id === value);
        return plan?.name || value;
      default:
        return value;
    }
  };

  const getFilterDisplayName = (filterType) => {
    const names = {
      businessCategories: "Business Category",
      businessTypes: "Business Type",
      states: "State",
      districts: "District",
      taluks: "Taluk",
      membershipPlans: "Membership Plan",
    };
    return names[filterType] || filterType;
  };

  const getFilteredOptions = (filterType) => {
    const options = filterData[filterType] || [];
    const searchQuery = searchQueries[filterType]?.toLowerCase() || "";

    if (!searchQuery) return options;

    return options.filter((option) => {
      if (typeof option === "object") {
        return option.name?.toLowerCase().includes(searchQuery);
      }
      return option.toLowerCase().includes(searchQuery);
    });
  };

  const renderCheckboxGroup = (filterType, title) => {
    const options = getFilteredOptions(filterType);
    const selectedValues = tempFilters[filterType] || [];

    if (options.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          {selectedValues.length > 0 && (
            <button
              onClick={() => clearFilterGroup(filterType)}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search input for filter options */}
        <div className="relative mb-3">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQueries[filterType] || ""}
            onChange={(e) =>
              setSearchQueries((prev) => ({
                ...prev,
                [filterType]: e.target.value,
              }))
            }
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg 
              focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Options list */}
        <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
          {options.map((option) => {
            const value = typeof option === "object" ? option._id : option;
            const label = typeof option === "object" ? option.name : option;
            const isSelected = selectedValues.includes(value);

            return (
              <label
                key={value}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) =>
                      handleCheckboxChange(filterType, value, e.target.checked)
                    }
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 border-2 rounded flex items-center justify-center
                    ${
                      isSelected
                        ? "bg-blue-500 border-blue-500"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {isSelected && <FiCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFilterDropdown = () => {
    if (!showFilters) return null;

    return (
      <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-fadeIn">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                  {getActiveFilterCount()} selected
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Filter Sections */}
          <div className="max-h-96 overflow-y-auto pr-2">
            {renderCheckboxGroup("businessCategories", "Business Categories")}
            {renderCheckboxGroup("businessTypes", "Business Types")}
            {renderCheckboxGroup("states", "States")}
            {renderCheckboxGroup("districts", "Districts")}
            {renderCheckboxGroup("taluks", "Taluks")}
            {renderCheckboxGroup("membershipPlans", "Membership Plans")}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg transition-all shadow-sm hover:shadow"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveFilterBadges = () => {
    const activeFilters = [];

    Object.keys(tempFilters).forEach((filterType) => {
      tempFilters[filterType].forEach((value) => {
        if (value) {
          activeFilters.push({ type: filterType, value });
        }
      });
    });

    if (activeFilters.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {activeFilters.map(({ type, value }) => {
          const label = getFilterLabel(type, value);
          if (!label) return null;

          return (
            <div
              key={`${type}-${value}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full text-sm border border-blue-200"
            >
              <span className="font-medium">
                {getFilterDisplayName(type)}: {label}
              </span>
              <button
                onClick={() => removeFilter(type, value)}
                className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                title="Remove filter"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          );
        })}
        <button
          onClick={handleClearFilters}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiX className="w-3 h-3" />
          Clear All
        </button>
      </div>
    );
  };

  return (
    <div className="relative" ref={filterRef}>
      {/* Filter Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 border border-blue-600 hover:border-blue-700 shadow-sm"
          >
            <FiFilter className="w-4 h-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white text-blue-600 text-xs font-bold rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </button>

          {/* Show applied filters count */}
          {getActiveFilterCount() > 0 && (
            <div className="text-sm text-gray-600 hidden md:block">
              <span className="font-bold text-blue-600">
                {getActiveFilterCount()}
              </span>{" "}
              filter{getActiveFilterCount() !== 1 ? "s" : ""} applied
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Badges */}
      {renderActiveFilterBadges()}

      {/* Filters Dropdown */}
      {renderFilterDropdown()}
    </div>
  );
};

export default UserFilters;
