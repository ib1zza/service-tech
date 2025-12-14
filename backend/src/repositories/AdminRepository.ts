import { DataSource, Repository } from "typeorm";
import { Admin } from "../entities/Admin";
import { Role } from "../entities/Role";

// Кастомный репозиторий для работы с администраторами
export class AdminRepository extends Repository<Admin> {
  constructor(private dataSource: DataSource) {
    // Инициализация родительского класса Repository
    super(Admin, dataSource.createEntityManager());
  }

  // Поиск администратора по логину (с загрузкой роли)
  async findByLogin(login: string): Promise<Admin | null> {
    return this.findOne({
      where: { login_admin: login },
      relations: ["role"], // Загружаем связанную сущность Role
    });
  }

  // Поиск администратора по ID (с загрузкой роли)
  async findByIdWithRole(id: number): Promise<Admin | null> {
    return this.findOne({
      where: { id },
      relations: ["role"],
    });
  }

  // Создание нового администратора
  async createAdmin(
    login: string,
    password: string,
    plainPassword: string,
    fio: string,
    phone: string,
    role: Role
  ): Promise<Admin> {
    // Создаем новый экземпляр администратора
    const admin = this.create({
      login_admin: login,
      password,
      password_plain: plainPassword,
      fio_admin: fio,
      phone_number_admin: phone,
      role, // Связь с сущностью Role
    });

    // Сохраняем в базе данных
    return this.save(admin);
  }

  // Поиск администратора по номеру телефона
  async getAdminByPhone(phone: string): Promise<Admin | null> {
    return this.findOne({
      where: { phone_number_admin: phone },
      relations: ["role"],
    });
  }

  // Получение первого администратора из базы
  async getOneAdmin(): Promise<Admin | null> {
    return this.findOne({
      where: {}, // Без условий
      relations: ["role"],
      order: { id: "ASC" }, // Сортировка по ID (первый)
    });
  }
}
