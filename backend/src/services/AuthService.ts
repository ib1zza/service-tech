import { DataSource } from "typeorm";
import { AdminRepository } from "../repositories/AdminRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { StaffRepository } from "../repositories/StaffRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * Сервис для аутентификации и авторизации пользователей
 */
export class AuthService {
  private adminRepo: AdminRepository;
  private clientRepo: ClientRepository;
  private staffRepo: StaffRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    // Инициализация репозиториев для работы с разными типами пользователей
    this.adminRepo = new AdminRepository(dataSource);
    this.clientRepo = new ClientRepository(dataSource);
    this.staffRepo = new StaffRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  /**
   * Обновление токена доступа
   * @param id - ID пользователя
   * @param role - Роль пользователя (admin, staff, client)
   * @returns Объект с новым токеном и данными пользователя
   */
  async refresh({ id, role }: { id: number; role: string }) {
    // Проверка существования роли
    const roleObj = await this.roleRepo.findByRoleName(role);
    if (!roleObj) throw new Error("Недопустимая роль");

    let user;
    // Получение пользователя в зависимости от роли
    switch (role) {
      case "admin":
        user = await this.adminRepo.findByIdWithRole(id);
        break;
      case "staff":
        user = await this.staffRepo.findByIdWithRole(id);
        break;
      case "client":
        user = await this.clientRepo.findByIdWithRole(id);
        break;
      default:
        throw new Error("Неизвестный тип пользователя");
    }

    // Генерация нового JWT токена
    return {
      token: jwt.sign({ id, role }, process.env.JWT_SECRET!, {
        expiresIn: "24h", // Токен действителен 24 часа
      }),
      user, // Возвращаем данные пользователя
    };
  }

  /**
   * Аутентификация пользователя
   * @param login - Логин пользователя
   * @param password - Пароль пользователя
   * @param roleType - Тип пользователя (admin, staff, client)
   * @returns Объект с токеном и данными пользователя
   */
  async login(
    login: string,
    password: string,
    roleType: "admin" | "staff" | "client"
  ) {
    let user;
    // Поиск пользователя в соответствующем репозитории
    switch (roleType) {
      case "admin":
        user = await this.adminRepo.findByLogin(login);
        break;
      case "staff":
        user = await this.staffRepo.findByLogin(login);
        break;
      case "client":
        user = await this.clientRepo.findByLogin(login);
        break;
    }

    if (!user) throw new Error("Пользователь не найден");

    // Временная проверка пароля
    if (user.password_plain !== password) throw new Error("Неверный пароль");

    // Проверка соответствия роли пользователя
    const role = await this.roleRepo.findByRoleName(roleType);
    if (!role || user.role.role !== roleType) throw new Error("Неверная роль");

    // Генерация JWT токена
    return {
      token: jwt.sign(
        { id: user.id, role: roleType }, // Полезная нагрузка токена
        process.env.JWT_SECRET!, // Секретный ключ из .env
        {
          expiresIn: "24h", // Время жизни токена
        }
      ),
      user, // Данные пользователя
    };
  }
}
