import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../types/category.types';
import CategoryForm from './CategoryForm';
import { getCategoryDisplayName } from '../utils/categoryName';
import { TagIcon, getCategoryIconComponent } from './common/CategoryIcons';
import styles from './CategoryItem.module.css';

interface Props {
  category: Category;
  onUpdate: (id: string, name: string, icon: string) => void;
  onDelete: (id: string) => void;
  updateError?: string;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function CategoryItem({
  category,
  onUpdate,
  onDelete,
  updateError,
  isUpdating,
  isDeleting,
}: Props) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (name: string, icon: string) => {
    onUpdate(category.id, name, icon);
    setIsEditing(false);
  };

  const IconComponent = category.isDefault ? TagIcon : getCategoryIconComponent(category.icon);

  if (isEditing) {
    return (
      <CategoryForm
        initialName={category.name}
        initialIcon={category.icon}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
        isPending={isUpdating}
        error={updateError}
      />
    );
  }

  return (
    <div className={styles.item}>
      <span className={styles.name}>
        <span className={styles.icon}>
          <IconComponent size={14} />
        </span>
        {getCategoryDisplayName(category, t)}
      </span>
      {!category.isDefault && (
        <div className={styles.actions}>
          <button
            className={styles.btn}
            onClick={() => setIsEditing(true)}
            aria-label={`${category.name} ${t('common.edit')}`}
          >
            {t('common.edit')}
          </button>
          <button
            className={`${styles.btn} ${styles.danger}`}
            onClick={() => onDelete(category.id)}
            disabled={isDeleting}
            aria-label={`${category.name} ${t('common.delete')}`}
          >
            {t('common.delete')}
          </button>
        </div>
      )}
    </div>
  );
}
