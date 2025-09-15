// Импорт функции useState из библиотеки React для управления состоянием компонента
import { useState } from 'react';
// Импорт компонентов навигации и маршрутизации из react-router-dom
import { NavLink, Navigate, useNavigate } from 'react-router-dom';
// Импорт кастомного хука useAppDispatch для доступа к dispatch функции хранилища
import { useAppDispatch } from '@/store/hooks';
// Импорт действия addUser и типа UserRole из слайса пользователей
import { addUser, type UserRole } from './usersSlice';
// Импорт функции getRole для проверки роли пользователя
import { getRole } from '@/auth/role';

// Экспорт компонента страницы создания пользователя по умолчанию
export default function UsersCreatePage() {
    // Проверка роли пользователя - если не админ, перенаправляем на страницу пользователей
    if (getRole() !== 'admin') return <Navigate to="/users" replace />;

    // Получение функции dispatch из хранилища
    const dispatch = useAppDispatch();
    // Получение функции навигации для программного перехода между страницами
    const navigate = useNavigate();

    // Создание состояния формы с начальными значениями
    const [form, setForm] = useState({
        name: '', // Имя пользователя
        group: 'JSE-242', // Группа по умолчанию
        role: 'student' as UserRole, // Роль по умолчанию
        email: '', // Email
        phone: '', // Телефон
    });

    // Создание состояния для хранения ошибок
    const [error, setError] = useState<string | null>(null);

    // Функция обработки изменений в полях формы
    const onChange = (field: keyof typeof form, value: string) => {
        // Обновление состояния формы с сохранением предыдущих значений
        setForm(prev => ({ ...prev, [field]: value }));
    };

    // Функция обработки отправки формы
    const onSubmit = (e: React.FormEvent) => {
        // Предотвращение стандартного поведения формы (перезагрузки страницы)
        e.preventDefault();
        // Сброс ошибок
        setError(null);

        // Очистка и проверка имени пользователя
        const name = form.name.trim();
        if (!name) {
            // Установка ошибки если имя не указано
            setError('Укажите имя пользователя.');
            return;
        }

        // Диспатч действия добавления пользователя с данными из формы
        dispatch(addUser({
            name,
            group: form.group.trim() || 'JSE-242', // Использование группы по умолчанию если поле пустое
            role: form.role,
            email: form.email.trim(),
            phone: form.phone.trim(),
        }));

        // Перенаправление на страницу пользователей после успешного создания
        navigate('/users');
    };

    // Возвращаем JSX разметку компонента
    return (
        <div className="container" style={{ paddingTop: 16 }}>
            {/* Карточка с заголовком */}
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
                <h1 style={{ margin: 0 }}>Создать пользователя</h1>
                <div style={{ color: 'var(--color-text-muted)' }}>
                    Доступно только администратору.
                </div>
            </div>

            {/* Форма создания пользователя */}
            <form className="card userCard" style={{ padding: 20, maxWidth: 720 }} onSubmit={onSubmit}>
                <div style={{ display: 'grid', gap: 12 }}>
                    {/* Поле для имени пользователя */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Имя *</span>
                        <input
                            value={form.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            placeholder="Иван Иванов"
                            required
                        />
                    </label>

                    {/* Поле для группы */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Группа</span>
                        <input
                            value={form.group}
                            onChange={(e) => onChange('group', e.target.value)}
                            placeholder="JSE-242"
                        />
                    </label>

                    {/* Выпадающий список для выбора роли */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Роль</span>
                        <select
                            value={form.role}
                            onChange={(e) => onChange('role', e.target.value as UserRole)}
                        >
                            <option value="student">student</option>
                            <option value="teacher">teacher</option>
                            <option value="admin">admin</option>
                        </select>
                    </label>

                    {/* Поле для email */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => onChange('email', e.target.value)}
                            placeholder="name@example.com"
                        />
                    </label>

                    {/* Поле для телефона */}
                    <label style={{ display: 'grid', gap: 6 }}>
                        <span>Телефон</span>
                        <input
                            value={form.phone}
                            onChange={(e) => onChange('phone', e.target.value)}
                            placeholder="+7 ..."
                        />
                    </label>

                    {/* Блок отображения ошибок */}
                    {error && (
                        <div className="error" role="alert">{error}</div>
                    )}
                </div>

                {/* Кнопки действий */}
                <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <button className="btn primary" type="submit">Сохранить</button>
                    <NavLink to="/users" className="btn ghost">Отмена</NavLink>
                </div>
            </form>
        </div>
    );
}

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ =================

1. ИМПОРТЫ:
   - useState: Хук React для управления состоянием компонента
   - NavLink, Navigate, useNavigate: Компоненты и хуки для навигации между страницами
   - useAppDispatch: Кастомный хук для доступа к функции dispatch хранилища Redux
   - addUser, UserRole: Действие и тип из слайса пользователей
   - getRole: Функция для получения роли текущего пользователя

2. ПРОВЕРКА ПРАВ ДОСТУПА:
   - Компонент проверяет роль пользователя и перенаправляет не-админов
   - Navigate с replace=true заменяет текущую запись в истории браузера

3. УПРАВЛЕНИЕ СОСТОЯНИЕМ:
   - form: Объект состояния для хранения данных формы
   - error: Состояние для хранения сообщений об ошибках

4. ФУНКЦИЯ ONCHANGE:
   - Принимает имя поля и новое значение
   - Обновляет состояние формы через setForm
   - Использует spread оператор для сохранения неизмененных полей

5. ФУНКЦИЯ ONSUBMIT:
   - Обрабатывает отправку формы
   - Выполняет валидацию обязательного поля "name"
   - Диспатчит действие addUser с данными формы
   - Перенаправляет на страницу пользователей после успешного создания

6. JSX РАЗМЕТКА:
   - Использует CSS классы и inline стили для оформления
   - Содержит форму с пятью полями ввода
   - Имеет кнопки "Сохранить" и "Отмена"
   - Отображает ошибки валидации при их наличии

7. ДОСТУПНОСТЬ:
   - role="alert" для сообщений об ошибках улучшает доступность
   - required атрибут для обязательных полей формы

8. ТИПИЗАЦИЯ:
   - TypeScript обеспечивает типобезопасность
   - UserRole гарантирует корректные значения ролей
*/


// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================
