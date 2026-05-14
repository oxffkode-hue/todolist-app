import styles from './LoadingSpinner.module.css';

interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ size = 'md' }: Props) {
  return (
    <div
      className={`${styles.spinner} ${styles[size]}`}
      role="status"
      aria-label="로딩 중"
    />
  );
}
