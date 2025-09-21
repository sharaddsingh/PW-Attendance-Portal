// components/auth/RoleSelector.jsx
import { useAuth } from "../../contexts/AuthContext";

export default function RoleSelector() {
  const { assignRole } = useAuth();

  const handleSelect = (role) => {
    assignRole(role);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-bold mb-4">Select Your Role</h2>
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded mb-3"
        onClick={() => handleSelect("student")}
      >
        I am a Student
      </button>
      <button
        className="bg-green-500 text-white px-6 py-2 rounded"
        onClick={() => handleSelect("faculty")}
      >
        I am Faculty
      </button>
    </div>
  );
}
