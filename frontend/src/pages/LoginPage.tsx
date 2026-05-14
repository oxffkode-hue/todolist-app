import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../mutations/useLoginMutation';
import { ROUTES } from '../constants';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { mutate, isPending } = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    mutate(
      { email, password },
      {
        onError: (error) => {
          const status = (error as { response?: { status?: number } }).response?.status;
          if (status === 401) {
            setErrorMsg(t('auth.loginError'));
          } else {
            setErrorMsg(t('common.retry'));
          }
        },
      },
    );
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{t('app.name')}</h1>
      <p className={styles.subtitle}>{t('app.tagline')}</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          id="email"
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          autoComplete="email"
          required
        />
        <Input
          id="password"
          label={t('auth.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          autoComplete="current-password"
          required
        />

        {errorMsg && <p className={styles.globalError}>{errorMsg}</p>}

        <Button type="submit" loading={isPending} disabled={!email || !password}>
          {t('auth.login')}
        </Button>
      </form>

      <p className={styles.switchText}>
        {t('auth.noAccount')}{' '}
        <Link to={ROUTES.SIGNUP} className={styles.link}>
          {t('auth.signup')}
        </Link>
      </p>
    </div>
  );
}
