import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, CheckCircle2, HelpCircle, Layers3, Lightbulb, PenLine, Quote, ScrollText } from "lucide-react";
import { AppIcon } from "@/components/usable/app-icon";
import { EmptyState, emptyStatePresets } from "@/components/usable/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLessonData } from "../context/lesson-context";

type Segment =
	| {
			text: string;
	  }
	| {
			kanji: string;
			reading: string;
	  };

interface FuriganaTextProps {
	segments?: Segment[];
}

function FuriganaText({ segments = [] }: FuriganaTextProps) {
	return (
		<span className="font-jp leading-8">
			{segments.map((segment, index) => {
				if ("kanji" in segment) {
					return (
						<ruby key={index} className="mx-[1px]">
							{segment.kanji}
							<rt className="text-[0.6em] text-muted-foreground">
								{segment.reading}
							</rt>
						</ruby>
					);
				}

				return <span key={index}>{segment.text}</span>;
			})}
		</span>
	);
}

function GrammarSection({
	icon,
	label,
	title,
	children,
	className,
}: {
	icon: typeof ScrollText;
	label: string;
	title: string;
	children: ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("rounded-xl border border-border p-5 shadow-premium card-lift", className)}>
			<div className="mb-3 flex items-center gap-2">
				<AppIcon icon={icon} size="sm" className="bg-surface-paper" />
				<div>
					<p className="font-display text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
						{label}
					</p>
					<h3 className="font-display text-lg font-extrabold text-foreground">{title}</h3>
				</div>
			</div>
			{children}
		</section>
	);
}

