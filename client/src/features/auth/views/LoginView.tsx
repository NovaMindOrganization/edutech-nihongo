import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-xl backdrop-blur"
    >
        <p className="font-display text-sm tracking-widest text-primary uppercase">NihongoCoach</p>
        <h1 className="font-display mt-2 text-2xl font-bold">Đăng nhập</h1>
        <p className="mt-1 text-sm text-muted-foreground">Học tiếng Nhật — lộ trình JLPT N5→N1</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              className="mt-1"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Mật khẩu</label>
              <Link to={paths.forgotPassword} className="text-xs text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <Input
              className="mt-1"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link to={paths.register} className="text-primary hover:underline">
            Đăng ký
          </Link>
        </p>
      </motion.div>
  );
}
