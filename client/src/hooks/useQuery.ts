/**
 * Custom hooks for API queries
 * Simple data fetching hooks with loading and error states
 */

import { useState, useEffect, useCallback } from 'react';
import { getErrorMessage } from '../utils/errors';

/**
 * Generic API hook for data fetching
 */
export const useQuery = <T>(
    queryFn: () => Promise<{ data?: T }>,
    enabled: boolean = true
) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await queryFn();
            setData(response.data || null);
        } catch (err) {
            setError(getErrorMessage(err));
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [queryFn]);

    useEffect(() => {
        if (enabled) {
            refetch();
        }
    }, [enabled, refetch]);

    return { data, loading, error, refetch };
};

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export const useMutation = <TData, TVariables>(
    mutationFn: (variables: TVariables) => Promise<{ data?: TData }>
) => {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mutate = useCallback(
        async (variables: TVariables) => {
            try {
                setLoading(true);
                setError(null);
                const response = await mutationFn(variables);
                setData(response.data || null);
                return response;
            } catch (err) {
                const errorMsg = getErrorMessage(err);
                setError(errorMsg);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [mutationFn]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return { mutate, data, loading, error, reset };
};
