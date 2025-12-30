import type {
  UserAppAssignment,
  GroupAppAssignment,
  AssignmentConversionResult,
  AppAssignmentSecurityAnalysis,
  AssignmentRecommenderResult,
} from '../../../shared/types';

export interface SelectedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  login: string;
  status: string;
}

export interface SelectedGroup {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface ConversionPreviewData {
  appId: string;
  appName: string;
  userProfile: Record<string, any>;
  groupProfile: Record<string, any>;
  mergedProfile: Record<string, any>;
  differences: Array<{
    field: string;
    userValue: any;
    groupValue: any;
    mergedValue: any;
    fieldType: string;
  }>;
  warnings: string[];
}

export type MergeStrategy = 'preserve_user' | 'prefer_user' | 'prefer_default';

export type AppSubTab = 'viewer' | 'converter' | 'security' | 'bulk' | 'recommender';

export interface AppSubTabProps {
  groupId?: string;
  groupName?: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setResultMessage: (
    message: { text: string; type: 'info' | 'success' | 'warning' | 'error' } | null,
  ) => void;
}

export type {
  UserAppAssignment,
  GroupAppAssignment,
  AssignmentConversionResult,
  AppAssignmentSecurityAnalysis,
  AssignmentRecommenderResult,
};
