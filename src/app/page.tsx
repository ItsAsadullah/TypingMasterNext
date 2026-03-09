import { BookOpen, Timer, Gamepad2, BarChart3, Keyboard } from "lucide-react";

const cards = [
  {
    title: "Studying",
    description: "Start from Home Row and progress through structured lessons.",
    icon: BookOpen,
    color: "bg-emerald-500/10 text-emerald-600",
    cta: "Go to Lessons",
  },
  {
    title: "Typing Test",
    description: "Take a 1, 3, or 5 minute timed test and get your WPM score.",
    icon: Timer,
    color: "bg-blue-500/10 text-blue-600",
    cta: "Start Test",
  },
  {
    title: "Games",
    description: "Beat the boredom — type falling words before they hit the ground.",
    icon: Gamepad2,
    color: "bg-violet-500/10 text-violet-600",
    cta: "Play Now",
  },
  {
    title: "Statistics",
    description: "View your speed history, accuracy trends and session records.",
    icon: BarChart3,
    color: "bg-amber-500/10 text-amber-600",
    cta: "View Stats",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 flex items-center gap-6 shadow-xl">
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/40 shrink-0">
          <Keyboard className="w-8 h-8 text-white" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-white text-2xl font-bold leading-tight">
            Welcome to TechHat Typing Master
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-lg">
            Learn Bangla (Bijoy &amp; Avro) and English typing — with lessons,
            speed tests, games &amp; AI-powered feedback.
          </p>
        </div>
      </div>

      {/* Quick-access cards */}
      <div>
        <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-widest mb-4">
          Quick Access
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map(({ title, description, icon: Icon, color, cta }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${color}`}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <h4 className="text-gray-900 font-semibold text-base leading-tight mb-1">
                {title}
              </h4>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {description}
              </p>
              <span className="text-sm font-medium text-emerald-600 group-hover:underline">
                {cta} →
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        Built by{" "}
        <span className="font-semibold text-gray-500">Md Asadullah</span> ·
        TechHat · Jhenaidah, Bangladesh
      </p>
    </div>
  );
}

