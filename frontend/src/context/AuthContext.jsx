import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && storedUser !== "undefined" && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post("/v1/auth/login", { email, password });
      
      const { accessToken, userId, username } = response.data;
      const user = { id: userId, username: username || email.split("@")[0], email };
      
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please check your credentials."
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosInstance.post("/v1/auth/register", userData);
      const { accessToken, userId, username } = response.data;
      
      if (accessToken) {
        const user = { id: userId, username, email: userData.email };
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Registration failed:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed." 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
