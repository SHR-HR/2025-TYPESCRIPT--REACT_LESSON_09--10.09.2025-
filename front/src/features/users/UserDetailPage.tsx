// Импорт необходимых хуков и функций из React
import { useMemo, useState } from 'react';
// Импорт функций для навигации и работы с параметрами URL из React Router
import { useNavigate, useParams, NavLink } from 'react-router-dom';
// Импорт пользовательских хуков для работы с Redux store
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// Импорт действий и селекторов из слайса пользователей, а также типов
import { deleteUser, selectUserById, updateUser, type User, type UserRole } from './usersSlice';

// Основной компонент страницы детальной информации о пользователе
export default function UserDetailPage() {
    // Получение параметра ID из URL
    const { id = '' } = useParams();
    // Получение функции dispatch для отправки действий в Redux store
    const dispatch = useAppDispatch();
    // Получение функции navigate для программной навигации
    const navigate = useNavigate();

    // Мемоизированный селектор для получения пользователя по ID
    const user = useAppSelector(useMemo(() => selectUserById(id), [id]));
    // Локальное состояние формы для редактирования пользователя
    const [form, setForm] = useState<User | null>(user);

    // Проверка: если пользователь не найден или форма не инициализирована
    if (!user || !form) {
        return (
            // Контейнер с отступом сверху
            <div className="container" style={{ paddingTop: 16 }}>
                {/* Карточка с сообщением об ошибке */}
                <div className="card" style={{ padding: 20 }}>
                    {/* Заголовок */}
                    <h1 style={{ marginTop: 0 }}>Пользователь не найден</h1>
                    {/* Ссылка для возврата к списку пользователей */}
                    <NavLink to="/users" className="btn outline">← Назад к списку</NavLink>
                </div>
            </div>
        );
    }

    // Функция обработки изменения полей формы
    const onChange = (field: keyof User, value: string) => {
        // Обновление состояния формы с сохранением предыдущих значений
        setForm({ ...form, [field]: value });
    };

    // Функция сохранения изменений пользователя
    const onSave = () => {
        // Отправка действия обновления пользователя в Redux store
        dispatch(updateUser({
            id: form.id, // ID пользователя для обновления
            changes: { // Обновляемые поля
                name: form.name.trim(), // Имя с удалением пробелов
                email: form.email?.trim(), // Email с удалением пробелов (опционально)
                phone: form.phone?.trim(), // Телефон с удалением пробелов (опционально)
                group: form.group?.trim(), // Группа с удалением пробелов (опционально)
                role: form.role, // Роль пользователя
            }
        }));
        // Перенаправление на страницу списка пользователей после сохранения
        navigate('/users');
    };

    // Функция удаления пользователя
    const onDelete = () => {
        // Подтверждение удаления через браузерный confirm
        if (!confirm(`Удалить пользователя «${user.name}»?`)) return;
        // Отправка действия удаления пользователя в Redux store
        dispatch(deleteUser(user.id));
        // Перенаправление на страницу списка пользователей после удаления
        navigate('/users');
    };

    // Возврат JSX разметки компонента
    return (
        // Основной контейнер с отступом сверху
        <div className="container" style={{ paddingTop: 16 }}>
            {/* Карточка с заголовком страницы */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                {/* Заголовок страницы */}
                <h1 style={{ margin: 0 }}>Карточка пользователя</h1>
                {/* Описание страницы */}
                <div style={{ color: 'var(--color-text-muted)' }}>
                    Редактирование полей и удаление.
                </div>
            </div>

            {/* КЛАСС userCard — гарантирует читаемость инпутов в тёмной теме */}
            {/* Форма редактирования пользователя */}
            <div className="card userCard" style={{ padding: 20, maxWidth: 720 }}>
                {/* Сетка для расположения полей формы */}
                <div style={{ display: 'grid', gap: 12 }}>
                    {/* Поле для имени пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Имя</span>
                        <input
                            value={form.name} // Текущее значение имени
                            onChange={(e) => onChange('name', e.target.value)} // Обработчик изменения
                            placeholder="Имя" // Подсказка в поле ввода
                        />
                    </label>

                    {/* Поле для группы пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Группа</span>
                        <input
                            value={form.group ?? ''} // Текущее значение группы или пустая строка
                            onChange={(e) => onChange('group', e.target.value)} // Обработчик изменения
                            placeholder="JSE-242" // Подсказка в поле ввода
                        />
                    </label>

                    {/* Выпадающий список для выбора роли пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Роль</span>
                        <select
                            value={form.role} // Текущее значение роли
                            onChange={(e) => onChange('role', e.target.value as UserRole)} // Обработчик изменения с приведением типа
                        >
                            {/* Опция для роли "student" */}
                            <option value="student">student</option>
                            {/* Опция для роли "teacher" */}
                            <option value="teacher">teacher</option>
                            {/* Опция для роли "admin" */}
                            <option value="admin">admin</option>
                        </select>
                    </label>

                    {/* Поле для email пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Email</span>
                        <input
                            type="email" // Тип поля - email
                            value={form.email ?? ''} // Текущее значение email или пустая строка
                            onChange={(e) => onChange('email', e.target.value)} // Обработчик изменения
                            placeholder="name@example.com" // Подсказка в поле ввода
                        />
                    </label>

                    {/* Поле для телефона пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Телефон</span>
                        <input
                            value={form.phone ?? ''} // Текущее значение телефона или пустая строка
                            onChange={(e) => onChange('phone', e.target.value)} // Обработчик изменения
                            placeholder="+7 ..." // Подсказка в поле ввода
                        />
                    </label>
                </div>

                {/* Контейнер для кнопок действий */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    {/* Кнопка сохранения изменений */}
                    <button className="btn primary" onClick={onSave}>Сохранить</button>
                    {/* Ссылка для отмены редактирования */}
                    <NavLink to="/users" className="btn ghost">Отмена</NavLink>
                    {/* Кнопка удаления пользователя */}
                    <button className="btn danger" onClick={onDelete}>Удалить</button>
                </div>
            </div>
        </div>
    );
}

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ ================= */

/*
1. React Router:
   - useParams: хук для получения параметров из URL (в данном случае id пользователя)
   - useNavigate: хук для программной навигации между страницами
   - NavLink: компонент для навигации с дополнительными возможностями

2. Redux Integration:
   - useAppDispatch: хук для получения функции dispatch из Redux store
   - useAppSelector: хук для доступа к состоянию Redux store
   - useMemo: для мемоизации селектора и оптимизации производительности

3. Управление состоянием:
   - useState: хук для управления локальным состоянием формы
   - Двойное состояние: user (из Redux) и form (локальная копия для редактирования)

4. Валидация данных:
   - trim(): удаление пробелов в начале и конце строк для чистоты данных
   - Опциональные поля: email, phone, group могут быть null или undefined

5. Обработка событий:
   - onChange: универсальный обработчик для всех полей формы
   - onSave: обработчик сохранения изменений
   - onDelete: обработчик удаления пользователя с подтверждением

6. TypeScript типизация:
   - keyof User: гарантирует, что field является valid ключом интерфейса User
   - UserRole: тип для строгой проверки значений ролей

7. Условный рендеринг:
   - Проверка if (!user || !form) для обработки случая когда пользователь не найден

8. Стилизация:
   - Inline styles: используются для быстрой стилизации без CSS классов
   - CSS переменные: var(--color-text-muted) для согласованности цветовой схемы
   - Класс userCard: специальный класс для обеспечения читаемости в темной теме

9. Доступность:
   - Правильная структура label + input для accessibility
   - placeholder для подсказок пользователю

10. Безопасность:
    - Подтверждение удаления через window.confirm
    - Обработка optional полей через ?? '' (nullish coalescing)

11. Навигация:
    - navigate('/users') после успешного сохранения или удаления
    - NavLink для возврата к списку пользователей

12. Grid layout:
    - display: grid для формы обеспечивает равномерное расположение полей
    - gap: 12 для расстояния между элементами

13. Flexbox:
    - display: flex для кнопок действий
    - flex-wrap: wrap для адаптивности на мобильных устройствах

14. Максимальная ширина:
    - maxWidth: 720 для ограничения ширины формы на больших экранах

15. Обработка edge cases:
    - Проверка на существование пользователя перед рендерингом формы
    - Обработка optional полей (email, phone, group)

16. Структура компонента:
    - Четкое разделение на логические блоки: заголовок, форма, кнопки действий
    - Семантическая верстка с использованием правильных HTML тегов

17. Производительность:
    - useMemo для мемоизации селектора предотвращает лишние перерисовки
    - Локальное состояние формы предотвращает частые обновления Redux store

18. UX considerations:
    - Подтверждение перед удалением предотвращает случайные действия
    - Перенаправление после операций улучшает пользовательский опыт

19. Error handling:
    - Graceful degradation при отсутствии пользователя
    - Четкое сообщение об ошибке

20. Code organization:
    - Логичная последовательность: импорты, состояние, обработчики, JSX
    - Комментарии для пояснения ключевых моментов
*/


// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================

