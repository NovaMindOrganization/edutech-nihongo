import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { AuthCard, AuthField } from '../components/auth-card';
import { login } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { defaultAppPath } from '../utils/auth-routes';

export function LoginView() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(email, password);
      setSession(data.user, data.accessToken);
      toast.success('Đăng nhập thành công');
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo;
      navigate(returnTo ?? defaultAppPath(data.user), { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Chào mừng trở lại!"
      description="Tiếp tục lộ trình JLPT, giữ streak và mở khóa bài học tiếp theo."
      accent="pink"
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to={paths.register} className="font-extrabold text-primary hover:underline">
            Đăng ký miễn phí
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthField label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            autoComplete="email"
            required
          />
        </AuthField>
        <AuthField
          label="Mật khẩu"
          action={
            <Link to={paths.forgotPassword} className="text-xs font-extrabold text-primary hover:underline">
              Quên mật khẩu?
            </Link>
          }
        >
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
        </AuthField>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </Button>
      </form>
    </AuthCard>
  );
}
