import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import EditIcon from "@mui/icons-material/Edit";
import {
  adminApi,
  infoApi,
  UpdateCredentialsData,
} from "../../../../services/requests";
import { useAuth } from "../../../../hooks/useAuth";

export default function AdminSettingsTab() {
  const { user } = useAuth();

  // Добавляем пароль в локальное состояние отображения
  const [adminInfo, setAdminInfo] = useState({
    login: "",
    phone: "",
    password: "",
  });

  const [adminEditData, setAdminEditData] = useState({
    newLogin: "",
    newPassword: "",
    newPhone: "",
  });

  const [aboutInfo, setAboutInfo] = useState<string>("");
  const [editAboutInfo, setEditAboutInfo] = useState<string>("");

  const [openAdminModal, setOpenAdminModal] = useState<boolean>(false);
  const [openAboutModal, setOpenAboutModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [errors, setErrors] = useState({
    login: false,
    password: false,
    phone: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const aboutRes = await infoApi.getAboutInfo();
        setAboutInfo(aboutRes);

        // Инициализируем данные из user (включая пароль)
        if (user) {
          setAdminInfo({
            login: user.login_admin,
            phone: user.phone_number_admin,
            password: user.password_plain, // Используем поле из вашего запроса
          });
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAdminEditData((prev) => ({ ...prev, [name]: value }));

    // Валидация
    if (name === "newLogin") {
      setErrors((prev) => ({
        ...prev,
        login: value.length > 0 && (value.length < 2 || value.length > 10),
      }));
    }
    if (name === "newPassword") {
      setErrors((prev) => ({
        ...prev,
        password: value.length > 0 && (value.length < 2 || value.length > 10),
      }));
    }
    if (name === "newPhone") {
      setErrors((prev) => ({
        ...prev,
        phone: value.length > 0 && !/^\+79\d{9}$/.test(value),
      }));
    }
  };

  // ОТКРЫТИЕ МОДАЛКИ: теперь подставляем и пароль тоже
  const handleOpenAdminModal = () => {
    setAdminEditData({
      newLogin: adminInfo.login,
      newPhone: adminInfo.phone,
      newPassword: adminInfo.password, // Теперь пароль подставляется сюда
    });
    setErrors({ login: false, password: false, phone: false });
    setOpenAdminModal(true);
  };

  const handleSaveAdminData = async () => {
    if (errors.login || errors.password || errors.phone) return;

    setLoading(true);
    try {
      const updateData: UpdateCredentialsData = {};

      // Отправляем данные, только если они изменились
      if (adminEditData.newLogin !== adminInfo.login)
        updateData.newLogin = adminEditData.newLogin;
      if (adminEditData.newPhone !== adminInfo.phone)
        updateData.newPhone = adminEditData.newPhone;
      if (adminEditData.newPassword !== adminInfo.password)
        updateData.newPassword = adminEditData.newPassword;

      // Если ничего не изменилось, просто закрываем
      if (Object.keys(updateData).length === 0) {
        setOpenAdminModal(false);
        return;
      }

      await adminApi.updateCredentials(updateData);

      setAdminInfo({
        login: adminEditData.newLogin,
        phone: adminEditData.newPhone,
        password: adminEditData.newPassword,
      });

      setOpenAdminModal(false);
      alert("Данные администратора успешно обновлены");
    } catch (error) {
      console.error("Ошибка при обновлении данных:", error);
      alert("Не удалось обновить данные");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAboutModal = () => {
    setEditAboutInfo(aboutInfo);
    setOpenAboutModal(true);
  };

  const handleSaveAboutInfo = async () => {
    setLoading(true);
    try {
      const response = await infoApi.updateAboutInfo(editAboutInfo);
      setAboutInfo(response);
      setOpenAboutModal(false);
    } catch (error) {
      alert("Не удалось сохранить изменения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mt: 2 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Настройки администратора
        </Typography>
        <List sx={{ mb: 2 }}>
          <ListItem disableGutters>
            <ListItemText
              primary="Логин"
              secondary={adminInfo.login || "Не задан"}
            />
          </ListItem>
          <Divider />
          <ListItem disableGutters>
            <ListItemText
              primary="Телефон Telegram"
              secondary={adminInfo.phone || "Не задан"}
            />
          </ListItem>
          <Divider />
          <ListItem disableGutters>
            <ListItemText
              primary="Пароль"
              secondary={adminInfo.password ? "********" : "Не задан"}
            />
          </ListItem>
        </List>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenAdminModal}
        >
          Изменить данные
        </Button>
      </Paper>

      {/* О программе - без изменений */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Информация "О программе"
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 2, whiteSpace: "pre-wrap", color: "text.secondary" }}
        >
          {aboutInfo || "Информация не заполнена"}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleOpenAboutModal}
        >
          Редактировать текст
        </Button>
      </Paper>

      <Dialog
        open={openAdminModal}
        onClose={() => !loading && setOpenAdminModal(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Редактирование администратора</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Новый логин"
            name="newLogin"
            value={adminEditData.newLogin}
            onChange={handleAdminChange}
            error={errors.login}
            helperText={errors.login ? "От 2 до 10 символов" : ""}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Новый телефон (+79XXXXXXXXX)"
            name="newPhone"
            value={adminEditData.newPhone}
            onChange={handleAdminChange}
            error={errors.phone}
            helperText={errors.phone ? "Формат: +79XXXXXXXXX" : ""}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Пароль"
            name="newPassword"
            // type="password" // Уберите это, если хотите чтобы пароль был виден текстом
            value={adminEditData.newPassword}
            onChange={handleAdminChange}
            error={errors.password}
            helperText={errors.password ? "От 2 до 10 символов" : ""}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdminModal(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleSaveAdminData}
            variant="contained"
            disabled={
              loading || errors.login || errors.phone || errors.password
            }
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* О программе Dialog - без изменений */}
      <Dialog
        open={openAboutModal}
        onClose={() => !loading && setOpenAboutModal(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Редактирование информации</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={8}
            value={editAboutInfo}
            onChange={(e) => setEditAboutInfo(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAboutModal(false)} disabled={loading}>
            Отмена
          </Button>
          <Button
            onClick={handleSaveAboutInfo}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
