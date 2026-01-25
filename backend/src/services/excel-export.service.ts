import ExcelJS from "exceljs";
import { Appeal } from "../entities/Appeal";
import { Client } from "../entities/Client";
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
    appeals: Appeal[],
  ): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("История заявок");

    // 1. Настройка колонок (убрали фиксированную ширину для description, так как будем считать её ниже)
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Дата создания", key: "date_start", width: 30 },
      { header: "Дата закрытия", key: "date_close", width: 30 },
      { header: "Приоритет", key: "priority", width: 15 },
      { header: "Кто сообщил", key: "client", width: 30 },
      { header: "Оборудование", key: "mechanism", width: 25 },
      { header: "Описание неисправности", key: "problem", width: 40 },
      { header: "Статус", key: "status", width: 15 },
      { header: "Принял заявку", key: "staff_open", width: 30 },
      { header: "Закрыл заявку", key: "staff_close", width: 30 },
      { header: "Исполнитель", key: "fio_staff", width: 30 },
      { header: "Выполненные работы", key: "description", width: 20 }, // Базовая ширина
    ];

    // Стилизация заголовков (Делаем жирным первую строку)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };

    worksheet.columns.forEach((column) => {
      column.alignment = { horizontal: "left", vertical: "middle" };
    });

    // Функция форматирования даты (без изменений)
    function parseAndFormatDate(str: string) {
      const startIndex = str.indexOf("[");
      const endIndex = str.indexOf("]");
      if (startIndex === -1 || endIndex === -1) return str;

      const dateStr = str.substring(startIndex + 1, endIndex);
      const date = new Date(dateStr);
      const formatter = new Intl.DateTimeFormat("ru-RU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Moscow",
      });

      const formattedDate = formatter.format(date);
      const before = str.substring(0, startIndex);
      const after = str.substring(endIndex + 1);
      return before + formattedDate + " (Мск)" + after;
    }

    // Добавление данных
    [...appeals]
      .sort((a, b) => b.date_start.getTime() - a.date_start.getTime())
      .forEach((appeal) => {
        worksheet.addRow({
          id: appeal.id,
          date_start:
            appeal.date_start.toLocaleString("ru-RU", {
              timeZone: "Europe/Moscow",
            }) + " (Мск)",
          date_close: appeal.date_close
            ? appeal.date_close.toLocaleString("ru-RU", {
                timeZone: "Europe/Moscow",
              }) + " (Мск)"
            : "-",
          mechanism: appeal.mechanism,
          problem: appeal.problem,
          status: appeal.status?.st,
          staff_open: appeal.fio_staff_open_id?.fio_staff,
          staff_close: appeal.fio_staff_close_id?.fio_staff,
          fio_staff: appeal.fio_staff,
          description: parseAndFormatDate(appeal.appeal_desc),
          client: appeal.fio_client,
          priority: appeal.priority,
        });
      });

    // 2. АВТОПОДБОР ШИРИНЫ для колонки L (description)
    let maxDescriptionLength = 0;
    const descriptionColumn = worksheet.getColumn("description");

    descriptionColumn.eachCell({ includeEmpty: true }, (cell) => {
      const columnValue = cell.value ? cell.value.toString() : "";
      if (columnValue.length > maxDescriptionLength) {
        maxDescriptionLength = columnValue.length;
      }
    });

    // Устанавливаем ширину: количество символов + небольшой запас (2-5 единиц)
    // Ограничим максимальную ширину (например, 100), чтобы Excel не стал бесконечным, если текст очень длинный
    descriptionColumn.width =
      maxDescriptionLength > 100 ? 100 : maxDescriptionLength + 5;

    // Формирование имени файла
    const fileName = `${client.company_name}_report.xlsx`;
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
    appeals: Appeal[],
  ): Promise<fs.ReadStream> {
    try {
      // Логируем процесс (теперь это всегда создание/обновление)
      console.log(
        `Generating/Updating report for client: ${client.company_name}`,
      );

      // Просто вызываем генерацию.
      // Если generateClientReport внутри использует fs.writeFile или подобные методы,
      // файл будет перезаписан автоматически.
      const filePath = await this.generateClientReport(client, appeals);

      // Возвращаем стрим уже обновленного файла
      return this.getReportStream(filePath);
    } catch (error: any) {
      throw new Error(`Ошибка формирования отчета: ${error.message}`);
    }
  }
}

// Экспорт singleton-экземпляра сервиса
export const excelExportService = new ExcelExportService();
