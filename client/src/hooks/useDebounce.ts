/**
 * Debounce hook
 * Returns a debounced version of the provided value
 */

import { useState, useEffect } from 'react';
import { UI } from '../config/constants';

export const useDebounce = <T>(value: T, delay: number = UI.DEBOUNCE_DELAY): T => {
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
};
