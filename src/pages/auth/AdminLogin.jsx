import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { isAdminLoggedIn } from "../../utils/auth";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  //   const [error, setError] = useState("");

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);

      toast.success("Login successful");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      console.log("error", err);
      const message =
        err.response?.data?.message || "Invalid email or password";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-xl shadow-xl p-8 border border-white/20">
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          Admin Login
        </h1>
        <p className="text-gray-300 text-center mb-6 text-sm">
          Sign in to access admin dashboard
        </p>

        {/* {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded">
            {error}
          </div>
        )} */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/40 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="admin@vkmarketing.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded bg-black/40 text-white border border-gray-600 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 transition text-white font-semibold disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} VK Marketing – Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
