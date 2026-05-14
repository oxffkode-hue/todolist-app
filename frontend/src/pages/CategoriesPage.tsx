import { useCategoriesQuery } from '../queries/useCategoriesQuery';
import CategoryList from '../components/CategoryList';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategoriesQuery();

  if (isLoading) return <p className={styles.status}>불러오는 중...</p>;
  if (isError) return <p className={styles.status}>카테고리를 불러오지 못했습니다.</p>;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>카테고리 관리</h2>
      <CategoryList categories={categories ?? []} />
    </div>
  );
}
