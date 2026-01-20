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
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useEffect, useState } from "react";
import { appealApi, AppealInProgress } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

export default function AppealsInWorkTab() {
  const [appeals, setAppeals] = useState<AppealInProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealInProgress | null>(
    null,
  );
  const [workDescription, setWorkDescription] = useState("");
  const [executors, setExecutors] = useState("");
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

  const handleOpenDialog = (appeal: AppealInProgress) => {
    setSelectedAppeal(appeal);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setWorkDescription("");
    setExecutors("");
  };

  const handleCloseAppeal = async () => {
    if (!selectedAppeal) return;

    try {
      await appealApi.closeAppeal(selectedAppeal.id, {
        description: workDescription,
        fio_staff: executors,
      });

      setAppeals(appeals.filter((appeal) => appeal.id !== selectedAppeal.id));
      alert("Заявка успешно закрыта");
      handleCloseDialog();
    } catch (err) {
      console.error("Error closing appeal:", err);
      alert("Не удалось закрыть заявку");
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
        const data = await appealApi.getAppealsInProgress();
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
        Заявки в работе ({appeals.length})
      </Typography>

      {appeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет заявок в работе</Typography>
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
                    <Chip label="В работе" color="warning" size="small" />
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
                      Описание неисправности:
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {appeal.problem}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Кто сообщил:</Typography>
                    <Typography>{appeal.fio_client}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">Принял:</Typography>
                    <Typography>
                      {appeal.fio_staff_open_id?.fio_staff || "Не назначен"}
                    </Typography>
                  </Box>
                </Box>

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
                    onClick={() => handleOpenDialog(appeal)}
                  >
                    Закрыть заявку
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Диалог закрытия (без изменений) */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Закрытие заявки №{selectedAppeal?.id}.</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <TextField
              label="Описание выполненных работ"
              multiline
              rows={4}
              fullWidth
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              helperText={`${workDescription.length}/256 символов`}
            />
            <TextField
              label="Исполнитель(и) работ"
              fullWidth
              value={executors}
              onChange={(e) => setExecutors(e.target.value)}
              helperText={`${executors.length}/56 символов`}
            />
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
            onClick={handleCloseAppeal}
            color="primary"
            variant="contained"
            disabled={!workDescription || !executors}
          >
            Ок
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
