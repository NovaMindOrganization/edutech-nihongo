import { motion } from 'framer-motion';
import { BookOpen, Brain, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { paths } from '@/router/paths';

const features = [
  { icon: BookOpen, title: 'Lộ trình JLPT', desc: 'N5→N1, học tuần tự có khóa bài' },
  { icon: Brain, title: 'AI & OCR', desc: 'Speaking mentor, tra cứu ngữ nghĩa' },
  { icon: Users, title: 'Cộng đồng', desc: 'Flashcard sets, luyện nói peer-to-peer' },
];

export function HomeView() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, var(--nc-sakura) 0%, transparent 45%), radial-gradient(circle at 80% 10%, var(--nc-indigo-soft) 0%, transparent 40%)',
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-bold tracking-tight text-primary">NihongoCoach</span>
        <nav className="flex gap-3">
          <Link to={paths.login}>
            <Button variant="outline" size="sm">
              Đăng nhập
            </Button>
          </Link>
          <Link to={paths.register}>
            <Button variant="outline" size="sm">
              Đăng ký
            </Button>
          </Link>
          <Link to={paths.learn.hub}>
            <Button size="sm">Bắt đầu học</Button>
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-8 md:pt-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="font-display text-sm tracking-[0.25em] text-primary uppercase">EdTech · 日本語 · Việt Nam</p>
          <h1 className="font-display mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Học tiếng Nhật có lộ trình,
            <span className="text-primary"> từ N5 đến N1</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Nền tảng kết hợp phong cách giáo dục Nhật Bản và trải nghiệm học thân thiện với người Việt — từ
            điển tập trung, MiniTest mở khóa, đến mô phỏng JLPT.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to={paths.placementTest}>
              <Button size="lg" className="shadow-lg shadow-primary/20">
                Placement Test
              </Button>
            </Link>
            <Link to={paths.learn.hub}>
              <Button size="lg" variant="outline">
                Khám phá khóa N5
              </Button>
            </Link>
            <Link to={paths.admin.dashboard}>
              <Button size="lg" variant="outline">
                Khu vực quản trị
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur"
            >
              <Icon className="size-8 text-primary" />
              <h3 className="font-display mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>

        <p className="font-jp mt-16 text-center text-2xl text-primary/30">がんばって</p>
      </section>
    </div>
  );
}
