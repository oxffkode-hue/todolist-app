import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSignupMutation } from '../mutations/useSignupMutation';
import { getErrorCode } from '../utils/getErrorCode';
import { validatePassword } from '../utils/validation';
import { ROUTES } from '../constants';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import styles from './AuthPage.module.css';

export default function SignupPage() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const { mutate, isPending } = useSignupMutation();

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = t('auth.nameRequired');
    if (!email) next.email = t('auth.emailRequired');
    const pwKey = validatePassword(password);
    if (pwKey) next.password = t(pwKey);
    if (password !== passwordConfirm) next.passwordConfirm = t('auth.passwordMismatch');
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError('');
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mutate(
      { name: name.trim(), email, password },
      {
        onError: (error) => {
          const code = getErrorCode(error);
          if (code === 'EMAIL_CONFLICT') {
            setErrors({ email: t('auth.emailDuplicate') });
          } else if (code === 'INVALID_PASSWORD_FORMAT') {
            setErrors({ password: t('auth.passwordFormatError') });
          } else {
            setGlobalError(t('common.retry'));
          }
        },
      },
    );
  };

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{t('app.name')}</h1>
      <p className={styles.subtitle}>{t('auth.signup')}</p>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          id="name"
          label={t('auth.name')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('auth.namePlaceholder')}
          error={errors.name}
          autoComplete="name"
          required
        />
        <Input
          id="email"
          label={t('auth.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('auth.emailPlaceholder')}
          error={errors.email}
          autoComplete="email"
          required
        />
        <div>
          <Input
            id="password"
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.passwordPlaceholder')}
            error={errors.password}
            autoComplete="new-password"
            required
          />
          {!errors.password && (
            <p className={styles.hint}>{t('auth.passwordHint')}</p>
          )}
        </div>
        <Input
          id="passwordConfirm"
          label={t('auth.passwordConfirm')}
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder={t('auth.passwordPlaceholder')}
          error={errors.passwordConfirm}
          autoComplete="new-password"
          required
        />

        {globalError && <p className={styles.globalError}>{globalError}</p>}

        <Button
          type="submit"
          loading={isPending}
          disabled={!name || !email || !password || !passwordConfirm}
        >
          {t('auth.signup')}
        </Button>
      </form>

      <p className={styles.switchText}>
        {t('auth.hasAccount')}{' '}
        <Link to={ROUTES.LOGIN} className={styles.link}>
          {t('auth.login')}
        </Link>
      </p>
    </div>
  );
}
