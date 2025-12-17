import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material"; // Импорт компонентов Material-UI для построения пользовательского интерфейса
import CancelIcon from "@mui/icons-material/Cancel"; // Импорт иконки "Отмена"
import { useEffect, useState } from "react"; // Импорт хуков React для управления состоянием и выполнения побочных эффектов
import { Appeal, appealApi } from "../../../../services/requests"; // Импорт API для работы с заявками и типа данных для заявок
import { useAppSelector } from "../../../../store/hooks"; // Импорт пользовательского хука для доступа к Redux-хранилищу

// Компонент `PostedAppealsTab` отображает список **новых (размещенных)** заявок текущего клиента
// и позволяет отменить заявки, если они еще не приняты в работу.
export default function PostedAppealsTab() {
  // Состояние для хранения списка размещенных заявок.
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  // Состояние для отслеживания статуса загрузки данных.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения сообщений об ошибках, если загрузка не удалась.
  const [error, setError] = useState<string | null>(null);
  // Получение данных текущего пользователя из Redux-хранилища для фильтрации заявок по компании.
  const { user } = useAppSelector((state) => state.auth);

  // Асинхронная функция для отмены заявки.
  const handleCancelAppeal = async (appealId: number) => {
    // Запрашиваем подтверждение у пользователя перед отменой.
    if (!window.confirm("Вы уверены, что хотите отменить эту заявку?")) {
      return;
    }
    try {
      await appealApi.cancelAppeal(appealId); // Отправляем запрос на отмену заявки через API.
      // Обновляем UI, удаляя отмененную заявку из списка.
      setAppeals(appeals.filter((appeal) => appeal.id !== appealId));
      alert("Заявка успешно отменена"); // Уведомление об успешной отмене.
    } catch (err) {
      console.error("Error canceling appeal:", err);
      alert("Не удалось отменить заявку"); // Уведомление об ошибке.
    }
  };

  // Вспомогательная функция для форматирования даты и времени в удобный для отображения формат.
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru-RU"), // Форматирование даты
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }), // Форматирование времени
    };
  };

  // Хук `useEffect` для загрузки размещенных заявок при монтировании компонента
  // или при изменении названия компании текущего пользователя.
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true); // Устанавливаем состояние загрузки.
        const data = await appealApi.getNewAppeals(); // Получаем все новые заявки.
        // Фильтруем заявки, чтобы отобразить только те, что относятся к текущей компании пользователя.
        const userAppeals = data.filter(
          (appeal) => appeal.company_name_id.company_name === user?.company_name
        );
        setAppeals(userAppeals); // Обновляем состояние списка заявок.
        setError(null); // Сбрасываем сообщение об ошибке.
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Не удалось загрузить заявки"); // Устанавливаем сообщение об ошибке.
      } finally {
        setLoading(false); // Снимаем состояние загрузки.
      }
    };

    fetchAppeals(); // Вызываем функцию загрузки данных.
  }, [user?.company_name]); // Зависимость от `user?.company_name` для перезагрузки данных при смене пользователя.

  // Условный рендеринг: отображение индикатора загрузки, пока данные загружаются.
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Условный рендеринг: отображение сообщения об ошибке, если загрузка не удалась.
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        Размещенные заявки ({appeals.length})
      </Typography>

      {/* Условный рендеринг: если заявок нет, отображаем соответствующее сообщение. */}
      {appeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет новых заявок</Typography>
        </Paper>
      ) : (
        // Если заявки есть, отображаем их в виде списка карточек.
        <Box sx={{ mt: 2 }}>
          {appeals.map((appeal) => {
            const { date, time } = formatDateTime(appeal.date_start); // Форматируем дату и время начала заявки.

            return (
              <Paper key={appeal.id} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6">
                    {" "}
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>
                  {/* Отображение статуса заявки в виде "чипа" */}
                  <Chip
                    label={
                      appeal.status.st === "new" ? "Новая" : appeal.status.st
                    }
                    color={appeal.status.st === "new" ? "primary" : "default"}
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  {date} в {time}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Отображение основных деталей заявки в адаптивной сетке */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2">Заказчик</Typography>
                    <Typography>
                      {appeal.company_name_id.company_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">
                      Оборудование (механизм)
                    </Typography>
                    <Typography>{appeal.mechanism}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Кто сообщил</Typography>
                    <Typography>{appeal.fio_client}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Статус</Typography>
                    <Typography>
                      {appeal.status.st === "new"
                        ? "Ожидает принятия"
                        : "В работе"}
                    </Typography>
                  </Box>
                </Box>

                {/* Описание проблемы */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">Описание проблемы</Typography>
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    {appeal.problem}
                  </Typography>
                </Box>

                {/* Кнопка "Отменить заявку" */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleCancelAppeal(appeal.id)}
                    disabled={appeal.status.st !== "new"} // Кнопка активна только для новых заявок
                  >
                    Отменить заявку
                  </Button>
                </Box>

                {/* Сообщение, если заявка уже не новая и не может быть отменена */}
                {appeal.status.st !== "new" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "right" }}
                  >
                    Заявка уже в работе, отмена невозможна
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
