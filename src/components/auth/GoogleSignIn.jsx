import { useAuth } from "../../contexts/AuthContext";
import { FcGoogle } from "react-icons/fc"; // Google icon from react-icons

export default function GoogleSignIn() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <button
        onClick={loginWithGoogle}
        className="flex items-center space-x-3 px-6 py-3 bg-white shadow-md rounded-lg hover:shadow-lg hover:bg-gray-100 transition-all duration-300 focus:outline-none"
      >
        <FcGoogle className="w-6 h-6" />
        <span className="text-gray-700 font-medium text-lg">
          Sign in with Google
        </span>
      </button>
    </div>
  );
}
