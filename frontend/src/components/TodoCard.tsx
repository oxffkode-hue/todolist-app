import { useTranslation } from 'react-i18next';
import type { Todo } from '../types/todo.types';
import styles from './TodoCard.module.css';

interface Props {
  todo: Todo;
  categoryName: string;
  isDefault?: boolean;
  onToggle?: (id: string, isCompleted: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

function formatDate(raw: string): string {
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toISOString().slice(0, 10);
}

export default function TodoCard({ todo, categoryName, isDefault, onToggle, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <div className={`${styles.card} ${todo.isCompleted ? styles.completed : ''}`}>
      <button
        className={`${styles.checkbox} ${todo.isCompleted ? styles.checked : ''}`}
        onClick={() => onToggle?.(todo.id, !todo.isCompleted)}
        aria-label={todo.isCompleted ? t('todo.markIncomplete') : t('todo.markComplete')}
        aria-pressed={todo.isCompleted}
      >
        {todo.isCompleted && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className={styles.content}>
        <p className={styles.title}>{todo.title}</p>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${isDefault ? styles.badgeDefault : styles.badgeCustom}`}>
            {categoryName}
          </span>
          <span className={styles.dueDate}>
            {todo.dueDate ? `📅 ${formatDate(todo.dueDate)}` : t('todo.noDueDate')}
          </span>
        </div>
      </div>
      <div className={styles.actions}>
        {onEdit && (
          <button className={styles.actionBtn} onClick={() => onEdit(todo)}>
            {t('common.edit')}
          </button>
        )}
        {onDelete && (
          <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => onDelete(todo.id)}>
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  );
}
