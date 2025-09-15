import { useEffect, useState } from 'react'; // Импорт хуков useEffect и useState из React
import { useParams, Link } from 'react-router-dom'; // Импорт хука useParams для получения параметров URL и компонента Link для навигации
import { apiClient } from '@/api/http'; // Импорт HTTP-клиента для выполнения запросов к API
import type { Post } from '@/shared/types'; // Импорт типа Post для типизации
import { formatLocalTimestamp } from '@/shared/date'; // Импорт функции форматирования даты

// Если в дальнейшем будут в проекте модульные стили для детальной страницы, можно оставь импорт тут:
// import styles from './PostDetailsPage.module.scss';

// Компонент страницы деталей поста
const PostDetailsPage = () => {
    const { id } = useParams<{ id: string }>(); // Получение параметра id из URL
    const [post, setPost] = useState<Post | null>(null); // Состояние для хранения данных поста
    const [err, setErr] = useState<string | null>(null); // Состояние для хранения ошибки
    const [loading, setLoading] = useState(true); // Состояние для отображения загрузки

    // NEW: скроллимся к началу при смене id
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Плавная прокрутка к верху страницы при изменении id
    }, [id]); // Зависимость от id

    // Эффект для загрузки данных поста
    useEffect(() => {
        let cancelled = false; // Флаг для отмены запроса при размонтировании компонента
        (async () => { // Асинхронная функция для загрузки данных
            try {
                setErr(null); // Сброс ошибки перед запросом
                const { data } = await apiClient.get<Post>(`/${id}`); // GET запрос к API для получения поста по id
                if (!cancelled) setPost(data); // Установка данных поста, если компонент не размонтирован
            } catch {
                if (!cancelled) setErr('Не удалось получить пост'); // Установка ошибки, если запрос не удался
            } finally {
                if (!cancelled) setLoading(false); // Завершение загрузки в любом случае
            }
        })();
        return () => { // Функция очистки эффекта
            cancelled = true; // Установка флага отмены при размонтировании компонента
        };
    }, [id]); // Зависимость от id

    // NEW: эффект для установки заголовка вкладки браузера
    useEffect(() => {
        const prev = document.title; // Сохранение предыдущего заголовка
        if (post?.title) document.title = `${post.title} — Posts`; // Установка нового заголовка с названием поста
        return () => { // Функция очистки эффекта
            document.title = prev; // Восстановление предыдущего заголовка при размонтировании
        };
    }, [post?.title]); // Зависимость от заголовка поста

    // NEW: состояние и функция для копирования ссылки
    const [copied, setCopied] = useState(false); // Состояние для отображения статуса копирования
    const handleCopyLink = async () => { // Асинхронная функция для копирования ссылки
        try {
            await navigator.clipboard.writeText(window.location.href); // Копирование текущего URL в буфер обмена
            setCopied(true); // Установка статуса "скопировано"
            setTimeout(() => setCopied(false), 1500); // Сброс статуса через 1.5 секунды
        } catch {
            // Фолбэк, если clipboard недоступен
            window.prompt('Скопируйте ссылку на пост:', window.location.href); // Показ диалога с ссылкой для ручного копирования
        }
    };

    if (loading) return <div className="loading">Загрузка…</div>; // Отображение состояния загрузки
    if (err || !post) return <div className="error">{err ?? 'Пост не найден'}</div>; // Отображение ошибки или отсутствия поста

    const created = post.created_at ? formatLocalTimestamp(post.created_at) : null; // Форматирование даты создания
    const updated = post.updated_at ? formatLocalTimestamp(post.updated_at) : null; // Форматирование даты обновления

    // Если буду использовать module.scss — то нужно заменить inline-стили на классы из него.
    return (
        <article className="card" style={{ maxWidth: 800, margin: '0 auto' }}> {/* Основной контейнер статьи */}
            <h1 style={{ marginBottom: 6, textAlign: 'center' }}>{post.title}</h1> {/* Заголовок поста */}
            <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 16 }}>
                Автор: {post.author || 'Неизвестно'} {/* Информация об авторе */}
            </p>

            {post.image_url && ( // Условный рендеринг изображения, если URL существует
                <div style={{ margin: '0 auto 16px', maxWidth: 'min(100%, 860px)' }}> {/* Контейнер для изображения */}
                    <img
                        src={post.image_url} // URL изображения
                        alt="" // Пустой alt для декоративных изображений
                        style={{ display: 'block', margin: '0 auto', maxWidth: '100%', borderRadius: 12 }} // Стили изображения
                        onError={(ev) => (ev.currentTarget.style.display = 'none')} // Скрытие изображения при ошибке загрузки
                    />
                </div>
            )}

            <div // Контейнер для содержимого поста
                style={{
                    whiteSpace: 'pre-wrap', // Сохранение пробелов и переносов
                    marginTop: 8, // Отступ сверху
                    textAlign: 'center', // Выравнивание по центру
                    color: 'var(--color-text-primary)', // Цвет текста
                    lineHeight: 1.7, // Межстрочный интервал
                }}
            >
                {post.content} {/* Содержимое поста */}
            </div>

            <div // Контейнер для мета-информации (даты создания и обновления)
                style={{
                    marginTop: 16, // Отступ сверху
                    color: 'var(--color-text-muted)', // Приглушенный цвет текста
                    fontSize: 14, // Размер шрифта
                    display: 'flex', // Flex-контейнер
                    gap: 12, // Расстояние между элементами
                    justifyContent: 'center', // Выравнивание по центру
                    flexWrap: 'wrap', // Перенос на новую строку при необходимости
                }}
            >
                {created && <span>Создан: {created}</span>} {/* Дата создания */}
                {updated && <span>Обновлён: {updated}</span>} {/* Дата обновления */}
            </div>

            <div // Контейнер для кнопок действий
                style={{
                    marginTop: 16, // Отступ сверху
                    display: 'flex', // Flex-контейнер
                    gap: 8, // Расстояние между кнопками
                    justifyContent: 'center', // Выравнивание по центру
                    flexWrap: 'wrap', // Перенос на новую строку при необходимости
                }}
            >
                <Link className="btn outline" to="/"> {/* Кнопка "Назад" */}
                    ← Назад
                </Link>
                <Link className="btn primary" to={`/edit/${encodeURIComponent(String(post.id))}`}> {/* Кнопка "Редактировать" */}
                    Редактировать
                </Link>
                <button type="button" className="btn outline" onClick={handleCopyLink}> {/* Кнопка "Скопировать ссылку" */}
                    {copied ? 'Скопировано!' : 'Скопировать ссылку'} {/* Динамический текст кнопки */}
                </button>
            </div>
        </article>
    );
};

