import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  TableSortLabel,
  TextField,
  InputAdornment,
  Grid, // <-- НОВЫЙ ИМПОРТ
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useState, useEffect } from "react";
import { AppealCompleted, appealApi } from "../../../../services/requests";
import { useAppSelector } from "../../../../store/hooks";

type Order = "asc" | "desc";

// --- НОВЫЙ ТИП ДЛЯ СЧЕТЧИКОВ ---
type AppealCounts = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  total: number;
};
// ------------------------------

// ... (descendingComparator, getValue, getComparator, applySortFilter, formatDate, formatDateTime - без изменений) ...

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = getValue(a, orderBy as any);
  const bValue = getValue(b, orderBy as any);
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getValue(obj: any, key: string): any {
  switch (key) {
    case "company_name_id":
      return obj.company_name_id?.company_name || "";
    case "fio_staff_close_id":
      return obj.fio_staff_close_id?.fio_staff || "";
    default:
      return obj[key];
  }
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter<T>(
  array: T[],
  comparator: (a: T, b: T) => number,
  filters: {
    number: string;
    mechanism: string;
    date: string;
    customer: string;
  }
) {
  const filtered = array.filter((item: any) => {
    const numberMatch =
      filters.number === "" || item.id.toString().includes(filters.number);
    const mechanismMatch =
      filters.mechanism === "" ||
      item.mechanism?.toLowerCase().includes(filters.mechanism.toLowerCase());
    const dateMatch =
      filters.date === "" ||
      (item.date_close && formatDate(item.date_close).includes(filters.date));
    const customerMatch =
      filters.customer === "" ||
      item.company_name_id?.company_name
        ?.toLowerCase()
        .includes(filters.customer.toLowerCase());
    return numberMatch && mechanismMatch && dateMatch && customerMatch;
  });

  return filtered.sort(comparator);
}

const formatDate = (dateString: string) => {
  if (!dateString) return "Не указана";
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU");
};

const formatDateTime = (dateString: string) => {
  if (!dateString)
    return {
      date: "Не указана",
      time: "Не указано",
    };
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("ru-RU"),
    time: date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

// --- НОВАЯ ФУНКЦИЯ ДЛЯ РАСЧЕТА СЧЕТЧИКОВ ---
const calculateAppealCounts = (appeals: AppealCompleted[]): AppealCounts => {
  const now = new Date();
  // Устанавливаем начало дня, недели (понедельник), месяца и года для сравнения
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Начало текущей недели (понедельник, 0:00:00)
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // 0=Вс -> 6, 1=Пн -> 0
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  let daily = 0;
  let weekly = 0;
  let monthly = 0;
  let yearly = 0;
  const total = appeals.length;

  for (const appeal of appeals) {
    if (!appeal.date_close) continue;
    const closeDate = new Date(appeal.date_close);

    // Проверка диапазона. Обратите внимание, что мы сравниваем дату закрытия!
    if (closeDate >= startOfDay) daily++;
    if (closeDate >= startOfWeek) weekly++;
    if (closeDate >= startOfMonth) monthly++;
    if (closeDate >= startOfYear) yearly++;
  }

  return { daily, weekly, monthly, yearly, total };
};
// ------------------------------------------

export default function HistoryAppealsTab() {
  const [appeals, setAppeals] = useState<AppealCompleted[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealCompleted | null>(
    null
  );
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof AppealCompleted>("id");
  const [filters, setFilters] = useState({
    number: "",
    mechanism: "",
    date: "",
    customer: "",
  });

  // --- НОВОЕ СОСТОЯНИЕ ДЛЯ СЧЕТЧИКОВ ---
  const [counts, setCounts] = useState<AppealCounts>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    total: 0,
  });
  // ------------------------------------

  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const fetchAppeals = async () => {
      try {
        setLoading(true);
        const data = await appealApi.getCompletedAppeals();
        setAppeals(data);

        // --- ВЫЗОВ ФУНКЦИИ РАСЧЕТА СЧЕТЧИКОВ ---
        setCounts(calculateAppealCounts(data));
        // ------------------------------------

        setError(null);
      } catch (err) {
        console.error("Error fetching history appeals:", err);
        setError("Не удалось загрузить историю заявок");
      } finally {
        setLoading(false);
      }
    };

    fetchAppeals();
  }, [user?.company_name]);

  const handleRowClick = (appeal: AppealCompleted) => {
    setSelectedAppeal(appeal);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSort = (property: keyof AppealCompleted) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredAndSortedAppeals = applySortFilter(
    appeals,
    getComparator(order, orderBy),
    filters
  );

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

  // Вспомогательный компонент для отображения карточки счетчика
  const CountCard = ({ title, count }: { title: string; count: number }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: "center", height: "100%" }}>
      <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
        {count}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" gutterBottom>
        История заявок
      </Typography>

      {/* --- БЛОК ОТОБРАЖЕНИЯ СЧЕТЧИКОВ --- */}
      <Paper elevation={1} sx={{ mb: 3, p: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
          Выполненные заявки
        </Typography>
        <Box display={"flex"} gap={2}>
          <Box flex={1}>
            <CountCard title="За сегодня" count={counts.daily} />
          </Box>
          <Box flex={1}>
            <CountCard title="За неделю" count={counts.weekly} />
          </Box>
          <Box flex={1}>
            <CountCard title="За месяц" count={counts.monthly} />
          </Box>
          <Box flex={1}>
            <CountCard title="За год" count={counts.yearly} />
          </Box>
          <Box flex={1}>
            <CountCard title="Всего" count={counts.total} />
          </Box>
        </Box>
      </Paper>
      {/* ------------------------------------ */}

      {/* Поля для фильтрации таблицы */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        {/* Поле "Заказчик" отображается только для роли "staff" */}
        {user?.role.role === "staff" && (
          <TextField
            label="Заказчик"
            size="small"
            value={filters.customer}
            onChange={(e) =>
              setFilters({ ...filters, customer: e.target.value })
            }
          />
        )}
        <TextField
          label="Номер заявки"
          size="small"
          value={filters.number}
          onChange={(e) => setFilters({ ...filters, number: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Дата закрытия"
          size="small"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        <TextField
          label="Оборудование (механизм)"
          size="small"
          value={filters.mechanism}
          onChange={(e) =>
            setFilters({ ...filters, mechanism: e.target.value })
          }
        />
      </Box>

      {/* Таблица */}
      {filteredAndSortedAppeals.length === 0 ? (
        <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body1">Нет завершенных заявок</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          {/* ... (Содержимое таблицы без изменений) ... */}
          <Table>
            <TableHead>
              <TableRow>
                {/* Заголовки столбцов с возможностью сортировки */}
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "company_name_id"}
                    direction={orderBy === "company_name_id" ? order : "asc"}
                    onClick={() => handleSort("company_name_id")}
                  >
                    Заказчик
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "id"}
                    direction={orderBy === "id" ? order : "asc"}
                    onClick={() => handleSort("id")}
                  >
                    Заявка №
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "date_close"}
                    direction={orderBy === "date_close" ? order : "asc"}
                    onClick={() => handleSort("date_close")}
                  >
                    Дата закрытия
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "mechanism"}
                    direction={orderBy === "mechanism" ? order : "asc"}
                    onClick={() => handleSort("mechanism")}
                  >
                    Оборудование (механизм)
                  </TableSortLabel>
                </TableCell>
                <TableCell>Подробности</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Отображение строк таблицы с данными заявок */}
              {filteredAndSortedAppeals.map((appeal) => {
                const { date, time } = formatDateTime(appeal.date_start); // Форматирование даты и времени начала заявки.
                const dateClose = formatDateTime(appeal.date_close!);

                return (
                  <TableRow key={appeal.id} hover>
                    <TableCell>{appeal.company_name_id.company_name}</TableCell>
                    <TableCell>
                      {appeal.id}
                      <Typography variant="body2" color="text.secondary">
                        {date} {time}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {dateClose.date} {dateClose.time}
                    </TableCell>
                    <TableCell>{appeal.mechanism}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRowClick(appeal)} // Открытие диалога с деталями заявки.
                      >
                        Показать
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалоговое окно для отображения деталей выбранной заявки (без изменений) */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Детали заявки {selectedAppeal?.id}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppeal && ( // Отображаем детали, если заявка выбрана.
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography>
                <strong>Заказчик:</strong>{" "}
                {selectedAppeal.company_name_id.company_name}
              </Typography>
              <Typography>
                <strong>Дата создания:</strong>{" "}
                {formatDateTime(selectedAppeal.date_start).date}{" "}
                {formatDateTime(selectedAppeal.date_start).time}
              </Typography>
              <Typography>
                <strong>Дата закрытия:</strong>{" "}
                {formatDateTime(selectedAppeal.date_close).date}{" "}
                {formatDateTime(selectedAppeal.date_close).time}
              </Typography>
              <Typography>
                <strong>Оборудование (механизм):</strong>{" "}
                {selectedAppeal.mechanism}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Кто сообщил:</strong> {selectedAppeal.fio_client}
              </Typography>
              <Typography>
                <strong>Кто принял:</strong>{" "}
                {selectedAppeal.fio_staff_open_id.fio_staff || "Не указан"}
              </Typography>
              <Typography>
                <strong>Кто закрыл:</strong>{" "}
                {selectedAppeal.fio_staff_close_id.fio_staff || "Не указан"}
              </Typography>
              <Typography>
                <strong>Исполнители работ:</strong>{" "}
                {selectedAppeal.fio_staff || "Не указан"}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Описание неисправности:</strong>
              </Typography>
              <Typography sx={{ pl: 2 }}>{selectedAppeal.problem}</Typography>
              <Typography>
                <strong>Описание выполненных работ:</strong>
              </Typography>
              <Typography sx={{ pl: 2 }}>
                {selectedAppeal.appeal_desc}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
