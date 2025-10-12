
import axios from 'axios';
import useTokenStore from '@/store';

const api = axios.create({
    // todo: move this value to env variable.
    baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

api.interceptors.request.use((config) => {
    const token = useTokenStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// login admin
export const login = async (data: { identifier: string; password: string, platform: string }) => {
    const response = await api.post('/api/auth/login', data);
    return response.data;
};

// change password
export const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
    const response = await api.post('/api/auth/change-password', data);
    return response.data;
};

// register admin or compliance
export const register = async (data: { name: string; email: string; password: string; isAdmin?: boolean }) => {
    const endpoint = data.isAdmin ? '/api/auth/register-admin' : '/api/auth/register-compliance';
    const response = await api.post(endpoint, {
        email: data.email,
        password: data.password,
        profile: {
            name: data.name
        }
    });
    return response.data;
};

// forget password
export const forgetPassword = async (data: { email: string; }) =>
    api.post('/api/auth/forget-password-admin', data);

// verify otp
export const verifyOtp = async (data: { email: string; otp: string; newPassword: string, confirmPassword: string}) => {
    const response = await api.post('/api/auth/verify-otp', data);
    return response.data;
};

interface PaginationParams {
  page?: number;
  limit?: number;
  filterStatus?: string;
}

// get all customers
export const getCustomers = async ({ page = 1, limit=20 }: PaginationParams = {}) => {
  const response = await api.get(`/api/list/all-customers?page=${page}&limit=${limit}`);
  return response.data;
};

// get all admins and compliance
export const getAdmins = async ({ page = 1, limit=20 }: PaginationParams = {}) => {
  const response = await api.get(`/api/list/all-admins-compliance?page=${page}&limit=${limit}`);
  return response.data;
};

// activate or deactivate user
export const updateUserStatus = async ({ userId, status }: { userId: string, status: string }) => {
  const response = await api.patch(`/api/list/user/${userId}/status`, { status });
  return response.data;
};

// get all drivers
export const getDrivers = async ({ page = 1, filterStatus = 'accepted', limit=20 }: PaginationParams = {}) => {
  const response = await api.get(`/api/list/all-drivers?page=${page}&filterStatus=${filterStatus}&limit=${limit}`);
  return response.data;
};

// accept or reject driver
export const updateDriverProfileStatus = async ({ userId, status, message }: { userId: string, status: string, message?: string }) => {
  const response = await api.patch(`/api/list/driver/${userId}/profile_status`, { 
    profile_status: status,
    profile_status_message: message 
  });
  return response.data;
};

// get all vehicles
export const getVehicles = async ({ page = 1, limit = 20 }: PaginationParams = {}) => {
  const response = await api.get(`/api/list/vehicles-with-owners?page=${page}&limit=${limit}`);
  return response.data;
};

// get all car owners
export const getCarOwners = async ({ page = 1, filterStatus = 'accepted' }: PaginationParams = {}) => {
  const response = await api.get(`/api/list/all-car-owners?page=${page}&filterStatus=${filterStatus}`);
  return response.data;
};

// accept or reject vehicle
export const updateVehicleStatus = async ({ id, status }: { id: string, status: string }) => {
  const response = await api.patch(`/api/list/vehicle/${id}/status`, { status });
  return response.data;
};

// accept or reject car owner
export const updateCarOwnerProfileStatus = async ({ userId, status, message }: { userId: string, status: string, message?: string }) => {
  const response = await api.patch(`/api/list/car-owner/${userId}/profile_status`, { 
    profile_status: status,
    profile_status_message: message 
  });
  return response.data;
};

export const getBooks = async () => api.get('/api/books');

export const createBook = async (data: FormData) =>
    api.post('/api/books', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

export const searchEntities = async ({ entity, searchQuery, page = 1, filterStatus = 'accepted', limit=20 }: { entity: string, searchQuery: string, page: number, filterStatus?: string, limit: number }) => {
  try {
    const response = await api.get(`/api/list/search`, {
      params: {
        entity,
        searchQuery,
        page,
        filterStatus,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

// Get bookings with filters (status, booking_type)
export const getBookings = async ({ status, booking_type, start_date, end_date, page, limit }: { status?: string, booking_type?: string, start_date?: string, end_date?: string, page?: number, limit?: number  }) => {
  const response = await api.get('/api/booking/all/bookings', {
    params: { status, booking_type, start_date, end_date, page, limit }
  });
  return response.data;
};

// Get available drivers for a booking
export const getAvailableDriversForBooking = async (bookingId: string) => {
  const response = await api.get(`/api/booking/${bookingId}/available-drivers`);
  return response.data;
};

// Assign driver to a booking
export const assignDriverToBooking = async ({ bookingId, driverId }: { bookingId: string, driverId: string }) => {
  const response = await api.patch(`/api/booking/${bookingId}/assign-driver`, { driver_id: driverId });
  return response.data;
};

// Register driver
export const registerDriver = async (data: any) => {
  const response = await api.post('/api/auth/register-driver', data);
  return response.data;
};

// Upload file (image/pdf)
export const uploadFile = async (formData: FormData) => {
  const response = await api.post('/api/auth/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get credits history for admin (with filters, pagination)
export const getCreditsHistoryAdmin = async ({ status, page = 1, limit = 10 }: { status?: string, page?: number, limit?: number }) => {
  const response = await api.get('/api/credits/all-history', {
    params: { status, page, limit }
  });
  return response.data;
};

// Approve a pending credit transaction
export const approveCreditTransaction = async (id: string) => {
  const response = await api.patch(`/api/credits/approve/${id}`);
  return response.data;
};


// Get all open support chats (admin)
export const getSupportChats = async () => {
  const response = await api.get('/api/support');
  return response.data;
};

// Send admin reply to a support chat (REST fallback, not used for socket)
export const sendAdminReply = async ({ chatId, text, adminId }: { chatId: string, text: string, adminId: string }) => {
  const response = await api.post(`/api/support-chats/${chatId}/reply`, { text, adminId });
  return response.data;
};

// Cancel a booking by admin
export const cancelBookingByAdmin = async ({ bookingId, reason }: { bookingId: string, reason: string }) => {
  const response = await api.patch(`/api/booking/${bookingId}/cancel`, {
    reason,
    cancelled_by: 'admin',
  });
  return response.data;
};

// Get notifications for admin
export const getNotifications = async () => {
  const response = await api.get('/api/auth/notifications');
  return response.data;
};

// Get dashboard statistics
export const getDashboardStats = async () => {
  const response = await api.get('/api/dashboard/stats');
  return response.data;
};