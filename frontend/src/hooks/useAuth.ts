import { RootState } from '../store/store'; // Импортируем тип RootState из файла настроек Redux-хранилища
import {useAppSelector} from "../store/hooks.ts"; // Импортируем пользовательский хук useAppSelector для доступа к состоянию Redux

// Хук `useAuth` предоставляет удобный способ доступа к данным аутентификации пользователя
// и определения его роли в приложении.
export const useAuth = () => {
    // Используем `useAppSelector` для извлечения всей ветки `auth` из глобального состояния Redux.
    const auth = useAppSelector((state: RootState) => state.auth);

    // Возвращаем объект, который включает все свойства из `auth` (например, `user`, `token` и т.д.),
    // а также три дополнительных булевых флага для удобной проверки роли пользователя.
    return {
        ...auth, // Распространяем все свойства объекта `auth`
        // `isAdmin` будет `true`, если роль пользователя 'admin'.
        isAdmin: auth.user?.role.role === 'admin',
        // `isStaff` будет `true`, если роль пользователя 'staff'.
        isStaff: auth.user?.role.role === 'staff',
        // `isClient` будет `true`, если роль пользователя 'client'.
        isClient: auth.user?.role.role === 'client',
    };
};
