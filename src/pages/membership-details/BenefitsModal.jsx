import { FiList } from "react-icons/fi";

const BenefitsModal = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <FiList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Benefits for {plan.name} PLAN
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    {plan.description || "No description provided."}
                  </p>
                </div>
                <div className="mt-4">
                  {plan.benefits && plan.benefits.length > 0 ? (
                    <ul className="space-y-2">
                      {plan.benefits.map((benefit, index) => (
                        <li
                          key={benefit._id || index}
                          className="flex items-start p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-medium mr-3 mt-0.5">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 text-sm leading-relaxed">
                            {benefit.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <div className="text-gray-400 mb-3">
                        <FiList className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500">
                        No benefits added for this plan.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Add benefits when creating or editing the plan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenefitsModal;
