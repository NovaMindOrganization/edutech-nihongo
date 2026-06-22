import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  PenLine,
  Sparkles,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

import { AppHeader } from '@/components/usable/app-header';
import { AppIcon } from '@/components/usable/app-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth';
import { defaultAppPath } from '@/features/auth/utils/auth-routes';
import { PricingSection } from '@/features/pricing';
import { paths } from '@/router/paths';
import { cn } from '@/lib/utils';

const features = [
  {
    icon: BookOpen,
    title: 'Lộ trình rõ như bản đồ',
    desc: 'Khóa học chia thành từng chặng nhỏ, mở khóa bằng MiniTest để bạn luôn biết bước tiếp theo.',
    accent: 'bg-tertiary',
  },
  {
    icon: Brain,
    title: 'AI coach luôn sẵn sàng',
    desc: 'Luyện nói, nhận phản hồi, tra cứu OCR và học lại đúng phần bạn đang vấp.',
    accent: 'bg-secondary',
  },
  {
    icon: Users,
    title: 'Học cùng cộng đồng',
    desc: 'Study sets, flashcards, gọi luyện nói và ôn tập cùng bạn học khác.',
    accent: 'bg-quaternary',
  },
];

const roadmap = [
  {
    icon: ClipboardCheck,
    label: '01',
    title: 'Test đầu vào',
    desc: 'Xác định điểm xuất phát và chọn lộ trình vừa sức.',
  },
  {
    icon: BookOpen,
    label: '02',
    title: 'Học từng bài',
    desc: 'Ngữ pháp, từ vựng, hội thoại, kanji và luyện nói trong một flow.',
  },
  {
    icon: PenLine,
    label: '03',
    title: 'MiniTest mở khóa',
    desc: 'Kiểm tra nhanh để củng cố trước khi sang chặng kế tiếp.',
  },
  {
    icon: Trophy,
    label: '04',
    title: 'Mô phỏng JLPT',
    desc: 'Luyện đề, xem lịch sử và quay lại ôn lỗi sai có mục tiêu.',
  },
];

const testimonials = [
  {
    name: 'Minh Anh',
    role: 'Từ vựng N5',
    quote: 'Giao diện vui nên mình mở app mỗi ngày. Các bài nhỏ giúp không bị ngợp.',
    accent: 'bg-secondary',
  },
  {
    name: 'Tuấn Khoa',
    role: 'Luyện nói',
    quote: 'AI speaking giống có người nhắc bài. Sai phát âm là biết chỗ sửa ngay.',
    accent: 'bg-tertiary',
  },
  {
    name: 'Hà Linh',
    role: 'Ôn JLPT',
    quote: 'MiniTest và ôn lỗi sai làm mình thấy tiến bộ rõ hơn sau mỗi tuần.',
    accent: 'bg-quaternary',
  },
];

