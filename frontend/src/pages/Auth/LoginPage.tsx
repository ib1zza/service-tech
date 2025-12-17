import { useState } from "react"; // Импорт хука `useState` для управления состоянием компонента
import { useNavigate } from "react-router-dom"; // Импорт хука `useNavigate` для программной навигации
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material"; // Импорт иконки замка и иконок для пароля
import {
  Avatar, // Компонент для отображения аватаров
  Box, // Универсальный контейнер для компоновки
  Button, // Компонент кнопки
  Container, // Компонент-контейнер с фиксированной шириной
  FormControl, // Компонент для группировки элементов формы
  InputLabel, // Метка для полей ввода
  MenuItem, // Элемент выпадающего списка
  Select, // Компонент выпадающего списка
  TextField, // Компонент текстового поля ввода
  Typography, // Компонент для отображения текста
  IconButton, // Компонент кнопки-иконки
  InputAdornment, // Компонент для добавления элементов внутрь поля ввода
} from "@mui/material"; // Импорт компонентов Material-UI
import { useForm, Controller } from "react-hook-form"; // Импорт хуков и компонентов из React Hook Form для управления формами
import { yupResolver } from "@hookform/resolvers/yup"; // Интеграция Yup с React Hook Form для валидации
import * as yup from "yup"; // Импорт библиотеки Yup для определения схем валидации
import api from "../../services/api"; // Импорт экземпляра Axios для выполнения HTTP-запросов
import { useAppDispatch } from "../../store/hooks"; // Пользовательский хук для получения функции `dispatch` из Redux
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice"; // Импорт экшенов Redux для управления состоянием аутентификации

// Схема валидации для формы входа с использованием Yup
const loginSchema = yup.object({
  login: yup.string().required("Логин обязателен").min(2, "Минимум 2 символа"),
  password: yup
    .string()
    .required("Пароль обязателен")
    .min(2, "Минимум 2 символа"),
  roleType: yup.string().required("Тип пользователя обязателен"),
});

// Вывод типа данных формы на основе схемы валидации
type LoginFormData = yup.InferType<typeof loginSchema>;

// Компонент `LoginPage` отвечает за отображение формы входа в систему и обработку аутентификации пользователя.
export default function LoginPage() {
  const navigate = useNavigate(); // Хук для навигации после успешного входа
  const dispatch = useAppDispatch(); // Хук для отправки экшенов в Redux-хранилище
  const [error, setError] = useState(""); // Состояние для отображения сообщений об ошибках входа
  // !!! НОВОЕ СОСТОЯНИЕ: для переключения видимости пароля.
  const [showPassword, setShowPassword] = useState(false);

  // Инициализация формы с помощью `useForm` из React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema as any), // Подключение схемы валидации Yup
    defaultValues: {
      // Значения по умолчанию для полей формы
      login: "",
      password: "",
      roleType: "client", // По умолчанию выбран тип "Клиент"
    },
  });

  // !!! НОВЫЙ ОБРАБОТЧИК: переключение видимости пароля.
  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Асинхронная функция, вызываемая при отправке формы
  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart()); // Отправляем экшен о начале попытки входа
    setError(""); // Очищаем предыдущие ошибки

    try {
      // Отправляем запрос на сервер для аутентификации
      const response = await api.post("/auth/login", data);
      const { token, user } = response.data; // Получаем токен и данные пользователя из ответа

      // Сохраняем токен и роль пользователя в локальном хранилище браузера
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", data.roleType);

      dispatch(loginSuccess({ token, user })); // Отправляем экшен об успешном входе с данными пользователя

      // Перенаправляем пользователя на соответствующую страницу в зависимости от его роли
      switch (data.roleType) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "staff":
          navigate("/staff/appeals");
          break;
        default:
          navigate("/client/appeals");
      }
    } catch (err) {
      // Обработка ошибок при входе
      const errorMessage = "Неверные учетные данные";
      setError(errorMessage); // Устанавливаем сообщение об ошибке для отображения пользователю
      dispatch(loginFailure(errorMessage)); // Отправляем экшен о неудачном входе
      console.error("Login error:", err); // Логируем ошибку в консоль
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {" "}
      {/* Основной контейнер страницы входа */}
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlined /> {/* Иконка замка */}
        </Avatar>
        <Typography component="h1" variant="h5">
          Вход в систему
        </Typography>

        {/* Отображение сообщения об ошибке, если оно есть */}
        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        {/* Форма входа */}
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)} // Обработчик отправки формы
          noValidate // Отключаем стандартную HTML-валидацию
          sx={{ mt: 1 }}
        >
          {/* Поле ввода логина, управляемое React Hook Form через `Controller` */}
          <Controller
            name="login"
            control={control}
            render={({ field }) => (
              <TextField
                {...field} // Привязка поля к React Hook Form
                margin="normal"
                required
                fullWidth
                label="Логин"
                autoComplete="username"
                autoFocus
                error={!!errors.login} // Отображение ошибки валидации
                helperText={errors.login?.message} // Текст ошибки
              />
            )}
          />

          {/* Поле ввода пароля, управляемое React Hook Form через `Controller` */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Пароль"
                // !!! ИЗМЕНЕНИЕ: тип поля зависит от состояния showPassword
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
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
            )}
          />

          {/* Выпадающий список для выбора типа пользователя, управляемый React Hook Form через `Controller` */}
          <Controller
            name="roleType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип пользователя</InputLabel>
                <Select
                  {...field}
                  label="Тип пользователя"
                  error={!!errors.roleType}
                >
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="staff">Сотрудник</MenuItem>
                  <MenuItem value="client">Клиент</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          {/* Кнопка отправки формы */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting} // Кнопка отключается во время отправки формы
          >
            {isSubmitting ? "Вход..." : "Войти"}{" "}
            {/* Текст кнопки меняется во время отправки */}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
