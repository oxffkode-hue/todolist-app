import Button from './Button';
import styles from './Modal.module.css';

interface Props {
  isOpen: boolean;
  title: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  confirmLabel = '확인',
  cancelLabel = '취소',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  isLoading = false,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{title}</h2>
        {children && <div className={styles.content}>{children}</div>}
        <div className={styles.actions}>
          <Button variant="secondary" size="md" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={confirmVariant} size="md" onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
