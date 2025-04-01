import { useEffect, useState } from "react"

export const useDebouncer = <T>(value : T,delay = 500) => {
    const [debounce, setDebounce] = useState<T>(value);
    useEffect(()=>{
        const timeout = setTimeout(()=>{
            setDebounce(value);
        },delay);

        return () => clearTimeout(timeout);
    },[value]);

    return debounce;
}