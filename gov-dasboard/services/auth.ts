import { User, UserRole } from '../types';
import { MOCK_USERS } from '../mock/data';

export const authService = {
  getCurrentUser: async (): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...MOCK_USERS[0] }; // Default to Super Admin Dr. Rajesh Sharma
  },

  getAllUsers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return [...MOCK_USERS];
  },

  switchUserByRole: async (role: UserRole): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = MOCK_USERS.find((u) => u.role === role);
    return found ? { ...found } : { ...MOCK_USERS[0] };
  },
};
