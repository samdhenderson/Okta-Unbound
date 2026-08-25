export interface RequestLogEndpoint {
  method: string;
  endpoint: string;
}

export type RequestLogOutcome = 'all' | 'partial' | 'none';

export interface RequestLogEntry {
  id: string;
  timestamp: number;
  reason: string;
  requestCount: number;
  endpoints: RequestLogEndpoint[];
  endpointsTruncated: boolean;
  durationMs: number;
  outcome: RequestLogOutcome;
}

export interface RequestLogHistory {
  entries: RequestLogEntry[];
  maxSize: number;
}
