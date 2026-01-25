import { useState, useEffect, useMemo } from "react"; // Добавил useMemo для сортировки
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
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { staffApi, StaffFromServer } from "../../../../services/requests";

export default function EmployeesSettingsTab() {
  const [staffMembers, setStaffMembers] = useState<StaffFromServer[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffFromServer | null>(
    null,
  );
  const [newStaff, setNewStaff] = useState<
    Pick<StaffFromServer, "fio_staff" | "login_staff" | "password_plain">
  >({ fio_staff: "", login_staff: "", password_plain: "" });
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({
    fio_staff: false,
    login_staff: false,
    password: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  // Сортировка сотрудников по алфавиту по ФИО
  const sortedStaffMembers = useMemo(() => {
    return [...staffMembers].sort((a, b) =>
      a.fio_staff.localeCompare(b.fio_staff, "ru"),
    );
  }, [staffMembers]);

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    setLoading(true);
    try {
      const staff = await staffApi.getAllStaff();
      setStaffMembers(staff);
    } catch (error) {
      console.error("Ошибка при загрузке сотрудников:", error);
    } finally {
      setLoading(false);
    }
  };

  // Обновленная функция валидации
  const validateInputs = (
    data: Pick<StaffFromServer, "fio_staff" | "login_staff" | "password_plain">,
  ) => {
    const isPasswordEmpty =
      !data.password_plain || data.password_plain.length === 0;

    const newErrors = {
      fio_staff: data.fio_staff.length === 0 || data.fio_staff.length > 40,
      login_staff: data.login_staff.length < 2 || data.login_staff.length > 10,
      // При добавлении пароль обязателен, при редактировании - нет
      password:
        !isEditing && isPasswordEmpty
          ? true
          : isPasswordEmpty
            ? false // При редактировании пустой пароль - ок
            : data.password_plain.length < 2 || data.password_plain.length > 10,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleAddStaff = () => {
    setNewStaff({ fio_staff: "", login_staff: "", password_plain: "" });
    setIsEditing(false);
    setOpenDialog(true);
    setShowPassword(false);
    // Сброс ошибок
    setErrors({
      fio_staff: false,
      login_staff: false,
      password: false,
    });
  };

  const handleEditStaff = (staff: StaffFromServer) => {
    // Устанавливаем сотрудника для редактирования, включая текущий пароль
    // Если пароль не должен отображаться, используем пустую строку
    setEditingStaff({
      ...staff,
      password: "", // Оставляем пустым при редактировании
    });
    setIsEditing(true);
    setOpenDialog(true);
    setShowPassword(false);
    // Сброс ошибок
    setErrors({
      fio_staff: false,
      login_staff: false,
      password: false,
    });
  };

  const handleDeleteStaff = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
      try {
        await staffApi.deleteStaff(id);
        fetchStaffMembers();
      } catch (error) {
        console.error("Ошибка при удалении сотрудника:", error);
      }
    }
  };

  const handleSaveStaff = async () => {
    const data = isEditing ? editingStaff : newStaff;

    if (!data) return;

    // Для валидации при редактировании используем заглушку, если пароль пустой
    const validationData =
      isEditing && data.password_plain === ""
        ? ({ ...data, password_plain: "dummy_valid_password" } as typeof data)
        : data;

    if (!validateInputs(validationData)) return;

    try {
      if (isEditing && editingStaff) {
        // Формируем данные для обновления
        const updateData: any = {
          fio: editingStaff.fio_staff,
          login: editingStaff.login_staff,
        };

        // Добавляем пароль только если он был введен (не пустой)
        if (
          editingStaff.password_plain &&
          editingStaff.password_plain.trim() !== ""
        ) {
          updateData.password = editingStaff.password_plain;
        }

        await staffApi.updateStaff(editingStaff.id, updateData);
      } else {
        await staffApi.createStaff({
          fio: newStaff.fio_staff!,
          login: newStaff.login_staff!,
          password: newStaff.password_plain || "",
        });
      }

      fetchStaffMembers();
      setOpenDialog(false);
      setShowPassword(false);
    } catch (error) {
      console.error("Ошибка при сохранении сотрудника:", error);
    }
  };

  const handleInputChange = (field: keyof StaffFromServer, value: string) => {
    if (isEditing && editingStaff) {
      setEditingStaff({ ...editingStaff, [field]: value });
      // Валидация при вводе для редактирования
      const tempData = { ...editingStaff, [field]: value };
      validateInputs(tempData);
    } else {
      setNewStaff({ ...newStaff, [field]: value });
      // Валидация при вводе для добавления
      const tempData = { ...newStaff, [field]: value };
      validateInputs(tempData);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddStaff}
        >
          Добавить сотрудника
        </Button>
      </Box>

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
              {/* Используем отсортированный массив */}
              {sortedStaffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.fio_staff}</TableCell>
                  <TableCell>{staff.login_staff}</TableCell>
                  <TableCell>••••••••</TableCell>
                  <TableCell>
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

      <Dialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          setShowPassword(false);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Изменить данные сотрудника" : "Добавить сотрудника"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
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
              type={showPassword ? "text" : "password"}
              value={
                isEditing
                  ? editingStaff?.password_plain || ""
                  : newStaff.password_plain || ""
              }
              onChange={(e) =>
                handleInputChange("password_plain", e.target.value)
              }
              error={errors.password}
              helperText={
                errors.password
                  ? isEditing
                    ? "Если вводите пароль, он должен быть от 2 до 10 символов"
                    : "Пароль должен быть от 2 до 10 символов"
                  : ""
              }
              margin="normal"
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
            disabled={
              errors.fio_staff ||
              errors.login_staff ||
              (!isEditing && errors.password)
            }
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
