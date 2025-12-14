import { Router, Request, Response } from "express";
import { AppealService } from "../services/AppealService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

export const appealRouter = (appealService: AppealService) => {
  const router = Router();

  // Получение новых заявок
  router.get(
    "/new",
    currentUser,
    requireAuth,
    requireRole("admin", "staff", "client"),
    async (req: Request, res: Response) => {
      try {
        if (req.currentUser!.role === "client") {
          const appeals = await appealService.getNewAppealsByClientId(
            req.currentUser!.id
          );
          res.json(appeals);
          return;
        }

        const appeals = await appealService.getNewAppeals();
        res.json(appeals);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Получение заявок в работе
  router.get(
    "/in-progress",
    currentUser,
    requireAuth,
    requireRole("admin", "staff", "client"),
    async (req: Request, res: Response) => {
      try {
        if (req.currentUser!.role === "client") {
          const appeals = await appealService.getAppealsInProgressByClientId(
            req.currentUser!.id
          );
          res.json(appeals);
          return;
        }
        const appeals = await appealService.getAppealsInProgress();
        res.json(appeals);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Получение завершенных заявок
  router.get(
    "/completed",
    currentUser,
    requireAuth,
    requireRole("admin", "staff", "client"),
    async (req: Request, res: Response) => {
      try {
        if (req.currentUser!.role === "client") {
          const appeals = await appealService.getCompletedAppealsByClientId(
            req.currentUser!.id
          );
          res.json(appeals);
          return;
        }
        const appeals = await appealService.getCompletedAppeals();
        res.json(appeals);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Создание новой заявки
  router.post(
    "/",
    currentUser,
    requireAuth,
    requireRole("client"),
    async (req: Request, res: Response) => {
      try {
        const { mechanism, problem, fioClient } = req.body;
        const appeal = await appealService.createAppeal(
          mechanism,
          problem,
          fioClient,
          req.currentUser!.id
        );
        res.status(201).json(appeal);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Взятие заявки в работу
  router.patch(
    "/:id/take",
    currentUser,
    requireAuth,
    requireRole("staff"),
    async (req: Request, res: Response) => {
      try {
        const appealId = parseInt(req.params.id);
        const appeal = await appealService.takeAppealToWork(
          appealId,
          req.currentUser!.id
        );
        res.json(appeal);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Закрытие заявки
  router.patch(
    "/:id/close",
    currentUser,
    requireAuth,
    requireRole("staff"),
    async (req: Request, res: Response) => {
      try {
        const appealId = parseInt(req.params.id);
        const { description, fio_staff } = req.body;
        const appeal = await appealService.closeAppeal(
          appealId,
          req.currentUser!.id,
          description,
          fio_staff
        );
        res.json(appeal);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.log(error);
        res.status(400).json({ error: message });
      }
    }
  );

  // Отмена заявки
  router.patch(
    "/:id/cancel",
    currentUser,
    requireAuth,
    requireRole("client"),
    async (req: Request, res: Response) => {
      try {
        const appealId = parseInt(req.params.id);
        const appeal = await appealService.cancelAppeal(
          appealId,
          req.currentUser!.id
        );
        res.json(appeal);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  return router;
};
