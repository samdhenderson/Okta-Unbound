import type {
  MessageRequest,
  MessageResponse,
  OktaUser,
  UserStatus,
  AuditLogEntry,
  OktaApp,
  OktaFactor,
  MemberMfaResult,
  MfaScanStatus,
  ResultType,
} from '../../../shared/types';

export type {
  MessageRequest,
  MessageResponse,
  OktaUser,
  UserStatus,
  AuditLogEntry,
  OktaApp,
  OktaFactor,
  MemberMfaResult,
  MfaScanStatus,
  ResultType,
};

export interface OperationResult {
  message: string;
  type: ResultType;
}

export interface OperationCallbacks {
  onResult?: (result: OperationResult) => void;
  onProgress?: (current: number, total: number, message: string, apiCalls?: number) => void;
}

export interface UseOktaApiOptions {
  targetTabId: number | null;
  onResult?: (result: OperationResult) => void;
  onProgress?: (current: number, total: number, message: string, apiCalls?: number) => void;
}
