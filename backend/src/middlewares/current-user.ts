import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Расширение типов Express для добавления currentUser в Request
declare global {
  namespace Express {
    interface Request {
      currentUser?: {
        id: number;
        role: string;
      };
    }
  }
}

// Middleware для проверки и верификации JWT токена
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Извлечение токена из заголовка Authorization
  const token = req.headers.authorization?.split(" ")[1];

  // Если токена нет, пропускаем дальше
  if (!token) {
    return next();
  }

  try {
    // Верификация токена
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
    };

    // Добавление информации о пользователе в запрос
    req.currentUser = payload;
  } catch (err) {
    // Ошибка верификации игнорируется (неавторизованный доступ)
  }

  // Передача управления следующему middleware
  next();
};
