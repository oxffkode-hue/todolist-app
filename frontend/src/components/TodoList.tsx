import { useTranslation } from 'react-i18next';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';
import TodoCard from './TodoCard';
import { getCategoryDisplayName } from '../utils/categoryName';
import styles from './TodoList.module.css';

interface Props {
  todos: Todo[];
  categories: Category[];
  isFiltered?: boolean;
  onToggle?: (id: string, isCompleted: boolean) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
}

export default function TodoList({ todos, categories, isFiltered, onToggle, onEdit, onDelete }: Props) {
  const { t } = useTranslation();

  const findCategory = (categoryId: string) =>
    categories.find((c) => c.id === categoryId);

  if (todos.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyIcon}>📋</p>
        <p className={styles.emptyText}>
          {isFiltered ? t('todo.emptyFiltered') : t('todo.empty')}
        </p>
        {isFiltered && (
          <p className={styles.emptyHint}>{t('todo.emptyHint')}</p>
        )}
      </div>
    );
  }

  return (
    <ul className={styles.list}>
      {todos.map((todo) => {
        const category = findCategory(todo.categoryId);
        return (
          <li key={todo.id} className={styles.item}>
            <TodoCard
              todo={todo}
              categoryName={category ? getCategoryDisplayName(category, t) : t('todo.unknownCategory')}
              isDefault={category?.isDefault}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        );
      })}
    </ul>
  );
}
