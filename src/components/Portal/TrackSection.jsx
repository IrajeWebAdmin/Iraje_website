import {
  FiShield,
  FiMonitor,
  FiBookOpen,
  FiUsers,
  FiLayers,
} from "react-icons/fi";
import CourseCard from "./CourseCard";

const ICONS = {
  pam: FiShield,
  epm: FiMonitor,
  cybertantra: FiBookOpen,
  iam: FiUsers,
};

// One track (PAM, EPM, …): a small heading, then its certifications two-up.
export default function TrackSection({ group, passedCodes }) {
  const Icon = ICONS[group.track] ?? FiLayers;
  return (
    <section className="scroll-mt-24">
      <div className="flex items-center gap-3">
        <span className="border-mist text-shuttle flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-white">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-ink text-sm font-semibold">{group.title}</h2>
          {group.subtitle && (
            <p className="text-shuttle text-xs">{group.subtitle}</p>
          )}
        </div>
      </div>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {group.items.map((card) => (
          <CourseCard
            key={card.cert.code}
            card={card}
            passedCodes={passedCodes}
          />
        ))}
      </ul>
    </section>
  );
}
