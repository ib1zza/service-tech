import { POinfoRepository } from "../repositories/POinfoRepository";
import { DataSource } from "typeorm";

/**
 * Сервис для работы с дополнительной информацией (POinfo)
 * Предоставляет методы для получения и обновления информации
 */
export class POinfoService {
  private poInfoRepo: POinfoRepository;

  constructor(dataSource: DataSource) {
    // Инициализация репозитория для работы с POinfo
    this.poInfoRepo = new POinfoRepository(dataSource);
  }

  /**
   * Получение информации "О нас"
   * @returns Объект с информацией или null если не найдено
   */
  async getAboutInfo() {
    return this.poInfoRepo.getInfo();
  }

  /**
   * Обновление информации "О нас"
   * @param text Новый текст информации
   * @returns Обновленный объект с информацией
   * @throws Ошибка если не удалось обновить информацию
   */
  async updateAboutInfo(text: string) {
    // Валидация длины текста
    if (text.length > 255) {
      throw new Error("Текст информации не должен превышать 255 символов");
    }

    return this.poInfoRepo.updateInfo(text);
  }
}
