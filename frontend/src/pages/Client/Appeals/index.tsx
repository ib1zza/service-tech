import { useState } from 'react'; // Импорт хука React для управления состоянием компонента
import {
    Box, // Универсальный компонент-контейнер для компоновки
    Tabs, // Компонент для создания вкладок
    Tab, // Отдельная вкладка
    Typography, // Компонент для отображения текста
} from '@mui/material'; // Импорт компонентов Material-UI
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Иконка для вкладки "Новая заявка"
import AssignmentIcon from '@mui/icons-material/Assignment'; // Иконка для вкладки "Размещенные заявки"
import BuildIcon from '@mui/icons-material/Build'; // Иконка для вкладки "Заявки в работе"
import HistoryIcon from '@mui/icons-material/History'; // Иконка для вкладки "История заявок"
import NewAppealTab from "./components/NewAppealTab.tsx"; // Импорт компонента для создания новой заявки
import PostedAppealsTab from "./components/PostedAppealsTab.tsx"; // Импорт компонента для отображения размещенных заявок
import AppealsInWorkTab from "./components/AppealsInWorkTab.tsx"; // Импорт компонента для отображения заявок в работе
import HistoryAppealsTab from "./components/HistoryAppealsTab.tsx"; // Импорт компонента для отображения истории заявок

// Вспомогательный компонент `TabPanel` для условного рендеринга содержимого вкладок.
// Он отображает свои дочерние элементы только тогда, когда `value` (индекс активной вкладки)
// совпадает с `index` (индексом этой конкретной панели).
function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel" // Роль для обеспечения доступности (ARIA)
            hidden={value !== index} // Скрывает панель, если она не является активной вкладкой
            id={`simple-tabpanel-${index}`} // Уникальный ID для панели, связанный с ID вкладки
            aria-labelledby={`simple-tab-${index}`} // Связывает панель с соответствующей вкладкой для доступности
            {...other}
        >
            {value === index && ( // Рендерит содержимое только если текущая вкладка активна
                <Box sx={{ p: 3 }}> {/* Добавляет отступы к содержимому панели */}
                    {children}
                </Box>
            )}
        </div>
    );
}

// Вспомогательная функция для генерации свойств доступности (`a11yProps`) для каждой вкладки.
// Это помогает связывать вкладки с их соответствующими панелями содержимого для пользователей вспомогательных технологий.
function a11yProps(index:number) {
    return {
        id: `simple-tab-${index}`, // Уникальный ID для вкладки
        'aria-controls': `simple-tabpanel-${index}`, // Указывает, какой панелью управляет эта вкладка
    };
}

// Моковые данные для таблицы заявок (закомментированы, так как используются реальные компоненты)
// const mockAppeals = [
//     { id: 1, number: 'APP-2023-001', date: '12.05.2023', status: 'Новая', description: 'Не работает принтер' },
//     { id: 2, number: 'APP-2023-002', date: '15.05.2023', status: 'В работе', description: 'Требуется замена картриджа' },
//     { id: 3, number: 'APP-2023-003', date: '18.05.2023', status: 'Завершена', description: 'Настройка ПО' },
//     { id: 4, number: 'APP-2023-004', date: '20.05.2023', status: 'Отклонена', description: 'Неисправность клавиатуры' },
// ];

// Главный компонент `ClientAppealsPage`, который представляет собой страницу с вкладками для управления заявками клиента.
export default function ClientAppealsPage() {
    // Состояние для отслеживания текущей активной вкладки (по умолчанию 0, первая вкладка).
    const [value, setValue] = useState(0);

    // Обработчик изменения активной вкладки. Обновляет состояние `value` на новый индекс вкладки.
    const handleChange = (_event: any, newValue: number) => {
        setValue(newValue);
    };

    // Функция для отображения статуса в виде чипа (закомментирована, так как используется в дочерних компонентах)
    // const renderStatusChip = (status: any) => {
    //     let color;
    //     switch (status) {
    //         case 'Новая':
    //             color = 'primary';
    //             break;
    //         case 'В работе':
    //             color = 'warning';
    //             break;
    //         case 'Завершена':
    //             color = 'success';
    //             break;
    //         case 'Отклонена':
    //             color = 'error';
    //             break;
    //         default:
    //             color = 'default';
    //     }
    //     return <Chip label={status} color={color as any} size="small" />;
    // };

    return (
        <Box sx={{ width: '100%' }}> {/* Основной контейнер страницы, занимающий всю доступную ширину */}
            <Typography variant="h4" component="h1" gutterBottom>
                Мои заявки {/* Заголовок страницы */}
            </Typography>

            {/* Контейнер для вкладок с нижней границей */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value} // Текущая активная вкладка
                    onChange={handleChange} // Обработчик изменения вкладки
                    aria-label="tabs for appeals" // Метка для доступности
                    variant="scrollable" // Позволяет вкладкам прокручиваться, если их много
                    scrollButtons="auto" // Автоматически показывает кнопки прокрутки
                >
                    {/* Вкладка "Новая заявка" */}
                    <Tab
                        label="Новая заявка"
                        icon={<AddCircleOutlineIcon />} // Иконка для вкладки
                        iconPosition="start" // Позиция иконки относительно текста
                        {...a11yProps(0)} // Свойства доступности для этой вкладки
                    />
                    {/* Вкладка "Размещенные заявки" */}
                    <Tab
                        label="Размещенные заявки"
                        icon={<AssignmentIcon />}
                        iconPosition="start"
                        {...a11yProps(1)}
                    />
                    {/* Вкладка "Заявки в работе" */}
                    <Tab
                        label="Заявки в работе"
                        icon={<BuildIcon />}
                        iconPosition="start"
                        {...a11yProps(2)}
                    />
                    {/* Вкладка "История заявок" */}
                    <Tab
                        label="История заявок"
                        icon={<HistoryIcon />}
                        iconPosition="start"
                        {...a11yProps(3)}
                    />
                </Tabs>
            </Box>

            {/* Панель для содержимого вкладки "Новая заявка" */}
            <TabPanel value={value} index={0}>
                <NewAppealTab/> {/* Рендерит компонент формы создания новой заявки */}
                {/* Закомментированный моковый контент */}
            </TabPanel>

            {/* Панель для содержимого вкладки "Размещенные заявки" */}
            <TabPanel value={value} index={1}>
                <PostedAppealsTab /> {/* Рендерит компонент для отображения размещенных заявок */}
                {/* Закомментированный моковый контент */}
            </TabPanel>

            {/* Панель для содержимого вкладки "Заявки в работе" */}
            <TabPanel value={value} index={2}>
                <AppealsInWorkTab /> {/* Рендерит компонент для отображения заявок в работе */}
                {/* Закомментированный моковый контент */}
            </TabPanel>

            {/* Панель для содержимого вкладки "История заявок" */}
            <TabPanel value={value} index={3}>
                <HistoryAppealsTab /> {/* Рендерит компонент для отображения истории заявок */}
                {/* Закомментированный моковый контент */}
            </TabPanel>
        </Box>
    );
}
