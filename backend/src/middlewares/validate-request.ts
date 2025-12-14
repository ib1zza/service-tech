import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

/**
 * Middleware для валидации входящих запросов
 * Проверяет результаты валидации и возвращает ошибки, если они есть
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Получаем результаты валидации из запроса
  const errors = validationResult(req);

  // Если есть ошибки валидации
  if (!errors.isEmpty()) {
    // Возвращаем статус 400 с массивом ошибок
    res.status(400).json({
      errors: errors.array(), // Преобразуем ошибки в массив
    });
    return;
  }

  // Если ошибок нет, передаем управление следующему обработчику
  next();
};
