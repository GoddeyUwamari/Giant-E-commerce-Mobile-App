import { useState, useEffect, useRef, useCallback } from 'react';

// Basic debounced value hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// Debounced callback hook
export function useDebouncedCallback<TArgs extends any[]>(
    callback: (...args: TArgs) => void,
    delay: number,
    deps?: React.DependencyList
): {
    debouncedCallback: (...args: TArgs) => void;
    cancel: () => void;
    flush: () => void;
    isPending: () => boolean;
} {
    const callbackRef = useRef(callback);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const argsRef = useRef<TArgs | null>(null);

    // Update callback ref when dependencies change
    useEffect(() => {
        callbackRef.current = callback;
    }, deps ? [callback, ...deps] : [callback]);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            argsRef.current = null;
        }
    }, []);

    const flush = useCallback(() => {
        if (timeoutRef.current && argsRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            const args = argsRef.current;
            argsRef.current = null;
            callbackRef.current(...args);
        }
    }, []);

    const isPending = useCallback(() => {
        return timeoutRef.current !== null;
    }, []);

    const debouncedCallback = useCallback(
        (...args: TArgs) => {
            cancel();
            argsRef.current = args;

            timeoutRef.current = setTimeout(() => {
                timeoutRef.current = null;
                const currentArgs = argsRef.current;
                argsRef.current = null;
                if (currentArgs) {
                    callbackRef.current(...currentArgs);
                }
            }, delay);
        },
        [delay, cancel]
    );

    // Cleanup on unmount
    useEffect(() => {
        return cancel;
    }, [cancel]);

    return {
        debouncedCallback,
        cancel,
        flush,
        isPending,
    };
}

// Advanced debounced state hook with additional features
export function useDebouncedState<T>(
    initialValue: T,
    delay: number,
    options?: {
        leading?: boolean;
        trailing?: boolean;
        maxWait?: number;
    }
): {
    value: T;
    debouncedValue: T;
    setValue: (value: T | ((prev: T) => T)) => void;
    cancel: () => void;
    flush: () => void;
    isPending: () => boolean;
} {
    const { leading = false, trailing = true, maxWait } = options || {};

    const [value, setValue] = useState<T>(initialValue);
    const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxWaitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastCallTimeRef = useRef<number>(0);
    const lastInvokeTimeRef = useRef<number>(0);

    const cancel = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (maxWaitTimeoutRef.current) {
            clearTimeout(maxWaitTimeoutRef.current);
            maxWaitTimeoutRef.current = null;
        }
    }, []);

    const flush = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
            setDebouncedValue(value);
        }
        if (maxWaitTimeoutRef.current) {
            clearTimeout(maxWaitTimeoutRef.current);
            maxWaitTimeoutRef.current = null;
        }
        lastInvokeTimeRef.current = Date.now();
    }, [value]);

    const isPending = useCallback(() => {
        return timeoutRef.current !== null;
    }, []);

    const invokeFunc = useCallback(() => {
        cancel();
        setDebouncedValue(value);
        lastInvokeTimeRef.current = Date.now();
    }, [value, cancel]);

    const shouldInvoke = useCallback((time: number) => {
        const timeSinceLastCall = time - lastCallTimeRef.current;
        const timeSinceLastInvoke = time - lastInvokeTimeRef.current;

        return (
            lastCallTimeRef.current === 0 ||
            timeSinceLastCall >= delay ||
            timeSinceLastCall < 0 ||
            (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
        );
    }, [delay, maxWait]);

    const leadingEdge = useCallback((time: number) => {
        lastInvokeTimeRef.current = time;
        timeoutRef.current = setTimeout(timerExpired, delay);
        return leading ? invokeFunc() : setDebouncedValue(value);
    }, [delay, leading, invokeFunc, value]);

    const remainingWait = useCallback((time: number) => {
        const timeSinceLastCall = time - lastCallTimeRef.current;
        const timeSinceLastInvoke = time - lastInvokeTimeRef.current;
        const timeWaiting = delay - timeSinceLastCall;

        return maxWait !== undefined
            ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
            : timeWaiting;
    }, [delay, maxWait]);

    const timerExpired = useCallback(() => {
        const time = Date.now();
        if (shouldInvoke(time)) {
            return trailingEdge(time);
        }
        timeoutRef.current = setTimeout(timerExpired, remainingWait(time));
    }, [shouldInvoke, remainingWait]);

    const trailingEdge = useCallback((time: number) => {
        timeoutRef.current = null;

        if (trailing && lastCallTimeRef.current !== 0) {
            return invokeFunc();
        }
        lastCallTimeRef.current = 0;
        return setDebouncedValue(value);
    }, [trailing, invokeFunc, value]);

    const debounced = useCallback((newValue: T | ((prev: T) => T)) => {
        const time = Date.now();
        const isInvoking = shouldInvoke(time);

        lastCallTimeRef.current = time;

        // Update the actual value immediately
        setValue(newValue);

        if (isInvoking) {
            if (timeoutRef.current === null) {
                return leadingEdge(time);
            }
            if (maxWait !== undefined) {
                timeoutRef.current = setTimeout(timerExpired, delay);
                maxWaitTimeoutRef.current = setTimeout(invokeFunc, maxWait);
                return leading ? invokeFunc() : setDebouncedValue(value);
            }
        }

        if (timeoutRef.current === null) {
            timeoutRef.current = setTimeout(timerExpired, delay);
        }
    }, [
        shouldInvoke,
        leadingEdge,
        timerExpired,
        invokeFunc,
        delay,
        maxWait,
        leading,
        value,
    ]);

    // Update debounced value when value changes
    useEffect(() => {
        debounced(value);
    }, [value]);

    // Cleanup on unmount
    useEffect(() => {
        return cancel;
    }, [cancel]);

    return {
        value,
        debouncedValue,
        setValue,
        cancel,
        flush,
        isPending,
    };
}

