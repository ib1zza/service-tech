import swaggerJsdoc from "swagger-jsdoc"; // Импортируем библиотеку для генерации спецификации Swagger/OpenAPI из JSDoc-комментариев
import { Express } from "express"; // Импортируем тип Express приложения для типизации
import { serve, setup } from "swagger-ui-express"; // Импортируем middleware для отображения Swagger UI в Express приложении

// Определяем опции для swagger-jsdoc, которые описывают основную информацию о вашем API и его структуру
const options: swaggerJsdoc.Options = {
  // Определение спецификации OpenAPI
  definition: {
    openapi: "3.0.0", // Указываем версию OpenAPI
    info: {
      title: "Service Tech API", // Название вашего API, которое будет отображаться в документации
      version: "1.0.0", // Версия вашего API
      description: "API для системы управления заявками сервисного центра", // Краткое описание API
    },
    // Компоненты, которые могут быть переиспользованы в спецификации API
    components: {
      securitySchemes: {
        // Определение схемы безопасности для авторизации (например, с помощью JWT Bearer токена)
        bearerAuth: {
          type: "http", // Тип схемы безопасности - HTTP
          scheme: "bearer", // Схема авторизации - Bearer
          bearerFormat: "JWT", // Формат Bearer токена - JWT (JSON Web Token)
        },
      },
    },
    // Глобальные настройки безопасности для всех операций API
    security: [
      {
        bearerAuth: [], // Указываем, что для доступа к API требуется Bearer токен
      },
    ],
    // Список серверов, на которых развернуто API
    servers: [
      {
        url: "http://localhost:5000/api", // URL для сервера разработки
        description: "Development server", // Описание сервера
      },
    ],
  },
  // Пути к файлам, из которых swagger-jsdoc будет извлекать JSDoc-комментарии для генерации документации
  // Здесь указано, что нужно искать комментарии в файлах .ts внутри папки src/routes/
  apis: ["./src/routes/*.ts"], // Укажите путь к вашим роутам
};

// Генерируем спецификацию Swagger/OpenAPI на основе определенных опций
const swaggerSpec = swaggerJsdoc(options);

/**
 * Функция для настройки Swagger UI в Express приложении.
 * Она подключает middleware для отображения интерактивной документации API.
 * @param app Экземпляр Express приложения.
 */
export const setupSwagger = (app: Express): void => {
  // Используем middleware swagger-ui-express для обслуживания и настройки Swagger UI
  // Документация будет доступна по пути /api-docs
  app.use("/api-docs", serve, setup(swaggerSpec));
};
