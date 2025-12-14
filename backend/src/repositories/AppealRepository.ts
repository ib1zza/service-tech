import { DataSource, Repository } from "typeorm";
import { Appeal } from "../entities/Appeal";
import { AppealStatus } from "../entities/AppealStatus";
import { Client } from "../entities/Client";
import { Staff } from "../entities/Staff";

// Кастомный репозиторий для работы с обращениями (Appeal)
export class AppealRepository extends Repository<Appeal> {
  constructor(private dataSource: DataSource) {
    // Инициализация родительского класса Repository для сущности Appeal
    super(Appeal, dataSource.createEntityManager());
  }

  // Поиск всех новых обращений
  async findNewAppeals(): Promise<Appeal[]> {
    // Сначала находим статус "new"
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "new" },
    });
    if (!status) return []; // Если статус не найден, возвращаем пустой массив

    // Ищем все обращения с этим статусом
    return this.find({
      where: { status: { id: status.id } },
      relations: ["company_name_id", "status"], // Загружаем связанные сущности
    });
  }

  // Поиск новых обращений конкретного клиента
  async findNewAppealsByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "new" },
    });
    if (!status) return [];

    return this.find({
      where: {
        status: { id: status.id },
        company_name_id: { id: clientId }, // Фильтр по ID клиента
      },
      relations: ["company_name_id", "status"],
    });
  }

  // Поиск обращений в работе
  async findAppealsInProgress(): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "in_progress" },
    });
    if (!status) return [];

    return this.find({
      where: { status: { id: status.id } },
      relations: ["company_name_id", "fio_staff_open_id"], // Загружаем сотрудника, который открыл обращение
    });
  }

  // Поиск обращений в работе для конкретного клиента
  async getAppealsInProgressByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "in_progress" },
    });
    if (!status) return [];

    return this.find({
      where: {
        status: { id: status.id },
        company_name_id: { id: clientId },
      },
      relations: ["company_name_id", "status", "fio_staff_open_id"],
    });
  }

  // Поиск завершенных обращений
  async findCompletedAppeals(): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) return [];

    return this.find({
      where: { status: { id: status.id } },
      relations: [
        "company_name_id",
        "fio_staff_close_id", // Сотрудник, закрывший обращение
        "fio_staff_open_id", // Сотрудник, открывший обращение
      ],
    });
  }

  // Поиск завершенных обращений для конкретного клиента
  async getCompletedAppealsByClientId(clientId: number): Promise<Appeal[]> {
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) return [];

    return this.find({
      where: {
        status: { id: status.id },
        company_name_id: { id: clientId },
      },
      relations: [
        "company_name_id",
        "status",
        "fio_staff_open_id",
        "fio_staff_close_id",
      ],
    });
  }

  // Создание нового обращения
  async createAppeal(
    mechanism: string, // Тип механизма
    problem: string, // Описание проблемы
    fioClient: string, // ФИО клиента
    status: AppealStatus, // Статус обращения
    client: Client, // Клиент
    staff?: Staff // Сотрудник (необязательный)
  ): Promise<Appeal> {
    // Создаем новый экземпляр обращения
    const appeal = this.create({
      mechanism,
      problem,
      fio_client: fioClient,
      status,
      company_name_id: client, // Связь с клиентом
      fio_staff_open_id: staff, // Связь с сотрудником (если указан)
      date_start: new Date(), // Устанавливаем текущую дату
    });
    return this.save(appeal); // Сохраняем в БД
  }

  // Закрытие обращения
  async closeAppeal(
    id: number, // ID обращения
    staff: Staff, // Сотрудник, закрывающий обращение
    description: string, // Описание решения
    fio_staff: string // ФИО сотрудника
  ): Promise<Appeal> {
    // Находим обращение по ID
    const appeal = await this.findOne({
      where: { id },
      relations: ["status", "company_name_id"],
    });
    if (!appeal) throw new Error("Appeal not found");

    // Находим статус "completed"
    const status = await this.manager.findOne(AppealStatus, {
      where: { st: "completed" },
    });
    if (!status) throw new Error("Status not found");

    // Обновляем данные обращения
    appeal.status = status;
    appeal.fio_staff_close_id = staff; // Устанавливаем сотрудника, закрывшего обращение
    appeal.fio_staff = fio_staff;
    appeal.date_close = new Date(); // Устанавливаем текущую дату как дату закрытия
    appeal.appeal_desc = description; // Добавляем описание решения

    return this.save(appeal); // Сохраняем изменения
  }
}
