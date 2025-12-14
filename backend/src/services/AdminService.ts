import { AdminRepository } from "../repositories/AdminRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

/**
 * Сервис для работы с администраторами
 */
export class AdminService {
  private adminRepo: AdminRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    this.adminRepo = new AdminRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  /**
   * Создание нового администратора
   * @param login Логин администратора
   * @param plainPassword Пароль в открытом виде
   * @param fio ФИО администратора
   * @param phone Номер телефона
   * @returns Созданный администратор
   * @throws Ошибка если администратор уже существует или роль не найдена
   */
  async createAdmin(
    login: string,
    plainPassword: string,
    fio: string,
    phone: string
  ) {
    // Проверка существования администратора
    const exists = await this.adminRepo.findByLogin(login);
    if (exists) throw new Error("Администратор уже существует");

    // Получение роли администратора
    const role = await this.roleRepo.findByRoleName("admin");
    if (!role) throw new Error("Роль администратора не найдена");

    // Хеширование пароля
    const password = await bcrypt.hash(plainPassword, 10);

    // Создание администратора
    return this.adminRepo.createAdmin(
      login,
      password,
      plainPassword,
      fio,
      phone,
      role
    );
  }

  /**
   * Обновление учетных данных администратора
   * @param adminId ID администратора
   * @param newLogin Новый логин (опционально)
   * @param newPassword Новый пароль (опционально)
   * @param newPhone Новый телефон (опционально)
   * @returns Обновленный администратор
   * @throws Ошибка если администратор не найден
   */
  async updateAdminCredentials(
    adminId: number,
    newLogin?: string,
    newPassword?: string,
    newPhone?: string
  ) {
    // Поиск администратора
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) throw new Error("Администратор не найден");

    // Установка новых значений или сохранение старых
    if (!newLogin) newLogin = admin.login_admin;
    if (!newPassword) newPassword = admin.password_plain;
    if (!newPhone) newPhone = admin.phone_number_admin;

    // Обновление полей
    admin.login_admin = newLogin;
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.password_plain = newPassword;
    admin.phone_number_admin = newPhone;

    // Сохранение изменений
    return this.adminRepo.save(admin);
  }
}
