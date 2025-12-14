import { DataSource, Repository } from "typeorm";
import { POinfo } from "../entities/POinfo";

/**
 * Репозиторий для работы с дополнительной информацией (POinfo)
 * Предполагается, что в таблице будет только одна запись с id = 1
 */
export class POinfoRepository extends Repository<POinfo> {
  constructor(private dataSource: DataSource) {
    // Инициализация стандартного репозитория для сущности POinfo
    super(POinfo, dataSource.createEntityManager());
  }

  /**
   * Получение информации (всегда получает запись с id = 1)
   * @returns Объект с информацией или null если не найден
   */
  async getInfo(): Promise<POinfo | null> {
    return this.findOne({ where: { id: 1 } });
  }

  /**
   * Обновление или создание информации
   * @param text Текст информации для сохранения
   * @returns Обновленный или созданный объект POinfo
   */
  async updateInfo(text: string): Promise<POinfo> {
    // Пытаемся получить существующую запись
    let info = await this.getInfo();

    if (!info) {
      // Если записи нет - создаем новую
      info = this.create({
        id: 1, // Явно указываем id = 1
        TextInfo: text,
      });
    } else {
      // Если запись есть - обновляем текст
      info.TextInfo = text;
    }

    // Сохраняем изменения
    return this.save(info);
  }
}
