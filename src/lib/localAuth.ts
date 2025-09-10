import { LocalStorage, LocalTable } from './localStorage';

export interface LocalUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface LocalProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'legal_entity';
  legal_entity_id: string | null;
  blockchain_address?: string;
  blockchain_public_key?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalSession {
  user: LocalUser;
  access_token: string;
  expires_at: string;
}

class LocalAuthService {
  private usersTable = new LocalTable<LocalUser>('users');
  private profilesTable = new LocalTable<LocalProfile>('profiles');
  private readonly SESSION_KEY = 'current_session';

  // Initialize with default users if none exist
  async initializeDefaultUsers() {
    const existingUsers = await this.usersTable.select();
    if (existingUsers.length > 0) return;

    // Create default user
    const defaultUser = await this.usersTable.insert({
      email: 'user@example.com',
    });

    await this.profilesTable.insert({
      id: defaultUser.id,
      email: defaultUser.email,
      full_name: 'John Doe',
      role: 'user',
      legal_entity_id: null,
    });

    // Create legal entity users
    const legalEntityUsers = [
      { email: 'customs@sudan.gov', name: 'Customs Authority', entity_id: 'legal_entity_1' },
      { email: 'centralbank@sudan.gov', name: 'Central Bank', entity_id: 'legal_entity_2' },
      { email: 'ministry@sudan.gov', name: 'Ministry of Trade', entity_id: 'legal_entity_3' },
    ];

    for (const userInfo of legalEntityUsers) {
      const user = await this.usersTable.insert({
        email: userInfo.email,
      });

      await this.profilesTable.insert({
        id: user.id,
        email: user.email,
        full_name: userInfo.name,
        role: 'legal_entity',
        legal_entity_id: userInfo.entity_id,
      });
    }
  }

  async signUp(email: string, password: string, userData?: any): Promise<{ user: LocalUser; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = await this.usersTable.selectSingle({ email });
      if (existingUser) {
        return { user: existingUser, error: 'User already exists' };
      }

      // Create new user
      const user = await this.usersTable.insert({ email });

      // Create profile
      await this.profilesTable.insert({
        id: user.id,
        email: user.email,
        full_name: userData?.full_name || email,
        role: email.includes('@customs.') || email.includes('customs@') ? 'legal_entity' : 'user',
        legal_entity_id: null,
      });

      return { user };
    } catch (error) {
      return { user: {} as LocalUser, error: 'Failed to create user' };
    }
  }

  async signIn(email: string, password: string): Promise<{ session?: LocalSession; error?: string }> {
    try {
      const user = await this.usersTable.selectSingle({ email });
      if (!user) {
        return { error: 'Invalid credentials' };
      }

      const session: LocalSession = {
        user,
        access_token: 'local_token_' + Date.now(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      LocalStorage.setItem(this.SESSION_KEY, session);
      return { session };
    } catch (error) {
      return { error: 'Sign in failed' };
    }
  }

  async signOut(): Promise<void> {
    LocalStorage.removeItem(this.SESSION_KEY);
  }

  async getSession(): Promise<LocalSession | null> {
    const session = LocalStorage.getItem<LocalSession>(this.SESSION_KEY);
    
    if (!session) return null;
    
    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      LocalStorage.removeItem(this.SESSION_KEY);
      return null;
    }
    
    return session;
  }

  async getUser(): Promise<LocalUser | null> {
    const session = await this.getSession();
    return session?.user || null;
  }

  async getProfile(userId: string): Promise<LocalProfile | null> {
    return await this.profilesTable.selectSingle({ id: userId });
  }

  async updateProfile(userId: string, updates: Partial<LocalProfile>): Promise<LocalProfile | null> {
    return await this.profilesTable.update(userId, updates);
  }

  // Mock auth state change listeners
  private listeners: Array<(event: string, session: LocalSession | null) => void> = [];

  onAuthStateChange(callback: (event: string, session: LocalSession | null) => void) {
    this.listeners.push(callback);
    
    // Immediately call with current session
    this.getSession().then(session => {
      callback('INITIAL_SESSION', session);
    });

    return {
      unsubscribe: () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      }
    };
  }

  private notifyListeners(event: string, session: LocalSession | null) {
    this.listeners.forEach(listener => listener(event, session));
  }

  // Override signIn to notify listeners
  async signInWithNotification(email: string, password: string): Promise<{ session?: LocalSession; error?: string }> {
    const result = await this.signIn(email, password);
    if (result.session) {
      this.notifyListeners('SIGNED_IN', result.session);
    }
    return result;
  }

  // Override signOut to notify listeners
  async signOutWithNotification(): Promise<void> {
    await this.signOut();
    this.notifyListeners('SIGNED_OUT', null);
  }
}

export const localAuth = new LocalAuthService();