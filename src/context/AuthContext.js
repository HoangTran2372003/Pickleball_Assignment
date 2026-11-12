import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Tải danh sách tài khoản trực tiếp từ database.json qua json-server
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get('http://localhost:9999/users');
        const dbUsers = Array.isArray(res.data) ? res.data : [];
        setUsers(dbUsers);

        // Đồng bộ thông tin user nếu đã đăng nhập trước đó
        setCurrentUser((prev) => {
          if (prev) {
            const matched = dbUsers.find((u) => String(u.id) === String(prev.id));
            return matched || prev;
          }
          return null;
        });
      } catch (err) {
        console.error('Lỗi khi tải danh sách users từ database.json:', err);
      }
    };

    fetchUsers();
  }, []);

  // Lưu user hiện tại vào localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Hàm đăng nhập kiểm tra với database.json
  const login = async (identifier, password) => {
    try {
      // Đảm bảo lấy dữ liệu mới nhất từ server
      const res = await axios.get('http://localhost:9999/users');
      const dbUsers = Array.isArray(res.data) ? res.data : users;
      setUsers(dbUsers);

      const cleanId = identifier.trim().toLowerCase();
      const matched = dbUsers.find(
        (u) =>
          (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
          String(u.password) === String(password).trim()
      );

      if (matched) {
        setCurrentUser(matched);
        return { success: true, user: matched };
      } else {
        return { success: false, message: 'Email/Tên đăng nhập hoặc mật khẩu không chính xác.' };
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ users, currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
