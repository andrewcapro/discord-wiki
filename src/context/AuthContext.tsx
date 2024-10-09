import { createContext, useContext, useEffect, useState } from "react";
import jwt from "jsonwebtoken";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean; // Loading state
  userRole: string | null; // User role
  userName: string | null; // User name
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Initialize loading state
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setIsAuthenticated(true);
        setUserRole(decoded.role || null); // Set user role if it exists
        setUserName(decoded.username || null); // Set user name if it exists
      } else {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setLoading(false); // Set loading to false after the check
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    const decoded = jwt.decode(token) as any;

    // console.log("Decoded token:", decoded); // Log the decoded token for debugging

    setIsAuthenticated(true);
    setUserRole(decoded.role || null);
    setUserName(decoded.username || null);

    // Log the updated state
    // console.log("User logged in:", {
    //   isAuthenticated: true,
    //   userRole: decoded.role,
    //   userName: decoded.username,
    // });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, loading, userRole, userName, login, logout }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
