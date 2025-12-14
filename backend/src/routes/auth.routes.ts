import { Router, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { currentUser } from "../middlewares/current-user";

// Тип для тела запроса при авторизации
interface LoginRequestBody {
  login: string;
  password: string;
  roleType: "admin" | "staff" | "client";
}

// Роутер для аутентификации
export const authRouter = (authService: AuthService) => {
  const router = Router();

  // Эндпоинт для входа в систему
  router.post(
    "/login",
    [
      // Валидация входных данных
      body("login").trim().notEmpty().withMessage("Логин обязателен"),
      body("password").trim().notEmpty().withMessage("Пароль обязателен"),
      body("roleType")
        .isIn(["admin", "staff", "client"])
        .withMessage("Недопустимый тип роли"),
    ],
    validateRequest, // Middleware для проверки валидации
    async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
      try {
        const { login, password, roleType } = req.body;
        // Аутентификация через сервис
        const data = await authService.login(login, password, roleType);
        res.json(data);
      } catch (error: unknown) {
        // Обработка ошибок аутентификации
        const errorMessage =
          error instanceof Error ? error.message : "Ошибка аутентификации";
        res.status(401).json({ error: errorMessage });
      }
    }
  );

  // Эндпоинт для получения информации о текущем пользователе
  router.get("/me", (req: Request, res: Response) => {
    // Проверка аутентификации через middleware
    currentUser(req, res, async (err?: any) => {
      if (req.currentUser) {
        // Обновление токена через сервис
        const userSmallInfo = req.currentUser;
        const data = await authService.refresh(userSmallInfo);
        res.json(data);
      } else {
        res.status(401).json({ error: "Не авторизован" });
      }
    });
  });

  return router;
};
