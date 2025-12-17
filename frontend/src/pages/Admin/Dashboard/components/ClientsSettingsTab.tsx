import { useState, useEffect } from "react"; // Импорт хуков React: useState для управления состоянием, useEffect для выполнения побочных эффектов
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment, // !!! НОВЫЙ ИМПОРТ: для добавления кнопки в поле ввода
} from "@mui/material"; // Импорт компонентов Material-UI для построения интерфейса
import AddIcon from "@mui/icons-material/Add"; // Иконка "Добавить"
import DownloadIcon from "@mui/icons-material/Download";
import ArchiveIcon from "@mui/icons-material/Archive";

import EditIcon from "@mui/icons-material/Edit"; // Иконка "Редактировать"
import DeleteIcon from "@mui/icons-material/Delete"; // Иконка "Удалить"
import Visibility from "@mui/icons-material/Visibility"; // !!! НОВЫЙ ИМПОРТ: Иконка "Показать пароль"
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // !!! НОВЫЙ ИМПОРТ: Иконка "Скрыть пароль"
import { clientApi, ClientFromServer } from "../../../../services/requests"; // Импорт API для взаимодействия с клиентами и типа данных клиента

// Компонент ClientsSettingsTab позволяет администратору управлять списком клиентов: просматривать, добавлять, редактировать и удалять.
export default function ClientsSettingsTab() {
  // Состояние для хранения списка клиентов, загруженных с сервера.
  const [clients, setClients] = useState<ClientFromServer[]>([]);
  // Состояние для данных клиента, который в данный момент редактируется.
  const [editingClient, setEditingClient] = useState<ClientFromServer | null>(
    null
  );
  console.log(editingClient);
  // Состояние для данных нового клиента, который будет добавлен.
  const [newClient, setNewClient] = useState<Omit<ClientFromServer, "id">>({
    login_client: "",
    password: "",
    phone_number_client: "",
    company_name: "",
  });
  const handleDownloadReport = (companyName: string) => {
    const filename = `${companyName}_report.xlsx`;

    // Открываем файл в новой вкладке → браузер сам скачает
    try {
      window.open(`/api/reports/${encodeURIComponent(filename)}`, "_blank");
    } catch {
      alert("Отчёт для этой компании ещё не сформирован");
    }
  };

  const handleDownloadAllReports = () => {
    window.open("/api/reports/all", "_blank");
  };

  // Состояние для управления видимостью диалогового окна добавления/редактирования.
  const [openDialog, setOpenDialog] = useState(false);
  // Флаг, указывающий, находится ли диалог в режиме редактирования (true) или добавления (false).
  const [isEditing, setIsEditing] = useState(false);
  // Флаг, указывающий на состояние загрузки данных клиентов.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения ошибок валидации полей формы.
  const [errors, setErrors] = useState({
    login: false,
    password_plain: false,
    phone: false,
    companyName: false,
  });

  // !!! НОВОЕ СОСТОЯНИЕ: для переключения видимости пароля.
  const [showPassword, setShowPassword] = useState(false);

  // Хук `useEffect` для загрузки списка клиентов при первом монтировании компонента.
  useEffect(() => {
    fetchClients();
  }, []);

  // Асинхронная функция для получения списка клиентов с сервера.
  const fetchClients = async () => {
    setLoading(true); // Устанавливаем состояние загрузки.
    try {
      const clientsData = await clientApi.getAllClients(); // Выполняем запрос к API.
      setClients(clientsData as any); // Обновляем состояние списка клиентов.
    } catch (error) {
      console.error("Ошибка при загрузке клиентов:", error);
    } finally {
      setLoading(false); // Снимаем состояние загрузки.
    }
  };

  // Функция для валидации полей формы клиента.
  const validateInputs = (data: Omit<ClientFromServer, "id">) => {
    const isPasswordEmpty =
      !data.password_plain || data.password_plain.length === 0;

    const newErrors = {
      login: data.login_client.length < 3 || data.login_client.length > 20,

      // Пароль считается ошибкой, если:
      // 1. Мы в режиме добавления И он пуст. (Обязателен при добавлении)
      // 2. Или он не пуст И его длина некорректна. (В обоих режимах)
      password:
        (!isEditing && isPasswordEmpty) || // Ошибка: При добавлении пароль обязателен и пуст
        (!isPasswordEmpty &&
          (data.password_plain.length < 6 || data.password_plain.length > 20)), // Ошибка: Пароль введен, но не соответствует длине

      phone: !/^\+?[0-9]{10,15}$/.test(data.phone_number_client), // Валидация номера телефона.
      companyName:
        data.company_name.length < 2 || data.company_name.length > 50,
    };
    setErrors(newErrors); // Обновляем состояние ошибок.
    return !Object.values(newErrors).some(Boolean); // Возвращаем `true`, если нет ошибок.
  };

  // Открывает диалог для добавления нового клиента.
  const handleAddClient = () => {
    setNewClient({
      // Сбрасываем данные нового клиента.
      login_client: "",
      password_plain: "",
      phone_number_client: "",
      company_name: "",
    });
    setIsEditing(false); // Устанавливаем режим добавления.
    setOpenDialog(true); // Открываем диалог.
    setShowPassword(false); // Скрываем пароль по умолчанию при открытии.
  };

  // Открывает диалог для редактирования существующего клиента.
  const handleEditClient = (client: ClientFromServer) => {
    setEditingClient(client); // Устанавливаем клиента для редактирования.
    setIsEditing(true); // Устанавливаем режим редактирования.
    setOpenDialog(true); // Открываем диалог.
    setShowPassword(false); // Скрываем пароль по умолчанию при открытии.
  };

  // Обработчик удаления клиента.
  const handleDeleteClient = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого клиента?")) {
      // Запрос подтверждения.
      try {
        await clientApi.deleteClient(id); // Выполняем запрос на удаление.
        fetchClients(); // Обновляем список клиентов после удаления.
      } catch (error) {
        console.error("Ошибка при удалении клиента:", error);
      }
    }
  };

  // Обработчик сохранения (добавления или обновления) клиента.
  const handleSaveClient = async () => {
    const data = isEditing ? editingClient : newClient; // Определяем, какие данные сохранять.
    if (!data || !validateInputs(data)) return; // Валидируем данные перед сохранением.

    try {
      if (isEditing && editingClient) {
        // Если режим редактирования, обновляем клиента.
        await clientApi.updateClient(editingClient.id, {
          login: editingClient.login_client,
          phone: editingClient.phone_number_client,
          companyName: editingClient.company_name,
          // Пароль обновляется только если он был изменен.
          ...(editingClient.password_plain && {
            currentPassword: clients.find((c) => c.id === editingClient.id)!
              .password_plain, // Заглушка, в реальном приложении нужно запросить текущий пароль.
            newPassword: editingClient.password_plain,
          }),
        });
      } else {
        // Если режим добавления, создаем нового клиента.
        await clientApi.createClient({
          login: newClient.login_client,
          password: newClient.password_plain!, // Пароль обязателен при создании.
          phone: newClient.phone_number_client,
          companyName: newClient.company_name,
        });
      }
      fetchClients(); // Обновляем список клиентов.
      setOpenDialog(false); // Закрываем диалог.
      setShowPassword(false); // Скрываем пароль после сохранения
    } catch (error) {
      console.error("Ошибка при сохранении клиента:", error);
    }
  };

  // Универсальный обработчик изменения полей ввода в диалоге.
  const handleInputChange = (
    field: keyof Omit<ClientFromServer, "id">,
    value: string
  ) => {
    if (isEditing && editingClient) {
      setEditingClient({ ...editingClient, [field]: value }); // Обновляем данные редактируемого клиента.
    } else {
      setNewClient({ ...newClient, [field]: value }); // Обновляем данные нового клиента.
    }
  };

  // !!! НОВЫЙ ОБРАБОТЧИК: переключение видимости пароля.
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box>
      {/* Кнопка "Добавить клиента" */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        {/* Скачать все отчёты */}
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArchiveIcon />}
          onClick={handleDownloadAllReports}
        >
          Скачать все отчёты
        </Button>

        {/* Добавить клиента */}
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClient}
        >
          Добавить клиента
        </Button>
      </Box>

      {/* Условный рендеринг: отображение индикатора загрузки или таблицы клиентов. */}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Название организации</TableCell>
                <TableCell>Логин</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Отображение списка клиентов в таблице. */}
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.company_name}</TableCell>
                  <TableCell>{client.login_client}</TableCell>
                  <TableCell>{client.phone_number_client}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClient(client)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      onClick={() => handleDeleteClient(client.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>

                    <IconButton
                      color="primary"
                      title="Скачать отчёт"
                      onClick={() => handleDownloadReport(client.company_name)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Диалоговое окно для добавления или редактирования клиента. */}
      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setShowPassword(false);
        }} // Скрываем пароль при закрытии
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Изменить данные клиента" : "Добавить клиента"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Поля ввода для данных клиента. */}
            <TextField
              fullWidth
              label="Название организации"
              value={
                isEditing
                  ? editingClient?.company_name || ""
                  : newClient.company_name
              }
              onChange={(e) =>
                handleInputChange("company_name", e.target.value)
              }
              error={errors.companyName}
              helperText={
                errors.companyName
                  ? "Название должно быть от 2 до 50 символов"
                  : ""
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Телефон"
              value={
                isEditing
                  ? editingClient?.phone_number_client || ""
                  : newClient.phone_number_client
              }
              onChange={(e) =>
                handleInputChange("phone_number_client", e.target.value)
              }
              error={errors.phone}
              helperText={
                errors.phone ? "Введите корректный номер телефона" : ""
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Логин"
              value={
                isEditing
                  ? editingClient?.login_client || ""
                  : newClient.login_client
              }
              onChange={(e) =>
                handleInputChange("login_client", e.target.value)
              }
              error={errors.login}
              helperText={
                errors.login ? "Логин должен быть от 3 до 20 символов" : ""
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label={
                isEditing
                  ? "Новый пароль (оставьте пустым, чтобы не менять)"
                  : "Пароль (6-20 символов)" // Добавлена подсказка длины
              }
              // !!! ИЗМЕНЕНИЕ: тип поля зависит от состояния showPassword
              type={showPassword ? "text" : "password"}
              value={
                isEditing
                  ? editingClient?.password_plain || ""
                  : newClient.password_plain
              }
              onChange={(e) =>
                handleInputChange("password_plain", e.target.value)
              }
              error={errors.password_plain}
              helperText={
                errors.password_plain
                  ? "Пароль должен быть от 6 до 20 символов"
                  : ""
              }
              margin="normal"
              // !!! НОВОЕ: Добавление иконки для переключения видимости
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button
            onClick={handleSaveClient}
            variant="contained"
            // Кнопка сохранения отключена, если есть ошибки валидации.
            disabled={
              errors.login ||
              errors.password || // Пароль теперь валидируется на длину/обязательность в validateInputs
              errors.phone ||
              errors.companyName
            }
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
