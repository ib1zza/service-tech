import { Router, Request, Response, NextFunction } from "express";
import { ClientService } from "../services/ClientService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";

// Типы для тел запросов
interface CreateClientBody {
  login: string;
  password: string;
  phone: string;
  companyName: string;
}

interface UpdateClientBody {
  login?: string;
  phone?: string;
  companyName?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Роутер для работы с клиентами
export const clientRouter = (clientService: ClientService) => {
  const router = Router();

  // Применение middleware для проверки аутентификации
  router.use((req: Request, res: Response, next: NextFunction) => {
    currentUser(req, res, (err?: any) => {
      if (err) return next(err);
      requireAuth(req, res, next);
    });
  });

  // Создание клиента (только админы)
  router.post(
    "/",
    requireRole("admin"),
    async (req: Request, res: Response) => {
      try {
        const { login, password, phone, companyName } =
          req.body as CreateClientBody;
        const client = await clientService.createClient(
          login,
          password,
          phone,
          companyName
        );
        res.status(201).json(client);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  // Получение всех клиентов (только админы)
  router.get(
    "/",
    requireRole("admin"),
    async (_req: Request, res: Response) => {
      try {
        const clients = await clientService.getAllClients();
        res.json(clients);
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(500).json({ error: message });
      }
    }
  );

  // Получение клиента по ID
  router.get(
    "/:id",
    requireRole("admin", "client"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId =
          req.params.id === "me"
            ? req.currentUser!.id
            : parseInt(req.params.id);

        // Проверка прав доступа
        if (
          req.currentUser!.role === "client" &&
          clientId !== req.currentUser!.id
        ) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        const client = await clientService.getClientById(clientId);
        if (!client) {
          res.status(404).json({ error: "Client not found" });
          return;
        }
        res.json(client);
      } catch (error) {
        next(error);
      }
    }
  );

  // Получение заявок клиента
  router.get(
    "/:id/appeals",
    requireRole("admin", "client"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId =
          req.params.id === "me"
            ? req.currentUser!.id
            : parseInt(req.params.id);

        // Проверка прав доступа
        if (
          req.currentUser!.role === "client" &&
          clientId !== req.currentUser!.id
        ) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        const client = await clientService.getClientWithAppeals(clientId);
        res.json(client?.appeals || []);
      } catch (error) {
        next(error);
      }
    }
  );

  // Обновление данных клиента
  router.put(
    "/:id",
    requireRole("admin", "client"),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId =
          req.params.id === "me"
            ? req.currentUser!.id
            : parseInt(req.params.id);

        // Проверка прав доступа
        if (
          req.currentUser!.role === "client" &&
          clientId !== req.currentUser!.id
        ) {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        const { login, phone, companyName, currentPassword, newPassword } =
          req.body as UpdateClientBody;

        // Обновление данных
        if (login || phone || companyName) {
          await clientService.updateClient(clientId, {
            login,
            phone,
            companyName,
          });
        }

        // Обновление пароля
        if (currentPassword && newPassword) {
          await clientService.updateClientPassword(
            clientId,
            currentPassword,
            newPassword
          );
        }

        const updatedClient = await clientService.getClientById(clientId);
        res.json(updatedClient);
      } catch (error) {
        next(error);
      }
    }
  );

  // Удаление клиента (только админы)
  router.delete(
    "/:id",
    requireRole("admin"),
    async (req: Request, res: Response) => {
      try {
        const clientId = parseInt(req.params.id);
        await clientService.deleteClient(clientId);
        res.status(204).send();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        res.status(400).json({ error: message });
      }
    }
  );

  return router;
};
