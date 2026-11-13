import axios from 'axios';
import initialDatabase from '../data/database.json';

const STORAGE_KEY = 'propickleball_mock_db';
const FIREBASE_BASE_URL = 'https://fer202-986d8-default-rtdb.firebaseio.com';

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('mock_db_updated'));
    }
  } catch (e) {
    console.warn('Lỗi ghi localStorage mock db:', e);
  }
}

/**
 * Đọc dữ liệu từ Firebase Realtime Database trên mây (hoặc fallback về localStorage nếu mất mạng)
 */
async function fetchCloudResource(resource) {
  try {
    const res = await fetch(`${FIREBASE_BASE_URL}/${resource}.json`);
    if (res.ok) {
      const data = await res.json();
      if (data !== null) {
        // Cập nhật lại localStorage làm cache dự phòng
        const local = getLocalDb();
        local[resource] = data;
        saveLocalDb(local);
        return data;
      }
    }
  } catch (e) {
    console.warn(`[Firebase] Lỗi tải ${resource}, dùng local:`, e);
  }
  const db = getLocalDb();
  return db[resource];
}

/**
 * Lưu dữ liệu lên Firebase Realtime Database và đồng bộ localStorage
 */
async function saveCloudResource(resource, updatedData) {
  const local = getLocalDb();
  local[resource] = updatedData;
  saveLocalDb(local);

  try {
    await fetch(`${FIREBASE_BASE_URL}/${resource}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
  } catch (e) {
    console.warn(`[Firebase] Lỗi lưu ${resource}:`, e);
  }
}

/**
 * Cài đặt Axios Interceptor:
 * - Khi kết nối localhost:9999 thành công -> json-server phản hồi bình thường.
 * - Khi không kết nối được (deploy Vercel, offline, hoặc chưa bật json-server) -> Tự động đồng bộ với Firebase Realtime Database trên đám mây.
 */
export function setupAxiosFallback() {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
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
      const resource = parts[0]; // e.g. "courses", "courts", "products", "courtBookings", "academyInfo", "orders", "registrations"
      const resourceId = parts[1]; // e.g. "1", "c6c6"

      const method = (config.method || 'get').toLowerCase();

      // Đọc dữ liệu mới nhất từ Firebase Realtime Database
      const cloudData = await fetchCloudResource(resource);

      let responseData;
      let status = 200;

      if (method === 'get') {
        if (resourceId) {
          const list = Array.isArray(cloudData) ? cloudData : Object.values(cloudData || {});
          const item = list.find((x) => String(x.id) === String(resourceId));
          if (item) {
            responseData = item;
          } else {
            return Promise.reject(error);
          }
        } else {
          responseData = Array.isArray(cloudData)
            ? JSON.parse(JSON.stringify(cloudData))
            : (cloudData || {});
        }
      } else if (method === 'post') {
        let payload = {};
        try {
          payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        } catch (e) {
          payload = config.data || {};
        }

        if (Array.isArray(cloudData)) {
          const newItem = {
            id: payload.id || Math.random().toString(36).substr(2, 6),
            createdAt: payload.createdAt || new Date().toISOString(),
            ...payload,
          };
          const updatedList = [...cloudData, newItem];
          await saveCloudResource(resource, updatedList);
          responseData = newItem;
          status = 201;
        } else {
          const updatedObj = { ...(cloudData || {}), ...payload };
          await saveCloudResource(resource, updatedObj);
          responseData = updatedObj;
          status = 200;
        }
      } else if (method === 'patch' || method === 'put') {
        let payload = {};
        try {
          payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
        } catch (e) {
          payload = config.data || {};
        }

        if (Array.isArray(cloudData) && resourceId) {
          const index = cloudData.findIndex((x) => String(x.id) === String(resourceId));
          if (index !== -1) {
            cloudData[index] = { ...cloudData[index], ...payload };
            await saveCloudResource(resource, cloudData);
            responseData = cloudData[index];
            status = 200;
          } else {
            return Promise.reject(error);
          }
        } else {
          const updatedObj = { ...(cloudData || {}), ...payload };
          await saveCloudResource(resource, updatedObj);
          responseData = updatedObj;
          status = 200;
        }
      } else if (method === 'delete') {
        if (Array.isArray(cloudData) && resourceId) {
          const updatedList = cloudData.filter((x) => String(x.id) !== String(resourceId));
          await saveCloudResource(resource, updatedList);
          responseData = {};
          status = 200;
        }
      }

      // Trả về cấu trúc response giả lập hoàn toàn tương thích với Axios
      return Promise.resolve({
        data: responseData,
        status: status,
        statusText: 'OK (Firebase Cloud Sync)',
        headers: {},
        config: config,
      });
    }
  );
}
