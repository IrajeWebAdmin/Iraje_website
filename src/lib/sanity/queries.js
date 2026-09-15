// GROQ queries for the website. Run them through getSanityClient() only.
//
// SECURITY: question options carry `isCorrect`, the answer key. Any query whose
// result reaches a learner — a page, a Client Component prop, an API response —
// must project options with EXAM_OPTION_PROJECTION and nothing else. Never
// `options[]`, `options[]{...}`, or a bare `...` on a question. `explanation` is
// answer-adjacent too and stays out until the attempt is graded.
export const EXAM_OPTION_PROJECTION = "{_key, text}";

export const CERTIFICATIONS_QUERY = `*[_type == "certification"] | order(code asc) {
  _id,
  code,
  label,
  title,
  track,
  level,
  status,
  validityYears,
  exam,
  "prerequisite": prerequisite->{code, label}
}`;

export const COURSES_WITH_MODULES_QUERY = `*[_type == "course"] | order(certification->code asc) {
  _id,
  title,
  summary,
  status,
  "certification": certification->{code, label},
  "modules": *[_type == "module" && course._ref == ^._id] | order(order asc) {_id, order, title}
}`;

// Every active question for one certification. The exam engine will sample
// `exam.questionCount` of these and shuffle options per attempt; grading reads
// the answer key server-side with a separate query that never leaves the server.
export const EXAM_QUESTIONS_QUERY = `*[_type == "question" && status == "active" && certification->code == $code] {
  _id,
  prompt,
  difficulty,
  "category": category->title,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;
