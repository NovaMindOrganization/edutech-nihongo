import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
		return (
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground">
					Không có dữ liệu ngữ pháp.
				</CardContent>
			</Card>
		);
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
		<Card>
			<CardHeader className="space-y-3">
				<div className="flex items-center justify-between">
					<CardTitle>Học ngữ pháp</CardTitle>

					<span className="text-sm text-muted-foreground">
						{grammarIndex + 1}/{grammar.length}
					</span>
				</div>

				<div className="h-2 overflow-hidden rounded-full bg-muted">
					<div
						className="h-full bg-primary transition-all"
						style={{
							width: `${((grammarIndex + 1) / grammar.length) * 100}%`,
						}}
					/>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{viewMode === "grammar" ? (
					<>
						{/* Grammar Card */}

						<div className="overflow-hidden rounded-xl border">
							{/* Header */}

							<div className="border-l-4 border-l-primary bg-primary/5 px-5 py-4">
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
										{currentGrammar.jlpt}
									</span>

									{currentGrammar.type && (
										<span className="text-xs text-muted-foreground">
											{currentGrammar.type}
										</span>
									)}
								</div>

								<div className="mt-3 flex items-center justify-between gap-4">
									<div>
										<h2 className="text-2xl font-bold text-primary">
											{currentGrammar.title}
										</h2>
									</div>

									<Button
										onClick={() => setViewMode("quiz")}
										className="shrink-0">
										📝 Làm bài tập
									</Button>
								</div>
							</div>

							{/* Pattern */}

							<div className="border-t p-5">
								<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Mẫu ngữ pháp
								</p>

								<div className="rounded-lg bg-muted/40 p-4">
									<p className="font-jp text-2xl leading-relaxed">
										{currentGrammar.pattern}
									</p>
								</div>
							</div>

							{/* Meaning */}

							<div className="border-t p-5">
								<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
									Ý nghĩa
								</p>

								<p className="leading-relaxed">{currentGrammar.meaningVi}</p>
							</div>

							{/* Usage */}

							{currentGrammar.usage && (
								<div className="border-t p-5">
									<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
										Cách dùng
									</p>

									<p>{currentGrammar.usage}</p>
								</div>
							)}

							{/* Notes */}

							{currentGrammar.notes && (
								<div className="border-t p-5">
									<div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
										<p className="mb-2 font-medium text-amber-700 dark:text-amber-300">
											💡 Lưu ý
										</p>

										<p className="text-sm text-muted-foreground">
											{currentGrammar.notes}
										</p>
									</div>
								</div>
							)}
						</div>

						{/* Examples */}

						{currentGrammar.examples?.length ? (
							<div className="space-y-3">
								<h3 className="font-medium">Ví dụ</h3>

								{currentGrammar.examples.map((example, index) => (
									<div
										key={index}
										className="rounded-lg border bg-muted/40 p-4">
										<p className="text-base">
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

										<p className="mt-2 text-sm text-muted-foreground">
											{example.vi}
										</p>
									</div>
								))}
							</div>
						) : null}

						{/* Navigation */}

						<div className="border-t pt-6">
							<div className="grid grid-cols-2 gap-6">
								<button
									onClick={handlePrevGrammar}
									disabled={grammarIndex === 0}
									className="text-left transition disabled:opacity-40">
									<div className="text-sm text-muted-foreground">
										← Mẫu trước
									</div>

									{grammarIndex > 0 && (
										<div className="font-jp text-lg font-medium text-primary">
											{grammar[grammarIndex - 1].pattern}
										</div>
									)}
								</button>

								<button
									onClick={handleNextGrammar}
									disabled={grammarIndex === grammar.length - 1}
									className="text-right transition disabled:opacity-40">
									<div className="text-sm text-muted-foreground">
										Mẫu tiếp →
									</div>

									{grammarIndex < grammar.length - 1 && (
										<div className="font-jp text-lg font-medium text-primary">
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

						<div className="flex items-center justify-between">
							<Button variant="outline" onClick={() => setViewMode("grammar")}>
								← Xem ngữ pháp
							</Button>

							<span className="text-sm text-muted-foreground">
								{grammarIndex + 1}/{grammar.length}
							</span>
						</div>

						{/* Quiz */}

						<div className="space-y-6">
							{currentGrammar.quiz?.map((question, questionIndex) => (
								<div key={questionIndex} className="rounded-lg border p-4">
									<p className="mb-4 font-medium">Câu {questionIndex + 1}</p>

									<div className="mb-4 text-lg">
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
													className={`w-full rounded-lg border p-3 text-left transition ${
														selected ? "border-primary" : "border-border"
													} ${
														submitted && isCorrect ? "bg-green-500/10" : ""
													}`}>
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
								<div className="rounded-lg border bg-muted/40 p-4 text-center">
									<p className="text-lg font-semibold">Kết quả</p>

									<p className="mt-2">
										{score}/{currentGrammar.quiz?.length ?? 0} câu đúng
									</p>
								</div>

								<div className="flex gap-3">
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
