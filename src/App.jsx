import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function App() {
  return (
    // <div className="h-screen flex items-center justify-center bg-gray-900">
    //   <h1 className="text-4xl font-bold text-yellow-400">
    //     Tailwind + Vite is Working 🚀
    //   </h1>
    // </div>
    <AppRoutes />
  );
}
export default App;
