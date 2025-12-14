import { DataSource, Repository } from "typeorm";
import { Client } from "../entities/Client";
import { Role } from "../entities/Role";

// Кастомный репозиторий для работы с клиентами
export class ClientRepository extends Repository<Client> {
  constructor(private dataSource: DataSource) {
    // Инициализация родительского класса Repository для сущности Client
    super(Client, dataSource.createEntityManager());
  }

  /**
   * Поиск клиента по логину
   * @param login Логин клиента
   * @returns Клиент с загруженной ролью или null если не найден
   */
  async findByLogin(login: string): Promise<Client | null> {
    return this.findOne({
      where: { login_client: login },
      relations: ["role"], // Загружаем связанную сущность Role
    });
  }

  /**
   * Поиск клиента по ID с загрузкой роли
   * @param id ID клиента
   * @returns Клиент с ролью или null
   */
  async findByIdWithRole(id: number): Promise<Client | null> {
    return this.findOne({
      where: { id },
      relations: ["role"],
    });
  }

  /**
   * Создание нового клиента
   * @param login Логин
   * @param passwordHash Хэш пароля
   * @param plainPassword Пароль в открытом виде (не рекомендуется)
   * @param phone Номер телефона
   * @param companyName Название компании
   * @param role Роль клиента
   * @returns Созданный клиент
   */
  async createClient(
    login: string,
    passwordHash: string,
    plainPassword: string,
    phone: string,
    companyName: string,
    role: Role
  ): Promise<Client> {
    const client = this.create({
      login_client: login,
      password_hash: passwordHash,
      password_plain: plainPassword,
      phone_number_client: phone,
      company_name: companyName,
      role, // Связь с сущностью Role
    });
    return this.save(client);
  }

  /**
   * Получение всех клиентов с их обращениями
   * @returns Массив клиентов с загруженными обращениями и ролями
   */
  async getClientsWithAppeals(): Promise<Client[]> {
    return this.find({
      relations: ["appeals", "role"], // Загружаем обращения и роль
      order: { company_name: "ASC" }, // Сортировка по названию компании
    });
  }

  /**
   * Удаление клиента
   * @param clientId ID клиента для удаления
   */
  async removeClient(clientId: number): Promise<void> {
    await this.delete(clientId);
  }

  /**
   * Редактирование данных клиента
   * @param clientId ID клиента
   * @param data Объект с изменяемыми полями
   */
  async editClient(
    clientId: number,
    data: {
      companyName?: string;
      login?: string;
      passwordHash?: string;
      plainPassword?: string;
      phone?: string;
    }
  ): Promise<void> {
    const updatedData: Record<string, string> = {};

    // Формируем объект для обновления только переданных полей
    if (data.companyName) updatedData["company_name"] = data.companyName;
    if (data.login) updatedData["login_client"] = data.login;
    if (data.passwordHash) updatedData["password_hash"] = data.passwordHash;
    if (data.plainPassword) updatedData["password_plain"] = data.plainPassword;
    if (data.phone) updatedData["phone_number_client"] = data.phone;

    await this.update(clientId, updatedData);
  }

  /**
   * Поиск клиента по ID с загрузкой обращений
   * @param clientId ID клиента
   * @returns Клиент с обращениями и ролью или null
   */
  async findByIdWithAppeals(clientId: number): Promise<Client | null> {
    return this.findOne({
      where: { id: clientId },
      relations: ["appeals", "role"],
    });
  }

  /**
   * Поиск клиента по номеру телефона
   * @param phone Номер телефона
   * @returns Найденный клиент или null
   */
  async getClientByPhone(phone: string): Promise<Client | null> {
    return this.findOne({
      where: { phone_number_client: phone },
    });
  }

  /**
   * Обновление пароля клиента
   * @param clientId ID клиента
   * @param newPasswordHash Новый хэш пароля
   * @param newPlainPassword Новый пароль в открытом виде
   */
  async updateClientPassword(
    clientId: number,
    newPasswordHash: string,
    newPlainPassword: string
  ): Promise<void> {
    await this.update(clientId, {
      password_hash: newPasswordHash,
      password_plain: newPlainPassword,
    });
  }
}
