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
// ---- Learning path -----------------------------------------------------------

// Every certification a learner could see on the dashboard.
export const CATALOG_QUERY = `*[_type == "certification" && status in ["active", "comingSoon"]] | order(code asc) {
  code,
  label,
  title,
  track,
  level,
  status,
  "prerequisite": prerequisite->{code, label},
  exam{questionCount, durationMinutes, passPercentage},
  "moduleCount": count(*[_type == "module" && course->certification._ref == ^._id])
}`;

// One certification with its course, modules in order, how many knowledge-check
// questions each module has, and which exam sets exist. Only `hasPdf` is read
// here — the Drive link itself is fetched by /api/materials and never reaches a page.
export const COURSE_QUERY = `*[_type == "certification" && code == $code][0] {
  _id,
  code,
  label,
  title,
  status,
  validityYears,
  exam,
  "templateUrl": certificateTemplate.asset->url,
  "course": *[_type == "course" && certification._ref == ^._id && status != "archived"] | order(_createdAt asc)[0] {
    _id,
    title,
    summary,
    "modules": *[_type == "module" && course._ref == ^._id] | order(order asc) {
      _id,
      order,
      title,
      summary,
      estimatedMinutes,
      "hasPdf": defined(pdfDriveLink),
      "checkCount": count(*[_type == "question" && usedFor == "knowledgeCheck" && status == "active" && module._ref == ^._id])
    }
  },
  "examSets": array::unique(*[_type == "question" && usedFor == "exam" && status == "active" && certification._ref == ^._id].examSet)
}`;

// The 2–3 questions shown after one module's PDF. No answer key.
export const KNOWLEDGE_CHECK_QUERY = `*[_type == "question" && usedFor == "knowledgeCheck" && status == "active" && module._ref == $moduleId] | order(sourceNo asc)[0...3] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// Every question in one exam set. No answer key.
export const EXAM_SET_QUESTIONS_QUERY = `*[_type == "question" && usedFor == "exam" && status == "active" && certification->code == $code && examSet == $set] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// Questions by id, for showing a frozen exam paper. No answer key.
export const QUESTIONS_BY_ID_QUERY = `*[_type == "question" && _id in $ids] {
  _id,
  prompt,
  questionType,
  "options": options[]${EXAM_OPTION_PROJECTION}
}`;

// SERVER ONLY — the answer key. The result of this query is used to mark
// answers and must never be returned to the browser as-is.
export const ANSWER_KEY_QUERY = `*[_type == "question" && _id in $ids] {
  _id,
  "correct": options[isCorrect == true][0]._key,
  explanation
}`;
