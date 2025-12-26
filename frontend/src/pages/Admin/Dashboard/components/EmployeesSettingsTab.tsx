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
} from "@mui/material"; // Импорт компонентов Material-UI для построения пользовательского интерфейса
import AddIcon from "@mui/icons-material/Add"; // Иконка "Добавить"
import EditIcon from "@mui/icons-material/Edit"; // Иконка "Редактировать"
import DeleteIcon from "@mui/icons-material/Delete"; // Иконка "Удалить"
import Visibility from "@mui/icons-material/Visibility"; // !!! НОВЫЙ ИМПОРТ: Иконка "Показать пароль"
import VisibilityOff from "@mui/icons-material/VisibilityOff"; // !!! НОВЫЙ ИМПОРТ: Иконка "Скрыть пароль"
import { staffApi, StaffFromServer } from "../../../../services/requests"; // Импорт API для взаимодействия с сотрудниками и типа данных сотрудника

// Компонент `EmployeesSettingsTab` позволяет администратору управлять списком сотрудников: просматривать, добавлять, редактировать и удалять.
export default function EmployeesSettingsTab() {
  // Состояние для хранения списка сотрудников, загруженных с сервера.
  const [staffMembers, setStaffMembers] = useState<StaffFromServer[]>([]);
  // Состояние для данных сотрудника, который в данный момент редактируется.
  const [editingStaff, setEditingStaff] = useState<StaffFromServer | null>(
    null
  );
  // Состояние для данных нового сотрудника, который будет добавлен.
  const [newStaff, setNewStaff] = useState<
    Pick<StaffFromServer, "fio_staff" | "login_staff" | "password">
  >({ fio_staff: "", login_staff: "", password: "" });
  // Состояние для управления видимостью диалогового окна добавления/редактирования.
  const [openDialog, setOpenDialog] = useState(false);
  // Флаг, указывающий, находится ли диалог в режиме редактирования (true) или добавления (false).
  const [isEditing, setIsEditing] = useState(false);
  // Флаг, указывающий на состояние загрузки данных сотрудников.
  const [loading, setLoading] = useState(true);
  // Состояние для хранения ошибок валидации полей формы.
  const [errors, setErrors] = useState({
    fio_staff: false,
    login_staff: false,
    password: false,
  });

  // !!! НОВОЕ СОСТОЯНИЕ: для переключения видимости пароля.
  const [showPassword, setShowPassword] = useState(false);

  // Хук `useEffect` для загрузки списка сотрудников при первом монтировании компонента.
  useEffect(() => {
    fetchStaffMembers();
  }, []);

  // Асинхронная функция для получения списка сотрудников с сервера.
  const fetchStaffMembers = async () => {
    setLoading(true); // Устанавливаем состояние загрузки.
    try {
      const staff = await staffApi.getAllStaff(); // Выполняем запрос к API.
      setStaffMembers(staff); // Обновляем состояние списка сотрудников.
    } catch (error) {
      console.error("Ошибка при загрузке сотрудников:", error);
    } finally {
      setLoading(false); // Снимаем состояние загрузки.
    }
  };

  // Функция для валидации полей формы сотрудника.
  const validateInputs = (
    data: Pick<StaffFromServer, "fio_staff" | "login_staff" | "password">
  ) => {
    const newErrors = {
      fio_staff: data.fio_staff.length === 0 || data.fio_staff.length > 40,
      login_staff: data.login_staff.length < 2 || data.login_staff.length > 10,
      password: data.password
        ? data.password.length < 2 || data.password.length > 10
        : false, // Пароль валидируется, если он не пустой
    };
    setErrors(newErrors); // Обновляем состояние ошибок.
    return !Object.values(newErrors).some(Boolean); // Возвращаем `true`, если нет ошибок.
  };

  // Открывает диалог для добавления нового сотрудника.
  const handleAddStaff = () => {
    setNewStaff({ fio_staff: "", login_staff: "", password: "" }); // Сбрасываем данные нового сотрудника.
    setIsEditing(false); // Устанавливаем режим добавления.
    setOpenDialog(true); // Открываем диалог.
    setShowPassword(false); // Скрываем пароль по умолчанию при открытии.
  };

  // Открывает диалог для редактирования существующего сотрудника.
  const handleEditStaff = (staff: StaffFromServer) => {
    setEditingStaff(staff); // Устанавливаем сотрудника для редактирования.
    setIsEditing(true); // Устанавливаем режим редактирования.
    setOpenDialog(true); // Открываем диалог.
    setShowPassword(false); // Скрываем пароль по умолчанию при открытии.
  };

  // Обработчик удаления сотрудника.
  const handleDeleteStaff = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
      // Запрос подтверждения.
      try {
        await staffApi.deleteStaff(id); // Выполняем запрос на удаление.
        fetchStaffMembers(); // Обновляем список сотрудников после удаления.
      } catch (error) {
        console.error("Ошибка при удалении сотрудника:", error);
      }
    }
  };

  // Обработчик сохранения (добавления или обновления) сотрудника.
  const handleSaveStaff = async () => {
    const data = isEditing ? editingStaff : newStaff; // Определяем, какие данные сохранять.
    // При редактировании, если пароль пуст, его не валидируем как обязательный.
    const validationData =
      isEditing && editingStaff?.password === ""
        ? ({ ...data, password: "dummy_valid_password" } as typeof data) // Заглушка для прохождения валидации, если поле пустое
        : data;

    if (!data || !validateInputs(validationData)) return; // Валидируем данные перед сохранением.

    try {
      if (isEditing && editingStaff) {
        // Если режим редактирования, обновляем сотрудника.
        await staffApi.updateStaff(editingStaff.id, {
          fio: editingStaff.fio_staff,
          login: editingStaff.login_staff,
          ...(editingStaff.password && { password: editingStaff.password }), // Обновляем пароль, только если он был введен.
        });
      } else {
        // Если режим добавления, создаем нового сотрудника.
        await staffApi.createStaff({
          fio: newStaff.fio_staff!,
          login: newStaff.login_staff!,
          password: newStaff.password || "", // Пароль может быть пустым при создании, если не обязателен.
        });
      }
      fetchStaffMembers(); // Обновляем список сотрудников.
      setOpenDialog(false); // Закрываем диалог.
      setShowPassword(false); // Скрываем пароль
    } catch (error) {
      console.error("Ошибка при сохранении сотрудника:", error);
    }
  };

  // Универсальный обработчик изменения полей ввода в диалоге.
  const handleInputChange = (field: keyof StaffFromServer, value: string) => {
    if (isEditing && editingStaff) {
      setEditingStaff({ ...editingStaff, [field]: value }); // Обновляем данные редактируемого сотрудника.
    } else {
      setNewStaff({ ...newStaff, [field]: value }); // Обновляем данные нового сотрудника.
    }
  };

  // !!! НОВЫЙ ОБРАБОТЧИК: переключение видимости пароля.
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box>
      {/* Кнопка "Добавить сотрудника" */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStaff}
        >
          Добавить сотрудника
        </Button>
      </Box>

      {/* Условный рендеринг: отображение индикатора загрузки или таблицы сотрудников. */}
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Фамилия И. О.
                </TableCell>
                <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Логин
                </TableCell>
                <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Пароль
                </TableCell>
                <TableCell style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Действия
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Отображение списка сотрудников в таблице. */}
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.fio_staff}</TableCell>
                  <TableCell>{staff.login_staff}</TableCell>
                  <TableCell>••••••••</TableCell> {/* Пароль скрыт */}
                  <TableCell>
                    {/* Кнопки редактирования и удаления сотрудника. */}
                    <IconButton onClick={() => handleEditStaff(staff)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteStaff(staff.id)}
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

      {/* Диалоговое окно для добавления или редактирования сотрудника. */}
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
          {isEditing ? "Изменить данные сотрудника" : "Добавить сотрудника"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Поля ввода для данных сотрудника. */}
            <TextField
              fullWidth
              label="Фамилия И. О. (до 40 символов)"
              value={
                isEditing ? editingStaff?.fio_staff || "" : newStaff.fio_staff
              }
              onChange={(e) => handleInputChange("fio_staff", e.target.value)}
              error={errors.fio_staff}
              helperText={
                errors.fio_staff ? "ФИО должно быть от 1 до 40 символов" : ""
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Логин (2-10 символов)"
              value={
                isEditing
                  ? editingStaff?.login_staff || ""
                  : newStaff.login_staff
              }
              onChange={(e) => handleInputChange("login_staff", e.target.value)}
              error={errors.login_staff}
              helperText={
                errors.login_staff
                  ? "Логин должен быть от 2 до 10 символов"
                  : ""
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label={
                isEditing
                  ? "Новый пароль (оставьте пустым, чтобы не менять)"
                  : "Пароль (2-10 символов)"
              }
              // !!! ИЗМЕНЕНИЕ: тип поля зависит от состояния showPassword
              type={showPassword ? "text" : "password"}
              value={
                isEditing
                  ? editingStaff?.password || ""
                  : newStaff.password || ""
              }
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={errors.password}
              helperText={
                errors.password ? "Пароль должен быть от 2 до 10 символов" : ""
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
            onClick={handleSaveStaff}
            variant="contained"
            // Кнопка сохранения отключена, если есть ошибки валидации.
            disabled={
              errors.fio_staff ||
              errors.login_staff ||
              (!isEditing && errors.password) // Пароль обязателен только при создании.
            }
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
