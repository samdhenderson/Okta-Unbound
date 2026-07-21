import { z } from 'zod';
import { formatDateForCSV } from '@/shared/utils/csvUtils';
import type { ExportColumn } from '../types';

export const exportUserSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    created: z.string().nullish(),
    lastLogin: z.string().nullish(),
    lastUpdated: z.string().nullish(),
    profile: z
      .object({
        login: z.string().optional(),
        email: z.string().optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        department: z.string().optional(),
        title: z.string().optional(),
        manager: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type ExportUser = z.infer<typeof exportUserSchema>;

export const userColumns: ExportColumn<ExportUser>[] = [
  { id: 'id', label: 'User ID', group: 'base', defaultEnabled: true, accessor: (u) => u.id },
  {
    id: 'status',
    label: 'Status',
    group: 'base',
    defaultEnabled: true,
    accessor: (u) => u.status,
  },
  {
    id: 'created',
    label: 'Created',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.created,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastLogin',
    label: 'Last Login',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.lastLogin,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'lastUpdated',
    label: 'Last Updated',
    group: 'base',
    defaultEnabled: false,
    accessor: (u) => u.lastUpdated,
    format: (v) => formatDateForCSV(v as string | null | undefined),
  },
  {
    id: 'login',
    label: 'Login',
    group: 'profile',
    defaultEnabled: true,
    accessor: (u) => u.profile?.login,
  },
  {
    id: 'email',
    label: 'Email',
    group: 'profile',
    defaultEnabled: true,
    accessor: (u) => u.profile?.email,
  },
  {
    id: 'firstName',
    label: 'First Name',
    group: 'profile',
    defaultEnabled: true,
    accessor: (u) => u.profile?.firstName,
  },
  {
    id: 'lastName',
    label: 'Last Name',
    group: 'profile',
    defaultEnabled: true,
    accessor: (u) => u.profile?.lastName,
  },
  {
    id: 'department',
    label: 'Department',
    group: 'profile',
    defaultEnabled: false,
    accessor: (u) => u.profile?.department,
  },
  {
    id: 'title',
    label: 'Title',
    group: 'profile',
    defaultEnabled: false,
    accessor: (u) => u.profile?.title,
  },
  {
    id: 'manager',
    label: 'Manager',
    group: 'profile',
    defaultEnabled: false,
    accessor: (u) => u.profile?.manager,
  },
];
