import { useState } from "react";
import { toast } from "sonner";

export const useFetch = <TResponse = unknown, TArgs extends unknown[] = unknown[]>(cb: (...args: TArgs) => Promise<TResponse>) => {
    const [data, setData] = useState<TResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);

    const fn = async (...args: TArgs): Promise<TResponse | undefined> => {
        setLoading(true);
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
            return response;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error("An unexpected error occurred.");
            setError(errorObj);
            toast.error(errorObj.message, { style: { background: 'red' } });
            return undefined;
        } finally {
            setLoading(false);
        }
    };

    return { data, error, loading, fn, setData };
};
