import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/category.types';
import CategoryItem from './CategoryItem';
import CategoryForm from './CategoryForm';
import { useCreateCategoryMutation } from '../mutations/useCreateCategoryMutation';
import { useUpdateCategoryMutation } from '../mutations/useUpdateCategoryMutation';
import { useDeleteCategoryMutation } from '../mutations/useDeleteCategoryMutation';
import { getErrorCode } from '../utils/getErrorCode';
import Button from './common/Button';
import styles from './CategoryList.module.css';

interface Props {
  categories: Category[];
}

export default function CategoryList({ categories }: Props) {
  const { t } = useTranslation();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const defaultCategories = categories.filter((c) => c.isDefault);
  const customCategories = categories.filter((c) => !c.isDefault);

  const handleCreate = (name: string, icon: string) => {
    setCreateError('');
    createMutation.mutate(
      { name, icon },
      {
        onSuccess: () => setIsCreating(false),
        onError: (err) => {
          const code = getErrorCode(err);
          if (code === 'CATEGORY_NAME_DUPLICATE') {
            setCreateError(t('category.duplicateError'));
          } else {
            setCreateError(t('common.retry'));
          }
        },
      },
    );
  };

  const handleUpdate = (id: string, name: string, icon: string) => {
    updateMutation.mutate({ id, payload: { name, icon } });
  };

  const handleDelete = (id: string) => {
    setDeleteErrors((prev) => ({ ...prev, [id]: '' }));
    deleteMutation.mutate(id, {
      onError: (err) => {
        const code = getErrorCode(err);
        const msg =
          code === 'CATEGORY_HAS_TODOS'
            ? t('category.hasTodosError')
            : t('category.deleteError');
        setDeleteErrors((prev) => ({ ...prev, [id]: msg }));
      },
    });
  };

  return (
    <div className={styles.container}>
      <section>
        <h3 className={styles.sectionTitle}>{t('category.defaultSection')}</h3>
        <p className={styles.hint}>{t('category.defaultHint')}</p>
        <div className={styles.list}>
          {defaultCategories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={updateMutation.isPending}
            />
          ))}
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('category.mySection')}</h3>
          {!isCreating && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              {t('category.addNew')}
            </Button>
          )}
        </div>

        <div className={styles.list}>
          {customCategories.map((cat) => (
            <div key={cat.id}>
              <CategoryItem
                category={cat}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                isUpdating={updateMutation.isPending}
                isDeleting={deleteMutation.isPending}
              />
              {deleteErrors[cat.id] && (
                <p className={styles.deleteError}>{deleteErrors[cat.id]}</p>
              )}
            </div>
          ))}

          {customCategories.length === 0 && !isCreating && (
            <p className={styles.empty}>{t('category.noCustom')}</p>
          )}

          {isCreating && (
            <CategoryForm
              onSubmit={handleCreate}
              onCancel={() => { setIsCreating(false); setCreateError(''); }}
              isPending={createMutation.isPending}
              error={createError}
            />
          )}
        </div>
      </section>
    </div>
  );
}
