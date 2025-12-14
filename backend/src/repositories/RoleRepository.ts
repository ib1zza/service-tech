import { DataSource, Repository } from "typeorm";
import { Role } from "../entities/Role";

/**
 * Репозиторий для работы с ролями пользователей
 */
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    // Инициализация родительского класса Repository для сущности Role
    super(Role, dataSource.createEntityManager());
  }

  /**
   * Поиск роли по названию
   * @param role Название роли (например, 'admin', 'client', 'manager')
   * @returns Найденная роль или null если не существует
   */
  async findByRoleName(role: string): Promise<Role | null> {
    return this.findOne({
      where: { role },
    });
  }

  /**
   * Создание новой роли
   * @param roleName Название новой роли
   * @returns Созданная роль
   * @throws Ошибка если роль уже существует
   */
  async createRole(roleName: string): Promise<Role> {
    // Проверяем существует ли роль
    const existingRole = await this.findByRoleName(roleName);
    if (existingRole) {
      throw new Error(`Role '${roleName}' already exists`);
    }

    // Создаем и сохраняем новую роль
    const role = this.create({
      role: roleName,
    });
    return this.save(role);
  }

  /**
   * Получение всех ролей
   * @returns Массив всех ролей
   */
  async getAllRoles(): Promise<Role[]> {
    return this.find();
  }

  /**
   * Удаление роли по названию
   * @param roleName Название роли для удаления
   * @returns Количество удаленных записей
   */
  async deleteRole(roleName: string): Promise<number> {
    const result = await this.delete({ role: roleName });
    return result.affected || 0;
  }
}
