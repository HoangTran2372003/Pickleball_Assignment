import axios from 'axios';
import initialDatabase from '../data/database.json';

const STORAGE_KEY = 'propickleball_mock_db';

/**
 * Lấy dữ liệu từ localStorage (nếu có) hoặc khởi tạo từ database.json
 */
function getLocalDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Lỗi đọc localStorage mock db:', e);
  }

  // Khởi tạo bản sao dữ liệu gốc
  const initial = JSON.parse(JSON.stringify(initialDatabase));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {}
  return initial;
}

/**
 * Lưu dữ liệu cập nhật vào localStorage
 */
function saveLocalDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('Lỗi ghi localStorage mock db:', e);
  }
}

/**
 * Cài đặt Axios Interceptor:
 * - Khi kết nối localhost:9999 thành công -> json-server phản hồi bình thường.
 * - Khi không kết nối được (deploy Vercel, offline, hoặc chưa bật json-server) -> Tự động fallback sang mock data nội bộ.
 */
export function setupAxiosFallback() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config;
      if (!config || !config.url) {
        return Promise.reject(error);
      }

      // Chỉ can thiệp các request gọi vào json-server (localhost hoặc cổng 9999) khi gặp lỗi mạng
      const isLocalServer = config.url.includes('9999') || config.url.includes('localhost');
      if (!isLocalServer) {
        return Promise.reject(error);
      }

      // Bóc tách pathname và query params
      let cleanPath = config.url;
      try {
        if (config.url.startsWith('http')) {
          const u = new URL(config.url);
          cleanPath = u.pathname;
        }
      } catch (e) {
        cleanPath = config.url.replace(/^https?:\/\/[^/]+/, '').split('?')[0];
      }

      const parts = cleanPath.replace(/^\/+|\/+$/g, '').split('/');
      const resource = parts[0]; // e.g. "courses", "courts", "products", "courtBookings", "academyInfo"
      const resourceId = parts[1]; // e.g. "1", "c6c6"

      const db = getLocalDb();
      const method = (config.method || 'get').toLowerCase();

      // Nếu resource không có trong mock db thì reject lỗi ban đầu
      if (!Object.prototype.hasOwnProperty.call(db, resource)) {
        return Promise.reject(error);
      }

      console.info(`[Vercel / Offline Fallback] Tự động phục vụ dữ liệu tĩnh cho: ${method.toUpperCase()} ${cleanPath}`);

      let responseData;
      let status = 200;

      if (method === 'get') {
        if (resourceId) {
          const list = Array.isArray(db[resource]) ? db[resource] : [];
          const item = list.find((x) => String(x.id) === String(resourceId));
          if (item) {
            responseData = item;
          } else {
            return Promise.reject(error);
          }
        } else {
          responseData = db[resource];
        }
      } else if (method === 'post') {
        let payload = {};
        try {
          payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        } catch (e) {
          payload = config.data || {};
        }

        if (Array.isArray(db[resource])) {
          const newItem = {
            id: payload.id || Math.random().toString(36).substr(2, 6),
            createdAt: payload.createdAt || new Date().toISOString(),
            ...payload,
          };
          db[resource].unshift(newItem);
          saveLocalDb(db);
          responseData = newItem;
          status = 201;
        } else {
          db[resource] = { ...db[resource], ...payload };
          saveLocalDb(db);
          responseData = db[resource];
          status = 200;
        }
      } else if (method === 'patch' || method === 'put') {
        let payload = {};
        try {
          payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        } catch (e) {
          payload = config.data || {};
        }

        if (Array.isArray(db[resource]) && resourceId) {
          const index = db[resource].findIndex((x) => String(x.id) === String(resourceId));
          if (index !== -1) {
            db[resource][index] = { ...db[resource][index], ...payload };
            saveLocalDb(db);
            responseData = db[resource][index];
            status = 200;
          } else {
            return Promise.reject(error);
          }
        } else {
          db[resource] = { ...db[resource], ...payload };
          saveLocalDb(db);
          responseData = db[resource];
          status = 200;
        }
      } else if (method === 'delete') {
        if (Array.isArray(db[resource]) && resourceId) {
          db[resource] = db[resource].filter((x) => String(x.id) !== String(resourceId));
          saveLocalDb(db);
          responseData = {};
          status = 200;
        }
      }

      // Trả về cấu trúc response giả lập hoàn toàn tương thích với Axios
      return Promise.resolve({
        data: responseData,
        status: status,
        statusText: 'OK (Mock Fallback)',
        headers: {},
        config: config,
      });
    }
  );
}
