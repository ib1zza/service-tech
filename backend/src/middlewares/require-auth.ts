import { Request, Response, NextFunction } from "express";

// Middleware для проверки аутентификации пользователя
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Проверка наличия информации о пользователе в запросе
  if (!req.currentUser) {
    // Отправка 401 ошибки если пользователь не аутентифицирован
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  // Продолжение выполнения цепочки middleware если аутентификация успешна
  next();
};
