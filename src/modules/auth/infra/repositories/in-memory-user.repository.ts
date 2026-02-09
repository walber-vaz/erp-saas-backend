import { Injectable } from '@nestjs/common';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  async findById(id: string): Promise<User | null> {
    return this.users.find((user) => user.id === id) || null;
  }

  async findByEmail(
    organizationId: string,
    email: string,
  ): Promise<User | null> {
    return (
      this.users.find(
        (user) =>
          user.organizationId === organizationId && user.email === email,
      ) || null
    );
  }

  async findByOrganization(
    organizationId: string,
    params?: { page?: number; limit?: number },
  ): Promise<{ data: User[]; total: number }> {
    const filteredUsers = this.users.filter(
      (user) => user.organizationId === organizationId,
    );
    const total = filteredUsers.length;

    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      const end = start + params.limit;
      const data = filteredUsers.slice(start, end);
      return { data, total };
    }

    return { data: filteredUsers, total };
  }

  async create(user: User): Promise<User> {
    this.users.push(user);
    return user;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index !== -1) {
      this.users[index] = user;
    }
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter((user) => user.id !== id);
  }

  clear(): void {
    this.users = [];
  }
}
