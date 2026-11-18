import { FiCheck } from "react-icons/fi";

// The "Get certified. Prove your expertise." panel beside the learner login,
// built in HTML instead of a picture so it stays sharp on every screen.
//
// Every position and size is taken from the 1177 × 1336 design and written in
// design pixels through u(), which turns them into a share of the panel's
// width (cqw). The whole panel therefore scales as one piece, like an image,
// at whatever width the page gives it.
const W = 1177;
const H = 1336;
const u = (px) => `${((px / W) * 100).toFixed(4)}cqw`;

const BG = "#001A46";
const BLUE = "#005CFB";
const INK = "#0E1A3A";
const GREY = "#5F6C89";
const GREEN = "#119A4E";
const GREEN_BG = "#D4F7E8";
const SKY = "#7FA8FF";
const CARD_SHADOW = `0 ${u(22)} ${u(44)} rgba(0, 6, 30, 0.45)`;

// Text placed by its left edge and the middle of its line.
function Text({ x, cy, size, weight = 400, color, style, children }) {
  return (
    <span
      style={{
        position: "absolute",
        left: u(x),
        top: u(cy - size * 0.6),
        fontSize: u(size),
        lineHeight: 1.2,
        fontWeight: weight,
        color,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// A positioned box in design pixels.
function Box({ x, y, w, h, style, children }) {
  return (
    <div
      style={{
        position: "absolute",
        left: u(x),
        top: u(y),
        width: u(w),
        height: u(h),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// Rounded label with centred text (Passed, Verifiable ID, PAM 101, …).
function Pill({ x, y, w, h, bg, border, radius = 999, children, style }) {
  return (
    <Box
      x={x}
      y={y}
      w={w}
      h={h}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius === 999 ? 999 : u(radius),
        background: bg,
        border,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </Box>
  );
}

const STEPS = [
  { n: 1, title: "Register", text: "Pick the certifications you want" },
  { n: 2, title: "Get approved", text: "Your login arrives by email" },
  { n: 3, title: "Learn & certify", text: "Finish modules, pass the exam" },
];
const STEP_X = [61, 423, 785];

export default function LoginIllustration({ className = "", style }) {
  return (
    <div
      role="img"
      aria-label="Iraje University: course progress, a certificate of achievement and a passed final exam. Get certified in three steps: register, get approved, learn and certify."
      className={className}
      style={{ containerType: "inline-size", ...style }}
    >
      {/* The navy panel, at the design's full shape. If its container is
          ever taller (h-full), the extra is plain navy below the steps, so
          nothing distorts. */}
      <div
        aria-hidden="true"
        className="font-display relative h-full overflow-hidden select-none"
        style={{
          minHeight: u(H),
          backgroundColor: BG,
          // Dot grid: one dot every 37 design px, first at (22, 22).
          backgroundImage: `radial-gradient(circle, #2A4A86 ${u(1.4)}, transparent ${u(1.9)})`,
          backgroundSize: `${u(37)} ${u(37)}`,
          backgroundPosition: `${u(3.5)} ${u(3.5)}`,
        }}
      >
        {/* The design itself, at its exact shape, pinned to the top. */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ aspectRatio: `${W} / ${H}` }}
        >
        {/* The two arcs behind the cards. */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <circle
            cx="1032"
            cy="110"
            r="300"
            fill="none"
            stroke={BLUE}
            strokeOpacity="0.75"
            strokeWidth="2"
          />
          <circle
            cx="1032"
            cy="110"
            r="430"
            fill="none"
            stroke={BLUE}
            strokeOpacity="0.75"
            strokeWidth="2"
          />
        </svg>

        {/* "Iraje University" tag */}
        <Pill
          x={59}
          y={54}
          w={203}
          h={54}
          bg="rgba(255,255,255,0.07)"
          border={`${u(2)} solid rgba(255,255,255,0.22)`}
          style={{ fontSize: u(22), fontWeight: 600, color: "#fff" }}
        >
          Iraje University
        </Pill>

        {/* Certificate (slightly tilted, under the course card) */}
        <Box
          x={284}
          y={208}
          w={612}
          h={390}
          style={{
            background: "#fff",
            borderRadius: u(22),
            borderTop: `${u(8)} solid ${BLUE}`,
            boxShadow: CARD_SHADOW,
            transform: "rotate(-1.6deg)",
          }}
        >
          {/* Award seal */}
          <Box
            x={493}
            y={32}
            w={78}
            h={78}
            style={{
              borderRadius: 999,
              border: `${u(3)} solid ${BLUE}`,
              background: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: u(60),
                height: u(60),
                borderRadius: 999,
                background: BLUE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: u(30), height: u(30) }}
              >
                <circle cx="12" cy="9" r="5" />
                <path d="M9 13.5 8 21l4-2.2 4 2.2-1-7.5" />
              </svg>
            </div>
          </Box>
          <Text
            x={38}
            cy={144}
            size={15}
            weight={500}
            color="#3D4A6B"
            style={{ letterSpacing: "0.22em" }}
          >
            CERTIFICATE OF ACHIEVEMENT
          </Text>
          <Text x={38} cy={186} size={32} weight={600} color={INK}>
            Certified Associate
          </Text>
          <Text
            x={38}
            cy={228}
            size={25}
            weight={400}
            color={BLUE}
            style={{ fontStyle: "italic" }}
          >
            PAM Fundamentals
          </Text>
          <Box
            x={38}
            y={268}
            w={534}
            h={2}
            style={{ background: "#DDE4F1" }}
          />
          <Text x={42} cy={300} size={16} color={GREY}>
            Awarded to
          </Text>
          <Text x={42} cy={331} size={21} weight={600} color={INK}>
            Your name
          </Text>
          <Pill
            x={404}
            y={306}
            w={170}
            h={42}
            bg={GREEN_BG}
            style={{
              gap: u(8),
              fontSize: u(18),
              fontWeight: 600,
              color: GREEN,
            }}
          >
            <FiCheck style={{ width: u(17), height: u(17) }} strokeWidth={3} />
            Verifiable ID
          </Pill>
        </Box>

        {/* Course progress card */}
        <Box
          x={58}
          y={150}
          w={362}
          h={172}
          style={{
            background: "#fff",
            borderRadius: u(22),
            boxShadow: CARD_SHADOW,
          }}
        >
          <Pill
            x={27}
            y={23}
            w={96}
            h={38}
            bg={BLUE}
            radius={8}
            style={{ fontSize: u(17), fontWeight: 600, color: "#fff" }}
          >
            PAM 101
          </Pill>
          <Text
            x={0}
            cy={42}
            size={18}
            color={GREY}
            style={{ left: "auto", right: u(26) }}
          >
            Course
          </Text>
          <Text x={27} cy={93} size={21.5} weight={600} color={INK}>
            Modules complete
          </Text>
          <Box
            x={27}
            y={130}
            w={246}
            h={10}
            style={{ background: BLUE, borderRadius: 999 }}
          />
          <Text x={286} cy={135} size={20} weight={600} color={INK}>
            15/15
          </Text>
        </Box>

        {/* Final exam card */}
        <Box
          x={767}
          y={532}
          w={352}
          h={208}
          style={{
            background: "#fff",
            borderRadius: u(22),
            boxShadow: CARD_SHADOW,
          }}
        >
          <Text x={27} cy={41} size={19} color={GREY}>
            Final exam
          </Text>
          <Pill
            x={230}
            y={21}
            w={96}
            h={38}
            bg={GREEN_BG}
            style={{ fontSize: u(18), fontWeight: 600, color: GREEN }}
          >
            Passed
          </Pill>
          <Text x={25} cy={96} size={52} weight={700} color="#0B4FD6">
            86%
          </Text>
          {/* Score bar: 86% filled, tick at the 70% pass mark. */}
          <Box
            x={27}
            y={138}
            w={299}
            h={9}
            style={{
              background: "#DBE6F8",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "86%",
                height: "100%",
                background: "#09B055",
                borderRadius: 999,
              }}
            />
          </Box>
          <Box
            x={235}
            y={131}
            w={3}
            h={23}
            style={{ background: INK, borderRadius: 2 }}
          />
          <Text x={27} cy={173} size={18} color={GREY}>
            Pass mark 70%
          </Text>
        </Box>

        {/* "6 certifications - 3 tracks" tag */}
        <Box
          x={69}
          y={638}
          w={364}
          h={74}
          style={{
            borderRadius: 999,
            background: "rgba(255,255,255,0.07)",
            border: `${u(2)} solid rgba(255,255,255,0.22)`,
          }}
        >
          <Box
            x={13}
            y={14}
            w={46}
            h={46}
            style={{
              borderRadius: 999,
              background: "#86B4F8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke={BG}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: u(22), height: u(22) }}
            >
              <path d="M3 3v18h18" />
              <path d="m7 15 4-4 3 3 5-6" />
            </svg>
          </Box>
          <Text x={76} cy={36} size={20.7} weight={600} color="#fff">
            6 certifications · 3 tracks
          </Text>
        </Box>

        {/* Headline */}
        <Text x={61} cy={823} size={45} weight={600} color="#fff">
          Get{" "}
          <span style={{ color: SKY, fontStyle: "italic", fontWeight: 400 }}>
            certified.
          </span>{" "}
          Prove your expertise.
        </Text>

        {/* Steps: numbered dots joined by lines, then title and line of text. */}
        <Box
          x={120}
          y={912}
          w={298}
          h={2}
          style={{ background: BLUE, opacity: 0.7 }}
        />
        <Box
          x={482}
          y={912}
          w={293}
          h={2}
          style={{ background: BLUE, opacity: 0.7 }}
        />
        {STEPS.map((s, i) => (
          <div key={s.n}>
            <Pill
              x={STEP_X[i]}
              y={887}
              w={52}
              h={52}
              bg={s.n === 3 ? "#fff" : BLUE}
              border={s.n === 3 ? `${u(2)} solid ${BLUE}` : undefined}
              style={{
                fontSize: u(19),
                fontWeight: 600,
                color: s.n === 3 ? INK : "#fff",
              }}
            >
              {s.n}
            </Pill>
            <Text x={STEP_X[i]} cy={975} size={25} weight={600} color="#fff">
              {s.title}
            </Text>
            <Text
              x={STEP_X[i]}
              cy={1013}
              size={19.7}
              color="rgba(255,255,255,0.88)"
            >
              {s.text}
            </Text>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
