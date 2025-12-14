import { useState, useEffect } from 'react'; // Импорт хуков React: useState для управления состоянием компонента, useEffect для выполнения побочных эффектов
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
    CircularProgress
} from '@mui/material'; // Импорт компонентов Material-UI для построения интерфейса

import SaveIcon from '@mui/icons-material/Save'; // Иконка сохранения
import EditIcon from '@mui/icons-material/Edit'; // Иконка редактирования
import {adminApi, infoApi, UpdateCredentialsData} from "../../../../services/requests"; // Импорт API-сервисов для взаимодействия с бэкендом

// Компонент AdminSettingsTab предоставляет интерфейс для настройки администраторских данных и информации "О программе"
export default function AdminSettingsTab() {
    // Состояние для полей формы обновления учетных данных администратора
    const [formData, setFormData] = useState({
        newLogin: '',
        newPassword: '',
        newPhone: '',
    });

    // Состояние для хранения текста информации "О программе" (отображаемого)
    const [aboutInfo, setAboutInfo] = useState<string>('');
    // Состояние для текста информации "О программе" в режиме редактирования (в модальном окне)
    const [editAboutInfo, setEditAboutInfo] = useState<string>('');
    // Состояние для управления видимостью модального окна редактирования
    const [openModal, setOpenModal] = useState<boolean>(false);
    // Состояние для индикатора загрузки при сохранении информации "О программе"
    const [loading, setLoading] = useState<boolean>(false);

    // Состояние для отслеживания ошибок валидации полей формы
    const [errors, setErrors] = useState({
        login: false,
        password: false,
        phone: false
    });

    // Хук useEffect для загрузки информации "О программе" при первом рендере компонента
    useEffect(() => {
        const fetchAboutInfo = async () => {
            try {
                // Выполняем запрос к API для получения информации
                const response = await infoApi.getAboutInfo();
                setAboutInfo(response); // Обновляем состояние с полученной информацией
            } catch (error) {
                console.error('Ошибка при загрузке информации:', error);
            }
        };

        fetchAboutInfo(); // Вызываем функцию загрузки
    }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз

    // Обработчик изменения значений в полях формы
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value })); // Обновляем данные формы

        // Выполняем валидацию полей и обновляем состояние ошибок
        if (name === 'newLogin') {
            setErrors(prev => ({ ...prev, login: value.length < 2 || value.length > 10 }));
        }
        if (name === 'newPassword') {
            setErrors(prev => ({ ...prev, password: value.length < 2 || value.length > 10 }));
        }
        if (name === 'newPhone') {
            setErrors(prev => ({ ...prev, phone: !/^\+79\d{9}$/.test(value) })); // Валидация номера телефона по регулярному выражению
        }
    };

    // Обработчик отправки формы обновления учетных данных
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Предотвращаем стандартное поведение отправки формы

        // Если есть ошибки валидации, прерываем отправку
        if (errors.login || errors.password || errors.phone) {
            return;
        }

        try {
            // Создаем объект с данными для обновления, включая только заполненные поля
            const updateData: UpdateCredentialsData = {};
            if (formData.newLogin) updateData.newLogin = formData.newLogin;
            if (formData.newPassword) updateData.newPassword = formData.newPassword;
            if (formData.newPhone) updateData.newPhone = formData.newPhone;

            // Выполняем запрос к API для обновления учетных данных
            await adminApi.updateCredentials(updateData);

            // Очищаем поля логина и пароля после успешного обновления
            setFormData(prev => ({
                ...prev,
                newLogin: '',
                newPassword: '',
            }));

            alert('Данные успешно обновлены'); // Сообщаем об успехе
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            alert('Произошла ошибка при обновлении данных'); // Сообщаем об ошибке
        }
    };

    // Открывает модальное окно для редактирования информации "О программе"
    const handleOpenModal = () => {
        setEditAboutInfo(aboutInfo); // Инициализируем текст в модальном окне текущей информацией
        setOpenModal(true);
    };

    // Закрывает модальное окно
    const handleCloseModal = () => {
        setOpenModal(false);
    };

    // Обработчик сохранения измененной информации "О программе"
    const handleSaveAboutInfo = async () => {
        setLoading(true); // Включаем индикатор загрузки
        try {
            // Отправляем обновленную информацию на сервер
            const response = await infoApi.updateAboutInfo(editAboutInfo);
            setAboutInfo(response); // Обновляем отображаемую информацию
            handleCloseModal(); // Закрываем модальное окно
        } catch (error) {
            console.error('Ошибка при сохранении информации:', error);
            alert('Не удалось сохранить изменения'); // Сообщаем об ошибке
        } finally {
            setLoading(false); // Выключаем индикатор загрузки
        }
    };

    return (
        <Box sx={{ maxWidth: 500 }}> {/* Основной контейнер страницы настроек */}
            {/* Секция для настроек учетных данных администратора */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Настройки администратора
                </Typography>

                {/* Поле для нового логина */}
                <TextField
                    fullWidth
                    label="Новый логин администратора (2-10 символов)"
                    name="newLogin"
                    value={formData.newLogin}
                    onChange={handleChange}
                    error={errors.login} // Указываем, есть ли ошибка валидации
                    helperText={errors.login ? "Логин должен быть от 2 до 10 символов" : ""} // Текст ошибки
                    margin="normal"
                />

                {/* Поле для нового пароля */}
                <TextField
                    fullWidth
                    label="Новый пароль администратора (2-10 символов)"
                    name="newPassword"
                    type="password" // Тип поля для скрытия вводимых символов
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={errors.password}
                    helperText={errors.password ? "Пароль должен быть от 2 до 10 символов" : ""}
                    margin="normal"
                />

                {/* Поле для нового номера телефона Telegram */}
                <TextField
                    fullWidth
                    label="Номер телефона для Telegram (+79XXXXXXXXX)"
                    name="newPhone"
                    value={formData.newPhone}
                    onChange={handleChange}
                    error={errors.phone}
                    helperText={errors.phone ? "Введите номер в формате +79XXXXXXXXX" : ""}
                    margin="normal"
                />

                {/* Кнопка сохранения изменений учетных данных */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={errors.login || errors.password || errors.phone} // Кнопка отключена, если есть ошибки валидации
                        onClick={handleSubmit}
                    >
                        Сохранить изменения
                    </Button>
                </Box>
            </Paper>

            {/* Секция для информации "О программе" */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Информация "О программе"
                </Typography>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" paragraph>
                        {aboutInfo || 'Информация о программе не загружена'} {/* Отображаем загруженную информацию или сообщение */}
                    </Typography>
                </Box>

                {/* Кнопка для открытия модального окна редактирования */}
                <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleOpenModal}
                >
                    Редактировать информацию
                </Button>
            </Paper>

            {/* Модальное окно для редактирования информации "О программе" */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>Редактирование информации "О программе"</DialogTitle>
                <DialogContent>
                    {/* Многострочное текстовое поле для редактирования информации */}
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        variant="outlined"
                        value={editAboutInfo}
                        onChange={(e) => setEditAboutInfo(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>Отмена</Button>
                    {/* Кнопка сохранения в модальном окне с индикатором загрузки */}
                    <Button
                        onClick={handleSaveAboutInfo}
                        variant="contained"
                        disabled={loading} // Кнопка отключена во время загрузки
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />} // Иконка загрузки или сохранения
                    >
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
