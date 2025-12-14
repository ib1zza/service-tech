import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'; // Импортируем хуки `useDispatch`, `useSelector` и тип `TypedUseSelectorHook` из `react-redux`
import type { RootState, AppDispatch } from './store'; // Импортируем типы `RootState` (для всего состояния Redux) и `AppDispatch` (для типизации функции `dispatch`) из файла настроек хранилища

// `useAppDispatch` - это типизированная версия стандартного хука `useDispatch`.
// Она возвращает типизированную функцию `dispatch`, которая знает о всех возможных экшенах в вашем приложении.
// Это помогает обеспечить строгую типизацию при отправке экшенов.
export const useAppDispatch = () => useDispatch<AppDispatch>();

// `useAppSelector` - это типизированная версия стандартного хука `useSelector`.
// Она позволяет выбирать части состояния Redux, при этом сохраняя строгую типизацию.
// `TypedUseSelectorHook<RootState>` гарантирует, что селектор будет работать с вашим `RootState`.
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
