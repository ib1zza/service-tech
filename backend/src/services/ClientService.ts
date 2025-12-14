import { ClientRepository } from "../repositories/ClientRepository";
import { RoleRepository } from "../repositories/RoleRepository";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { Client } from "../entities/Client";
import { TelegramService } from "./TelegramService";

/**
 * Сервис для работы с клиентами
 */
export class ClientService {
  private clientRepo: ClientRepository;
  private roleRepo: RoleRepository;
  private telegramService: TelegramService;

  constructor(dataSource: DataSource, telegramService: TelegramService) {
    this.clientRepo = new ClientRepository(dataSource);
    this.roleRepo = new RoleRepository(dataSource);
    this.telegramService = telegramService;
  }

  /**
   * Отправка уведомления клиенту через Telegram
   */
  async sendTelegramNotification(
    phone: string,
    message: string
  ): Promise<boolean> {
    return this.telegramService.sendMessageToClient(phone, message);
  }

  /**
   * Создание нового клиента
   */
  async createClient(
    login: string,
    plainPassword: string,
    phone: string,
    companyName: string
  ): Promise<Client> {
    // Проверка уникальности логина
    const exists = await this.clientRepo.findByLogin(login);
    if (exists) throw new Error("Клиент с таким логином уже существует");

    // Получение роли клиента
    const role = await this.roleRepo.findByRoleName("client");
    if (!role) throw new Error("Роль клиента не найдена в базе данных");

    // Хеширование пароля
    const password = await bcrypt.hash(plainPassword, 10);

    // Создание клиента
    return this.clientRepo.createClient(
      login,
      password,
      plainPassword,
      phone,
      companyName,
      role
    );
  }

  /**
   * Получение клиента с его заявками
   */
  async getClientWithAppeals(clientId: number): Promise<Client | null> {
    return this.clientRepo.findByIdWithAppeals(clientId);
  }

  /**
   * Получение всех клиентов с их заявками
   */
  async getAllClients(): Promise<Client[]> {
    return this.clientRepo.getClientsWithAppeals();
  }

  /**
   * Получение клиента по ID
   */
  async getClientById(clientId: number): Promise<Client | null> {
    return this.clientRepo.findByIdWithRole(clientId);
  }

  /**
   * Получение клиента по логину
   */
  async getClientByLogin(login: string): Promise<Client | null> {
    return this.clientRepo.findByLogin(login);
  }

  /**
   * Получение клиента по телефону
   */
  async getClientByPhone(phone: string): Promise<Client | null> {
    return this.clientRepo.getClientByPhone(phone);
  }

  /**
   * Обновление данных клиента
   */
  async updateClient(
    clientId: number,
    updateData: {
      companyName?: string;
      phone?: string;
      login?: string;
      plainPassword?: string;
    }
  ): Promise<void> {
    // Проверка существования клиента
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Клиент не найден");

    const updatePayload: {
      companyName?: string;
      phone?: string;
      login?: string;
      passwordHash?: string;
      plainPassword?: string;
    } = {};

    // Обновление названия компании
    if (updateData.companyName)
      updatePayload.companyName = updateData.companyName;

    // Обновление телефона
    if (updateData.phone) updatePayload.phone = updateData.phone;

    // Обновление логина с проверкой уникальности
    if (updateData.login) {
      const loginExists = await this.clientRepo.findByLogin(updateData.login);
      if (loginExists && loginExists.id !== clientId) {
        throw new Error("Этот логин уже используется другим клиентом");
      }
      updatePayload.login = updateData.login;
    }

    // Обновление пароля
    if (updateData.plainPassword) {
      const passwordHash = await bcrypt.hash(updateData.plainPassword, 10);
      updatePayload.passwordHash = passwordHash;
      updatePayload.plainPassword = updateData.plainPassword;
    }

    // Сохранение изменений
    await this.clientRepo.editClient(clientId, updatePayload);
  }

  /**
   * Обновление пароля клиента
   */
  async updateClientPassword(
    clientId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Проверка существования клиента
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Клиент не найден");

    // Проверка текущего пароля
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      client.password_hash
    );
    if (!isPasswordValid) throw new Error("Текущий пароль неверен");

    // Хеширование нового пароля
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Обновление пароля
    await this.clientRepo.updateClientPassword(
      clientId,
      newPasswordHash,
      newPassword
    );
  }

  /**
   * Удаление клиента
   */
  async deleteClient(clientId: number): Promise<void> {
    // Проверка существования клиента
    const client = await this.clientRepo.findByIdWithRole(clientId);
    if (!client) throw new Error("Клиент не найден");

    // Удаление клиента
    await this.clientRepo.removeClient(clientId);
  }

  /**
   * Проверка учетных данных клиента
   */
  async validateClientCredentials(
    login: string,
    password: string
  ): Promise<Client | null> {
    const client = await this.clientRepo.findByLogin(login);
    if (!client) return null;

    // Проверка пароля
    const isValid = await bcrypt.compare(password, client.password_hash);
    return isValid ? client : null;
  }
}
