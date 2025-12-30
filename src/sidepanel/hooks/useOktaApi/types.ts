import type {
  MessageRequest,
  MessageResponse,
  OktaUser,
  UserStatus,
  AuditLogEntry,
  OktaApp,
  UserAppAssignment,
  GroupAppAssignment,
  CreateAppAssignmentRequest,
  AssignmentConversionRequest,
  AssignmentConversionResult,
  BulkAppAssignmentRequest,
  BulkAppAssignmentResult,
  AppAssignmentSecurityAnalysis,
  AssignmentRecommenderResult,
  AppProfileSchema,
} from '../../../shared/types';

export type {
  MessageRequest,
  MessageResponse,
  OktaUser,
  UserStatus,
  AuditLogEntry,
  OktaApp,
  UserAppAssignment,
  GroupAppAssignment,
  CreateAppAssignmentRequest,
  AssignmentConversionRequest,
  AssignmentConversionResult,
  BulkAppAssignmentRequest,
  BulkAppAssignmentResult,
  AppAssignmentSecurityAnalysis,
  AssignmentRecommenderResult,
  AppProfileSchema,
};

export interface OperationCallbacks {
  onResult?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onProgress?: (current: number, total: number, message: string, apiCalls?: number) => void;
}

export interface UseOktaApiOptions {
  targetTabId: number | null;
  onResult?: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onProgress?: (current: number, total: number, message: string, apiCalls?: number) => void;
}
