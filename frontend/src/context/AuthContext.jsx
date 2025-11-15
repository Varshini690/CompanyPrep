import { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Load user from stored tokens
  useEffect(() => {
    const access = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");

    if (access && refresh) {
      setUser({ loggedIn: true });
    }
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login/", {
      username,
      password,
    });

    localStorage.setItem("accessToken", res.data.access);
    localStorage.setItem("refreshToken", res.data.refresh);

    setUser({ loggedIn: true });
  };

  const register = async (username, email, password) => {
    await api.post("/auth/register/", {
      username,
      email,
      password,
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
