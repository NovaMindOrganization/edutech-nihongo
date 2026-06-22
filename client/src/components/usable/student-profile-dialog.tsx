import { Link } from 'react-router-dom';

import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth';
import { paths } from '@/router/paths';

type StudentProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogout: () => void;
};

export function StudentProfileDialog({
  open,
  onOpenChange,
  onLogout,
}: StudentProfileDialogProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;

  const displayName = user.displayName?.trim() || 'Học viên';

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Tài khoản">
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium">
          <p className="font-display text-lg font-extrabold">{displayName}</p>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-2 font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
            Vai trò: {user.role}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Cài đặt
          </p>
          <Link
            to={paths.pricing}
            onClick={() => onOpenChange(false)}
            className="block rounded-lg border border-border bg-surface-paper px-3 py-2 font-bold shadow-premium transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-premium"
          >
            Gói học & thanh toán
          </Link>
          <Link
            to={paths.forgotPassword}
            onClick={() => onOpenChange(false)}
            className="block rounded-lg border border-border bg-surface-paper px-3 py-2 font-bold shadow-premium transition-all hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-premium"
          >
            Đổi mật khẩu
          </Link>
        </div>

        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => {
            onOpenChange(false);
            onLogout();
          }}
        >
          Đăng xuất
        </Button>
      </div>
    </Dialog>
  );
}
