import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  // Новые импорты для диалогового окна
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { appealApi, AppealInProgress } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

export default function AppealsInWorkTab() {
  const [appeals, setAppeals] = useState<AppealInProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Состояния для диалога отмены
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState<number | null>(null);
  const [initiatorName, setInitiatorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Открытие диалога
  const handleOpenCancelDialog = (appealId: number) => {
    setSelectedAppealId(appealId);
    setIsDialogOpen(true);
  };

  // Закрытие диалога и сброс полей
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppealId(null);
    setInitiatorName("");
  };

  // Обработчик подтверждения отмены
  const handleConfirmCancel = async () => {
    if (!selectedAppealId) return;
    if (!initiatorName.trim()) {
      alert("Пожалуйста, введите фамилию и инициалы инициатора");
      return;
    }

    try {
      setIsSubmitting(true);
      // Предполагается, что API метод принимает ID и данные об отмене (инициатора)
      // Если ваш API принимает только ID, передайте инициатора вторым аргументом или в объекте,
      // в зависимости от реализации вашего appealApi.cancelAppeal
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
        const data = await appealApi.getAppealsInProgress();
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
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6">
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>
                  <Chip label="В работе" color="warning" />
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

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2">
                    Описание неисправности:
                  </Typography>
                  <Typography sx={{ whiteSpace: "pre-line" }}>
                    {appeal.problem}
                  </Typography>
                </Box>

                {appeal.appeal_desc && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Комментарий мастера:
                    </Typography>
                    <Typography sx={{ whiteSpace: "pre-line" }}>
                      {appeal.appeal_desc}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}
                >
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleOpenCancelDialog(appeal.id)} // Вызов диалога
                  >
                    Отменить заявку
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Диалоговое окно отмены заявки */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Инициатор отмены</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Укажите, кто со стороны заказчика инициировал отмену заявки.
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
