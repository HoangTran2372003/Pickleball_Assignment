import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.fullName && parsed.email) {
          return parsed;
        }
        localStorage.removeItem("currentUser");
      } catch (e) {
        localStorage.removeItem("currentUser");
      }
    }
    return null;
  });

  // Tải danh sách tài khoản từ database.json
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:9999/users");
        const dbUsers = Array.isArray(res.data) ? res.data : [];
        setUsers(dbUsers);

        setCurrentUser((prev) => {
          if (prev) {
            const matched = dbUsers.find(
              (u) => String(u.id) === String(prev.id),
            );
            return matched || prev;
          }
          return null;
        });
      } catch (err) {
        console.error("Lỗi khi tải danh sách users từ database.json:", err);
      }
    };

    fetchUsers();
  }, []);

  // Đồng bộ currentUser vào localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  // Đăng nhập
  const login = async (identifier, password) => {
    try {
      const res = await axios.get("http://localhost:9999/users");
      const dbUsers = Array.isArray(res.data) ? res.data : users;
      setUsers(dbUsers);

      const cleanId = identifier.trim().toLowerCase();
      const matched = dbUsers.find(
        (u) =>
          (u.email.toLowerCase() === cleanId ||
            u.username.toLowerCase() === cleanId) &&
          String(u.password) === String(password).trim(),
      );

      if (matched) {
        setCurrentUser(matched);
        return { success: true, user: matched };
      }
      return {
        success: false,
        message: "Email/Tên đăng nhập hoặc mật khẩu không chính xác.",
      };
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      return {
        success: false,
        message: "Không thể kết nối đến máy chủ xác thực.",
      };
    }
  };

  // Đăng ký tài khoản học viên mới
  const register = async ({ fullName, email, phone, password }) => {
    try {
      const res = await axios.get("http://localhost:9999/users");
      const dbUsers = Array.isArray(res.data) ? res.data : users;

      const cleanEmail = email.trim().toLowerCase();
      const cleanPhone = phone.trim();

      if (dbUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
        return {
          success: false,
          message: "Email này đã được đăng ký tài khoản!",
        };
      }
      if (dbUsers.some((u) => u.phone === cleanPhone)) {
        return {
          success: false,
          message: "Số điện thoại này đã được sử dụng!",
        };
      }

      const newUserPayload = {
        username: cleanEmail,
        password: password.trim(),
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: "student",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
        membershipTier: "Học Viên Mới",
      };

      const createRes = await axios.post(
        "http://localhost:9999/users",
        newUserPayload,
      );
      const createdUser = createRes.data;

      setUsers((prev) => [...prev, createdUser]);
      setCurrentUser(createdUser);
      return { success: true, user: createdUser };
    } catch (err) {
      console.error("Lỗi đăng ký tài khoản:", err);
      return {
        success: false,
        message: "Không thể tạo tài khoản. Vui lòng thử lại!",
      };
    }
  };

  // Cập nhật thông tin hồ sơ & mật khẩu
  const updateProfile = async (updates) => {
    if (!currentUser) return { success: false, message: "Chưa đăng nhập." };
    try {
      const res = await axios.patch(
        `http://localhost:9999/users/${currentUser.id}`,
        updates,
      );
      const updatedUser = { ...currentUser, ...res.data, ...updates };
      setCurrentUser(updatedUser);
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(currentUser.id) ? updatedUser : u,
        ),
      );
      return { success: true, user: updatedUser };
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      return { success: false, message: "Không thể cập nhật thông tin." };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{ users, currentUser, login, register, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