export function LessonGrammarView() {
	const { grammar } = useLessonData();

	const [grammarIndex, setGrammarIndex] = useState(0);

	const [viewMode, setViewMode] = useState<"grammar" | "quiz">("grammar");

	const [answers, setAnswers] = useState<Record<number, number>>({});

	const [submitted, setSubmitted] = useState(false);

	const currentGrammar = grammar[grammarIndex];

	const score = useMemo(() => {
		if (!currentGrammar?.quiz) {
			return 0;
		}

		return currentGrammar.quiz.reduce((total, question, index) => {
			return total + (answers[index] === question.answer ? 1 : 0);
		}, 0);
	}, [answers, currentGrammar]);

	if (!currentGrammar) {
		return <EmptyState {...emptyStatePresets.grammar} />;
	}

	const resetQuizState = () => {
		setAnswers({});
		setSubmitted(false);
	};

	const handlePrevGrammar = () => {
		if (grammarIndex === 0) {
			return;
		}

		setGrammarIndex((prev) => prev - 1);
		resetQuizState();
	};

	const handleNextGrammar = () => {
		if (grammarIndex >= grammar.length - 1) {
			return;
		}

		setGrammarIndex((prev) => prev + 1);
		resetQuizState();
	};

	const handleSelectAnswer = (questionIndex: number, choiceIndex: number) => {
		if (submitted) {
			return;
		}

		setAnswers((prev) => ({
			...prev,
			[questionIndex]: choiceIndex,
		}));
	};

	return (
		<Card className="overflow-hidden">
			<CardHeader className="space-y-4 bg-surface-paper">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<AppIcon icon={ScrollText} size="lg" className="bg-tertiary" />
						<div>
							<p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
								Grammar Focus
							</p>
							<CardTitle className="font-display text-2xl">Học ngữ pháp</CardTitle>
						</div>
					</div>

					<span className="rounded-lg border border-border bg-background px-3 py-1.5 font-display text-sm font-extrabold tabular-nums shadow-premium card-lift">
						{grammarIndex + 1}/{grammar.length}
					</span>
				</div>

				<div className="h-4 overflow-hidden rounded-full border border-border bg-muted">
					<div
						className="h-full rounded-full bg-primary transition-all"
						style={{
							width: `${((grammarIndex + 1) / grammar.length) * 100}%`,
						}}
					/>
				</div>
			</CardHeader>

			<CardContent className="space-y-6 bg-background p-4 sm:p-6">
				{viewMode === "grammar" ? (
					<>
						{/* Grammar Card */}

						<div className="overflow-hidden rounded-xl border border-border bg-surface-paper shadow-premium card-lift">
							{/* Header */}

							<div className="border-b border-border bg-tertiary/20 px-5 py-5">
								<div className="flex flex-wrap items-center gap-2">
									<Badge className="bg-brand-soft text-brand">{currentGrammar.jlpt}</Badge>

									{currentGrammar.type && (
										<Badge variant="outline">
											{currentGrammar.type}
										</Badge>
									)}
								</div>

								<div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<h2 className="font-display text-2xl font-extrabold leading-snug text-foreground md:text-3xl">
											{currentGrammar.title}
										</h2>
										<p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
											Học theo thứ tự: nhìn mẫu câu, hiểu ý nghĩa, đọc cách dùng rồi xem ví dụ.
										</p>
									</div>

									<Button
										onClick={() => setViewMode("quiz")}
										className="shrink-0 gap-2">
										<AppIcon icon={PenLine} size="sm" className="bg-tertiary" />
										Làm bài tập
									</Button>
								</div>
							</div>

							<div className="grid gap-4 p-5 lg:grid-cols-[1.05fr_0.95fr]">
								<GrammarSection
									icon={Layers3}
									label="Mẫu câu"
									title="Pattern"
									className="bg-primary/10"
								>
									<p className="font-jp text-2xl font-bold leading-relaxed md:text-3xl">
										{currentGrammar.pattern}
									</p>
								</GrammarSection>

								<GrammarSection
									icon={BookOpen}
									label="Giải thích"
									title="Ý nghĩa"
									className="bg-quaternary/15"
								>
									<p className="text-base font-semibold leading-8">{currentGrammar.meaningVi}</p>
								</GrammarSection>
							</div>

							{/* Usage */}

							{currentGrammar.usage && (
								<div className="border-t border-border p-5">
									<GrammarSection
										icon={CheckCircle2}
										label="Cách áp dụng"
										title="Cách dùng"
										className="bg-secondary/10"
									>
										<p className="font-medium leading-8">{currentGrammar.usage}</p>
									</GrammarSection>
								</div>
							)}

							{/* Notes */}

							{currentGrammar.notes && (
								<div className="border-t border-border p-5">
									<div className="rounded-xl border border-border bg-tertiary/20 p-4 shadow-premium card-lift">
										<p className="mb-2 flex items-center gap-2 font-display font-extrabold text-foreground">
											<AppIcon icon={Lightbulb} size="sm" className="bg-tertiary" />
											Lưu ý khi dùng
										</p>

										<p className="text-sm font-medium leading-7 text-muted-foreground">
											{currentGrammar.notes}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Examples */}

						{currentGrammar.examples?.length ? (
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<AppIcon icon={Quote} size="md" className="bg-quaternary" />
									<div>
										<p className="font-display text-xs font-extrabold uppercase tracking-widest text-primary">
											Examples
										</p>
										<h3 className="font-display text-xl font-extrabold">Ví dụ trong câu</h3>
									</div>
								</div>

								{currentGrammar.examples.map((example, index) => (
									<div
										key={index}
										className="flex gap-3 rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
										<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-tertiary font-display text-sm font-extrabold shadow-premium card-lift">
											{index + 1}
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-lg">
												<FuriganaText
													segments={
														(
															example as {
																segments?: Segment[];
															}
														).segments
													}
												/>
											</p>

											<p className="mt-3 border-t-2 border-dashed border-border pt-3 text-sm font-medium leading-6 text-muted-foreground">
												{example.vi}
											</p>
										</div>
									</div>
								))}
							</div>
						) : null}

						{/* Navigation */}

						<div className="border-t border-border pt-6">
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<button
									onClick={handlePrevGrammar}
									disabled={grammarIndex === 0}
									className="rounded-xl border border-border bg-surface-paper p-4 text-left shadow-premium card-lift transition hover:-translate-y-0.5 hover:shadow-premium card-lift disabled:opacity-40">
									<div className="text-sm font-bold text-muted-foreground">
										← Mẫu trước
									</div>

									{grammarIndex > 0 && (
										<div className="mt-1 font-jp text-lg font-bold text-primary">
											{grammar[grammarIndex - 1].pattern}
										</div>
									)}
								</button>

								<button
									onClick={handleNextGrammar}
									disabled={grammarIndex === grammar.length - 1}
									className="rounded-xl border border-border bg-surface-paper p-4 text-right shadow-premium card-lift transition hover:-translate-y-0.5 hover:shadow-premium card-lift disabled:opacity-40">
									<div className="text-sm font-bold text-muted-foreground">
										Mẫu tiếp →
									</div>

									{grammarIndex < grammar.length - 1 && (
										<div className="mt-1 font-jp text-lg font-bold text-primary">
											{grammar[grammarIndex + 1].pattern}
										</div>
									)}
								</button>
							</div>
						</div>
					</>
				) : (
					<>
						{/* Quiz Header */}

						<div className="flex flex-wrap items-center justify-between gap-3">
							<Button variant="outline" onClick={() => setViewMode("grammar")}>
								← Xem ngữ pháp
							</Button>

							<span className="rounded-lg border border-border bg-surface-paper px-3 py-1.5 font-display text-sm font-extrabold tabular-nums shadow-premium card-lift">
								{grammarIndex + 1}/{grammar.length}
							</span>
						</div>

						{/* Quiz */}

						<div className="space-y-6">
							{currentGrammar.quiz?.map((question, questionIndex) => (
								<div key={questionIndex} className="rounded-xl border border-border bg-surface-paper p-4 shadow-premium card-lift">
									<p className="mb-4 flex items-center gap-2 font-display font-extrabold">
										<AppIcon icon={HelpCircle} size="sm" className="bg-tertiary" />
										Câu {questionIndex + 1}
									</p>

									<div className="mb-4 rounded-lg border border-border bg-background p-4 text-lg">
										<FuriganaText
											segments={
												(
													question as {
														question?: {
															segments?: Segment[];
														};
													}
												).question?.segments
											}
										/>
									</div>

									<div className="space-y-2">
										{question.choices.map((choice, choiceIndex) => {
											const selected = answers[questionIndex] === choiceIndex;

											const isCorrect = question.answer === choiceIndex;

											return (
												<button
													key={choiceIndex}
													type="button"
													onClick={() =>
														handleSelectAnswer(questionIndex, choiceIndex)
													}
													className={cn(
														"w-full rounded-lg border border-border bg-background p-3 text-left font-medium shadow-premium card-lift transition-all hover:-translate-y-0.5",
														selected && "bg-primary/10 shadow-premium card-lift",
														submitted && isCorrect && "bg-quaternary/25",
													)}>
													{choice}
												</button>
											);
										})}
									</div>
								</div>
							))}
						</div>

						{!submitted ? (
							<Button className="w-full" onClick={() => setSubmitted(true)}>
								Nộp bài
							</Button>
						) : (
							<div className="space-y-4">
								<div className="rounded-xl border border-border bg-quaternary/15 p-5 text-center shadow-premium card-lift">
									<p className="font-display text-lg font-extrabold">Kết quả</p>

									<p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-primary">
										{score}/{currentGrammar.quiz?.length ?? 0} câu đúng
									</p>
								</div>

								<div className="flex flex-wrap gap-3">
									<Button
										variant="outline"
										onClick={() => setViewMode("grammar")}>
										Xem lại ngữ pháp
									</Button>

									{grammarIndex < grammar.length - 1 && (
										<Button onClick={handleNextGrammar}>
											Ngữ pháp tiếp theo
										</Button>
									)}
								</div>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
