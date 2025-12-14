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
} from "@mui/material"; // Импорт компонентов Material-UI для построения интерфейса
import AddIcon from "@mui/icons-material/Add"; // Иконка "Добавить"
import EditIcon from "@mui/icons-material/Edit"; // Иконка "Редактировать"
import DeleteIcon from "@mui/icons-material/Delete"; // Иконка "Удалить"
import { clientApi, ClientFromServer } from "../../../../services/requests"; // Импорт API для взаимодействия с клиентами и типа данных клиента

// Компонент ClientsSettingsTab позволяет администратору управлять списком клиентов: просматривать, добавлять, редактировать и удалять.
export default function ClientsSettingsTab() {
  // Состояние для хранения списка клиентов, загруженных с сервера.
  const [clients, setClients] = useState<ClientFromServer[]>([]);
  // Состояние для данных клиента, который в данный момент редактируется.
  const [editingClient, setEditingClient] = useState<ClientFromServer | null>(
    null
  );
  // Состояние для данных нового клиента, который будет добавлен.
  const [newClient, setNewClient] = useState<Omit<ClientFromServer, "id">>({
    login_client: "",
    password: "",
    phone_number_client: "",
    company_name: "",
  });
  // Состояние для управления видимостью диалогового окна добавления/редактирования.
  const [openDialog, setOpenDialog] = useState(false);
  // Флаг, указывающий, находится ли диалог в режиме редактирования (true) или добавления (false).
  const [isEditing, setIsEditing] = useState(false);
  // Флаг, указывающий на состояние загрузки данных клиентов.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения ошибок валидации полей формы.
  const [errors, setErrors] = useState({
    login: false,
    password: false,
    phone: false,
    companyName: false,
  });

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
    const newErrors = {
      login: data.login_client.length < 3 || data.login_client.length > 20,
      // Пароль валидируется только при создании или если он изменен в режиме редактирования.
      password:
        !isEditing &&
        !!data.password &&
        (data.password.length < 6 || data.password.length > 20),
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
      password: "",
      phone_number_client: "",
      company_name: "",
    });
    setIsEditing(false); // Устанавливаем режим добавления.
    setOpenDialog(true); // Открываем диалог.
  };

  // Открывает диалог для редактирования существующего клиента.
  const handleEditClient = (client: ClientFromServer) => {
    setEditingClient(client); // Устанавливаем клиента для редактирования.
    setIsEditing(true); // Устанавливаем режим редактирования.
    setOpenDialog(true); // Открываем диалог.
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
          ...(editingClient.password && {
            currentPassword: "current-password-placeholder", // Заглушка, в реальном приложении нужно запросить текущий пароль.
            newPassword: editingClient.password,
          }),
        });
      } else {
        // Если режим добавления, создаем нового клиента.
        await clientApi.createClient({
          login: newClient.login_client,
          password: newClient.password!, // Пароль обязателен при создании.
          phone: newClient.phone_number_client,
          companyName: newClient.company_name,
        });
      }
      fetchClients(); // Обновляем список клиентов.
      setOpenDialog(false); // Закрываем диалог.
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

  return (
    <Box>
      {/* Кнопка "Добавить клиента" */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
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
                    {/* Кнопки редактирования и удаления клиента. */}
                    <IconButton onClick={() => handleEditClient(client)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClient(client.id)}
                      color="error"
                    >
                      <DeleteIcon />
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
        onClose={() => setOpenDialog(false)}
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
                  : "Пароль"
              }
              type="password"
              value={
                isEditing ? editingClient?.password || "" : newClient.password
              }
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={errors.password}
              helperText={
                errors.password ? "Пароль должен быть от 6 до 20 символов" : ""
              }
              margin="normal"
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
              (!isEditing && errors.password) || // Пароль обязателен только при создании.
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
