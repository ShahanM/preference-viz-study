import { useState, useEffect } from 'react';

/**
 * Hook to fetch and resolve condition mapping from a JSON config.
 *
 * @param externalCode The external short code provided by the participant/study.
 * @returns The resolved internal short code (key for conditionMap).
 */
export const useConditionMapping = (externalCode?: string) => {
    const [mappedCondition, setMappedCondition] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMapping = async () => {
            // Reset loading state when fetching starts
            if (isMounted) setIsLoading(true);

            try {
                console.log('Fetching condition mapping...');
                // Use BASE_URL to construct correct path (handles non-root deployments)
                const baseUrl = import.meta.env.BASE_URL.endsWith('/')
                    ? import.meta.env.BASE_URL
                    : `${import.meta.env.BASE_URL}/`;
                const response = await fetch(`${baseUrl}condition_mapping.json`);

                if (!response.ok) {
                    throw new Error(`Mapping file not found: ${response.statusText}`);
                }
                const mapping = await response.json();
                console.log('Condition mapping loaded:', mapping);

                if (isMounted) {
                    if (externalCode && mapping && mapping[externalCode]) {
                        console.log(`Mapped '${externalCode}' to '${mapping[externalCode]}'`);
                        setMappedCondition(mapping[externalCode]);
                    } else {
                        console.warn(`Code '${externalCode}' not found in mapping. Using fallback.`);
                        // Value not found in mapping, use default
                        setMappedCondition('BASE_TOPN');
                    }
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to load condition mapping:', err);
                if (isMounted) {
                    // Fallback to default behavior if fetch fails
                    setMappedCondition('BASE_TOPN');
                    setIsLoading(false);
                    setError(err instanceof Error ? err : new Error('Unknown error'));
                }
            }
        };

        if (externalCode) {
            fetchMapping();
        } else {
            // No external code provided, can't resolve anything useful implies default
            setMappedCondition('BASE_TOPN');
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [externalCode]);

    return { mappedCondition, isLoading, error };
};
