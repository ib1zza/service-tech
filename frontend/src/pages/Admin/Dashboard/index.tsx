import { useState } from 'react'; // Импорт хука React для управления состоянием компонента
import {
    Box, // Универсальный компонент-контейнер для компоновки
    Tabs, // Компонент для создания вкладок
    Tab, // Отдельная вкладка
    Typography, // Компонент для отображения текста
} from '@mui/material'; // Импорт компонентов Material-UI
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Иконка для вкладки настроек администратора
import PeopleIcon from '@mui/icons-material/People'; // Иконка для вкладки настроек заказчиков
import EngineeringIcon from '@mui/icons-material/Engineering'; // Иконка для вкладки настроек сотрудников
import AdminSettingsTab from "./components/AdminSettingsTab"; // Импорт компонента для настроек администратора
import ClientsSettingsTab from "./components/ClientsSettingsTab"; // Импорт компонента для настроек заказчиков
import EmployeesSettingsTab from "./components/EmployeesSettingsTab"; // Импорт компонента для настроек сотрудников

// Вспомогательный компонент `TabPanel` для условного рендеринга содержимого вкладок.
// Он отображает свои дочерние элементы только тогда, когда `value` (активная вкладка)
// совпадает с `index` (индексом этой панели).
function TabPanel(props: any) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel" // Роль для обеспечения доступности
            hidden={value !== index} // Скрывает панель, если она не активна
            id={`simple-tabpanel-${index}`} // Уникальный ID для панели
            aria-labelledby={`simple-tab-${index}`} // Связывает панель с соответствующей вкладкой для доступности
            {...other}
        >
            {value === index && ( // Рендерит содержимое только если вкладка активна
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

// Вспомогательная функция для генерации свойств доступности (`a11yProps`) для каждой вкладки.
// Это помогает связывать вкладки с их соответствующими панелями содержимого.
function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`, // ID для вкладки
        'aria-controls': `simple-tabpanel-${index}`, // Указывает, какой панелью управляет эта вкладка
    };
}

// Главный компонент `AdminSettingsPage`, который представляет собой страницу с вкладками для различных административных настроек.
export default function AdminSettingsPage() {
    // Состояние для отслеживания текущей активной вкладки (по умолчанию 0, первая вкладка).
    const [value, setValue] = useState(0);

    // Обработчик изменения активной вкладки. Обновляет состояние `value`.
    const handleChange = (_event: any, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}> {/* Основной контейнер, занимающий всю доступную ширину */}
            <Typography variant="h4" component="h1" gutterBottom>
                Панель администратора
            </Typography>

            {/* Контейнер для вкладок */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value} // Текущая активная вкладка
                    onChange={handleChange} // Обработчик изменения вкладки
                    aria-label="admin settings tabs" // Метка для доступности
                    variant="scrollable" // Позволяет вкладкам прокручиваться, если их много
                    scrollButtons="auto" // Автоматически показывает кнопки прокрутки
                >
                    {/* Вкладка "Настройка администратора" */}
                    <Tab
                        label="Настройка администратора"
                        icon={<AdminPanelSettingsIcon />} // Иконка для вкладки
                        iconPosition="start" // Позиция иконки относительно текста
                        {...a11yProps(0)} // Свойства доступности для этой вкладки
                    />
                    {/* Вкладка "Настройка заказчиков" */}
                    <Tab
                        label="Настройка заказчиков"
                        icon={<PeopleIcon />}
                        iconPosition="start"
                        {...a11yProps(1)}
                    />
                    {/* Вкладка "Настройка сотрудников" */}
                    <Tab
                        label="Настройка сотрудников"
                        icon={<EngineeringIcon />}
                        iconPosition="start"
                        {...a11yProps(2)}
                    />
                </Tabs>
            </Box>

            {/* Панель для настроек администратора. `TabPanel` рендерит `AdminSettingsTab` только когда `value` равно 0. */}
            <TabPanel value={value} index={0}>
                <AdminSettingsTab />
            </TabPanel>

            {/* Панель для настроек заказчиков. Рендерит `ClientsSettingsTab` когда `value` равно 1. */}
            <TabPanel value={value} index={1}>
                <ClientsSettingsTab />
            </TabPanel>

            {/* Панель для настроек сотрудников. Рендерит `EmployeesSettingsTab` когда `value` равно 2. */}
            <TabPanel value={value} index={2}>
                <EmployeesSettingsTab />
            </TabPanel>
        </Box>
    );
}
