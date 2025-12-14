import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider
} from '@mui/material'; // Импорт основных компонентов Material-UI для построения интерфейса
import SettingsIcon from '@mui/icons-material/Settings'; // Иконка настроек
import LogoutIcon from '@mui/icons-material/Logout'; // Иконка выхода
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Иконка для светлой темы
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Иконка для темной темы
import { useNavigate } from 'react-router-dom'; // Хук для навигации между страницами
import { deepPurple } from '@mui/material/colors'; // Цветовая палитра Material-UI
import { useState } from 'react'; // Хук React для управления состоянием компонента
import { useAppSelector } from "../../../store/hooks.ts"; // Пользовательский хук для доступа к Redux-хранилищу
import {useThemeContext} from "../../../contexts/ThemeContext.tsx"; // Пользовательский хук для доступа к контексту темы

// Компонент Header, представляющий верхнюю навигационную панель приложения
export default function Header() {
    // Получаем функции и состояние, связанные с переключением темы
    const { toggleTheme, mode } = useThemeContext();
    // Получаем данные текущего пользователя из Redux-хранилища
    const user = useAppSelector(state => state.auth.user);
    // Инициализируем хук для программной навигации
    const navigate = useNavigate();
    // Название компании, отображаемое в заголовке
    const companyName = "Сервисная служба Андрей Николаевич и К";

    // Состояние для управления открытием/закрытием выпадающего меню пользователя
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl); // Определяет, открыто ли меню

    // Открывает выпадающее меню, устанавливая текущий элемент как якорь
    const handleClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    // Закрывает выпадающее меню
    const handleClose = () => {
        setAnchorEl(null);
    };

    // Обработчик выхода из системы: очищает локальное хранилище и перенаправляет на страницу входа
    const handleLogout = () => {
        handleClose();
        console.log('Выполнен выход из системы');
        localStorage.clear(); // Удаляем все данные пользователя из локального хранилища
        setTimeout(() => {
            navigate('/login'); // Перенаправляем на страницу входа
        });
    };

    // Определяем отображаемое имя пользователя: приоритет отдается названию компании, затем ФИО сотрудника, затем ФИО админа
    const userDisplayName = user?.company_name || user?.fio_staff || user?.fio_admin || 'User';

    return (
        <AppBar
            position="fixed" // Фиксированное позиционирование панели сверху
            sx={{ // Стилизация панели с использованием свойств Material-UI
                zIndex: (theme) => theme.zIndex.drawer + 1, // Обеспечивает, что панель находится поверх бокового меню
                bgcolor: 'background.paper', // Цвет фона из темы
                color: 'text.primary', // Цвет текста из темы
                boxShadow: 'none', // Убираем тень
                borderBottom: (theme) => `1px solid ${theme.palette.divider}` // Нижняя граница
            }}
        >
            <Toolbar>
                {/* Секция логотипа и названия компании */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        mr: 2
                    }}
                    onClick={() => navigate('/')} // Переход на главную страницу при клике
                >
                    <Avatar sx={{ // Аватар с иконкой настроек
                        bgcolor: deepPurple[500],
                        mr: 1.5,
                        width: 40,
                        height: 40
                    }}>
                        <SettingsIcon sx={{ fontSize: 24 }} />
                    </Avatar>

                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            // Применение градиента к тексту для стилизации
                            background: (theme) =>
                                `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${deepPurple[500]} 90%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        {companyName}
                    </Typography>
                </Box>

                {/* Секция ссылки "О программе" */}
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'end', marginRight: 2 }} >
                    <Typography
                        variant="body2"
                        noWrap
                        component="div"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            background: (theme) =>
                                `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${deepPurple[500]} 90%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            cursor: 'pointer',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                        onClick={() => navigate('/about')} // Переход на страницу "О программе"
                    >
                        О программе
                    </Typography>
                </Box>

                {/* Кнопка переключения светлой/темной темы */}
                <IconButton
                    sx={{ mr: 2 }}
                    onClick={toggleTheme} // Вызывает функцию переключения темы
                    color="inherit"
                    aria-label="toggle theme"
                >
                    {/* Отображает соответствующую иконку в зависимости от текущей темы */}
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>

                {/* Секция с именем пользователя и аватаром */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {userDisplayName}
                    </Typography>
                    <IconButton
                        color="inherit"
                        onClick={handleClick} // Открывает выпадающее меню
                        aria-controls={open ? 'account-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        {/* Аватар с первой буквой имени пользователя */}
                        <Avatar sx={{ width: 32, height: 32 }}>{userDisplayName.charAt(0).toUpperCase()}</Avatar>
                    </IconButton>
                </Box>

                {/* Выпадающее меню пользователя */}
                <Menu
                    anchorEl={anchorEl} // Привязка меню к аватару пользователя
                    id="account-menu"
                    open={open} // Управляет видимостью меню
                    onClose={handleClose} // Закрывает меню при потере фокуса или клике вне его
                    onClick={handleClose} // Закрывает меню при клике на любой элемент внутри
                    PaperProps={{ // Дополнительные стили для контейнера меню
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&:before': { // Создание "стрелки" меню
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    {/* Пункт меню для переключения темы */}
                    <MenuItem onClick={toggleTheme}>
                        <ListItemIcon>
                            {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                        </ListItemIcon>
                        {mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
                    </MenuItem>
                    <Divider /> {/* Разделитель */}
                    {/* Пункт меню для выхода из системы */}
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Выход
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
