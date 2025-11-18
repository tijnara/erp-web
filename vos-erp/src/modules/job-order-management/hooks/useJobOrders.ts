import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import type { JobOrder } from '../types';

export function useJobOrders(page = 1, limit = 50) {
    const [data, setData] = useState<JobOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        let mounted = true;
        const fetchList = async () => {
            setLoading(true);
            setError(null);
            try {
                const from = (page - 1) * limit;
                const to = from + limit - 1;
                const { data: items, error: apiError, count } = await supabase
                    .from('job_order')
                    .select(`
                        id,
                        jo_no,
                        customer_id,
                        status,
                        order_date,
                        scheduled_start,
                        site_address,
                        site_contact_name,
                        sales_order_id,
                        customer:customer_id ( customer_name )
                    `, { count: 'exact' })
                    .order('order_date', { ascending: false })
                    .range(from, to);
                if (apiError) throw apiError;
                if (mounted) {
                    const uiData = (items || []).map((item: any) => ({
                        ...item,
                        customer_name: item.customer?.customer_name
                    }));
                    setData(uiData);
                    setTotal(count || 0);
                }
            } catch (err: any) {
                if (mounted) setError(err.message || 'Failed to load job orders');
                console.error(err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchList();
        return () => {
            mounted = false;
        };
    }, [page, limit]);

    return { data, loading, error, total };
}
