import Link from "next/link";
import { FiCheck, FiLock, FiPlay, FiAward } from "react-icons/fi";

const ICON = {
  done: { Icon: FiCheck, className: "bg-[#E4F7EC] text-[#1B8A4B]" },
  current: { Icon: FiPlay, className: "bg-[#E8EEFF] text-brand" },
  locked: { Icon: FiLock, className: "bg-[#F1F4F9] text-slate-soft" },
};

const ROW = "flex items-start gap-3 rounded-lg px-2 py-2";

// One line of the outline: state icon, small eyebrow, title.
function Row({ state, Icon = ICON[state].Icon, eyebrow, title, current }) {
  const muted = state === "locked";
  return (
    <>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${ICON[state].className}`}
      >
        <Icon className="h-3 w-3" />
      </span>
      <span className="min-w-0">
        <span
          className={`block text-[11px] ${current ? "text-brand" : "text-slate-soft"}`}
        >
          {eyebrow}
        </span>
        <span
          className={`line-clamp-2 block text-sm leading-snug ${muted ? "text-slate-soft" : "text-ink"} ${
            current ? "font-semibold" : ""
          }`}
        >
          {title}
        </span>
      </span>
    </>
  );
}

// A row is a link when its step is unlocked, plain text otherwise.
function Item({ href, unlocked, current, children }) {
  const cls = `${ROW} ${current ? "bg-[#E8EEFF]" : unlocked ? "hover:bg-catskill" : ""}`;
  return unlocked ? (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cls}
    >
      {children}
    </Link>
  ) : (
    <div className={cls}>{children}</div>
  );
}

// Left-hand outline for the learning pages: every module in order with its
// state, and the final exam at the end. Progress itself is shown in the
// CourseHeader tiles, not here.
export default function CourseOutline({ course, base, currentId }) {
  const { outline, enrolment } = course;
  const passed = enrolment.status === "passed";
  const examState = passed
    ? "done"
    : outline.examUnlocked
      ? "current"
      : "locked";

  return (
    <aside className="border-mist rounded-2xl border bg-white p-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <p className="text-brand px-2 pt-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
        Course outline
      </p>

      <ol className="mt-3 space-y-0.5">
        {outline.steps.map((s) => (
          <li key={s._id}>
            <Item
              href={`${base}/${s._id}`}
              unlocked={s.unlocked}
              current={s._id === currentId}
            >
              <Row
                state={s.state}
                eyebrow={`Module ${s.order}`}
                title={s.title}
                current={s._id === currentId}
              />
            </Item>
          </li>
        ))}

        <li className="border-mist mt-2 border-t pt-2">
          <Item
            href={`${base}/exam`}
            unlocked={outline.examUnlocked}
            current={currentId === "exam"}
          >
            <Row
              state={examState}
              Icon={FiAward}
              eyebrow={
                passed
                  ? "Passed"
                  : outline.examUnlocked
                    ? "Ready to take"
                    : "Unlocks after the last module"
              }
              title="Final exam"
              current={currentId === "exam"}
            />
          </Item>
        </li>
      </ol>
    </aside>
  );
}
