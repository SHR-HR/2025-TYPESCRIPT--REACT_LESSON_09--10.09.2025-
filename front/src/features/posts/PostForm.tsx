import React, { useEffect, useState } from 'react'; // Импорт React и необходимых хуков
import type { AxiosProgressEvent } from 'axios'; // Импорт типа для событий прогресса загрузки Axios
import type { PostPayload } from '@/shared/types'; // Импорт типа данных для payload поста
import styles from './PostForm.module.scss'; // Импорт CSS модуля для стилей формы
import { apiRoot } from '@/api/http'; // Импорт корневого API клиента

// Интерфейс пропсов компонента PostForm
interface PostFormProps {
  onSubmit: (data: PostPayload) => Promise<void>; // Функция обработки отправки формы (асинхронная)
  initial?: Partial<PostPayload>; // Начальные данные для редактирования (опционально)
  submitText?: string; // Текст кнопки отправки (опционально)
}

// Константы для валидации файлов
const ACCEPT = 'image/png,image/jpeg,image/jpg,image/gif,image/webp'; // Разрешенные MIME типы изображений
const DEFAULT_AUTHOR = 'Студент'; // Значение автора по умолчанию
const MAX_SIZE_MB = 10; // Максимальный размер файла в мегабайтах
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024; // Максимальный размер файла в байтах

