import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material"; // Импорт компонентов Material-UI для построения пользовательского интерфейса
import CheckIcon from "@mui/icons-material/Check"; // Импорт иконки "Проверить/Закрыть"
import { useEffect, useState } from "react"; // Импорт хуков React для управления состоянием и выполнения побочных эффектов
import { appealApi, AppealInProgress } from "../../../../services/requests"; // Импорт API для работы с заявками и типа данных "заявка в работе"
import { useAppSelector } from "../../../../store/hooks"; // Импорт пользовательского хука для доступа к Redux-хранилищу

// Компонент `AppealsInWorkTab` предназначен для сотрудников и отображает список заявок,
// которые находятся в работе. Сотрудник может просматривать детали заявок и закрывать их.
export default function AppealsInWorkTab() {
  // Состояние для хранения списка заявок, находящихся в работе.
  const [appeals, setAppeals] = useState<AppealInProgress[]>([]);
  // Флаг для отслеживания состояния загрузки данных.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения сообщений об ошибках, если загрузка не удалась.
  const [error, setError] = useState<string | null>(null);
  // Флаг для управления видимостью диалогового окна закрытия заявки.
  const [dialogOpen, setDialogOpen] = useState(false);
  // Состояние для хранения данных заявки, выбранной для закрытия.
  const [selectedAppeal, setSelectedAppeal] = useState<AppealInProgress | null>(
    null
  );
  // Состояние для описания выполненных работ при закрытии заявки.
  const [workDescription, setWorkDescription] = useState("");
  // Состояние для указания исполнителей работ при закрытии заявки.
  const [executors, setExecutors] = useState("");
  // Получение данных текущего пользователя (сотрудника) из Redux-хранилища.
  const { user } = useAppSelector((state) => state.auth);

  // Открывает диалоговое окно для закрытия заявки, устанавливая выбранную заявку.
  const handleOpenDialog = (appeal: AppealInProgress) => {
    setSelectedAppeal(appeal);
    setDialogOpen(true);
  };

  // Закрывает диалоговое окно и сбрасывает поля описания работ и исполнителей.
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setWorkDescription("");
    setExecutors("");
  };

  // Асинхронная функция для закрытия заявки.
  const handleCloseAppeal = async () => {
    if (!selectedAppeal) return; // Если заявка не выбрана, выходим.

    try {
      // Отправляем запрос к API для закрытия заявки, передавая описание работ и исполнителей.
      await appealApi.closeAppeal(selectedAppeal.id, {
        description: workDescription,
        fio_staff: executors,
      });

      // Обновляем список заявок в UI, удаляя закрытую заявку.
      setAppeals(appeals.filter((appeal) => appeal.id !== selectedAppeal.id));
      alert("Заявка успешно закрыта"); // Уведомление об успешном закрытии.
      handleCloseDialog(); // Закрываем диалоговое окно.
    } catch (err) {
      console.error("Error closing appeal:", err);
      alert("Не удалось закрыть заявку"); // Уведомление об ошибке.
    }
  };

  // Вспомогательная функция для форматирования даты и времени.
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("ru-RU"),
      time: date.toLocaleTimeString("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Хук `useEffect` для загрузки заявок, находящихся в работе, при монтировании компонента.
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true); // Устанавливаем состояние загрузки.
        const data = await appealApi.getAppealsInProgress(); // Получаем все заявки в работе.
        setAppeals(data); // Обновляем состояние списка заявок.
        setError(null); // Сбрасываем сообщение об ошибке.
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Не удалось загрузить заявки"); // Устанавливаем сообщение об ошибке.
      } finally {
        setLoading(false); // Снимаем состояние загрузки.
      }
    };

    fetchAppeals(); // Вызываем функцию загрузки данных.
  }, [user?.company_name]); // Зависимость от `user?.company_name` для перезагрузки данных при смене пользователя (хотя для сотрудника это может быть не так критично, как для клиента).

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
        Заявки в работе ({appeals.length})
      </Typography>

      {/* Условный рендеринг: если заявок нет, отображаем соответствующее сообщение. */}
      {appeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет заявок в работе</Typography>
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
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>
                  <Chip
                    label="В работе"
                    color="warning" // Чип для статуса "В работе"
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  {date} в {time}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Отображение деталей заявки в адаптивной сетке */}
                <Box
                  sx={{
                    display: "grid",
                    // gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, // Закомментировано, но может быть полезно для адаптивности
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
                    <Typography variant="subtitle2">
                      Описание проблемы
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {appeal.problem}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Кто сообщил</Typography>
                    <Typography>{appeal.fio_client}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Принял</Typography>
                    <Typography>
                      {appeal.fio_staff_open_id.fio_staff || "Не назначен"}
                    </Typography>
                  </Box>
                </Box>

                {/* Кнопка "Закрыть заявку" */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    mt: 3,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => handleOpenDialog(appeal)} // Открывает диалог закрытия заявки
                  >
                    Закрыть заявку
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Диалоговое окно для закрытия заявки */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Закрытие заявки №{selectedAppeal?.id}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            {/* Поле для описания выполненных работ */}
            <TextField
              label="Описание выполненных работ"
              multiline
              rows={4}
              fullWidth
              inputProps={{ maxLength: 256 }}
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              helperText={`${workDescription.length}/256 символов`}
            />

            {/* Поле для указания исполнителей работ */}
            <TextField
              label="Исполнитель(и) работ"
              fullWidth
              inputProps={{ maxLength: 56 }}
              value={executors}
              onChange={(e) => setExecutors(e.target.value)}
              helperText={`${executors.length}/56 символов`}
            />

            {/* Отображение текущей даты и времени */}
            <Typography variant="body1">
              <strong>Дата:</strong> {new Date().toLocaleDateString("ru-RU")}
            </Typography>

            <Typography variant="body1">
              <strong>Время:</strong>{" "}
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>

            {/* Отображение сотрудника, который закрывает заявку */}
            <Typography variant="body1">
              <strong>Закрыл заявку:</strong> {user?.fio_staff}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Отмена
          </Button>
          <Button
            onClick={handleCloseAppeal} // Вызывает функцию закрытия заявки
            color="primary"
            variant="contained"
            disabled={!workDescription || !executors} // Кнопка отключена, если поля не заполнены
          >
            Ок
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
