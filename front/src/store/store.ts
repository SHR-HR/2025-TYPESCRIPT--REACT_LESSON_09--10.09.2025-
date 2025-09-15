// Импорт функции configureStore из Redux Toolkit для создания хранилища
import { configureStore } from '@reduxjs/toolkit';
// Импорт редьюсера для работы с постами
import postsReducer from '@/features/posts/postsSlice';
// Импорт редьюсера для работы со студентами журнала
import studentsReducer from '@/features/journal/studentsSlice';
// Импорт редьюсера для работы с пользователями
import usersReducer from '@/features/users/usersSlice';

// ---- Функция загрузки состояния из localStorage ----
function loadState() {
    try {
        // Получаем сырые данные из localStorage по ключу 'journal_state'
        const raw = localStorage.getItem('journal_state');
        // Если данных нет, возвращаем undefined
        if (!raw) return undefined;
        // Парсим JSON строку в JavaScript объект
        const parsed = JSON.parse(raw);
        // Мягкая миграция: если раньше сохраняли только students — ок
        // Возвращаем объект с состояниями, используя оператор ?? для предоставления undefined если свойство отсутствует
        return {
            students: parsed.students ?? undefined,
            users: parsed.users ?? undefined,
        };
    } catch {
        // В случае ошибки при парсинге возвращаем undefined
        return undefined;
    }
}

// Создание и экспорт хранилища Redux
export const store = configureStore({
    // Объект редьюсеров для каждого среза состояния
    reducer: {
        posts: postsReducer,        // Редьюсер для постов
        students: studentsReducer,  // Редьюсер для студентов
        users: usersReducer,        // Редьюсер для пользователей ← НОВОЕ
    },
    // Предзагруженное состояние из localStorage
    preloadedState: loadState(),
    // Включение Redux DevTools для разработки
    devTools: true,
});

// ---- Подписка на изменения состояния для сохранения в localStorage ----
store.subscribe(() => {
    try {
        // Получаем текущее состояние хранилища
        const state = store.getState() as any;
        // Сохраняем оба среза, не трогаем posts
        localStorage.setItem(
            'journal_state', // Ключ для сохранения в localStorage
            // Сериализуем только необходимые срезы состояния в JSON строку
            JSON.stringify({ students: state.students, users: state.users }),
        );
    } catch { /* noop */ } // Игнорируем ошибки (no operation)
});

// Экспорт типа RootState на основе состояния хранилища
export type RootState = ReturnType<typeof store.getState>;
// Экспорт типа AppDispatch на основе dispatch функции хранилища
export type AppDispatch = typeof store.dispatch;



/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ =================

1. СТРУКТУРА ХРАНИЛИЩА:
   - Хранилище создается с помощью configureStore из Redux Toolkit
   - Объединяет несколько редьюсеров в единое состояние
   - Каждый редьюсер управляет своим срезом состояния

2. ПЕРСИСТЕНТНОСТЬ ДАННЫХ:
   - loadState: Загружает сохраненное состояние из localStorage при инициализации
   - store.subscribe: Автоматически сохраняет состояние в localStorage при изменениях
   - Используется ключ 'journal_state' для хранения данных

3. МЯГКАЯ МИГРАЦИЯ:
   - Оператор ?? (nullish coalescing) обрабатывает случаи когда в localStorage
     сохранены данные старого формата (только students)
   - Позволяет добавлять новые срезы без потери существующих данных

4. ВЫБОРОЧНОЕ СОХРАНЕНИЕ:
   - Сохраняются только students и users, posts не сохраняется
   - Это предотвращает сохранение больших или временных данных
   - posts обычно загружается из API и не требует сохранения

5. ОБРАБОТКА ОШИБОК:
   - try-catch блоки защищают от ошибок парсинга и записи в localStorage
   - В случае ошибок функции возвращают undefined или игнорируют ошибку

6. ТИПИЗАЦИЯ:
   - RootState: Тип всего состояния хранилища для типобезопасности
   - AppDispatch: Тип dispatch функции с учетом middleware

7. ИНСТРУМЕНТЫ РАЗРАБОТКИ:
   - devTools: true включает Redux DevTools Extension для отладки
   - Позволяет отслеживать actions и изменения состояния в браузере

8. АРХИТЕКТУРА:
   - Разделение ответственности между редьюсерами
   - Централизованное управление состоянием приложения
   - Поддержка persistence через localStorage
*/

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================

