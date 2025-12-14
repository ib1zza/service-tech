import ExcelJS from "exceljs";
import { Appeal } from "../entities/Appeal";
import { Client } from "../entities/Client";
import { Staff } from "../entities/Staff";
import fs from "fs";
import path from "path";

/**
 * Сервис для генерации Excel-отчетов по заявкам клиентов
 */
class ExcelExportService {
  // Директория для хранения отчетов
  private readonly reportsDir = process.env.REPORTS_DIR || "./storage/reports";

  constructor() {
    // Создаем директорию для отчетов при инициализации
    this.ensureReportsDirExists();
  }

  /**
   * Проверяет существование директории для отчетов и создает при необходимости
   */
  private ensureReportsDirExists(): void {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  /**
   * Генерирует отчет по заявкам клиента
   * @param client Клиент
   * @param appeals Массив заявок клиента
   * @returns Путь к сохраненному файлу отчета
   */
  async generateClientReport(
    client: Client,
    appeals: Appeal[]
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("История заявок");

    // Настройка колонок отчета
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Дата создания", key: "date_start", width: 20 },
      { header: "Дата закрытия", key: "date_close", width: 20 },
      { header: "Оборудование", key: "mechanism", width: 25 },
      { header: "Описание проблемы", key: "problem", width: 40 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Принял заявку", key: "staff_open", width: 30 },
      { header: "Закрыл заявку", key: "staff_close", width: 30 },
      { header: "Исполнитель", key: "fio_staff", width: 30 },
      { header: "Выполненные работы", key: "description", width: 50 },
    ];

    // Добавление данных в отчет
    [...appeals]
      .sort((a, b) => b.date_start.getTime() - a.date_start.getTime()) // Сортировка по дате (новые сверху)
      .forEach((appeal) => {
        worksheet.addRow({
          id: appeal.id,
          date_start: appeal.date_start,
          date_close: appeal.date_close,
          mechanism: appeal.mechanism,
          problem: appeal.problem,
          status: appeal.status?.st,
          staff_open: appeal.fio_staff_open_id?.fio_staff,
          staff_close: appeal.fio_staff_close_id?.fio_staff,
          fio_staff: appeal.fio_staff,
          description: appeal.appeal_desc,
        });
      });

    // Формирование имени файла
    const fileName = `${client.company_name}_отчет_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);

    try {
      await workbook.xlsx.writeFile(filePath);
      return filePath;
    } catch (error: any) {
      throw new Error(`Ошибка сохранения отчета: ${error.message}`);
    }
  }

  /**
   * Получает поток для чтения файла отчета
   * @param filePath Путь к файлу отчета
   * @returns Поток для чтения файла
   */
  async getReportStream(filePath: string): Promise<fs.ReadStream> {
    return new Promise((resolve, reject) => {
      // Проверка существования файла
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          return reject(new Error(`Отчет не найден: ${filePath}`));
        }

        const stream = fs.createReadStream(filePath);
        stream.on("error", (error) => {
          reject(new Error(`Ошибка чтения отчета: ${error.message}`));
        });
        stream.on("open", () => {
          resolve(stream);
        });
      });
    });
  }

  /**
   * Получает существующий отчет или создает новый
   * @param client Клиент
   * @param appeals Массив заявок клиента
   * @returns Поток для чтения файла отчета
   */
  async getOrCreateReport(
    client: Client,
    appeals: Appeal[]
  ): Promise<fs.ReadStream> {
    try {
      // Формирование имени файла
      const fileName = `${client.company_name}_отчет.xlsx`;
      const filePath = path.join(this.reportsDir, fileName);

      try {
        // Проверка существования отчета
        await fs.promises.access(filePath);
        return this.getReportStream(filePath);
      } catch {
        // Если отчет не существует - создаем новый
        const newFilePath = await this.generateClientReport(client, appeals);
        return this.getReportStream(newFilePath);
      }
    } catch (error: any) {
      throw new Error(`Ошибка формирования отчета: ${error.message}`);
    }
  }
}

// Экспорт singleton-экземпляра сервиса
export const excelExportService = new ExcelExportService();