export default PostDetailsPage; // Экспорт компонента по умолчанию

/* ===== ПОЯСНЕНИЯ К КОММЕНТАРИЯМ ===== */

/*
HOOKS (ХУКИ):
- useEffect: Используется для выполнения побочных эффектов (загрузка данных, изменение заголовка, прокрутка)
- useState: Используется для управления состоянием компонента (данные, ошибки, загрузка)

НАВИГАЦИЯ И ПАРАМЕТРЫ:
- useParams: Хук для получения параметров из URL (в данном случае id поста)
- Link: Компонент для навигации без перезагрузки страницы

ЗАПРОСЫ ДАННЫХ:
- apiClient: Преднастроенный HTTP-клиент для взаимодействия с API
- async/await: Синтаксис для работы с асинхронными операциями
- try/catch/finally: Обработка успешных и неуспешных сценариев запроса

УПРАВЛЕНИЕ СОСТОЯНИЕМ:
- Состояние loading: Отслеживает процесс загрузки данных
- Состояние err: Хранит сообщение об ошибке
- Состояние post: Хранит данные полученного поста
- Состояние copied: Отслеживает статус копирования ссылки

ОБРАБОТКА СБОЕВ:
- Отмена запроса: Предотвращает установку состояния после размонтирования компонента
- Фолбэк для clipboard: Альтернативный способ копирования через prompt
- Обработка ошибок изображений: Скрытие битых изображений

ФОРМАТИРОВАНИЕ:
- formatLocalTimestamp: Функция для преобразования даты в читаемый формат
- Условный рендеринг: Показ элементов только при наличии данных

СТИЛИЗАЦИЯ:
- Inline-стили: Используются для быстрой стилизации без CSS-классов
- CSS-переменные: Используются для согласованной цветовой схемы
- Flexbox: Для гибкого расположения элементов

ДОСТУПНОСТЬ:
- alt="": Пустой alt для декоративных изображений
- Четкие тексты кнопок: Понятные labels для действий

ПРОИЗВОДИТЕЛЬНОСТЬ:
- Зависимости useEffect: Оптимизация повторных выполнений эффектов
- Таймаут для copied: Автоматический сброс состояния через 1.5 секунды

ТИПИЗАЦИЯ:
- TypeScript: Строгая типизация пропсов и состояния
- import type: Оптимизация импорта только типов

АРХИТЕКТУРА:
- Разделение ответственности: Отдельные эффекты для разных задач
- Чистые функции: Функции без побочных эффектов
- Компонентная структура: Логичная организация кода
*/

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================



