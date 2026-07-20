import { useState } from 'react';
import { CheckCircle2, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { AuthCard, AuthField } from '../components/auth-card';
import { register, sendRegisterOtp, verifyRegisterOtp } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { defaultAppPath } from '../utils/auth-routes';

export function RegisterView() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [, setDevOtp] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const emailIsVerified =
    Boolean(emailVerificationToken) && verifiedEmail === normalizedEmail;
  const otpReady = otp.trim().length === 6;

  function resetOtpState() {
    setOtp('');
    setOtpSentEmail('');
    setVerifiedEmail('');
    setEmailVerificationToken('');
    setDevOtp(undefined);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    resetOtpState();
  }

  async function handleSendOtp() {
    if (!normalizedEmail) {
      toast.error('Vui lòng nhập email trước khi gửi mã OTP');
      return;
    }

    setSendingOtp(true);
    try {
      const data = await sendRegisterOtp(normalizedEmail);
      setOtpSentEmail(normalizedEmail);
      setVerifiedEmail('');
      setEmailVerificationToken('');
      setOtp('');
      setDevOtp(data.devOtp);
      toast.success(
        data.emailSent ? 'Đã gửi mã OTP tới email' : 'Đã tạo mã OTP ở chế độ dev',
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không gửi được mã OTP');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!otpReady) {
      toast.error('OTP phải gồm 6 chữ số');
      return;
    }
    if (otpSentEmail !== normalizedEmail) {
      toast.error('Vui lòng gửi lại OTP cho email hiện tại');
      return;
    }

    setVerifyingOtp(true);
    try {
      const data = await verifyRegisterOtp(normalizedEmail, otp.trim());
      setVerifiedEmail(data.email);
      setEmailVerificationToken(data.emailVerificationToken);
      toast.success('Email đã được xác thực');
    } catch (err) {
      setVerifiedEmail('');
      setEmailVerificationToken('');
      toast.error(err instanceof Error ? err.message : 'OTP không hợp lệ');
    } finally {
      setVerifyingOtp(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!emailIsVerified) {
      toast.error('Vui lòng xác thực OTP trước khi tạo tài khoản');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        email: normalizedEmail,
        password,
        displayName: displayName || undefined,
        emailVerificationToken,
      });
      setSession(data.user, data.accessToken);
      toast.success('Đăng ký thành công');
      navigate(defaultAppPath(data.user), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Tạo tài khoản học viên"
      description="Bắt đầu bằng một lộ trình nhỏ, rõ ràng và đủ vui để quay lại mỗi ngày."
      accent="success"
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to={paths.login} className="font-extrabold text-primary hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      {currentUser && (
        <p className="mb-5 rounded-lg border border-border bg-surface-paper p-3 text-sm font-medium text-foreground shadow-sm">
          Bạn đang đăng nhập <strong>{currentUser.email}</strong>. Đăng ký tài khoản mới sẽ thay thế phiên
          hiện tại.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField
          label="Email"
          action={
            emailIsVerified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-quaternary-foreground">
                <CheckCircle2 className="size-3.5" />
                Đã xác thực
              </span>
            ) : undefined
          }
        >
          <Input
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            required
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={handleSendOtp}
            disabled={sendingOtp || !normalizedEmail}
          >
            {sendingOtp ? <LoaderCircle className="animate-spin" /> : <Mail />}
            {otpSentEmail === normalizedEmail ? 'Gửi lại OTP' : 'Gửi OTP'}
          </Button>
          {/* dev OTP display disabled in production builds */}
        </AuthField>

        <AuthField label="OTP" hint="Nhập mã 6 chữ số vừa nhận được trong email.">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              disabled={!otpSentEmail || emailIsVerified}
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || !otpReady || !otpSentEmail || emailIsVerified}
            >
              {verifyingOtp ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ShieldCheck />
              )}
              Xác thực
            </Button>
          </div>
        </AuthField>

        <AuthField label="Tên hiển thị" hint="Bạn có thể đổi tên này trong hồ sơ sau.">
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="VD: Minh"
          />
        </AuthField>
        <AuthField label="Mật khẩu" hint="Tối thiểu 8 ký tự để bảo vệ tiến độ học của bạn.">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete="new-password"
            required
          />
        </AuthField>
        <Button type="submit" size="lg" className="w-full" disabled={loading || !emailIsVerified}>
          {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </Button>
      </form>
    </AuthCard>
  );
}
