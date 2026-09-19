// Edit the shared letter here. Use the certificate file path as a key in
// overrides when one student needs a different message later.
const teacherNote = {
  greeting: "Assalamu Alaikum 🌷",
  paragraphs: [
    "As you receive this certificate today, I want to leave you with a few sincere words that I hope stays with you for a long time.",
    "I am very proud of your academic progress, I am far more interested in the person you are becoming (Ibad-ur-Rahman) [25:63-74], a person of good character, good intentions, and beneficial knowledge. 🌸",
    "You might be reading this today, or perhaps you have stumbled upon this note years from now. Whenever it finds you, I hope it finds you doing well. 🌻",
    "Don't think one student is teachers favorite, Each student is special for their teacher. and it was a privilege having YOU as a student, I am grateful to be part of your learning journey, and I appreciate your role in completing this journey with struggles and efforts.",
    "This certificate represents your hard work, but the real test of your education comes in the unscripted moments when plans fail, days feel heavy, and self-doubt appears. You will face setbacks and deep uncertainty but in those moments keep going and do not let them break your spirit or define your worth. Never let a difficult chapter convince you that your story is over. Hold firmly to your kindness even when the world feels unkind, and remain grounded in humility [25:63]. Focus on continuous growth. Work hard so your career is successful, but strive even harder so your character is exceptional. 💡",
    "I also want you to know that you are valuable [17:70] and you all MATTER!, so Keep building yourself. Keep your character beautiful. Keep seeking knowledge—beyond certificates or jobs [58:11]. Your knowledge should be beneficial to others. wherever life takes you, try to remain humble, honest, and hopeful. Growth takes time, and strong people are built through struggle, patience, and consistency. ",
    "On a personal note, I also want to apologize if I ever fell short. I know main kuch bhi bol jata hoon 😅 and bezzti ky binna baat samaj nhi aati students ko, but I never intend to hurt you. So please forgive me for any mistakes I made. My intention has always been your betterment. And make this a rule for peaceful life: galti ho ya na ho foran maafi maang liya karein aur sabko maaf bhi kar diya karein! [24:22]. It keeps the heart lighter.",
    "And also remember, when things get difficult, you're never alone— (only) اللّٰه is always with you. ❤️‍🩹",
    "If you ever need guidance, you can always reach out (Jawab na aaye tw naraz na hona — just remind kar dena (more than once) ma bhool jata hu / busy 🙂).",
  ],
  reminder:
    "Never forget this: You are important! Stay strong. Keep learning. Keep smiling. Keep growing and never stop moving forward. 🌟",
  signOff:
    "With heartfelt wishes and a lot of sincere prayers for all of you that Allah bless you in both lives, put barakah in your efforts, increase you in beneficial knowledge, protects your heart, make your future better than your past, and make you a source of goodness for others. May He also guide you, strengthen you, and open doors of خير for you. Ameen. ✨",
  signature: "Your teacher, Shehzad Iqbal",
  overrides: {
    // "certificates/example.pdf": { paragraphs: ["A personal message..."] }
  },
};

function noteFor(certificate) {
  return { ...teacherNote, ...teacherNote.overrides[certificate.file] };
}
