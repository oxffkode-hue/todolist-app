import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useUpdateProfileMutation } from '../mutations/useUpdateProfileMutation';
import { useDeleteAccountMutation } from '../mutations/useDeleteAccountMutation';
import { validatePassword } from '../utils/validation';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState(user?.name ?? '');
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const updateProfileMutation = useUpdateProfileMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameSuccess('');
    setNameError('');
    updateProfileMutation.mutate(
      { name },
      {
        onSuccess: () => setNameSuccess(t('profile.nameSuccess')),
        onError: () => setNameError(t('profile.nameError')),
      },
    );
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const validationKey = validatePassword(newPassword);
    if (validationKey) {
      setPasswordError(t(validationKey));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('profile.passwordMismatch'));
      return;
    }

    updateProfileMutation.mutate(
      { currentPassword, password: newPassword },
      {
        onSuccess: () => {
          setPasswordSuccess(t('profile.passwordSuccess'));
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (error) => {
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            setPasswordError(t('profile.wrongCurrentPassword'));
          } else {
            setPasswordError(t('profile.passwordChangeError'));
          }
        },
      },
    );
  }

  function handleDeleteSubmit(e: React.FormEvent) {
    e.preventDefault();
    deleteAccountMutation.mutate({ password: deletePassword });
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>{t('profile.title')}</h2>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('profile.nameSection')}</h3>
        <form onSubmit={handleNameSubmit} className={styles.form}>
          <Input
            id="name"
            label={t('profile.nameLabel')}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {nameSuccess && <p className={styles.successMsg}>{nameSuccess}</p>}
          {nameError && <p className={styles.errorMsg}>{nameError}</p>}
          <Button
            type="submit"
            variant="primary"
            loading={updateProfileMutation.isPending}
            disabled={!name.trim()}
          >
            {t('profile.changeNameBtn')}
          </Button>
        </form>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('profile.passwordSection')}</h3>
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <Input
            id="currentPassword"
            label={t('profile.currentPassword')}
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            id="newPassword"
            label={t('profile.newPassword')}
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            id="confirmPassword"
            label={t('profile.newPasswordConfirm')}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {passwordError && <p className={styles.errorMsg}>{passwordError}</p>}
          {passwordSuccess && <p className={styles.successMsg}>{passwordSuccess}</p>}
          <Button
            type="submit"
            variant="primary"
            loading={updateProfileMutation.isPending}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            {t('profile.changePasswordBtn')}
          </Button>
        </form>
      </section>

      <section className={`${styles.section} ${styles.dangerSection}`}>
        <h3 className={styles.sectionTitle}>{t('profile.dangerSection')}</h3>
        <p className={styles.dangerDesc}>{t('profile.dangerDesc')}</p>
        <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
          {t('profile.deleteAccountBtn')}
        </Button>
      </section>

      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>{t('profile.deleteModalTitle')}</h3>
            <p className={styles.modalDesc}>{t('profile.deleteModalDesc')}</p>
            <form onSubmit={handleDeleteSubmit} className={styles.form}>
              <Input
                id="deletePassword"
                label={t('profile.deletePasswordLabel')}
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                autoComplete="current-password"
              />
              <div className={styles.modalActions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="danger"
                  loading={deleteAccountMutation.isPending}
                  disabled={!deletePassword}
                >
                  {t('profile.confirmDeleteBtn')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
