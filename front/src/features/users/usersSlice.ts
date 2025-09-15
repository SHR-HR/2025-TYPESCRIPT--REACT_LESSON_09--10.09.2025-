// Импорт функций и типов из Redux Toolkit для создания слайса
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
// Импорт типа RootState из файла хранилища
import type { RootState } from '@/store/store';

// Определение типа для ролей пользователей
export type UserRole = 'student' | 'teacher' | 'admin';

// Определение интерфейса для пользователя
export interface User {
    id: string; // Уникальный идентификатор пользователя
    name: string; // Имя пользователя (обязательное поле)
    email?: string; // Email пользователя (необязательное поле)
    phone?: string; // Телефон пользователя (необязательное поле)
    group?: string; // Группа пользователя (например, JSE-242) (необязательное поле)
    role: UserRole; // Роль пользователя
}

// Определение интерфейса для состояния пользователей
export interface UsersState {
    users: User[]; // Массив пользователей
}

// Функция для создания демонстрационных данных пользователей
const demo = (): User[] => ([
    // Демонстрационные пользователи с разными данными
    { id: nanoid(), name: 'Иван Иванов', email: 'ivan@example.com', phone: '+7 705 111-11-11', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Алексей Петров', email: 'alex@example.com', phone: '+7 778 222-22-22', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Мария Сидорова', email: 'maria@example.com', phone: '+7 701 333-33-33', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Анна Ковалёва', email: 'anna@example.com', phone: '+7 700 444-44-44', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Дмитрий Орлов', email: 'dmitry@example.com', phone: '+7 702 555-55-55', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Екатерина Смирнова', email: 'kate@example.com', phone: '+7 777 666-66-66', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Сергей Павлов', email: 'serg@example.com', phone: '+7 775 777-77-77', group: 'JSE-242', role: 'student' },
    { id: nanoid(), name: 'Игорь Соколов', email: 'teacher@example.com', phone: '+7 706 888-88-88', group: 'JSE-242', role: 'teacher' },
    { id: nanoid(), name: 'Администратор', email: 'admin@example.com', phone: '+7 703 999-99-99', group: 'JSE-242', role: 'admin' },
]);

// Определение начального состояния
const initialState: UsersState = {
    users: demo(), // Инициализация массива пользователей демонстрационными данными
};

// Создание слайса для управления состоянием пользователей
const usersSlice = createSlice({
    name: 'users', // Имя слайса
    initialState, // Начальное состояние
    reducers: { // Редукторы (редьюсеры) для обработки действий
        // Действие для добавления нового пользователя
        addUser: {
            // Функция prepare для подготовки payload перед передачей в reducer
            prepare(partial: Partial<User>) {
                return {
                    payload: {
                        id: nanoid(), // Генерация уникального ID
                        role: partial.role ?? 'student', // Роль по умолчанию 'student'
                        name: partial.name ?? 'Новый пользователь', // Имя по умолчанию
                        email: partial.email ?? '', // Email по умолчанию (пустая строка)
                        phone: partial.phone ?? '', // Телефон по умолчанию (пустая строка)
                        group: partial.group ?? 'JSE-242', // Группа по умолчанию
                    } as User, // Приведение типа к User
                };
            },
            // Редуктор для добавления пользователя в состояние
            reducer(state, { payload }: PayloadAction<User>) {
                state.users.unshift(payload); // Добавление пользователя в начало массива
            },
        },
        // Действие для обновления данных пользователя
        updateUser(state, { payload }: PayloadAction<{ id: string; changes: Partial<User> }>) {
            // Поиск пользователя по ID
            const u = state.users.find(x => x.id === payload.id);
            // Если пользователь найден, обновление его свойств
            if (u) Object.assign(u, payload.changes);
        },
        // Действие для удаления пользователя
        deleteUser(state, { payload }: PayloadAction<string>) {
            // Фильтрация массива пользователей - удаление пользователя с указанным ID
            state.users = state.users.filter(x => x.id !== payload);
        },
    },
});

// Экспорт действий (action creators)
export const { addUser, updateUser, deleteUser } = usersSlice.actions;
// Экспорт редьюсера по умолчанию
export default usersSlice.reducer;

// -------- Селекторы --------
// Селектор для получения всех пользователей
export const selectUsers = (s: RootState) => s.users.users;
// Селектор для получения пользователя по ID (возвращает null если не найден)
export const selectUserById = (id: string) => (s: RootState) =>
    s.users.users.find(u => u.id === id) || null;

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ =================

1. СТРУКТУРА СЛАЙСА:
   - Слайс (slice) - это часть Redux хранилища, содержащая редьюсеры и действия
   - Создается с помощью createSlice из Redux Toolkit
   - Включает имя, начальное состояние и редьюсеры

2. ТИПЫ ДАННЫХ:
   - UserRole: Перечисление возможных ролей пользователя
   - User: Интерфейс описывающий структуру объекта пользователя
   - UsersState: Интерфейс для состояния модуля пользователей

3. ДЕМО-ДАННЫЕ:
   - Функция demo() создает массив демонстрационных пользователей
   - nanoid() генерирует уникальные идентификаторы
   - Включает пользователей с разными ролями (student, teacher, admin)

4. РЕДЬЮСЕРЫ:
   - addUser: Действие с prepare функцией для подготовки данных
   - updateUser: Действие для частичного обновления пользователя
   - deleteUser: Действие для удаления пользователя по ID

5. ПОДГОТОВКА ДАННЫХ:
   - Оператор ?? (nullish coalescing) предоставляет значения по умолчанию
   - Partial<User> позволяет передавать частичные объекты пользователя

6. ИММУТАБЕЛЬНЫЕ ОБНОВЛЕНИЯ:
   - Redux Toolkit использует Immer для "мутабельного" синтаксиса
   - Фактически обновления остаются иммутабельными

7. СЕЛЕКТОРЫ:
   - selectUsers: Возвращает весь массив пользователей
   - selectUserById: Фабрика селекторов для поиска пользователя по ID
   - Селекторы принимают состояние всего приложения (RootState)

8. ЭКСПОРТЫ:
   - Экспортируются действия для диспетчеризации
   - Экспортируется редьюсер для подключения к хранилищу
   - Экспортируются селекторы для доступа к данным
*/


// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================
