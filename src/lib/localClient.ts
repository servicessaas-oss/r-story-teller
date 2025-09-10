// Mock Supabase client using localStorage
import { localAuth, type LocalUser, type LocalSession } from './localAuth';
import { localDb, localFunctions } from './localDb';

// Mock the Supabase client structure
export const localSupabaseClient = {
  auth: {
    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      const result = await localAuth.signUp(email, password, options?.data);
      return {
        data: { user: result.user, session: null },
        error: result.error ? new Error(result.error) : null
      };
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const result = await localAuth.signInWithNotification(email, password);
      return {
        data: { user: result.session?.user || null, session: result.session || null },
        error: result.error ? new Error(result.error) : null
      };
    },

    signOut: async () => {
      await localAuth.signOutWithNotification();
      return { error: null };
    },

    getSession: async () => {
      const session = await localAuth.getSession();
      return { data: { session }, error: null };
    },

    getUser: async () => {
      const user = await localAuth.getUser();
      return { data: { user }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: LocalSession | null) => void) => {
      return localAuth.onAuthStateChange(callback);
    }
  },

  from: (tableName: string) => {
    const table = (localDb as any)[tableName];
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }

    return {
      select: (columns = '*') => ({
        eq: async (column: string, value: any) => {
          const data = await table.select({ [column]: value });
          return { data, error: null };
        },
        order: (column: string, options?: { ascending?: boolean }) => ({
          eq: async (column: string, value: any) => {
            const data = await table.select({ [column]: value });
            const sorted = data.sort((a: any, b: any) => {
              const aVal = a[column];
              const bVal = b[column];
              if (options?.ascending === false) {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
              }
              return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            });
            return { data: sorted, error: null };
          }
        }),
        single: async () => {
          const data = await table.select({});
          return { data: data[0] || null, error: data.length === 0 ? new Error('No data found') : null };
        }
      }),

      insert: (data: any) => ({
        select: () => ({
          single: async () => {
            const result = await table.insert(data);
            return { data: result, error: null };
          }
        })
      }),

      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: async () => {
              // Find the record first
              const records = await table.select({ [column]: value });
              if (records.length === 0) {
                return { data: null, error: new Error('Record not found') };
              }
              
              const result = await table.update(records[0].id, data);
              return { data: result, error: null };
            }
          })
        })
      }),

      delete: () => ({
        eq: async (column: string, value: any) => {
          const records = await table.select({ [column]: value });
          if (records.length === 0) {
            return { data: null, error: new Error('Record not found') };
          }
          
          const success = await table.delete(records[0].id);
          return { data: success ? records[0] : null, error: success ? null : new Error('Delete failed') };
        }
      })
    };
  },

  functions: {
    invoke: localFunctions.invoke
  }
};

// Export as 'supabase' for easy replacement
export const supabase = localSupabaseClient;