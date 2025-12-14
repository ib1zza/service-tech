import { AppealRepository } from "../repositories/AppealRepository";
import { AppealStatusRepository } from "../repositories/AppealStatusRepository";
import { ClientRepository } from "../repositories/ClientRepository";
import { StaffRepository } from "../repositories/StaffRepository";
import { DataSource } from "typeorm";
import { excelExportService } from "./excel-export.service";
import { TelegramService } from "./TelegramService";
import { AdminRepository } from "../repositories/AdminRepository";

/**
 * Сервис для работы с заявками
 */
export class AppealService {
  private appealRepo: AppealRepository;
  private statusRepo: AppealStatusRepository;
  private clientRepo: ClientRepository;
  private staffRepo: StaffRepository;
  private adminRepo: AdminRepository;

  constructor(
    dataSource: DataSource,
    private telegramService: TelegramService
  ) {
    // Инициализация репозиториев
    this.appealRepo = new AppealRepository(dataSource);
    this.statusRepo = new AppealStatusRepository(dataSource);
    this.clientRepo = new ClientRepository(dataSource);
    this.staffRepo = new StaffRepository(dataSource);
    this.adminRepo = new AdminRepository(dataSource);
    this.telegramService = telegramService;
  }

  /**
   * Создание новой заявки
   */
  async createAppeal(
    mechanism: string,
    problem: string,
    fioClient: string,
    clientId: number
  ) {
    // Проверка существования клиента
    const client = await this.clientRepo.findOne({ where: { id: clientId } });
    if (!client) throw new Error("Клиент не найден");

    // Получение статуса "Новая"
    const status = await this.statusRepo.findByStatusName("new");
    if (!status) throw new Error("Статус не найден");

    // Создание заявки
    const appeal = await this.appealRepo.createAppeal(
      mechanism,
      problem,
      fioClient,
      status,
      client
    );

    // Уведомление администратора
    const admin = await this.adminRepo.getOneAdmin();
    if (!admin) throw new Error("Администратор не найден");

    await this.telegramService.sendMessageToAdmin(
      admin.phone_number_admin,
      `Новая заявка №${appeal.id} от ${client.company_name}`
    );

    return appeal;
  }

  /**
   * Взятие заявки в работу
   */
  async takeAppealToWork(appealId: number, staffId: number) {
    // Проверка существования заявки
    const appeal = await this.appealRepo.findOne({ where: { id: appealId } });
    if (!appeal) throw new Error("Заявка не найдена");

    // Проверка существования сотрудника
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new Error("Сотрудник не найден");

    // Получение статуса "В работе"
    const status = await this.statusRepo.findByStatusName("in_progress");
    if (!status) throw new Error("Статус не найден");

    // Обновление заявки
    appeal.status = status;
    appeal.fio_staff_open_id = staff;
    appeal.fio_staff = staff.fio_staff;

    return this.appealRepo.save(appeal);
  }

  /**
   * Закрытие заявки
   */
  async closeAppeal(
    appealId: number,
    staffId: number,
    description: string,
    fio_staff: string
  ) {
    // Проверка существования сотрудника
    const staff = await this.staffRepo.findOne({ where: { id: staffId } });
    if (!staff) throw new Error("Сотрудник не найден");

    // Получение статуса "Завершено"
    const closedStatus = await this.statusRepo.findByStatusName("completed");
    if (!closedStatus) throw new Error("Статус не найден");

    // Закрытие заявки
    const appeal = await this.appealRepo.closeAppeal(
      appealId,
      staff,
      description,
      fio_staff
    );

    // Получение клиента для уведомления
    const client = await this.clientRepo.findOne({
      where: { id: appeal.company_name_id.id },
      relations: ["appeals"],
    });

    if (!client) throw new Error("Клиент не найден");

    // Уведомление клиента
    await this.telegramService.sendMessageToClient(
      client.phone_number_client,
      `Закрыта заявка №${appeal.id} от ${client.company_name}`
    );

    // Генерация отчета
    if (appeal.company_name_id) {
      const appeals = await this.appealRepo.find({
        where: {
          company_name_id: appeal.company_name_id,
          status: closedStatus,
        },
        relations: [
          "company_name_id",
          "status",
          "fio_staff_close_id",
          "fio_staff_open_id",
        ],
      });
      await excelExportService.getOrCreateReport(client, appeals);
    }

    return appeal;
  }

  /**
   * Отмена заявки
   */
  async cancelAppeal(appealId: number, userId: number) {
    // Проверка существования пользователя
    const user = await this.clientRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error("Пользователь не найден");

    // Получение статусов
    const cancelStatus = await this.statusRepo.findByStatusName("cancel");
    const completedStatus = await this.statusRepo.findByStatusName("completed");

    // Поиск исходной заявки
    const prevAppeal = await this.appealRepo.findOne({
      where: { id: appealId },
    });
    if (!prevAppeal) throw new Error("Заявка не найдена");

    // Создание заявки на отмену
    const newAppeal = await this.appealRepo.createAppeal(
      "Отмена заявки",
      "Отмена заявки от " + prevAppeal.date_start.toLocaleString("ru"),
      "Отмена заявки от " + prevAppeal.date_start.toLocaleString("ru"),
      cancelStatus!,
      user
    );

    // Обновление исходной заявки
    prevAppeal.status = completedStatus!;
    prevAppeal.date_close = new Date();
    prevAppeal.appeal_desc =
      "Заявка отменена " + new Date().toLocaleString("ru");

    await this.appealRepo.save(prevAppeal);

    return prevAppeal;
  }

  // Методы получения заявок по статусам
  async getNewAppeals() {
    return this.appealRepo.findNewAppeals();
  }

  async getNewAppealsByClientId(clientId: number) {
    return this.appealRepo.findNewAppealsByClientId(clientId);
  }

  async getAppealsInProgress() {
    return this.appealRepo.findAppealsInProgress();
  }

  async getAppealsInProgressByClientId(clientId: number) {
    return this.appealRepo.getAppealsInProgressByClientId(clientId);
  }

  async getCompletedAppeals() {
    return this.appealRepo.findCompletedAppeals();
  }

  async getCompletedAppealsByClientId(clientId: number) {
    return this.appealRepo.getCompletedAppealsByClientId(clientId);
  }
}
