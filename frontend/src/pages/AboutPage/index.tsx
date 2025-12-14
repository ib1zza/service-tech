import { useEffect, useState } from 'react'; // Импортируем хуки React: useEffect для выполнения побочных эффектов и useState для управления состоянием компонента
import { Box, Typography, CircularProgress, Paper } from '@mui/material'; // Импортируем компоненты Material-UI для построения интерфейса: Box (контейнер), Typography (текст), CircularProgress (индикатор загрузки), Paper (контейнер с тенью)
import {infoApi} from "../../services/requests"; // Импортируем объект infoApi, который содержит методы для выполнения запросов к API

// Компонент AboutPage отображает информацию о программе, загружаемую с сервера
export default function AboutPage() {
    // Состояние для хранения текста информации о программе
    const [aboutInfo, setAboutInfo] = useState<string>('');
    // Состояние для отслеживания статуса загрузки данных
    const [loading, setLoading] = useState<boolean>(true);

    // Хук useEffect выполняется после рендеринга компонента
    useEffect(() => {
        // Асинхронная функция для загрузки информации о программе
        const fetchAboutInfo = async () => {
            try {
                // Выполняем запрос к API для получения информации
                const response = await infoApi.getAboutInfo();
                // Обновляем состояние с полученной информацией
                setAboutInfo(response);
            } catch (error) {
                // В случае ошибки логируем ее и устанавливаем сообщение об ошибке для пользователя
                console.error('Ошибка при загрузке информации:', error);
                setAboutInfo('Не удалось загрузить информацию о программе.');
            } finally {
                // В любом случае (успех или ошибка) завершаем состояние загрузки
                setLoading(false);
            }
        };

        fetchAboutInfo(); // Вызываем функцию загрузки при монтировании компонента
    }, []); // Пустой массив зависимостей означает, что эффект выполнится только один раз при монтировании

    // Условный рендеринг: если данные загружаются, показываем индикатор загрузки
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress /> {/* Индикатор круговой загрузки */}
            </Box>
        );
    }

    // Если данные загружены, отображаем информацию о программе
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}> {/* Контейнер с максимальной шириной, центрированием и отступами */}
            <Typography variant="h4" gutterBottom>
                О программе
            </Typography>
            <Paper elevation={3} sx={{ p: 3 }}> {/* Контейнер с тенью для отображения текста */}
                <Typography whiteSpace="pre-line"> {/* Текст информации. whiteSpace="pre-line" сохраняет переносы строк из полученного текста */}
                    {aboutInfo}
                </Typography>
            </Paper>
        </Box>
    );
}
