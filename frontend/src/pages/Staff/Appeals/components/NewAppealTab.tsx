import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  FormControl,
  FormLabel,
  MenuItem, // Импортируем MenuItem для выпадающего списка
} from "@mui/material";
import { useAppSelector } from "../../../../store/hooks.ts";
import { appealApi } from "../../../../services/requests";

// 1. Обновляем интерфейс: добавляем priority
interface NewAppealFormData {
  mechanism: string;
  description: string;
  reportedBy: string;
  priority: string; // Добавлено
}

// Константы для приоритетов (чтобы не дублировать текст)
const PRIORITIES = ["Низкий", "Средний", "Высокий", "Критичный"];

export default function NewAppealTab() {
  const { user } = useAppSelector((state) => state.auth);

  // 2. Добавляем приоритет в начальное состояние (по умолчанию "Средний")
  const [formData, setFormData] = useState<NewAppealFormData>({
    mechanism: "",
    description: "",
    reportedBy: "",
    priority: "Средний",
  });

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("ru-RU");
  const formattedTime = currentDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Отправка заявки:", {
      ...formData,
      customer: user?.company_name,
    });

    // 3. Передаем приоритет в API
    appealApi.createAppeal({
      mechanism: formData.mechanism,
      fioClient: formData.reportedBy,
      problem: formData.description,
      priority: formData.priority, // Не забудьте обновить этот метод в файле requests
    });

    alert("Заявка успешно размещена!");

    // Сброс формы (возвращаем "Средний")
    setFormData({
      mechanism: "",
      description: "",
      reportedBy: "",
      priority: "Средний",
    });
  };

  const handleCancel = () => {
    setFormData({
      mechanism: "",
      description: "",
      reportedBy: "",
      priority: "Средний",
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Новая заявка
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Дата: {formattedDate} Время: {formattedTime}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <FormLabel>Заказчик:</FormLabel>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {user?.company_name || "Не указан"}
            </Typography>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel required>Оборудование (механизм):</FormLabel>
            <Typography variant="caption" display="block" gutterBottom>
              Буквенно-цифровое обозначение до 25 символов
            </Typography>
            <TextField
              name="mechanism"
              value={formData.mechanism}
              onChange={handleInputChange}
              inputProps={{ maxLength: 25 }}
              required
              fullWidth
            />
          </FormControl>

          <FormControl fullWidth>
            <FormLabel required>Краткое описание неисправности:</FormLabel>
            <Typography variant="caption" display="block" gutterBottom>
              До 256 символов
            </Typography>
            <TextField
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              inputProps={{ maxLength: 256 }}
              required
              fullWidth
            />
          </FormControl>

          {/* --- НОВОЕ ПОЛЕ: ВЫБОР ПРИОРИТЕТА --- */}
          <FormControl fullWidth>
            <FormLabel required>Приоритет:</FormLabel>
            <TextField
              select // Делает поле выпадающим списком
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              required
              fullWidth
              variant="outlined"
              sx={{ mt: 1 }}
            >
              {PRIORITIES.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel required>Кто сообщил:</FormLabel>
            <Typography variant="caption" display="block" gutterBottom>
              Фамилия И. О.
            </Typography>
            <TextField
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleInputChange}
              required
              fullWidth
            />
          </FormControl>

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}
          >
            <Button variant="outlined" onClick={handleCancel}>
              Отмена
            </Button>
            <Button variant="contained" type="submit">
              Разместить заявку
            </Button>
          </Box>
        </Box>
      </form>
    </Paper>
  );
}
