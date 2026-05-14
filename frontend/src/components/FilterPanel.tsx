import { useTranslation } from 'react-i18next';
import { useUiStore } from '../stores/uiStore';
import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import { getCategoryDisplayName } from '../utils/categoryName';
import type { TodoFilters } from '../types/todo.types';
import styles from './FilterPanel.module.css';

export default function FilterPanel() {
  const { t } = useTranslation();
  const activeFilter = useUiStore((s) => s.activeFilter);
  const setFilter = useUiStore((s) => s.setFilter);
  const resetFilter = useUiStore((s) => s.resetFilter);
  const { data: categories = [] } = useCategoriesQuery();

  const completionValue =
    activeFilter.isCompleted === true
      ? 'true'
      : activeFilter.isCompleted === false
      ? 'false'
      : '';

  const isFiltered =
    !!activeFilter.categoryId ||
    activeFilter.isCompleted !== undefined ||
    !!activeFilter.dueDateFrom ||
    !!activeFilter.dueDateTo;

  const handleCompletionChange = (value: string) => {
    const next: TodoFilters = { ...activeFilter };
    if (value === 'true') next.isCompleted = true;
    else if (value === 'false') next.isCompleted = false;
    else delete next.isCompleted;
    setFilter(next);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{t('filter.title')}</span>
        {isFiltered && (
          <button className={styles.resetBtn} onClick={resetFilter}>
            {t('filter.reset')}
          </button>
        )}
      </div>
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('filter.category')}</label>
          <select
            className={styles.select}
            value={activeFilter.categoryId ?? ''}
            onChange={(e) => {
              const next: TodoFilters = { ...activeFilter };
              if (e.target.value) next.categoryId = e.target.value;
              else delete next.categoryId;
              setFilter(next);
            }}
          >
            <option value="">{t('filter.allCategory')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {getCategoryDisplayName(cat, t)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>{t('filter.completion')}</span>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="completion"
                value=""
                checked={completionValue === ''}
                onChange={() => handleCompletionChange('')}
              />
              {t('filter.all')}
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="completion"
                value="false"
                checked={completionValue === 'false'}
                onChange={() => handleCompletionChange('false')}
              />
              {t('filter.incomplete')}
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="completion"
                value="true"
                checked={completionValue === 'true'}
                onChange={() => handleCompletionChange('true')}
              />
              {t('filter.complete')}
            </label>
          </div>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>{t('filter.dueDate')}</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              className={styles.dateInput}
              value={activeFilter.dueDateFrom ?? ''}
              max={activeFilter.dueDateTo ?? undefined}
              onChange={(e) => {
                const from = e.target.value || undefined;
                const next: TodoFilters = { ...activeFilter, dueDateFrom: from };
                if (from && activeFilter.dueDateTo && from > activeFilter.dueDateTo) {
                  next.dueDateTo = from;
                }
                setFilter(next);
              }}
            />
            <span className={styles.dateSep}>~</span>
            <input
              type="date"
              className={styles.dateInput}
              value={activeFilter.dueDateTo ?? ''}
              min={activeFilter.dueDateFrom ?? undefined}
              onChange={(e) => {
                const to = e.target.value || undefined;
                const next: TodoFilters = { ...activeFilter, dueDateTo: to };
                if (to && activeFilter.dueDateFrom && to < activeFilter.dueDateFrom) {
                  next.dueDateFrom = to;
                }
                setFilter(next);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
