import { Department } from '../types';
import { MOCK_DEPARTMENTS } from '../mock/data';

let departmentsDatabase = [...MOCK_DEPARTMENTS];

export const departmentsService = {
  getDepartments: async (): Promise<Department[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return [...departmentsDatabase];
  },

  getDepartmentById: async (id: string): Promise<Department | null> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = departmentsDatabase.find((d) => d.id === id);
    return found ? { ...found } : null;
  },
};
