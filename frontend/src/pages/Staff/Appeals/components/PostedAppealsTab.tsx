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
  DialogContentText,
} from "@mui/material"; // Импорт основных компонентов Material-UI для построения пользовательского интерфейса
import CheckIcon from "@mui/icons-material/Check"; // Импорт иконки "Проверить/Принять"
import { useEffect, useState } from "react"; // Импорт хуков React для управления состоянием и выполнения побочных эффектов
import { Appeal, appealApi } from "../../../../services/requests"; // Импорт API для работы с заявками и типа данных для заявок
import { useAppSelector } from "../../../../store/hooks"; // Импорт пользовательского хука для доступа к Redux-хранилищу

// Компонент `PostedAppealsTab` предназначен для сотрудников и отображает список **новых** заявок,
// которые еще не приняты в работу. Сотрудник может просматривать детали заявок и принимать их в работу.
export default function PostedAppealsTab() {
  // Состояние для хранения списка новых заявок.
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  // Флаг для отслеживания состояния загрузки данных.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения сообщений об ошибках, если загрузка не удалась.
  const [error, setError] = useState<string | null>(null);
  // Флаг для управления видимостью диалогового окна подтверждения принятия заявки.
  const [dialogOpen, setDialogOpen] = useState(false);
  // Состояние для хранения данных заявки, выбранной для подтверждения.
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  // Получение данных текущего пользователя (сотрудника) из Redux-хранилища.
  const { user } = useAppSelector((state) => state.auth);

  // Открывает диалоговое окно подтверждения, устанавливая выбранную заявку.
  const handleOpenDialog = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setDialogOpen(true);
  };

  // Закрывает диалоговое окно.
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Асинхронная функция для принятия заявки в работу.
  const handleConfirm = async () => {
    if (!selectedAppeal) return; // Если заявка не выбрана, выходим.

    try {
      // Отправляем запрос к API для принятия заявки в работу.
      await appealApi.takeAppeal(selectedAppeal.id);

      // Обновляем список заявок в UI: удаляем принятую заявку.
      setAppeals(appeals.filter((appeal) => appeal.id !== selectedAppeal.id));

      alert("Заявка успешно принята в работу"); // Уведомление об успешном принятии.
      handleCloseDialog(); // Закрываем диалоговое окно.
    } catch (err) {
      console.error("Error taking appeal:", err);
      alert("Не удалось принять заявку в работу"); // Уведомление об ошибке.
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

  // Хук `useEffect` для загрузки новых заявок при монтировании компонента.
  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true); // Установка состояния загрузки.
        const data = await appealApi.getNewAppeals(); // Получение всех новых заявок с сервера.
        setAppeals(data); // Обновление состояния списка заявок.
        setError(null); // Сброс сообщений об ошибках.
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Не удалось загрузить заявки"); // Установка сообщения об ошибке.
      } finally {
        setLoading(false); // Снятие состояния загрузки.
      }
    };

    fetchAppeals(); // Вызов функции загрузки данных.
  }, [user?.company_name]); // Зависимость от `user?.company_name` для перезагрузки данных при смене пользователя (хотя для новых заявок это может быть не так критично).

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
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* дефис между id и заказчиком */}
                    <Typography variant="h6">
                      Заявка №{appeal.id} -{" "}
                      {appeal.company_name_id.company_name}
                    </Typography>
                  </Box>
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
                  {/* Закомментированное поле статуса, так как чип уже отображает статус */}
                  {/*<Box>*/}
                  {/* <Typography variant="subtitle2">Статус</Typography>*/}
                  {/* <Typography>*/}
                  {/* {appeal.status.st === 'new' ? 'Ожидает принятия' : 'В работе'}*/}
                  {/* </Typography>*/}
                  {/*</Box>*/}
                </Box>

                {/* Кнопка "Принять в работу" */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 3,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => handleOpenDialog(appeal)} // Открывает диалог подтверждения принятия заявки
                  >
                    Принять в работу
                  </Button>
                </Box>

                {/* Сообщение, если заявка уже не новая (и кнопка "Принять в работу" будет неактивна) */}
                {appeal.status.st !== "new" && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1, textAlign: "right" }}
                  >
                    Заявка уже в работе
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Диалоговое окно подтверждения принятия заявки */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение принятия заявки</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Typography variant="body1" gutterBottom>
              Заявка №{selectedAppeal?.id} от{" "}
              {selectedAppeal && formatDateTime(selectedAppeal.date_start).date}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Заказчик: {selectedAppeal?.company_name_id.company_name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Оборудование (механизм): {selectedAppeal?.mechanism}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" gutterBottom>
              Кто принял заявку: {user?.fio_staff}
            </Typography>
            <Typography variant="body1" gutterBottom>
              Дата: {new Date().toLocaleDateString("ru-RU")}{" "}
              {new Date().toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="error">
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
