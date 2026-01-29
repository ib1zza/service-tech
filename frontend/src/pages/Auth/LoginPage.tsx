import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../services/api";
import { useAppDispatch } from "../../store/hooks";
import { loginStart, loginSuccess, loginFailure } from "../../store/authSlice";

const loginSchema = yup.object({
  login: yup.string().required("Логин обязателен").min(2, "Минимум 2 символа"),
  password: yup
    .string()
    .required("Пароль обязателен")
    .min(2, "Минимум 2 символа"),
  roleType: yup.string().required("Тип пользователя обязателен"),
});

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema as any),
    defaultValues: {
      login: "",
      password: "",
      roleType: "client",
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    setError("");

    try {
      const response = await api.post("/auth/login", data);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("userRole", data.roleType);

      dispatch(loginSuccess({ token, user }));

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
      const errorMessage = "Неверные учетные данные";
      setError(errorMessage);
      dispatch(loginFailure(errorMessage));
      console.error("Login error:", err);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* НОВЫЙ БЛОК: Заголовок приложения с градиентом */}
        <Typography
          variant="h3"
          component="div"
          sx={{
            fontWeight: 900,
            textAlign: "center",
            mb: 2,
            background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Service App
        </Typography>

        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlined />
        </Avatar>
        <Typography component="h1" variant="h5">
          Вход в систему
        </Typography>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          <Controller
            name="login"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                label="Логин"
                autoComplete="username"
                autoFocus
                error={!!errors.login}
                helperText={errors.login?.message}
              />
            )}
          />

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
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
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

          <Controller
            name="roleType"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип пользовательского входа</InputLabel>
                <Select
                  {...field}
                  label="Тип пользовательского входа"
                  error={!!errors.roleType}
                >
                  <MenuItem value="admin">Администратор</MenuItem>
                  <MenuItem value="staff">Сервисный вход</MenuItem>
                  <MenuItem value="client">Клиентский вход</MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Вход..." : "Войти"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
