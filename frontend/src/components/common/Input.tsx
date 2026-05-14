import styles from './Input.module.css';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className = '', ...rest }: Props) {
  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        {...rest}
      />
      {error && <span className={styles.errorMsg}>{error}</span>}
    </div>
  );
}
