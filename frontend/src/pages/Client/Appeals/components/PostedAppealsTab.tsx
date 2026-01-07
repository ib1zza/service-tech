import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  // Добавленные импорты для диалога
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect, useState } from "react";
import { Appeal, appealApi } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

export default function PostedAppealsTab() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // --- Состояния для управления диалогом отмены ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState<number | null>(null);
  const [initiatorName, setInitiatorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Функция открытия диалога
  const handleOpenCancelDialog = (appealId: number) => {
    setSelectedAppealId(appealId);
    setIsDialogOpen(true);
  };

  // Функция закрытия диалога
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppealId(null);
    setInitiatorName("");
  };

  // Логика подтверждения отмены
  const handleConfirmCancel = async () => {
    if (!selectedAppealId) return;
    if (!initiatorName.trim()) {
      alert("Пожалуйста, введите фамилию и инициалы инициатора");
      return;
    }

    try {
      setIsSubmitting(true);
      // Вызов API с передачей ID и имени инициатора
      await appealApi.cancelAppeal(selectedAppealId, initiatorName);

      setAppeals(appeals.filter((appeal) => appeal.id !== selectedAppealId));
      alert("Заявка успешно отменена");
      handleCloseDialog();
    } catch (err) {
      console.error("Error canceling appeal:", err);
      alert("Не удалось отменить заявку");
    } finally {
      setIsSubmitting(false);
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
        const userAppeals = data.filter(
          (appeal) => appeal.company_name_id.company_name === user?.company_name
        );
        setAppeals(userAppeals);
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>
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

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
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

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Описание неисправности
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    {appeal.problem}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleOpenCancelDialog(appeal.id)} // Теперь открывает диалог
                    disabled={appeal.status.st !== "new"}
                  >
                    Отменить заявку
                  </Button>
                </Box>

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

      {/* --- Диалоговое окно для ввода инициатора отмены --- */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Инициатор отмены</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
            Укажите фамилию и инициалы лица со стороны заказчика, принявшего
            решение об отмене.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Фамилия И. О."
            type="text"
            fullWidth
            variant="outlined"
            value={initiatorName}
            onChange={(e) => setInitiatorName(e.target.value)}
            disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleCloseDialog}
            color="inherit"
            disabled={isSubmitting}
          >
            Назад
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            disabled={isSubmitting || !initiatorName.trim()}
          >
            {isSubmitting ? "Отмена..." : "Подтвердить отмену"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
