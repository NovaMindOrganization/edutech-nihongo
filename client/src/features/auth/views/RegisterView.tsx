import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { paths } from '@/router/paths';

import { register } from '../services/authApi';
import { useAuthStore } from '../store/authStore';
import { defaultAppPath } from '../utils/auth-routes';

export function RegisterView() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(email, password, displayName || undefined);
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md rounded-2xl border border-border/60 bg-card/90 p-8 shadow-xl backdrop-blur"
    >
      <p className="font-display text-sm tracking-widest text-primary uppercase">NihongoCoach</p>
      <h1 className="font-display mt-2 text-2xl font-bold">Đăng ký</h1>
      <p className="mt-1 text-sm text-muted-foreground">Tạo tài khoản học viên và bắt đầu học ngay</p>

      {currentUser && (
        <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-100">
          Bạn đang đăng nhập <strong>{currentUser.email}</strong>. Đăng ký tài khoản mới sẽ thay thế phiên
          hiện tại.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Tên hiển thị</label>
          <Input
            className="mt-1"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="VD: Minh"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            className="mt-1"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Mật khẩu</label>
          <Input
            className="mt-1"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <Link to={paths.login} className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </motion.div>
  );
}
