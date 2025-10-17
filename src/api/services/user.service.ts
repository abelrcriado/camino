// Service para lógica de negocio de User
import { BaseService } from "./base.service";
import { UserRepository } from "../repositories/user.repository";
import type { User, CreateUserDto, UpdateUserDto } from "@/shared/dto/user.dto";
import { ConflictError, DatabaseError } from "../errors/custom-errors";

export class UserService extends BaseService<User> {
  private userRepository: UserRepository;

  constructor(repository?: UserRepository) {
    const repo = repository || new UserRepository();
    super(repo);
    this.userRepository = repo;
  }

  /**
   * Crea un nuevo usuario
   */
  async createUser(data: CreateUserDto): Promise<User> {
    // Validar que el email no exista (si se proporciona)
    if (data.email) {
      const { data: existing } = await this.userRepository.findByEmail(
        data.email
      );
      if (existing) {
        throw new ConflictError("El email ya está registrado");
      }
    }

    return this.create(data);
  }

  /**
   * Actualiza un usuario
   */
  async updateUser(data: UpdateUserDto): Promise<User> {
    const { id, ...updates } = data;

    // Si se actualiza el email, validar que no exista
    if (updates.email) {
      const { data: existing } = await this.userRepository.findByEmail(
        updates.email
      );
      if (existing && existing.id !== id) {
        throw new ConflictError("El email ya está registrado");
      }
    }

    return this.update(id, updates);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.userRepository.findByEmail(email);

    if (error) {
      throw new DatabaseError(error.message, { email });
    }

    return data;
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role: string): Promise<User[]> {
    const { data, error } = await this.userRepository.findByRole(role);

    if (error) {
      throw new DatabaseError(error.message, { role });
    }

    return data || [];
  }
}