// Debounced search hook specifically for search functionality
export function useDebouncedSearch(
    initialQuery: string = '',
    delay: number = 300,
    options?: {
        minLength?: number;
        maxLength?: number;
        trimWhitespace?: boolean;
    }
): {
    query: string;
    debouncedQuery: string;
    setQuery: (query: string) => void;
    clearQuery: () => void;
    isSearching: boolean;
    isValidQuery: boolean;
} {
    const { minLength = 1, maxLength = 200, trimWhitespace = true } = options || {};

    const [query, setQueryState] = useState<string>(initialQuery);
    const debouncedQuery = useDebounce(query, delay);

    const setQuery = useCallback((newQuery: string) => {
        const processedQuery = trimWhitespace ? newQuery.trim() : newQuery;

        // Enforce max length
        if (processedQuery.length > maxLength) {
            setQueryState(processedQuery.slice(0, maxLength));
        } else {
            setQueryState(processedQuery);
        }
    }, [maxLength, trimWhitespace]);

    const clearQuery = useCallback(() => {
        setQueryState('');
    }, []);

    const isSearching = query !== debouncedQuery;
    const isValidQuery = debouncedQuery.length >= minLength && debouncedQuery.length <= maxLength;

    return {
        query,
        debouncedQuery,
        setQuery,
        clearQuery,
        isSearching,
        isValidQuery,
    };
}

// Debounced API call hook
export function useDebouncedApi<TData, TParams extends any[]>(
    apiFunction: (...params: TParams) => Promise<TData>,
    delay: number = 500,
    deps?: React.DependencyList
): {
    data: TData | null;
    loading: boolean;
    error: Error | null;
    call: (...params: TParams) => void;
    cancel: () => void;
    retry: () => void;
} {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [lastParams, setLastParams] = useState<TParams | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const executeApi = useCallback(async (...params: TParams) => {
        try {
            // Cancel previous request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            // Create new abort controller
            abortControllerRef.current = new AbortController();

            setLoading(true);
            setError(null);
            setLastParams(params);

            const result = await apiFunction(...params);

            // Only update state if request wasn't aborted
            if (!abortControllerRef.current.signal.aborted) {
                setData(result);
                setLoading(false);
            }
        } catch (err) {
            // Only update state if request wasn't aborted
            if (!abortControllerRef.current?.signal.aborted) {
                setError(err instanceof Error ? err : new Error('Unknown error'));
                setLoading(false);
            }
        }
    }, deps ? [apiFunction, ...deps] : [apiFunction]);

    const { debouncedCallback: debouncedCall, cancel } = useDebouncedCallback(
        executeApi,
        delay,
        [executeApi]
    );

    const retry = useCallback(() => {
        if (lastParams) {
            debouncedCall(...lastParams);
        }
    }, [lastParams, debouncedCall]);

    const cancelAll = useCallback(() => {
        cancel();
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setLoading(false);
    }, [cancel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        data,
        loading,
        error,
        call: debouncedCall,
        cancel: cancelAll,
        retry,
    };
}

// Debounced form validation hook
export function useDebouncedValidation<T>(
    value: T,
    validator: (value: T) => string | null,
    delay: number = 300
): {
    isValidating: boolean;
    error: string | null;
    isValid: boolean;
} {
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const debouncedValue = useDebounce(value, delay);

    useEffect(() => {
        setIsValidating(true);
    }, [value]);

    useEffect(() => {
        const validationError = validator(debouncedValue);
        setError(validationError);
        setIsValidating(false);
    }, [debouncedValue, validator]);

    return {
        isValidating,
        error,
        isValid: error === null && !isValidating,
    };
}

// Export default useDebounce for backward compatibility
export default useDebounce;