import { DataSource, Repository } from "typeorm";
import { AppealStatus } from "../entities/AppealStatus";

// Кастомный репозиторий для работы со статусами обращений
export class AppealStatusRepository extends Repository<AppealStatus> {
  constructor(private dataSource: DataSource) {
    // Инициализация родительского класса Repository для сущности AppealStatus
    super(AppealStatus, dataSource.createEntityManager());
  }

  /**
   * Поиск статуса обращения по названию
   * @param st Название статуса (например, 'new', 'in_progress', 'completed')
   * @returns Найденный статус или null если не найден
   */
  async findByStatusName(st: string): Promise<AppealStatus | null> {
    return this.findOne({ where: { st } });
  }

  /**
   * Получение всех статусов обращений
   * @returns Массив всех статусов
   */
  async getAllStatuses(): Promise<AppealStatus[]> {
    return this.find();
  }
}
