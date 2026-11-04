import StatTile from "./StatTile";
import Disclosure from "./Disclosure";

// The headline figures of a report: the key tiles (four or five) in a row,
// and any tile the server marked `secondary` behind a small "more figures"
// toggle, so the page leads with what matters.
export default function StatTiles({ tiles = [] }) {
  const key = tiles.filter((t) => !t.secondary);
  const more = tiles.filter((t) => t.secondary);
  const cols =
    key.length <= 3
      ? "md:grid-cols-3"
      : key.length === 4
        ? "md:grid-cols-4"
        : "md:grid-cols-3 lg:grid-cols-5";

  return (
    <section aria-label="Headline figures">
      <ul className={`grid grid-cols-2 gap-3 ${cols}`}>
        {key.map(({ key: k, secondary, ...tile }) => (
          <li key={k ?? tile.label}>
            <StatTile {...tile} />
          </li>
        ))}
      </ul>
      {more.length > 0 ? (
        <Disclosure
          label={`${more.length} more figure${more.length === 1 ? "" : "s"}`}
          openLabel="Fewer figures"
          className="mt-2"
        >
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {more.map(({ key: k, secondary, ...tile }) => (
              <li key={k ?? tile.label}>
                <StatTile {...tile} size="sm" />
              </li>
            ))}
          </ul>
        </Disclosure>
      ) : null}
    </section>
  );
}