// Основной компонент формы поста
const PostForm: React.FC<PostFormProps> = ({ onSubmit, initial, submitText }) => {
  // Состояния для полей формы
  const [title, setTitle] = useState(initial?.title ?? ''); // Состояние заголовка
  const [content, setContent] = useState(initial?.content ?? ''); // Состояние содержания
  const [author, setAuthor] = useState(initial?.author ?? DEFAULT_AUTHOR); // Состояние автора
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? ''); // Состояние URL изображения
  const [file, setFile] = useState<File | null>(null); // Состояние выбранного файла

  // Состояния UI и статусов
  const [isSubmitting, setIsSubmitting] = useState(false); // Состояние отправки формы
  const [dragOver, setDragOver] = useState(false); // Состояние перетаскивания файла над областью
  const [fileError, setFileError] = useState<string | null>(null); // Состояние ошибки файла
  const [previewUrl, setPreviewUrl] = useState(''); // Состояние URL превью изображения

  // Состояния загрузки файла
  const [uploading, setUploading] = useState(false); // Состояние процесса загрузки
  const [uploadProgress, setUploadProgress] = useState(0); // Состояние прогресса загрузки

  // Эффект для создания превью изображения при выборе файла
  useEffect(() => {
    if (!file) { // Если файл не выбран
      setPreviewUrl(''); // Очищаем URL превью
      return; // Выходим из эффекта
    }
    const url = URL.createObjectURL(file); // Создаем Object URL для файла
    setPreviewUrl(url); // Устанавливаем URL превью
    return () => URL.revokeObjectURL(url); // Функция очистки - освобождаем Object URL
  }, [file]); // Зависимость от file

  // Эффект для сброса формы при изменении initial данных (редактирование)
  useEffect(() => {
    if (!initial) return; // Если initial не передан - выходим
    // Сбрасываем все поля формы к initial значениям
    setTitle(initial.title ?? '');
    setContent(initial.content ?? '');
    setAuthor(initial.author ?? DEFAULT_AUTHOR);
    setImageUrl(initial.image_url ?? '');
    setFile(null); // Сбрасываем выбранный файл
    setFileError(null); // Сбрасываем ошибку файла
    setUploadProgress(0); // Сбрасываем прогресс загрузки
    setUploading(false); // Сбрасываем статус загрузки
  }, [initial]); // Зависимость от initial

  // Функция валидации файла
  const validateFile = (f: File | null): string | null => {
    if (!f) return null; // Если файл null - ошибки нет
    if (f.type && !f.type.startsWith('image/')) return 'Можно загружать только изображения.'; // Проверка типа файла
    if (f.size > MAX_SIZE_BYTES) return `Файл больше ${MAX_SIZE_MB} MB.`; // Проверка размера файла
    return null; // Ошибок нет
  };

  // Функция установки выбранного файла с валидацией
  const setPickedFile = (f: File | null) => {
    const err = validateFile(f); // Валидируем файл
    setFileError(err); // Устанавливаем ошибку (или null)
    setFile(err ? null : f); // Устанавливаем файл только если ошибок нет
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы
    if (!title.trim() || !content.trim()) return; // Проверяем обязательные поля

    setIsSubmitting(true); // Устанавливаем статус отправки
    try {
      let finalImageUrl = imageUrl.trim() || undefined; // Финальный URL изображения

      // Если выбран файл для загрузки
      if (file) {
        const fd = new FormData(); // Создаем объект FormData
        fd.append('file', file); // Добавляем файл в FormData

        setUploading(true); // Устанавливаем статус загрузки
        setUploadProgress(0); // Сбрасываем прогресс загрузки

        // Отправляем файл на сервер
        const { data } = await apiRoot.post<{ url: string }>('/upload', fd, {
          onUploadProgress: (evt: AxiosProgressEvent) => { // Обработчик прогресса загрузки
            if (!evt.total) return; // Если общий размер неизвестен - выходим
            const percent = Math.min(100, Math.round((evt.loaded * 100) / evt.total)); // Вычисляем процент
            setUploadProgress(percent); // Устанавливаем прогресс
          },
        });

        finalImageUrl = data.url; // Получаем URL загруженного файла
        setUploading(false); // Сбрасываем статус загрузки
        setUploadProgress(100); // Устанавливаем прогресс 100%
        setTimeout(() => setUploadProgress(0), 1200); // Через 1.2 сек сбрасываем прогресс
      }

      // Вызываем переданную функцию onSubmit
      await onSubmit({
        title: title.trim(), // Передаем очищенный заголовок
        content: content.trim(), // Передаем очищенное содержание
        author: author.trim(), // Передаем очищенного автора
        image_url: finalImageUrl, // Передаем финальный URL изображения
      });

      // Если это создание нового поста (не редактирование)
      if (!initial) {
        // Сбрасываем форму
        setTitle('');
        setContent('');
        setAuthor(DEFAULT_AUTHOR);
        setImageUrl('');
        setFile(null);
        setFileError(null);
      }
    } finally {
      // В любом случае сбрасываем статусы
      setIsSubmitting(false);
      setUploading(false);
    }
  };

  // Рендер компонента
  return (
    <form className={styles.form} onSubmit={handleSubmit}> {/* Основная форма */}
      <h3 className={styles.title}>{initial ? 'Изменить пост' : 'Создать новый пост'}</h3> {/* Заголовок формы */}

      {/* Поле заголовка */}
      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>Заголовок *</label> {/* Метка поля */}
        <input
          id="title" // ID для связи с label
          type="text" // Тип поля - текст
          value={title} // Текущее значение
          onChange={(e) => setTitle(e.target.value)} // Обработчик изменения
          className={styles.input} // CSS класс
          placeholder="Введите заголовок поста" // Подсказка
          required // Обязательное поле
          maxLength={100} // Максимальная длина
        />
      </div>

      {/* Поле содержания */}
      <div className={styles.field}>
        <label htmlFor="content" className={styles.label}>Содержание *</label> {/* Метка поля */}
        <textarea
          id="content" // ID для связи с label
          value={content} // Текущее значение
          onChange={(e) => setContent(e.target.value)} // Обработчик изменения
          className={`${styles.input} ${styles.textarea}`} // CSS классы
          placeholder="Введите содержание поста" // Подсказка
          required // Обязательное поле
          maxLength={1000} // Максимальная длина
        />
      </div>

      {/* Поле автора */}
      <div className={styles.field}>
        <label htmlFor="author" className={styles.label}>Автор</label> {/* Метка поля */}
        <input
          id="author" // ID для связи с label
          type="text" // Тип поля - текст
          value={author} // Текущее значение
          onChange={(e) => setAuthor(e.target.value)} // Обработчик изменения
          className={styles.input} // CSS класс
          placeholder="Имя автора" // Подсказка
          maxLength={50} // Максимальная длина
        />
      </div>

      {/* Поле URL изображения */}
      <div className={styles.field}>
        <label htmlFor="image_url" className={styles.label}>URL картинки (необязательно)</label> {/* Метка поля */}
        <input
          id="image_url" // ID для связи с label
          type="url" // Тип поля - URL
          value={imageUrl} // Текущее значение
          onChange={(e) => setImageUrl(e.target.value)} // Обработчик изменения
          className={styles.input} // CSS класс
          placeholder="https://example.com/image.jpg" // Подсказка
        />
      </div>

      {/* === Область загрузки файла (Drag and Drop + клик по label) === */}
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Или загрузите файл (JPG/PNG/GIF/WEBP)</label> {/* Метка */}
          <span className={styles.hint}>до {MAX_SIZE_MB} MB</span> {/* Подсказка о размере */}
        </div>

        {/* Контейнер области перетаскивания */}
        <div
          className={`${styles.dropzone} ${dragOver ? styles.dropzoneOver : ''}`} // CSS классы с условием
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} // Обработчик перетаскивания над областью
          onDragLeave={() => setDragOver(false)} // Обработчик выхода из области
          onDrop={(e) => { // Обработчик отпускания файла
            e.preventDefault(); // Предотвращаем стандартное поведение
            setDragOver(false); // Сбрасываем статус перетаскивания
            setPickedFile(e.dataTransfer.files?.[0] ?? null); // Берем первый файл
          }}
        >
          {/* Скрытый input для выбора файла */}
          <input
            id="image_file" // ID для связи с label
            type="file" // Тип - файл
            accept={ACCEPT} // Разрешенные типы файлов
            className={styles.fileInput} // CSS класс
            onChange={(e) => setPickedFile(e.currentTarget.files?.[0] ?? null)} // Обработчик изменения
          />

          {/* Кликабельная область */}
          <label htmlFor="image_file" className={styles.dropzoneInner}>
            <span className={styles.dropzoneHint}>
              Перетащите файл сюда или нажмите для выбора {/* Текст подсказки */}
            </span>

            {/* Индикатор прогресса загрузки */}
            {uploading && (
              <div className={styles.progressWrap} aria-live="polite"> {/* Контейнер прогресса */}
                <div className={styles.progressTrack}> {/* Дорожка прогресса */}
                  <div className={styles.progressBar} style={{ width: `${uploadProgress}%` }} /> {/* Полоса прогресса */}
                </div>
                <span className={styles.progressText}>{uploadProgress}%</span> {/* Текст прогресса */}
              </div>
            )}
          </label>
        </div>

        {/* Превью изображения */}
        {(file || imageUrl) && (
          <div style={{ marginTop: 8 }}> {/* Контейнер превью */}
            <img
              src={file ? previewUrl : imageUrl} // Источник изображения
              alt="preview" // Альтернативный текст
              style={{ maxWidth: '100%', borderRadius: 8 }} // Inline стили
              onError={(ev) => (ev.currentTarget.style.display = 'none')} // Скрытие при ошибке загрузки
            />
          </div>
        )}

        {/* Отображение ошибки файла */}
        {fileError && <div className={styles.error}>{fileError}</div>}
      </div>

      {/* Кнопка отправки формы */}
      <button
        type="submit" // Тип - submit
        className={styles.submitButton} // CSS класс
        disabled={isSubmitting || uploading || !title.trim() || !content.trim() || !!fileError} // Условия блокировки
      >
        {isSubmitting ? (initial ? 'Сохранение…' : 'Создание…') : (submitText ?? 'Создать пост')} {/* Текст кнопки */}
      </button>
    </form>
  );
};

