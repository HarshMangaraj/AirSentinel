import { create } from 'zustand';
import { User, UserRole, Permission } from '../types';
import { MOCK_USERS } from '../mock/data';

interface AuthState {
  currentUser: User;
  allUsers: User[];
  setUserRole: (role: UserRole) => void;
  hasPermission: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: MOCK_USERS[0],
  allUsers: MOCK_USERS,
  setUserRole: (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    set({ currentUser: user });
  },
  hasPermission: (permission: Permission) => {
    const { currentUser } = get();
    return currentUser.permissions.includes(permission);
  },
}));
