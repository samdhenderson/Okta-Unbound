import { useCallback, useMemo, useState } from 'react';
import { useOktaApi } from './useOktaApi';
import { redactJson } from '../../shared/utils/redact';
import { shapeOutline } from '../../shared/utils/shapeInference';
import { substitutePathHoles } from '../../shared/utils/apiPath';

export interface ApiExplorerResult {
  raw: unknown;
  redacted: unknown;
  redactedCount: number;
  shape: string;
  status?: number;
}

export interface UseApiExplorerOptions {
  targetTabId: number | null;
  oktaOrigin?: string;
}

export interface UseApiExplorerResult {
  path: string;
  setPath: (path: string) => void;
  send: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  result: ApiExplorerResult | null;
}

export function useApiExplorer({
  targetTabId,
  oktaOrigin,
}: UseApiExplorerOptions): UseApiExplorerResult {
  const [path, setPath] = useState('/api/v1/');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<{ data: unknown; status?: number } | null>(null);

  const api = useOktaApi({ targetTabId });

  const send = useCallback(() => {
    const trimmed = path.trim();
    if (!targetTabId || !trimmed) return;

    const filled = substitutePathHoles(trimmed, {});
    if (!filled.ok) {
      setResponse(null);
      setError(
        filled.error.reason === 'unfilled'
          ? `Fill in {${filled.error.token}} before sending.`
          : `The value for {${filled.error.token}} cannot be used in a path.`,
      );
      return;
    }

    setError(null);
    setIsLoading(true);
    void (async () => {
      try {
        const outcome = await api.makeApiRequest(trimmed, {
          method: 'GET',
          priority: 'interactive',
          reason: 'Manual API Explorer request',
        });
        if (outcome.success) {
          setResponse({ data: outcome.data, status: outcome.status });
        } else {
          setResponse(null);
          setError(outcome.error || 'Request failed');
        }
      } catch (err) {
        setResponse(null);
        setError(err instanceof Error ? err.message : 'Request failed');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [api, targetTabId, path]);

  const result = useMemo<ApiExplorerResult | null>(() => {
    if (!response) return null;
    const { data: redacted, redactedCount } = redactJson(response.data, oktaOrigin);
    return {
      raw: response.data,
      redacted,
      redactedCount,
      shape: shapeOutline(response.data),
      status: response.status,
    };
  }, [response, oktaOrigin]);

  const clearError = useCallback(() => setError(null), []);

  return { path, setPath, send, isLoading, error, clearError, result };
}
