import { useState, useCallback, useMemo } from 'react';
import type { ValidationResult } from '../../shared/utils/validation';

interface ValidationState {
  [field: string]: string | undefined;
}

interface UseValidationReturn {
  errors: ValidationState;
  validate: (field: string, result: ValidationResult) => boolean;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
  getError: (field: string) => string | undefined;
  hasError: (field: string) => boolean;
}

export function useValidation(): UseValidationReturn {
  const [errors, setErrors] = useState<ValidationState>({});

  const validate = useCallback((field: string, result: ValidationResult): boolean => {
    if (result.isValid) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return true;
    } else {
      setErrors((prev) => ({
        ...prev,
        [field]: result.error,
      }));
      return false;
    }
  }, []);

  const setError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  const getError = useCallback(
    (field: string): string | undefined => {
      return errors[field];
    },
    [errors],
  );

  const hasError = useCallback(
    (field: string): boolean => {
      return !!errors[field];
    },
    [errors],
  );

  return {
    errors,
    validate,
    setError,
    clearError,
    clearAllErrors,
    hasErrors,
    getError,
    hasError,
  };
}

export function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <span className="field-error">{error}</span>;
}
