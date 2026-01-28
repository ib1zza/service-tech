import { useState, useEffect, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import { appealApi, AppealInProgress } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

// Веса для приоритетов (чем выше число, тем выше в списке)
const priorityWeights: Record<string, number> = {
  Критичный: 4,
  Высокий: 3,
  Средний: 2,
  Низкий: 1,
};

// Типизация для вариантов сортировки
type SortVariant = "priority" | "id_asc" | "id_desc";

export default function AppealsInWorkTab() {
  const [appeals, setAppeals] = useState<AppealInProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);

  // Состояние сортировки (по умолчанию - по приоритету)
  const [sortType, setSortType] = useState<SortVariant>("priority");

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState<number | null>(null);
  const [initiatorName, setInitiatorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Функция для определения цвета приоритета ---
  const getPriorityColor = (
    priority: string,
  ): "error" | "warning" | "info" | "success" | "default" => {
    switch (priority) {
      case "Критичный":
        return "error";
      case "Высокий":
        return "warning";
      case "Средний":
        return "info";
      case "Низкий":
        return "success";
      default:
        return "default";
    }
  };

  // --- ЛОГИКА СОРТИРОВКИ ---
  const sortedAppeals = useMemo(() => {
    const data = [...appeals];

    switch (sortType) {
      case "priority":
        return data.sort((a, b) => {
          const weightA = priorityWeights[a.priority] || 0;
          const weightB = priorityWeights[b.priority] || 0;
          // 1. Сначала по весу приоритета (критичные выше)
          if (weightB !== weightA) return weightB - weightA;
          // 2. Если приоритеты одинаковые, то по ID (ранние выше)
          return a.id - b.id;
        });
      case "id_asc":
        // По номерам (ранние выше)
        return data.sort((a, b) => a.id - b.id);
      case "id_desc":
        // По номерам (поздние выше)
        return data.sort((a, b) => b.id - a.id);
      default:
        return data;
    }
  }, [appeals, sortType]);

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortType(event.target.value as SortVariant);
  };

  const handleOpenCancelDialog = (appealId: number) => {
    setSelectedAppealId(appealId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAppealId(null);
    setInitiatorName("");
  };

  const handleConfirmCancel = async () => {
    if (!selectedAppealId) return;
    if (!initiatorName.trim()) {
      alert("Пожалуйста, введите фамилию и инициалы инициатора");
      return;
    }

    try {
      setIsSubmitting(true);
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
          (appeal) =>
            appeal.company_name_id.company_name === user?.company_name,
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6">Заявки в работе ({appeals.length})</Typography>

        {/* ПАНЕЛЬ СОРТИРОВКИ */}
        <FormControl size="small" sx={{ minWidth: 300 }}>
          <InputLabel id="sort-label">Сортировка заявок:</InputLabel>
          <Select
            labelId="sort-label"
            value={sortType}
            label="Сортировка заявок:"
            onChange={handleSortChange}
          >
            <MenuItem value="priority">По приоритету (критичные выше)</MenuItem>
            <MenuItem value="id_asc">По номерам (ранние выше)</MenuItem>
            <MenuItem value="id_desc">По номерам (поздние выше)</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {sortedAppeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет заявок в работе</Typography>
        </Paper>
      ) : (
        <Box sx={{ mt: 2 }}>
          {sortedAppeals.map((appeal) => {
            const { date, time } = formatDateTime(appeal.date_start);

            return (
              <Paper key={appeal.id} elevation={3} sx={{ p: 3, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography variant="h6">
                    Заявка №{appeal.id} - {appeal.company_name_id.company_name}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={`Приоритет: ${appeal.priority || "Средний"}`}
                      color={getPriorityColor(appeal.priority || "Средний")}
                      variant="outlined"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                    <Chip label="В работе" color="warning" size="small" />
                  </Box>
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
                    onClick={() => handleOpenCancelDialog(appeal.id)}
                  >
                    Отменить заявку
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Диалоговое окно отмены */}
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
