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
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useState } from "react";
import { Appeal, appealApi } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

export default function PostedAppealsTab() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // --- Функция для определения цвета приоритета ---
  const getPriorityColor = (
    priority: string,
  ): "error" | "warning" | "info" | "success" | "default" => {
    switch (priority) {
      case "Критичный":
        return "error"; // Красный
      case "Высокий":
        return "warning"; // Оранжевый
      case "Средний":
        return "info"; // Синий
      case "Низкий":
        return "success"; // Зеленый
      default:
        return "default";
    }
  };

  const handleOpenDialog = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirm = async () => {
    if (!selectedAppeal) return;

    try {
      await appealApi.takeAppeal(selectedAppeal.id);
      setAppeals(appeals.filter((appeal) => appeal.id !== selectedAppeal.id));
      alert("Заявка успешно принята в работу");
      handleCloseDialog();
    } catch (err) {
      console.error("Error taking appeal:", err);
      alert("Не удалось принять заявку в работу");
    }
  };

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

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true);
        const data = await appealApi.getNewAppeals();
        setAppeals(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching appeals:", err);
        setError("Не удалось загрузить заявки");
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, [user?.company_name]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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

      {appeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет новых заявок</Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 2 }}>
          {appeals.map((appeal) => {
            const { date, time } = formatDateTime(appeal.date_start);

            return (
              <Paper key={appeal.id} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start", // Выравнивание по верхнему краю
                  }}
                >
                  <Typography variant="h6">
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>

                  {/* Контейнер для тегов Приоритет и Статус */}
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={`Приоритет: ${appeal.priority || "Средний"}`}
                      color={getPriorityColor(appeal.priority || "Средний")}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={
                        appeal.status.st === "new" ? "Новая" : appeal.status.st
                      }
                      color={appeal.status.st === "new" ? "primary" : "default"}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
                  {date} в {time}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2">Заказчик:</Typography>
                    <Typography>
                      {appeal.company_name_id.company_name}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">
                      Оборудование (механизм):
                    </Typography>
                    <Typography>{appeal.mechanism}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">
                      Описание проблемы:
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {appeal.problem}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Кто сообщил:</Typography>
                    <Typography>{appeal.fio_client}</Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    onClick={() => handleOpenDialog(appeal)}
                  >
                    Принять в работу
                  </Button>
                </Box>

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

      {/* Диалоговое окно подтверждения (без изменений) */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Подтверждение принятия заявки</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
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
              Кто принимает заявку: {user?.fio_staff}
            </Typography>
            <Typography variant="body1">
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
