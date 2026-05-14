import { useTranslation } from 'react-i18next';
import type { Todo } from '../types/todo.types';
import type { Category } from '../types/category.types';
import { useCreateTodoMutation } from '../mutations/useCreateTodoMutation';
import { useUpdateTodoMutation } from '../mutations/useUpdateTodoMutation';
import { getErrorCode } from '../utils/getErrorCode';
import TodoForm from './TodoForm';
import styles from './TodoDetail.module.css';

interface Props {
  isOpen: boolean;
  todo?: Todo;
  categories: Category[];
  onClose: () => void;
}

export default function TodoDetail({ isOpen, todo, categories, onClose }: Props) {
  const { t } = useTranslation();
  const createMutation = useCreateTodoMutation();
  const updateMutation = useUpdateTodoMutation();

  if (!isOpen) return null;

  const isEdit = !!todo;
  const mutation = isEdit ? updateMutation : createMutation;

  const getError = () => {
    if (!mutation.error) return undefined;
    const code = getErrorCode(mutation.error);
    if (code === 'TODO_FORBIDDEN' || mutation.error instanceof Error) {
      const status = (mutation.error as { response?: { status?: number } }).response?.status;
      if (status === 403) return t('todo.forbiddenError');
    }
    return t('common.retry');
  };

  const handleSubmit = (data: import('../types/todo.types').CreateTodoRequest | import('../types/todo.types').UpdateTodoRequest) => {
    if (isEdit && todo) {
      updateMutation.mutate(
        { id: todo.id, data: data as import('../types/todo.types').UpdateTodoRequest },
        { onSuccess: onClose },
      );
    } else {
      createMutation.mutate(data as import('../types/todo.types').CreateTodoRequest, {
        onSuccess: onClose,
      });
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? t('todo.editTitle') : t('todo.createTitle')}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label={t('todo.close')}>
            ×
          </button>
        </div>
        <TodoForm
          initialData={todo}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={mutation.isPending}
          error={getError()}
        />
      </div>
    </div>
  );
}
