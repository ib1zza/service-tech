import { Router, Request, Response, NextFunction } from "express";
import { POinfoService } from "../services/POinfoService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

// Тип для тела запроса обновления информации
interface UpdateAboutInfoBody {
  text: string;
}

// Роутер для работы с информацией
export const infoRouter = (poinfoService: POinfoService) => {
  const router = Router();

  // Получение информации "О нас" (публичный доступ)
  router.get("/about", async (req: Request, res: Response) => {
    try {
      const info = await poinfoService.getAboutInfo();
      res.json(info);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ошибка получения информации";
      res.status(400).json({ error: message });
    }
  });

  // Обновление информации "О нас" (только для админов)
  router.put(
    "/about",
    // Middleware для проверки прав доступа
    (req: Request, res: Response, next: NextFunction) => {
      currentUser(req, res, (err?: any) => {
        if (err) return next(err);
        requireAuth(req, res, (err?: any) => {
          if (err) return next(err);
          requireRole("admin")(req, res, next);
        });
      });
    },
    // Обработчик обновления информации
    async (req: Request<{}, {}, UpdateAboutInfoBody>, res: Response) => {
      try {
        const { text } = req.body;
        const info = await poinfoService.updateAboutInfo(text);
        res.json(info);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Ошибка обновления информации";
        res.status(400).json({ error: message });
      }
    }
  );

  return router;
};
