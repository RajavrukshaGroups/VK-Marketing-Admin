import api from "../api/axios";
import { toast } from "react-toastify";

export const isAdminLoggedIn = () => {
  return !!localStorage.getItem("adminToken");
};

export const logoutAdmin = async () => {
  try {
    await api.post("/logout");
  } catch (err) {
    // ignore backend logout errors
  } finally {
    localStorage.removeItem("adminToken");

    // ✅ show toast BEFORE redirect
    toast.success("Logged out successfully");

    // ✅ give toast time to render
    setTimeout(() => {
      window.location.href = "/admin/login";
    }, 1200);
  }
};
