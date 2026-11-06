import EventsVideo from "@/components/Events/EventsVideo";
import EventsArchive from "@/components/Events/EventsArchive";

// /events — the "Iraje Live" video, then the archive of past and upcoming events.
export default function EventsPage() {
  return (
    <>
      <EventsVideo />
      <EventsArchive />
    </>
  );
}

export const metadata = {
  title: "Events | Iraje",
  description:
    "Talks, booths, roundtables and training — where Iraje has shown up and where we're headed next, from CIO Association conclaves to GISEC Dubai.",
};
