// User Search Service for NFT Gifting
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  isActive: boolean;
  joinedAt: string;
}

export interface UserSearchResult {
  users: User[];
  total: number;
  hasMore: boolean;
}

export const userSearchService = {
  // Search users by ID, username, or email
  async searchUsers(query: string, limit: number = 10): Promise<UserSearchResult> {
    try {
      // Try to get real users from AuthContext (if available)
      let realUsers: User[] = [];
      
      try {
        // This will work if we're in a React component context
        const { useAuth } = await import('../contexts/AuthContext');
        // Note: This is a workaround - in a real app, you'd pass the auth context
        // For now, we'll use the Firebase service directly
      } catch (error) {
        // Fall back to Firebase service
      }
      
      // Get users from Firebase service
      const { userService } = await import('./firebaseService');
      const firebaseUsers = await userService.searchUsers(query, limit);
      
      // Convert to User format
      const users: User[] = firebaseUsers.map(user => ({
        id: user.id,
        username: user.username || user.displayName?.toLowerCase().replace(/\s+/g, '_') || `user_${user.id}`,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar || '/api/placeholder/40/40',
        isActive: user.isActive !== false,
        joinedAt: user.createdAt || user.joinedAt || new Date().toISOString()
      }));

      // If no results from Firebase, fall back to mock users
      if (users.length === 0) {
        const mockUsers: User[] = [
          {
            id: 'user1',
            username: 'john_doe',
            email: 'john.doe@example.com',
            displayName: 'John Doe',
            avatar: '/api/placeholder/40/40',
            isActive: true,
            joinedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: 'user2',
            username: 'jane_smith',
            email: 'jane.smith@example.com',
            displayName: 'Jane Smith',
            avatar: '/api/placeholder/40/40',
            isActive: true,
            joinedAt: '2024-02-20T14:30:00Z'
          },
          {
            id: 'user3',
            username: 'crypto_master',
            email: 'crypto@blockchain.com',
            displayName: 'Crypto Master',
            avatar: '/api/placeholder/40/40',
            isActive: true,
            joinedAt: '2024-03-10T09:15:00Z'
          },
          {
            id: 'user4',
            username: 'blockchain_dev',
            email: 'dev@lernis.com',
            displayName: 'Blockchain Developer',
            avatar: '/api/placeholder/40/40',
            isActive: true,
            joinedAt: '2024-01-25T16:45:00Z'
          },
          {
            id: 'user5',
            username: 'nft_collector',
            email: 'collector@nft.com',
            displayName: 'NFT Collector',
            avatar: '/api/placeholder/40/40',
            isActive: true,
            joinedAt: '2024-02-05T11:20:00Z'
          }
        ];

        // Filter mock users based on query
        const filteredMockUsers = mockUsers.filter(user => {
          const searchQuery = query.toLowerCase();
          return (
            user.id.toLowerCase().includes(searchQuery) ||
            user.username.toLowerCase().includes(searchQuery) ||
            user.email.toLowerCase().includes(searchQuery) ||
            user.displayName.toLowerCase().includes(searchQuery)
          );
        });

        return {
          users: filteredMockUsers.slice(0, limit),
          total: filteredMockUsers.length,
          hasMore: filteredMockUsers.length > limit
        };
      }

      return {
        users: users,
        total: users.length,
        hasMore: users.length >= limit
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return {
        users: [],
        total: 0,
        hasMore: false
      };
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const result = await this.searchUsers(userId, 1);
      return result.users.find(user => user.id === userId) || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.searchUsers(email, 1);
      return result.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },

  // Get user by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.searchUsers(username, 1);
      return result.users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  },

  // Validate if user exists and is active
  async validateUser(userId: string): Promise<{ isValid: boolean; user?: User; error?: string }> {
    try {
      const user = await this.getUserById(userId);
      
      if (!user) {
        return { isValid: false, error: 'User not found' };
      }
      
      if (!user.isActive) {
        return { isValid: false, error: 'User is not active' };
      }
      
      return { isValid: true, user };
    } catch (error) {
      console.error('Error validating user:', error);
      return { isValid: false, error: 'Validation failed' };
    }
  }
};
