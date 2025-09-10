// Core localStorage utilities
export class LocalStorage {
  private static prefix = 'primesay_';

  static setItem(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }

  static clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  static generateId(): string {
    return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}

// Database-like operations for localStorage
export class LocalTable<T extends { id: string; created_at?: string; updated_at?: string }> {
  constructor(private tableName: string) {}

  async insert(data: Omit<T, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<T> {
    const id = data.id || LocalStorage.generateId();
    const timestamp = new Date().toISOString();
    
    const record = {
      ...data,
      id,
      created_at: timestamp,
      updated_at: timestamp,
    } as T;

    const records = this.getAll();
    records.push(record);
    LocalStorage.setItem(this.tableName, records);
    
    return record;
  }

  async select(filters?: Partial<T>): Promise<T[]> {
    const records = this.getAll();
    
    if (!filters) return records;
    
    return records.filter(record => {
      return Object.entries(filters).every(([key, value]) => {
        return record[key as keyof T] === value;
      });
    });
  }

  async selectSingle(filters: Partial<T>): Promise<T | null> {
    const results = await this.select(filters);
    return results[0] || null;
  }

  async update(id: string, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T | null> {
    const records = this.getAll();
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    const updated = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString(),
    } as T;
    
    records[index] = updated;
    LocalStorage.setItem(this.tableName, records);
    
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const records = this.getAll();
    const filteredRecords = records.filter(r => r.id !== id);
    
    if (filteredRecords.length === records.length) return false;
    
    LocalStorage.setItem(this.tableName, filteredRecords);
    return true;
  }

  private getAll(): T[] {
    return LocalStorage.getItem<T[]>(this.tableName, []) || [];
  }

  async orderBy(field: keyof T, ascending = true): Promise<T[]> {
    const records = this.getAll();
    return records.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (ascending) {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  }
}