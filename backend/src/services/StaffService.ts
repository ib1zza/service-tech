import { StaffRepository } from "../repositories/StaffRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";

/**
 * Сервис для работы с сотрудниками (Staff)
 */
export class StaffService {
  private staffRepo: StaffRepository;
  private roleRepo: RoleRepository;

  constructor(dataSource: DataSource) {
    // Инициализация репозиториев
    this.staffRepo = new StaffRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
  }

  /**
   * Создание нового сотрудника
   * @param login Логин сотрудника
   * @param plainPassword Пароль в открытом виде
   * @param fio ФИО сотрудника
   * @returns Созданный сотрудник
   * @throws Ошибка если сотрудник уже существует или роль не найдена
   */
  async createStaff(login: string, plainPassword: string, fio: string) {
    // Проверка уникальности логина
    const exists = await this.staffRepo.findByLogin(login);
    if (exists) throw new Error("Сотрудник с таким логином уже существует");

    // Получение роли "staff"
    const role = await this.roleRepo.findByRoleName("staff");
    if (!role) throw new Error("Роль сотрудника не найдена");

    // Хеширование пароля
    const password = await bcrypt.hash(plainPassword, 10);

    // Создание сотрудника
    return this.staffRepo.createStaff(
      login,
      password,
      plainPassword,
      fio,
      role
    );
  }

  /**
   * Получение заявок сотрудника
   * @param staffId ID сотрудника
   * @returns Сотрудник с связанными заявками
   */
  async getStaffAppeals(staffId: number) {
    return this.staffRepo.findOne({
      where: { id: staffId },
      relations: ["opened_appeals", "closed_appeals"], // Загружаем открытые и закрытые заявки
    });
  }

  /**
   * Удаление сотрудника
   * @param staffId ID сотрудника
   * @throws Ошибка если сотрудник не найден
   */
  async removeStaff(staffId: number) {
    return this.staffRepo.removeStaff(staffId);
  }

  /**
   * Редактирование данных сотрудника
   * @param staffId ID сотрудника
   * @param fio Новое ФИО (опционально)
   * @param login Новый логин (опционально)
   * @param password Новый пароль (опционально)
   * @returns Обновленный сотрудник
   * @throws Ошибка если сотрудник не найден
   */
  async editStaff(
    staffId: number,
    fio?: string,
    login?: string,
    password?: string
  ) {
    return this.staffRepo.editStaff(staffId, fio, login, password);
  }

  /**
   * Получение всех сотрудников
   * @returns Массив сотрудников с загруженными ролями
   */
  async getAllStaff() {
    return this.staffRepo.find({ relations: ["role"] });
  }

  /**
   * Поиск сотрудника по ID
   * @param staffId ID сотрудника
   * @returns Найденный сотрудник или null
   */
  async findById(staffId: number) {
    return this.staffRepo.findOne({
      where: { id: staffId },
      relations: ["role"],
    });
  }

  /**
   * Обновление пароля сотрудника
   * @param staffId ID сотрудника
   * @param newPassword Новый пароль
   * @throws Ошибка если сотрудник не найден
   */
  async updatePassword(staffId: number, newPassword: string) {
    const staff = await this.findById(staffId);
    if (!staff) throw new Error("Сотрудник не найден");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    return this.staffRepo.editStaff(
      staffId,
      undefined,
      undefined,
      passwordHash
    );
  }
}
