import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic data-fetching hook.
 *
 * useApi(fn)           – fetch once on mount, fn is a stable reference
 * useApi(fn, [dep])    – re-fetch whenever dep changes (fn must be wrapped
 *                        in useCallback in the caller, or be a new arrow fn
 *                        whose identity changes when deps change)
 */
export function useApi(apiFn, deps = [], initial = null) {
  const [data,    setData]    = useState(initial);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const mountedRef = useRef(true);
  const apiFnRef   = useRef(apiFn);

  // Always keep a ref to the latest apiFn so the fetch closure isn't stale
  useEffect(() => { apiFnRef.current = apiFn; });

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current)
        setError(
          err.response?.data?.error?.message ||
          err.message ||
          "Something went wrong"
        );
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch, setData };
}

/**
 * Mutation hook – for POST / PATCH / DELETE calls.
 */
export function useMutation(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const apiFnRef = useRef(apiFn);
  useEffect(() => { apiFnRef.current = apiFn; });

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      return await apiFnRef.current(...args);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.message ||
        "Something went wrong";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}
