import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "../pages/auth/AdminLogin";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "../components/common/protectedRoute";
import BusinessCategory from "../pages/category/BusinessCategory";
import RegisteredUsers from "../pages/registeredUsers/registeredusers";
import MembershipTypes from "../pages/membership-details/MembershipTypes";
import EditMembershipTypes from "../pages/membership-details/EditMembershipTypes";
import ListAllPayments from "../pages/payments/listAllPayments";
import AddMemberAdminForm from "../pages/registeredUsers/addMemberForm";
import PostNotification from "../pages/notifications/postNotification";
import ListNotification from "../pages/notifications/listNotification";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/login" />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/category"
          element={
            <ProtectedRoute>
              <BusinessCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <RegisteredUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/membership-types"
          element={
            <ProtectedRoute>
              <MembershipTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/edit-membership/:id"
          element={
            <ProtectedRoute>
              <EditMembershipTypes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-membership"
          element={
            <ProtectedRoute>
              <AddMemberAdminForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/view-payments"
          element={
            <ProtectedRoute>
              <ListAllPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/post-notification"
          element={
            <ProtectedRoute>
              <PostNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/list-notification"
          element={
            <ProtectedRoute>
              <ListNotification />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
