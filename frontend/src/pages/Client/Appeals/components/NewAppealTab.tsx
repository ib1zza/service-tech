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
  Select, // Добавлено
  MenuItem, // Добавлено
  SelectChangeEvent, // Добавлено для типизации
} from "@mui/material";
import { useAppSelector } from "../../../../store/hooks.ts";
import { appealApi } from "../../../../services/requests";

// Определение интерфейса для данных новой заявки
interface NewAppealFormData {
  mechanism: string;
  description: string;
  reportedBy: string;
  priority: string; // Добавлено новое поле
}

export default function NewAppealTab() {
  const { user } = useAppSelector((state) => state.auth);

  // Список доступных приоритетов
  const priorities = ["Низкий", "Средний", "Высокий", "Критичный"];

  const [formData, setFormData] = useState<NewAppealFormData>({
    mechanism: "",
    description: "",
    reportedBy: "",
    priority: "Средний", // Значение по умолчанию
  });

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("ru-RU");
  const formattedTime = currentDate.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Обработчик для обычных полей ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Специальный обработчик для Select (MUI использует SelectChangeEvent)
  const handleSelectChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({
      ...prev,
      priority: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Отправка заявки:", {
      ...formData,
      customer: user?.company_name,
    });

    appealApi.createAppeal({
      mechanism: formData.mechanism,
      fioClient: formData.reportedBy,
      problem: formData.description,
      priority: formData.priority, // Не забудьте передать в API
    });

    alert("Заявка успешно размещена!");
    setFormData({
      mechanism: "",
      description: "",
      reportedBy: "",
      priority: "Средний", // Сброс к значению по умолчанию
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

          {/* НОВОЕ ПОЛЕ: ВЫБОР ПРИОРИТЕТА */}
          <FormControl fullWidth>
            <FormLabel required>Приоритет:</FormLabel>
            <Select
              value={formData.priority}
              onChange={handleSelectChange}
              sx={{ mt: 1 }}
            >
              {priorities.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </Select>
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
