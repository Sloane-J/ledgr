import { supabase } from '../lib/supabase';

export type AuditAction = 
  | 'PRODUCT_DELETE' 
  | 'PRICE_CHANGE' 
  | 'STOCK_OVERRIDE' 
  | 'ORDER_REFUND' 
  | 'USER_LOGIN'
  | 'SETTINGS_CHANGE';

export interface AuditLog {
  id?: string;
  created_at?: string;
  user_id: string;
  action: AuditAction;
  entity_id: string; // ID of the product, order, etc.
  entity_type: string;
  old_value?: any;
  new_value?: any;
  metadata?: any;
}

export const auditService = {
  async logAction(log: Omit<AuditLog, 'user_id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('audit_logs').insert([{
        ...log,
        user_id: user.id
      }]);

      if (error) console.error('Audit Log Error:', error);
    } catch (err) {
      console.error('Failed to log audit action:', err);
    }
  },

  async getLogs(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};
