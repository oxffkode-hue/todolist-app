import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY_ICONS } from './common/CategoryIcons';
import Input from './common/Input';
import Button from './common/Button';
import styles from './CategoryForm.module.css';

interface Props {
  initialName?: string;
  initialIcon?: string;
  onSubmit: (name: string, icon: string) => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string;
}

export default function CategoryForm({ initialName = '', initialIcon = 'folder', onSubmit, onCancel, isPending, error }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(initialName);
  const [icon, setIcon] = useState(initialIcon);

  useEffect(() => {
    setName(initialName);
    setIcon(initialIcon);
  }, [initialName, initialIcon]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, icon);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        id="category-name"
        label={t('category.nameLabel')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('category.namePlaceholder')}
        error={error}
        autoFocus
      />

      <div className={styles.iconField}>
        <span className={styles.iconLabel}>{t('category.iconLabel')}</span>
        <div className={styles.iconGrid}>
          {CATEGORY_ICONS.map(({ id, label, component: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.iconBtn} ${icon === id ? styles.iconBtnActive : ''}`}
              onClick={() => setIcon(id)}
              title={label}
              aria-label={label}
              aria-pressed={icon === id}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" size="sm" loading={isPending} disabled={!name.trim()}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
