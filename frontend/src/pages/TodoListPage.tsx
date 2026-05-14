import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../stores/uiStore';
import { useTodosQuery } from '../queries/useTodosQuery';
import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import { useDeleteTodoMutation } from '../mutations/useDeleteTodoMutation';
import { useToggleTodoMutation } from '../mutations/useToggleTodoMutation';
import FilterPanel from '../components/FilterPanel';
import TodoList from '../components/TodoList';
import TodoDetail from '../components/TodoDetail';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import Modal from '../components/common/Modal';
import type { Todo } from '../types/todo.types';
import styles from './TodoListPage.module.css';

export default function TodoListPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const activeFilter = useUiStore((s) => s.activeFilter);
  const setFilter = useUiStore((s) => s.setFilter);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | undefined>(undefined);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      setFilter({ ...activeFilter, categoryId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const { data: todos = [], isLoading, isError } = useTodosQuery(activeFilter);
  const { data: categories = [] } = useCategoriesQuery();
  const deleteMutation = useDeleteTodoMutation();
  const toggleMutation = useToggleTodoMutation();

  const isFiltered =
    !!activeFilter.categoryId ||
    activeFilter.isCompleted !== undefined ||
    !!activeFilter.dueDateFrom ||
    !!activeFilter.dueDateTo;

  const completedCount = todos.filter((t) => t.isCompleted).length;
  const pendingCount = todos.length - completedCount;

  const handleOpenCreate = () => {
    setSelectedTodo(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedTodo(undefined);
  };

  const handleDelete = (id: string) => {
    setSelectedDeleteId(id);
  };

  const handleToggle = (id: string, isCompleted: boolean) => {
    toggleMutation.mutate({ id, isCompleted });
  };

  return (
    <div className={styles.page}>
      <FilterPanel />

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2 className={styles.heading}>{t('todo.listTitle')}</h2>
          <div className={styles.headerRight}>
            {todos.length > 0 && (
              <p className={styles.summary}>
                {t('todo.summary', { total: todos.length, pending: pendingCount, completed: completedCount })}
              </p>
            )}
            <Button size="sm" onClick={handleOpenCreate} className={styles.addBtnDesktop}>
              {t('todo.addNew')}
            </Button>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        {isError && <ErrorMessage message={t('todo.loadError')} />}
        {!isLoading && !isError && (
          <TodoList
            todos={todos}
            categories={categories}
            isFiltered={isFiltered}
            onToggle={handleToggle}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <Button size="sm" onClick={handleOpenCreate} className={styles.addBtnFixed}>
        {t('todo.addNew')}
      </Button>

      <TodoDetail
        isOpen={isFormOpen}
        todo={selectedTodo}
        categories={categories}
        onClose={handleCloseForm}
      />

      <Modal
        isOpen={!!selectedDeleteId}
        title={t('todo.deleteTitle')}
        confirmLabel={t('common.delete')}
        confirmVariant="danger"
        onConfirm={() => {
          deleteMutation.mutate(selectedDeleteId!);
          setSelectedDeleteId(null);
        }}
        onCancel={() => setSelectedDeleteId(null)}
      >
        {t('todo.deleteConfirm')}
      </Modal>
    </div>
  );
}
