// Edit the shared letter here. Use the certificate file path as a key in
// overrides when one student needs a different message later.
const teacherNote = {
  greeting: "Assalamu Alaikum,",
  paragraphs: [
    "As you receive your certificate, I want you to know something beyond any grade or achievement: you matter to me. I am grateful that I got to be a small part of your journey.",
    "Life will bring difficult days. When they come, please do not let one setback decide what you believe about yourself. Take a breath, ask Allah for strength, and keep going. There is ease with hardship.",
    "Keep learning, keep growing, and keep your heart kind. Work hard, smile when you can, and be the sort of person who brings good into other people’s lives. I am proud of your progress, and I sincerely pray for the person you are becoming."
  ],
  reminder: "You are important. Stay strong. Keep moving forward.",
  signOff: "With prayers and best wishes,",
  signature: "Your teacher, Shehzad",
  overrides: {
    // "certificates/example.pdf": { paragraphs: ["A personal message..."] }
  }
};

function noteFor(certificate) {
  return { ...teacherNote, ...teacherNote.overrides[certificate.file] };
}
