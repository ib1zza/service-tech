import { Request, Response, NextFunction } from "express";

// Фабрика middleware для проверки ролей пользователя
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Проверка наличия пользователя и соответствия роли
    if (!req.currentUser || !roles.includes(req.currentUser.role)) {
      // Отправка 403 ошибки если доступ запрещен
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    // Продолжение выполнения если проверка пройдена
    next();
  };
};
