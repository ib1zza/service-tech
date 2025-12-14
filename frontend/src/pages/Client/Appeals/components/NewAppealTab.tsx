import { useState } from 'react'; // Импорт хука `useState` для управления состоянием компонента
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Divider,
    FormControl,
    FormLabel
} from '@mui/material'; // Импорт компонентов Material-UI для построения пользовательского интерфейса
import {useAppSelector} from "../../../../store/hooks.ts"; // Импорт пользовательского хука для доступа к Redux-хранилищу
import {appealApi} from "../../../../services/requests"; // Импорт API для взаимодействия с заявками

// Определение интерфейса для данных новой заявки
interface NewAppealFormData {
    mechanism: string; // Обозначение механизма
    description: string; // Описание неисправности
    reportedBy: string; // Кто сообщил о неисправности
}

// Компонент `NewAppealTab` предоставляет форму для создания новой заявки клиентом.
export default function NewAppealTab() {
    // Получаем данные текущего пользователя из Redux-хранилища, чтобы отобразить название компании.
    const { user } = useAppSelector(state => state.auth);
    // Состояние для хранения данных формы новой заявки.
    const [formData, setFormData] = useState<NewAppealFormData>({
        mechanism: '',
        description: '',
        reportedBy: ''
    });

    // Получаем текущую дату и время для отображения в форме.
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('ru-RU');
    const formattedTime = currentDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Обработчик изменения значений в полях формы. Обновляет соответствующее поле в состоянии `formData`.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Обработчик отправки формы. Выполняет запрос к API для создания новой заявки.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем стандартное поведение отправки формы.
        console.log('Отправка заявки:', {
            ...formData,
            customer: user?.company_name
        });
        // Вызов API для создания заявки с данными из формы.
        appealApi.createAppeal({
            mechanism: formData.mechanism,
            fioClient: formData.reportedBy,
            problem: formData.description
        });
        alert('Заявка успешно размещена!'); // Уведомление пользователя об успешном размещении.
        // Сброс полей формы после отправки.
        setFormData({
            mechanism: '',
            description: '',
            reportedBy: ''
        });
    };

    // Обработчик кнопки "Отмена". Сбрасывает все поля формы.
    const handleCancel = () => {
        setFormData({
            mechanism: '',
            description: '',
            reportedBy: ''
        });
    };

    return (
        <Paper elevation={3} sx={{ p: 3 }}> {/* Основной контейнер формы с тенью */}
            <Typography variant="h6" gutterBottom>
                Новая заявка
            </Typography>

            {/* Отображение текущей даты и времени */}
            <Typography variant="subtitle1" gutterBottom>
                Дата: {formattedDate} Время: {formattedTime}
            </Typography>

            <Divider sx={{ my: 2 }} /> {/* Разделитель */}

            <form onSubmit={handleSubmit}> {/* Форма для отправки заявки */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Поле "Заказчик" (отображает название компании текущего пользователя) */}
                    <FormControl fullWidth>
                        <FormLabel>Заказчик</FormLabel>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            {user?.company_name || 'Не указан'}
                        </Typography>
                    </FormControl>

                    {/* Поле для ввода механизма */}
                    <FormControl fullWidth>
                        <FormLabel required>Оборудование (механизм)</FormLabel>
                        <Typography variant="caption" display="block" gutterBottom>
                            Буквенно-цифровое обозначение до 25 символов
                        </Typography>
                        <TextField
                            name="mechanism"
                            value={formData.mechanism}
                            onChange={handleInputChange}
                            inputProps={{ maxLength: 25 }} // Ограничение на количество символов
                            required // Поле обязательно для заполнения
                            fullWidth
                        />
                    </FormControl>

                    {/* Поле для краткого описания неисправности */}
                    <FormControl fullWidth>
                        <FormLabel required>Краткое описание неисправности</FormLabel>
                        <Typography variant="caption" display="block" gutterBottom>
                            До 256 символов
                        </Typography>
                        <TextField
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline // Многострочное поле
                            rows={4} // Высота поля в строках
                            inputProps={{ maxLength: 256 }} // Ограничение на количество символов
                            required
                            fullWidth
                        />
                    </FormControl>

                    {/* Поле "Кто сообщил" */}
                    <FormControl fullWidth>
                        <FormLabel required>Кто сообщил</FormLabel>
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

                    {/* Кнопки "Отмена" и "Разместить заявку" */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                        >
                            Отмена
                        </Button>
                        <Button
                            variant="contained"
                            type="submit"
                        >
                            Разместить заявку
                        </Button>
                    </Box>
                </Box>
            </form>
        </Paper>
    );
}
