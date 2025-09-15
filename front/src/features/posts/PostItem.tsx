// Импорт необходимых модулей и библиотек
import React from 'react';
// Импорт компонента Link для навигации без перезагрузки страницы
import { Link } from 'react-router-dom';
// Импорт типа Post для типизации
import type { Post } from '@/shared/types';
// Импорт стилей из SCSS модуля
import styles from './PostItem.module.scss';
// Импорт функции форматирования даты
import { formatLocalTimestamp } from '@/shared/date';

// Определение интерфейса для пропсов компонента PostItem
interface PostItemProps {
  // Объект поста
  post: Post;
  // Функция для обновления поста, принимает ID и частичные данные поста
  onUpdate: (id: Post['id'], patch: Partial<Post>) => Promise<void>;
  // Функция для удаления поста, принимает ID
  onDelete: (id: Post['id']) => Promise<void>;
}

// Константа для максимальной длины отрывка текста
const EXCERPT_LEN = 140;
// Функция для создания отрывка текста
const makeExcerpt = (s = '') =>
  // Если длина строки превышает максимальную, обрезаем и добавляем многоточие
  s.length > EXCERPT_LEN ? s.slice(0, EXCERPT_LEN).trimEnd() + '…' : s;

// Основной компонент PostItem
export const PostItem: React.FC<PostItemProps> = ({ post, onUpdate, onDelete }) => {
  // Обработчик для обновления поста
  const handleUpdate = () => onUpdate(post.id, { title: 'Обновлено!' });
  // Обработчик для удаления поста с подтверждением
  const handleDelete = () =>
    // Показываем окно подтверждения и если пользователь согласен, удаляем пост
    window.confirm('Вы уверены, что хотите удалить этот пост?') && onDelete(post.id);

  // Форматируем дату создания поста, если она существует
  const created = post.created_at ? formatLocalTimestamp(post.created_at) : null;
  // Форматируем дату обновления поста, если она существует
  const updated = post.updated_at ? formatLocalTimestamp(post.updated_at) : null;

  // Создаем URL для детальной страницы поста
  const detailsHref = `/posts/${encodeURIComponent(String(post.id))}`;
  // Создаем отрывок текста из содержимого поста
  const excerpt = makeExcerpt(post.content || '');

  // Возвращаем JSX разметку компонента
  return (
    // Основной контейнер статьи с применением стилей
    <article className={styles.card}>
      {/* Шапка статьи */}
      <header className={styles.header}>
        {/* Заголовок поста */}
        <h3 className={styles.title}>{post.title}</h3>

        {/* Контейнер для кнопок действий */}
        <div className={styles.actions}>
          {/* Ссылка для редактирования поста */}
          <Link
            to={`/edit/${encodeURIComponent(String(post.id))}`}
            className={styles.updateButton}
            title="Открыть страницу редактирования"
          >
            Редактировать
          </Link>
          {/* Кнопка для быстрого обновления поста */}
          <button type="button" onClick={handleUpdate} className={styles.updateButton}>
            Обновить
          </button>
          {/* Кнопка для удаления поста */}
          <button type="button" onClick={handleDelete} className={styles.deleteButton}>
            Удалить
          </button>
        </div>
      </header>

      {/* Блок-ссылка для перехода к полной версии поста в новой вкладке */}
      <Link
        to={detailsHref}
        target="_blank"
        rel="noopener"
        className={styles.teaserWrap}
        aria-label={`Открыть пост «${post.title}» в новой вкладке`}
      >
        {/* Условный рендеринг: если есть изображение, показываем его */}
        {post.image_url ? (
          <img
            src={post.image_url}
            alt=""
            className={styles.teaserImg}
            onError={(ev) => (ev.currentTarget.style.display = 'none')}
          />
        ) : (
          // Если изображения нет, показываем заглушку
          <div className={styles.teaserPlaceholder} />
        )}

        {/* Наложение поверх изображения с текстом */}
        <div className={styles.teaserOverlay} aria-hidden>
          {/* Подсказка о скрытом контенте */}
          <span className={styles.teaserHint}>Скрытый контент</span>
          {/* Кнопка призыва к действию */}
          <span className={`${styles.cta} btn primary sm`}>Открыть пост →</span>
        </div>
      </Link>

      {/* Условный рендеринг отрывка текста, если он не пустой */}
      {!!excerpt && <p className={styles.excerpt}>{excerpt}</p>}

      {/* Подвал статьи с мета-информацией */}
      <footer className={styles.meta}>
        {/* Информация об авторе */}
        <span className={styles.author}>Автор: {post.author || 'Неизвестно'}</span>
        {/* Контейнер для временных меток */}
        <div className={styles.timestamps}>
          {/* Дата создания, если существует */}
          {created && <span>Создан: {created}</span>}
          {/* Дата обновления, если существует */}
          {updated && <span>Обновлён: {updated}</span>}
        </div>
      </footer>
    </article>
  );
};

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ ================= */

/*
1. React.FC<PostItemProps>:
   Типизация функционального компонента React с указанием пропсов.
   Обеспечивает проверку типов и автодополнение в IDE.

2. Хуки и обработчики событий:
   handleUpdate и handleDelete - функции-обработчики для кнопок.
   Используют переданные через пропсы функции onUpdate и onDelete.

3. Условный рендеринг:
   {post.image_url ? (...) : (...)} - показывает изображение или заглушку.
   {!!excerpt && ...} - показывает отрывок только если он не пустой.
   {created && ...} - показывает дату только если она существует.

4. Кодирование URL:
   encodeURIComponent(String(post.id)) - безопасное кодирование ID для URL.

5. Доступность (accessibility):
   aria-label - описание для screen readers.
   aria-hidden - скрывает декоративные элементы от screen readers.
   alt="" - пустой alt для декоративных изображений.

6. Обработка ошибок изображений:
   onError={(ev) => (ev.currentTarget.style.display = 'none')} - скрывает
   битое изображение.

7. Стилизация через CSS Modules:
   styles.card, styles.header и т.д. - уникальные имена классов для
   избежания конфликтов стилей.

8. Форматирование даты:
   formatLocalTimestamp - преобразует timestamp в удобочитаемый формат
   с учетом локали пользователя.

9. Безопасность:
   rel="noopener" - защита от уязвимостей при открытии в новой вкладке.

10. Подтверждение действий:
    window.confirm() - нативное браузерное подтверждение перед удалением.

11. Семантическая верстка:
    <article>, <header>, <footer> - семантические теги для улучшения
    SEO и доступности.

12. Управление состоянием:
    Компонент получает все данные через пропсы (props), что делает его
    контролируемым и предсказуемым.

13. Асинхронные операции:
    onUpdate и onDelete возвращают Promise<void>, что позволяет обрабатывать
    асинхронные операции (запросы к API).

14. Локализация:
    Все тексты на русском языке, включая сообщения подтверждения и метки.

15. Оптимизация:
    Функция makeExcerpt вынесена за пределы компонента для избежания
    пересоздания при каждом рендере.
*/


// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================