export default PostForm; // Экспорт компонента

// =============================================================================
// ПОЯСНЕНИЯ К КОММЕНТАРИЯМ
// =============================================================================

/*
ТИПЫ И ИНТЕРФЕЙСЫ:
- PostFormProps: Интерфейс пропсов компонента с обязательной функцией onSubmit и опциональными initial данными
- PostPayload: Тип данных, которые ожидает функция onSubmit (соответствует API)
- AxiosProgressEvent: Специальный тип события прогресса от библиотеки axios

СОСТОЯНИЯ КОМПОНЕНТА:
- Состояния полей формы: Управляют текущими значениями input/textarea
- Состояния UI: Управляют визуальными состояниями (загрузка, ошибки, превью)
- Состояния файла: Управляют выбранным файлом и процессом его загрузки

ВАЛИДАЦИЯ ФАЙЛОВ:
- ACCEPT: Строка с MIME типами для атрибута accept input[type=file]
- MAX_SIZE_MB: Лимит размера файла в мегабайтах для пользовательского сообщения
- MAX_SIZE_BYTES: Лимит размера файла в байтах для программной проверки

ЭФФЕКТЫ:
- Эффект превью: Создает и очищает Object URL для предпросмотра изображения
- Эффект сброса: Сбрасывает форму при получении новых initial данных

ОБРАБОТЧИКИ СОБЫТИЙ:
- handleSubmit: Основной обработчик отправки формы с логикой загрузки файла
- Валидация: Проверка типа и размера файла перед установкой
- Drag and Drop: Обработчики для современного UX загрузки файлов

ФОРМА И ПОЛЯ ВВОДА:
- Контролируемые компоненты: Все input/textarea управляются через state
- Валидация: HTML5 валидация через required и maxLength
- Доступность: Правильное использование label и id

ЗАГРУЗКА ФАЙЛОВ:
- FormData: Используется для отправки файлов через multipart/form-data
- Прогресс: Визуализация процесса загрузки с помощью axios onUploadProgress
- Обработка ошибок: try/catch/finally для устойчивости

СТИЛИЗАЦИЯ:
- CSS Modules: Изоляция стилей через импорт styles
- Условные классы: Динамическое применение стилей на основе состояния
- Inline стили: Для динамических свойств (ширина прогресса)

ДОСТУПНОСТЬ:
- aria-live: Для объявления изменений прогресса загрузки
- Правильные alt тексты: Для изображений превью
- Состояния disabled: Правильное управление доступностью кнопки

ОПТИМИЗАЦИЯ ПАМЯТИ:
- URL.revokeObjectURL: Освобождение памяти от созданных Object URL
- Очистка эффектов: Правильная работа с побочными эффектами

АСИНХРОННЫЕ ОПЕРАЦИИ:
- async/await: Современный синтаксис для работы с промисами
- Состояния загрузки: Правильное управление UI во время асинхронных операций
- Обработка ошибок: Грамотная обработка сценариев неудачи
*/


// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================
