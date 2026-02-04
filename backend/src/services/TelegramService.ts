import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import { DataSource, IsNull, Not } from "typeorm";
import { Client } from "../entities/Client";
import { ClientRepository } from "../repositories/ClientRepository";
import { AdminRepository } from "../repositories/AdminRepository";
import { StaffRepository } from "../repositories/StaffRepository";

dotenv.config();

export class TelegramService {
  private bot: TelegramBot;
  private clientRepo: ClientRepository;
  private adminRepo: AdminRepository;
  private staffRepo: StaffRepository;

  constructor(dataSource: DataSource) {
    // Проверяем наличие токена бота в переменных окружения
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      // Если токен не задан, выбрасываем ошибку
      throw new Error("TELEGRAM_BOT_TOKEN не задан в .env");
    }

    // Инициализируем нового Telegram-бота с токеном и включаем режим polling
    // Режим polling позволяет боту регулярно проверять наличие новых сообщений
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
      polling: true,
    });
    // Создаем экземпляры репозиториев для работы с данными клиентов и админов
    this.clientRepo = new ClientRepository(dataSource);
    this.adminRepo = new AdminRepository(dataSource);
    this.staffRepo = new StaffRepository(dataSource);
    // Вызываем метод для настройки обработчиков событий бота
    this.setupBot();
  }

  private setupBot() {
    // Обработка команды /start, которая может содержать дополнительные данные (deep linking)
    // Регулярное выражение \/start (.+) извлекает любую строку после команды /start
    this.bot.onText(/\/start (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;

      // Проверяем, что ссылка содержит дополнительный параметр (номер телефона)
      if (!match || !match[1]) {
        return this.bot.sendMessage(chatId, "❌ Некорректная ссылка");
      }
      // Извлекаем номер телефона из ссылки
      const phone = match[1]; // Например, из t.me/bot?start=79123456789

      try {
        const client = await this.clientRepo.getClientByPhone(phone);
        const admin = await this.adminRepo.getAdminByPhone(phone);
        const staff = await this.staffRepo.getStaffByPhone(phone);

        if (!client && !admin && !staff) {
          return this.bot.sendMessage(
            chatId,
            "❌ Пользователь с таким номером телефона не найден",
          );
        }

        if (client) {
          await this.clientRepo.update(client.id, {
            telegram_id: chatId.toString(),
          });

          this.bot.sendMessage(
            chatId,
            "Вас приветствует СервисБот! ✅ Telegram успешно привязан к профилю клиента.",
          );
        }

        if (admin) {
          await this.adminRepo.update(admin.id, {
            telegram_id: chatId.toString(),
          });

          this.bot.sendMessage(
            chatId,
            "Вас приветствует СервисБот! ✅ Telegram успешно привязан к профилю администратора.",
          );
        }

        if (staff) {
          await this.staffRepo.update(staff.id, {
            telegram_id: chatId.toString(),
          });

          this.bot.sendMessage(
            chatId,
            "Вас приветствует СервисБот! ✅ Telegram успешно привязан к профилю сотрудника.",
          );
        }
      } catch (error) {
        // Обработка ошибок, если что-то пошло не так
        console.error("Ошибка при обработке /start:", error);
        this.bot.sendMessage(chatId, "⚠ Произошла ошибка, попробуйте позже");
      }
    });

    // Обработчик для всех текстовых сообщений, которые не являются командами
    this.bot.on("message", (msg) => {
      if (!msg.text?.startsWith("/")) {
        // Отправляем простое эхо-сообщение для теста
        this.bot.sendMessage(msg.chat.id, `Вы написали: "${msg.text}"`);
      }
    });
  }

  /**
   * Отправляет сообщение клиенту по его номеру телефона.
   * @param phone Номер телефона клиента
   * @param message Текст сообщения
   * @returns Promise<boolean> - true, если сообщение отправлено, false в противном случае
   */
  public async sendMessageToClient(
    phone: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Ищем клиента в базе данных по номеру телефона
      const client = await this.clientRepo.getClientByPhone(phone);

      // Проверяем, существует ли клиент и привязан ли у него Telegram-аккаунт
      if (!client || !client.telegram_id) {
        console.log(`Клиент ${phone} не привязал Telegram`);
        return false;
      }

      // Отправляем сообщение клиенту, используя его telegram_id
      await this.bot.sendMessage(client.telegram_id, message);
      return true;
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      return false;
    }
  }

  public async sendMessageToStaff(
    phone: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Ищем клиента в базе данных по номеру телефона
      const client = await this.staffRepo.getStaffByPhone(phone);

      // Проверяем, существует ли клиент и привязан ли у него Telegram-аккаунт
      if (!client || !client.telegram_id) {
        console.log(`Сотрудник ${phone} не привязал Telegram`);
        return false;
      }

      // Отправляем сообщение клиенту, используя его telegram_id
      await this.bot.sendMessage(client.telegram_id, message);
      return true;
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      return false;
    }
  }

  public async sendMessageToAllStaff(message: string) {
    try {
      const allStaffsWithPhones = await this.staffRepo.find({
        where: { telegram_id: Not(IsNull()) },
      });

      for (const staff of allStaffsWithPhones) {
        this.bot.sendMessage(staff.telegram_id, message);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  }

  /**
   * Отправляет сообщение админу по его номеру телефона.
   * @param phone Номер телефона админа
   * @param message Текст сообщения
   * @returns Promise<boolean> - true, если сообщение отправлено, false в противном случае
   */
  public async sendMessageToAdmin(
    phone: string,
    message: string,
  ): Promise<boolean> {
    try {
      // Ищем админа в базе данных по номеру телефона
      const admin = await this.adminRepo.getAdminByPhone(phone);

      // Проверяем, существует ли админ и привязан ли у него Telegram-аккаунт
      if (!admin || !admin.telegram_id) {
        console.log(`Админ ${phone} не привязал Telegram`);
        return false;
      }

      // Отправляем сообщение админу, используя его telegram_id
      await this.bot.sendMessage(admin.telegram_id, message);
      return true;
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      return false;
    }
  }
}
