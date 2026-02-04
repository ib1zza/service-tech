import { Router, Request, Response, NextFunction } from "express";
import { AdminService } from "../services/AdminService";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { requireRole } from "../middlewares/require-role";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";

export const adminRouter = (adminService: AdminService) => {
  const router = Router();

  // ✅ ПУБЛИЧНЫЙ РОУТ (без авторизации)
  router.get(
    "/email",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const adminEmail = await adminService.getAdminEmail();
        res.json({ email: adminEmail });
      } catch (error: unknown) {
        next(error);
      }
    },
  );

  // 🔒 ВСЁ НИЖЕ — ТОЛЬКО ДЛЯ ADMIN
  router.use((req: Request, res: Response, next: NextFunction) => {
    currentUser(req, res, (err?: any) => {
      if (err) return next(err);
      requireAuth(req, res, (err?: any) => {
        if (err) return next(err);
        requireRole("admin")(req, res, next);
      });
    });
  });

  // Создание нового администратора
  router.post(
    "/",
    [
      body("login").trim().isLength({ min: 2, max: 10 }),
      body("password").trim().isLength({ min: 2, max: 10 }),
      body("fio").trim().notEmpty(),
      body("phone").trim().isMobilePhone("any"),
    ],
    (req: Request, res: Response, next: NextFunction) => {
      validateRequest(req, res, async () => {
        try {
          const { login, password, fio, phone } = req.body;
          const admin = await adminService.createAdmin(
            login,
            password,
            fio,
            phone,
          );
          res.status(201).json(admin);
        } catch (error) {
          next(error);
        }
      });
    },
  );

  // Обновление учетных данных администратора
  router.put(
    "/credentials",
    [
      body("newLogin").trim().isLength({ min: 2, max: 10 }).optional(),
      body("newPassword").trim().isLength({ min: 2, max: 10 }).optional(),
      body("newPhone").trim().isLength({ min: 9, max: 13 }).optional(),
      body("newEmail").isEmail().optional(),
    ],
    (req: Request, res: Response, next: NextFunction) => {
      validateRequest(req, res, async () => {
        try {
          const { newLogin, newPassword, newPhone, newEmail } = req.body;
          const admin = await adminService.updateAdminCredentials(
            req.currentUser!.id,
            newLogin,
            newPassword,
            newPhone,
            newEmail,
          );
          res.json(admin);
        } catch (error) {
          next(error);
        }
      });
    },
  );

  return router;
};
