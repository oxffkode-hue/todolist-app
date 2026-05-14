import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryDisplayName } from '../utils/categoryName';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '../types/todo.types';
import type { Category } from '../types/category.types';
import Input from './common/Input';
import Button from './common/Button';
import styles from './TodoForm.module.css';

interface Props {
  initialData?: Todo;
  categories: Category[];
  onSubmit: (data: CreateTodoRequest | UpdateTodoRequest) => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string;
}

export default function TodoForm({ initialData, categories, onSubmit, onCancel, isPending, error }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? '');
  const [titleError, setTitleError] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const isEdit = !!initialData;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;

    if (!title.trim()) {
      setTitleError(t('todo.titleRequired'));
      valid = false;
    } else {
      setTitleError('');
    }

    if (!categoryId) {
      setCategoryError(t('todo.categoryRequired'));
      valid = false;
    } else {
      setCategoryError('');
    }

    if (!valid) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      categoryId,
      dueDate: dueDate || null,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        id="todo-title"
        label={t('todo.titleLabel')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('todo.titlePlaceholder')}
        error={titleError}
        autoFocus
      />

      <div className={styles.field}>
        <label htmlFor="todo-desc" className={styles.label}>{t('todo.descLabel')}</label>
        <textarea
          id="todo-desc"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('todo.descPlaceholder')}
          rows={3}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="todo-category" className={styles.label}>{t('todo.categoryLabel')}</label>
        <select
          id="todo-category"
          className={`${styles.select} ${categoryError ? styles.selectError : ''}`}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">{t('todo.categoryPlaceholder')}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.isDefault ? '▪' : '▫'} {getCategoryDisplayName(cat, t)}
            </option>
          ))}
        </select>
        {categoryError && <p className={styles.errorText}>{categoryError}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="todo-duedate" className={styles.label}>{t('todo.dueDateLabel')}</label>
        <input
          id="todo-duedate"
          type="date"
          className={styles.dateInput}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {error && <p className={styles.globalError}>{error}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={isPending} disabled={isPending}>
          {isEdit ? t('todo.editAction') : t('todo.saveAction')}
        </Button>
      </div>
    </form>
  );
}
