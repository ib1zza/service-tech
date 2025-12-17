import { useState, useEffect } from "react"; // Импорт хуков React для управления состоянием и выполнения побочных эффектов
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
import { appealApi, AppealInProgress } from "../../../../services/requests"; // Импорт API для работы с заявками и типа данных "заявка в работе"
import { useAppSelector } from "../../../../store/hooks"; // Импорт пользовательского хука для доступа к Redux-хранилищу

// Компонент `AppealsInWorkTab` отображает список заявок, находящихся в работе у текущего клиента,
// и предоставляет функционал для их отмены.
export default function AppealsInWorkTab() {
  // Состояние для хранения списка заявок в работе.
  const [appeals, setAppeals] = useState<AppealInProgress[]>([]);
  // Состояние для отслеживания статуса загрузки данных.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения сообщений об ошибках.
  const [error, setError] = useState<string | null>(null);
  // Получение данных текущего пользователя из Redux-хранилища.
  const { user } = useAppSelector((state) => state.auth);

  // Обработчик отмены заявки.
  const handleCancelAppeal = async (appealId: number) => {
    // Запрос подтверждения у пользователя перед отменой.
    if (!window.confirm("Вы уверены, что хотите отменить эту заявку?")) {
      return;
    }
    try {
      await appealApi.cancelAppeal(appealId); // Выполнение запроса к API для отмены заявки.
      // Обновление списка заявок в UI: удаление отмененной заявки.
      setAppeals(appeals.filter((appeal) => appeal.id !== appealId));
      alert("Заявка успешно отменена"); // Уведомление пользователя об успехе.
    } catch (err) {
      console.error("Error canceling appeal:", err);
      alert("Не удалось отменить заявку"); // Уведомление пользователя об ошибке.
    }
  };

  // Вспомогательная функция для форматирования даты и времени.
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

  // Хук `useEffect` для загрузки заявок при монтировании компонента или изменении данных пользователя.
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true); // Установка состояния загрузки.
        const data = await appealApi.getAppealsInProgress(); // Получение всех заявок в работе.
        // Фильтрация заявок: отображаются только те, которые относятся к текущей компании пользователя.
        const userAppeals = data.filter(
          (appeal) => appeal.company_name_id.company_name === user?.company_name
        );
        setAppeals(userAppeals); // Обновление состояния заявок.
        setError(null); // Сброс ошибок.
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Не удалось загрузить заявки"); // Установка сообщения об ошибке.
      } finally {
        setLoading(false); // Снятие состояния загрузки.
      }
    };

    fetchAppeals(); // Вызов функции загрузки.
  }, [user?.company_name]); // Зависимость от `user?.company_name` для перезагрузки при изменении пользователя.

  // Условный рендеринг: отображение индикатора загрузки.
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Условный рендеринг: отображение сообщения об ошибке.
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
        Заявки в работе ({appeals.length})
      </Typography>

      {/* Условный рендеринг: если заявок нет, отображаем соответствующее сообщение. */}
      {appeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет заявок в работе</Typography>
        </Paper>
      ) : (
        // Если заявки есть, отображаем их список.
        <Box sx={{ mt: 2 }}>
          {appeals.map((appeal) => {
            const { date, time } = formatDateTime(appeal.date_start); // Форматирование даты и времени начала заявки.

            return (
              <Paper key={appeal.id} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  {/* дефис между id и заказчиком */}
                  <Typography variant="h6">
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>
                  <Chip label="В работе" color="warning" />
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  {date} в {time}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Отображение деталей заявки в сетке */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, // Адаптивная сетка
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
                    <Typography variant="subtitle2">Принял мастер</Typography>
                    <Typography>
                      {appeal.fio_staff_open_id.fio_staff || "Не назначен"}
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

                {/* Комментарий мастера (если есть) */}
                {appeal.appeal_desc && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Комментарий мастера
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {appeal.appeal_desc}
                    </Typography>
                  </Box>
                )}

                {/* Кнопка "Отменить заявку" */}
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleCancelAppeal(appeal.id)}
                  >
                    Отменить заявку
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
