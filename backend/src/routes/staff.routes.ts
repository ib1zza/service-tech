import { Router, Request, Response, NextFunction } from "express";
import { StaffService } from "../services/StaffService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

// Тип для тела запроса при создании сотрудника
interface CreateStaffBody {
  login: string;
  password: string;
  fio: string;
}

// Роутер для работы с сотрудниками
export const staffRouter = (staffService: StaffService) => {
  const router = Router();

  // Применение middleware для проверки прав доступа
  router.use((req: Request, res: Response, next: NextFunction) => {
    currentUser(req, res, (err?: any) => {
      if (err) return next(err);
      requireAuth(req, res, (err?: any) => {
        if (err) return next(err);
        requireRole("admin")(req, res, next);
      });
    });
  });

  // Создание нового сотрудника
  router.post(
    "/",
    async (req: Request<{}, {}, CreateStaffBody>, res: Response) => {
      try {
        const { login, password, fio } = req.body;
        const staff = await staffService.createStaff(login, password, fio);
        res.status(201).json(staff);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Ошибка создания сотрудника";
        res.status(400).json({ error: message });
      }
    }
  );

  // Получение заявок сотрудника
  router.get(
    "/:id/appeals",
    async (req: Request<{ id: string }>, res: Response) => {
      try {
        const staffId = parseInt(req.params.id);
        if (isNaN(staffId)) {
          res.status(400).json({ error: "Некорректный ID сотрудника" });
          return;
        }

        const appeals = await staffService.getStaffAppeals(staffId);
        res.json(appeals);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Ошибка получения заявок сотрудника";
        res.status(400).json({ error: message });
      }
    }
  );

  // Обновление данных сотрудника
  router.put("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const staffId = parseInt(req.params.id);
      if (isNaN(staffId)) {
        res.status(400).json({ error: "Некорректный ID сотрудника" });
        return;
      }

      const { login, password, fio } = req.body;
      const staff = await staffService.editStaff(staffId, fio, login, password);
      res.json(staff);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка обновления данных сотрудника";
      res.status(400).json({ error: message });
    }
  });

  // Удаление сотрудника
  router.delete("/:id", async (req: Request<{ id: string }>, res: Response) => {
    try {
      const staffId = parseInt(req.params.id);
      if (isNaN(staffId)) {
        res.status(400).json({ error: "Некорректный ID сотрудника" });
        return;
      }

      await staffService.removeStaff(staffId);
      res.sendStatus(204);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ошибка удаления сотрудника";
      res.status(400).json({ error: message });
    }
  });

  // Получение списка всех сотрудников
  router.get("/all", async (req: Request, res: Response) => {
    try {
      const staff = await staffService.getAllStaff();
      res.json(staff);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ошибка получения списка сотрудников";
      res.status(400).json({ error: message });
    }
  });

  return router;
};
