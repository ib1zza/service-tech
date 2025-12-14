import {JSX, lazy, Suspense, useEffect} from 'react'; // Импорт хуков React: `lazy` для ленивой загрузки, `Suspense` для отображения запасного контента во время загрузки, `useEffect` для побочных эффектов, `JSX` для типизации React-элементов
import {Routes, Route, Navigate, useNavigate} from 'react-router-dom'; // Импорт компонентов и хуков из React Router DOM для маршрутизации
import { CircularProgress, Box } from '@mui/material'; // Импорт компонентов Material-UI: `CircularProgress` для индикатора загрузки, `Box` для контейнера
import Layout from '../components/layout/Layout'; // Импорт компонента общей разметки приложения
import {useSelector} from "react-redux"; // Импорт хука `useSelector` для доступа к состоянию Redux
import {RootState} from "../store/store.ts"; // Импорт типа `RootState` для типизации состояния Redux
import {useAppDispatch} from "../store/hooks.ts"; // Пользовательский хук для получения функции `dispatch` из Redux
import {checkAuth} from "../store/authSlice.ts"; // Импорт экшена `checkAuth` для проверки аутентификации

// Ленивая загрузка компонентов страниц. Это помогает уменьшить размер начального бандла приложения,
// загружая код страницы только тогда, когда она действительно нужна.
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'));
const StaffAppeals = lazy(() => import('../pages/Staff/Appeals'));
const ClientAppeals = lazy(() => import('../pages/Client/Appeals'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const AboutPage = lazy(() => import('../pages/AboutPage'));

// Интерфейс для свойств компонента `ProtectedRoute`
interface AuthRouteProps {
    children: JSX.Element; // Дочерние элементы, которые будут рендериться, если пользователь авторизован
    roles?: Array<'admin' | 'staff' | 'client' | undefined>; // Массив ролей, которым разрешен доступ к маршруту
}

// Компонент `ProtectedRoute` используется для защиты маршрутов, требующих аутентификации и/или определенных ролей.
export function ProtectedRoute({ children, roles }: AuthRouteProps) {
    // Получаем состояние аутентификации и данные пользователя из Redux-хранилища.
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate(); // Хук для программной навигации.
    const dispatch = useAppDispatch(); // Хук для отправки экшенов Redux.
    // Флаг `loading` указывает, что происходит попытка загрузки пользователя по токену из localStorage,
    // если токен есть, но данные пользователя еще не загружены в Redux.
    const loading = !!(localStorage.getItem('token') && !user);

    // Эффект для проверки аутентификации при наличии токена, но отсутствии данных пользователя.
    useEffect(() => {
        if (localStorage.getItem('token') && !user && !loading) {
            dispatch(checkAuth()); // Отправляем экшен для проверки токена и загрузки данных пользователя.
        }
    }, [dispatch, user, loading]); // Зависимости: `dispatch`, `user`, `loading`.

    // Эффект для выполнения редиректов на основе статуса аутентификации и роли пользователя.
    useEffect(() => {
        if (!loading) { // Выполняем проверки только после завершения начальной загрузки пользователя.
            if (!isAuthenticated) {
                navigate('/login'); // Если не аутентифицирован, перенаправляем на страницу входа.
                return;
            }

            // Если для маршрута указаны роли и роль текущего пользователя не соответствует,
            // перенаправляем на страницу "Не найдено".
            if (roles && user?.role.role && !roles.includes(user.role.role)) {
                navigate('/not-found', { replace: true });
            }
        }
    }, [isAuthenticated, user, roles, navigate, loading]); // Зависимости: `isAuthenticated`, `user`, `roles`, `navigate`, `loading`.

    // Отображаем индикатор загрузки, если происходит начальная проверка аутентификации.
    if (loading) {
        return <div>Loading...</div>; // Можно заменить на более сложный компонент загрузки.
    }

    // Если пользователь аутентифицирован и его роль соответствует требованиям (или роли не указаны),
    // рендерим дочерние элементы. Иначе - ничего не рендерим (редирект уже произошел в `useEffect`).
    return isAuthenticated && (!roles || (user?.role.role && roles.includes(user.role.role)))
        ? children
        : null;
}

// Компонент `RoleBasedRedirect` автоматически перенаправляет пользователя
// на соответствующую страницу в зависимости от его сохраненной роли.
const RoleBasedRedirect = () => {
    const userRole = localStorage.getItem('userRole'); // Получаем роль пользователя из локального хранилища.

    switch(userRole) {
        case 'admin':
            return <Navigate to="/admin/dashboard" replace />; // Редирект для администратора.
        case 'staff':
            return <Navigate to="/staff/appeals" replace />; // Редирект для сотрудника.
        case 'client':
            return <Navigate to="/client/appeals" replace />; // Редирект для клиента.
        default:
            return <Navigate to="/login" replace />; // Если роль не определена, перенаправляем на вход.
    }
};

// Главный компонент `AppRouter` определяет все маршруты приложения.
export default function AppRouter() {
    return (
        // `Suspense` позволяет отображать запасной контент (`fallback`) во время загрузки
        // лениво загружаемых компонентов.
        <Suspense
            fallback={
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress /> {/* Индикатор загрузки */}
                </Box>
            }
        >
            <Routes> {/* Контейнер для всех маршрутов */}
                <Route path="/" element={<RoleBasedRedirect />} /> {/* Корневой маршрут для редиректа по роли */}
                <Route path="/login" element={<LoginPage />} /> {/* Маршрут для страницы входа */}

                {/* Группа маршрутов, использующих общий `Layout` */}
                <Route element={<Layout />}>
                    {/* Защищенные маршруты с проверкой ролей */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/staff/appeals"
                        element={
                            <ProtectedRoute roles={['staff']}>
                                <StaffAppeals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/client/appeals"
                        element={
                            <ProtectedRoute roles={['client']}>
                                <ClientAppeals />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/about"
                        element={
                            <ProtectedRoute roles={['admin', 'client', 'staff']}>
                                <AboutPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route path="/not-found" element={<NotFoundPage />} /> {/* Маршрут для страницы "Не найдено" */}
                <Route path="*" element={<Navigate to="/not-found" replace />} /> {/* Любой неопределенный маршрут перенаправляется на "Не найдено" */}
            </Routes>
        </Suspense>
    );
}
