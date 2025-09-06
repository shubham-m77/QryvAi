import { useState } from "react";
import { toast } from "sonner"

export const useFetch = (cb: any) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fn = async (...args: any) => {
        try {
            const response = await cb(...args);
            setData(response);
            setError(null);
        }
        catch (err: any) {
            setError(err);
            toast.error(err.message, { style: { background: 'red' } })
        }
        finally {
            setLoading(false);
        }

    };


    return { data, error, loading, fn, setData };
}