function DotPattern({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute opacity-30', className)}
      style={{
        backgroundImage: 'radial-gradient(var(--color-ink) 1.5px, transparent 1.5px)',
        backgroundSize: '18px 18px',
      }}
    />
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'center' | 'left';
}) {
  return (
    <div className={cn('mb-10', align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl')}>
      <Badge>{eyebrow}</Badge>
      <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight md:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base font-medium leading-7 text-muted-foreground md:text-lg">
        {description}
      </p>
    </div>
  );
}

export function HomeView() {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to={defaultAppPath(user)} replace />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <DotPattern className="left-8 top-32 h-44 w-44" />
      <DotPattern className="bottom-[22rem] right-8 h-52 w-52" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 18% 16%, var(--color-sakura) 0%, transparent 32%), radial-gradient(circle at 82% 8%, var(--color-lavender) 0%, transparent 30%), radial-gradient(circle at 72% 48%, rgb(var(--color-green-rgb) / 0.24) 0%, transparent 28%)',
        }}
      />
      <div className="pointer-events-none absolute -left-16 top-56 size-40 rotate-12 rounded-xl border border-border bg-brand-muted shadow-premium-hover" />
      <div className="pointer-events-none absolute -right-20 top-32 size-52 rounded-full border border-border bg-secondary/60 shadow-premium-hover" />
      <div className="pointer-events-none absolute right-1/4 top-[34rem] size-16 -rotate-12 rounded-xl border border-border bg-quaternary/70 shadow-premium card-lift" />

      <div className="relative z-10">
        <AppHeader marketing />

        <main className="w-full px-4 pb-24 pt-8 md:px-8 md:pt-12 lg:px-10 xl:px-12 2xl:px-16">
          <section className="relative grid min-h-[calc(100vh-6rem)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-quaternary text-quaternary-foreground">EdTech · 日本語 · Việt Nam</Badge>
              <h1 className="mt-6 max-w-4xl font-display text-4xl font-extrabold leading-[0.98] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl">
                Japanese learning that feels like a game board.
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-muted-foreground md:text-xl">
                NIHONGOCOACH biến JLPT thành từng nhiệm vụ nhỏ: học bài, luyện nói, làm MiniTest,
                mở khóa chặng mới và ôn lỗi sai đúng lúc.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to={paths.register}>
                  <Button size="lg">Bắt đầu miễn phí</Button>
                </Link>
                <Link to={paths.placementTest}>
                  <Button size="lg" variant="secondary">
                    Làm Placement Test
                  </Button>
                </Link>
                <Link to={paths.learn.hub}>
                  <Button size="lg" variant="outline">
                    Khám phá khóa học
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {(
                  [
                    { label: 'MiniTest mở khóa', variant: 'default' as const },
                    { label: 'AI Speaking', variant: 'secondary' as const },
                    { label: 'JLPT simulator', variant: 'warning' as const },
                  ] as const
                ).map(({ label, variant }) => (
                  <Badge key={label} variant={variant} className="px-3 py-1 text-sm font-bold shadow-premium card-lift">
                    {label}
                  </Badge>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, rotate: -2, y: 24 }}
              animate={{ opacity: 1, rotate: 0, y: 0 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="relative mx-auto w-full max-w-xl"
            >
              <div className="absolute -left-8 top-10 size-16 rotate-12 rounded-xl border border-border bg-tertiary shadow-premium card-lift" />
              <div className="absolute -right-6 bottom-16 size-20 rounded-full border border-border bg-secondary shadow-premium card-lift" />
              <div className="relative overflow-hidden rounded-display border border-border bg-surface-paper p-5 shadow-premium-hover">
                <div className="absolute -right-12 -top-12 size-32 rounded-full border border-border bg-quaternary/60" />
                <div className="relative rounded-lg border border-border bg-background p-5">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
                        Today's Quest
                      </p>
                      <h2 className="font-display text-2xl font-extrabold">N5 Mission Board</h2>
                    </div>
                    <AppIcon icon={Sparkles} size="lg" className="bg-tertiary" />
                  </div>
                  <div className="space-y-3">
                    {[
                      ['Grammar', 'て-form basics', 'bg-secondary'],
                      ['Vocabulary', 'Daily verbs', 'bg-tertiary'],
                      ['Speaking', 'Order at a cafe', 'bg-quaternary'],
                    ].map(([label, title, accent]) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface-paper p-3 shadow-premium card-lift"
                      >
                        <span className={cn('size-4 rounded-full border border-border', accent)} />
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
                            {label}
                          </p>
                          <p className="truncate font-bold">{title}</p>
                        </div>
                        <CheckCircle2 className="size-5 text-primary" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl border border-border bg-brand-soft p-4 text-brand shadow-premium card-lift">
                    <p className="font-display text-4xl font-extrabold">73%</p>
                    <p className="text-sm font-bold">Progress to unlock MiniTest</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          <section id="features" className="relative scroll-mt-28 py-20">
            <SectionHeading
              eyebrow="Features"
              title="Everything feels like a learning sticker pack."
              description="Readable learning content stays central, while playful interactions make every task feel lighter."
            />
            <div className="grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, desc, accent }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.08 }}
                  className="depth-interactive relative overflow-hidden rounded-xl border border-border bg-surface-paper p-6 shadow-premium card-lift"
                >
                  <div className={cn('absolute -right-8 -top-8 size-24 rounded-full border border-border', accent)} />
                  <AppIcon icon={Icon} size="lg" className={cn('relative', accent)} />
                  <h3 className="relative mt-6 font-display text-2xl font-extrabold tracking-tight">
                    {title}
                  </h3>
                  <p className="relative mt-3 text-sm font-medium leading-7 text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="roadmap" className="relative scroll-mt-28 py-20">
            <DotPattern className="-left-6 top-20 h-36 w-36" />
            <SectionHeading
              eyebrow="Roadmap"
              title="A colorful path from placement to confidence."
              description="Each milestone is clear, small enough to finish, and energetic enough to keep you moving."
              align="left"
            />
            <div className="relative grid gap-5 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-8 right-8 top-1/2 hidden h-1 -translate-y-1/2 rounded-full border border-border bg-tertiary lg:block" />
              {roadmap.map(({ icon: Icon, label, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    'relative rounded-xl border border-border bg-surface-paper p-5 shadow-premium card-lift',
                    i % 2 === 1 && 'lg:translate-y-10',
                  )}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full border border-border bg-brand-soft px-3 py-1 font-display text-sm font-extrabold text-brand shadow-premium card-lift">
                      {label}
                    </span>
                    <AppIcon icon={Icon} size="lg" className={i % 2 ? 'bg-secondary' : 'bg-quaternary'} />
                  </div>
                  <h3 className="font-display text-xl font-extrabold tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">{desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section id="testimonials" className="relative scroll-mt-28 py-20">
            <SectionHeading
              eyebrow="Testimonials"
              title="Friendly energy learners remember."
              description="A good study app should make people feel capable before the lesson even starts."
            />
            <div className="grid gap-6 lg:grid-cols-3">
              {testimonials.map(({ name, role, quote, accent }, i) => (
                <motion.figure
                  key={name}
                  initial={{ opacity: 0, rotate: -1, y: 18 }}
                  whileInView={{ opacity: 1, rotate: 0, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: i * 0.08 }}
                  className="relative rounded-xl border border-border bg-surface-paper p-6 shadow-premium card-lift"
                >
                  <div className={cn('absolute -right-4 -top-4 size-12 rotate-12 rounded-lg border border-border shadow-premium card-lift', accent)} />
                  <div className="mb-5 flex gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="size-4 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg font-bold leading-8">"{quote}"</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className={cn('flex size-11 items-center justify-center rounded-lg border border-border font-display font-extrabold shadow-premium card-lift', accent)}>
                      {name.charAt(0)}
                    </span>
                    <span>
                      <span className="block font-display font-extrabold">{name}</span>
                      <span className="block text-sm font-semibold text-muted-foreground">{role}</span>
                    </span>
                  </figcaption>
                </motion.figure>
              ))}
            </div>
          </section>

          <PricingSection sectionId="pricing" />

          <section className="relative py-20">
            <div className="relative overflow-hidden rounded-4xl border border-border bg-brand-soft p-8 text-brand shadow-premium-hover md:p-12">
              <DotPattern className="right-8 top-8 h-36 w-36 opacity-20" />
              <div className="absolute -left-10 -top-10 size-32 rounded-full border border-border bg-tertiary" />
              <div className="absolute -right-10 bottom-8 size-28 rotate-12 rounded-xl border border-border bg-secondary" />
              <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <Badge className="bg-tertiary text-tertiary-foreground">Ready?</Badge>
                  <h2 className="mt-5 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-6xl">
                    Make Japanese practice the bright part of your day.
                  </h2>
                  <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-foreground/80">
                    Start with placement, jump into N5, or explore the dictionary before creating an account.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                  <Link to={paths.register}>
                    <Button size="lg" className="w-full">
                      Join NIHONGOCOACH
                    </Button>
                  </Link>
                  <Link to={paths.dictionary}>
                    <Button size="lg" variant="outline" className="w-full">
                      Try dictionary
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
