// =============================================================================
//  TechHat Typing Master — English Curriculum
//  Hierarchy: Course → Module → Lesson → Drill
//
//  This file is the single source of truth for all lesson/drill content.
//  It can be seeded into the Postgres DB via `prisma/seed.ts` later.
// =============================================================================

export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type DrillType  = "key" | "word" | "sentence" | "paragraph" | "blind" | "intro" | "tip";

export interface StarsThreshold {
  stars: 1 | 2 | 3;
  minAccuracy: number; // 0–100
  minWpm:      number;
}

export interface IntroPage {
  title:    string;
  titleBn?: string;
  body:     string;   // plain text; use \n for new lines and "\u2022 " prefix for bullets
  bodyBn?:  string;
  image?:   string;   // path relative to public/ e.g. "/hands/left-home-row-1.png"
}

export interface Drill {
  id:         string;
  title:      string;
  type:       DrillType;
  content:    string;          // text the user must type (empty for intro/tip)
  difficulty: Difficulty;
  timeLimit:  number;          // seconds (0 = unlimited)
  targetWpm:  number;
  starsThresholds: StarsThreshold[];
  hint?:      string;          // optional coaching hint
  pages?:     IntroPage[];     // multi-page slides for intro / tip drills
}

export interface Lesson {
  id:          string;
  title:       string;
  description: string;
  difficulty:  Difficulty;
  drills:      Drill[];
}

export interface Module {
  id:          string;
  title:       string;
  subtitle:    string;
  icon:        string;         // emoji icon
  color:       string;         // Tailwind bg class
  lessons:     Lesson[];
}

export interface Course {
  id:      string;
  title:   string;
  locale:  "en" | "bn";
  modules: Module[];
}

// ─── Star threshold factory ────────────────────────────────────────────────

function stars(
  s3wpm: number, s3acc: number,
  s2wpm: number, s2acc: number,
  s1wpm: number, s1acc: number,
): StarsThreshold[] {
  return [
    { stars: 3, minWpm: s3wpm, minAccuracy: s3acc },
    { stars: 2, minWpm: s2wpm, minAccuracy: s2acc },
    { stars: 1, minWpm: s1wpm, minAccuracy: s1acc },
  ];
}

// =============================================================================
//  FAST TOUCH TYPING — 12 Lessons
//  Follows the classic typing-tutor sequence:
//   1  The Home Row          — a s d f  j k l ;
//   2  Keys E and I          — e i
//   3  Keys R and U          — r u
//   4  Keys T and O          — t o
//   5  Capital Letters & .   — Shift + letters, period
//   6  Keys C and ,          — c ,
//   7  Keys G H and '        — g h '
//   8  Keys V N and ?        — v n ?
//   9  Keys W and M          — w m
//  10  Keys Q and P          — q p
//  11  Keys B and Y          — b y
//  12  Keys Z and X          — z x
// =============================================================================

const FAST_TOUCH_MODULE: Module = {
  id:       "mod-fast-touch",
  title:    "Fast Touch Typing Course",
  subtitle: "Master all 26 keys without looking",
  icon:     "⌨️",
  color:    "bg-blue-500",
  lessons: [

    // ── Lesson 1 — The Home Row ───────────────────────────────────────────────
    {
      id:          "les-01-home-row",
      title:       "The Home Row",
      description: "Place your left fingers on A S D F and right fingers on J K L ; — this is your home base.",
      difficulty:  "BEGINNER",
      drills: [
        // 1.1
        {
          id:        "d-01-1-intro-basics",
          title:     "Touch typing basics",
          type:      "intro",
          content:   "",
          difficulty:"BEGINNER",
          timeLimit: 0,
          targetWpm: 0,
          starsThresholds: [],
          pages: [
            {
              title:   "What Is Touch Typing?",
              titleBn: "টাচ টাইপিং কী?",
              body:    "What Is Touch Typing?:\n\"Touch typing\" lets you type quickly and accurately using all 10 fingers — without ever looking at the keyboard.\n\nWhat You Will Learn:\n\u2022 Type faster using all 10 fingers\n\u2022 Type without errors\n\u2022 Never look at the keyboard again\n\u2022 Build better computing habits\n\nWhy It Matters:\nYou will type documents and emails much faster with fewer mistakes — saving hours every week and making typing genuinely enjoyable.",
              bodyBn:  "টাচ টাইপিং কী?:\n\"টাচ টাইপিং\" হলো দশটি আঙ্গুল ব্যবহার করে কীবোর্ডের দিকে না তাকিয়ে দ্রুত ও নির্ভুলভাবে টাইপ করার কৌশল।\n\nএই কোর্সে যা শিখবেন:\n\u2022 দশ আঙ্গুলে দ্রুত টাইপ করতে\n\u2022 ভুল ছাড়াই টাইপ করতে\n\u2022 কীবোর্ডের দিকে না তাকিয়ে টাইপ করতে\n\u2022 সঠিক মুদ্রাভঙ্গিতে কম্পিউটার ব্যবহার করতে\n\nকেন গুরুত্বপূর্ণ:\nএর ফলে আপনি অনেক দ্রুত ডকুমেন্ট ও ইমেইল লিখতে পারবেন — অনেক সময় বাঁচবে এবং টাইপিং আনন্দদায়ক হয়ে উঠবে।",
            },
            {
              title:   "Finger Positions",
              titleBn: "আঙ্গুলের অবস্থান",
              body:    "Your Starting Position:\nIn their basic position, your fingers rest on the middle row — also called the \"home row\". This is your base for reaching all other keys.\n\nPlace Your Fingers Now:\n1. Left fingers on keys A  S  D  F\n2. Right fingers on keys J  K  L  ;\n3. Both thumbs resting on the Space bar\n4. Wrists straight, fingers lightly curled\n\nTip! Can you feel the small bumps on F and J? They help you find the home row without looking.",
              bodyBn:  "শুরুর অবস্থান:\nআপনার আঙ্গুলগুলো কীবোর্ডের মাঝের সারিতে থাকে — যাকে \"হোম রো\" বলা হয়। হোম রো থেকেই সব কী'তে পৌঁছানো যায়।\n\nএখনই আঙ্গুল রাখুন:\n১. বাম হাতের আঙ্গুল A  S  D  F কী'তে\n২. ডান হাতের আঙ্গুল J  K  L  ; কী'তে\n৩. উভয় বুড়ো আঙ্গুল স্পেসবারে আলতোভাবে\n৪. কব্জি সোজা, আঙ্গুল সামান্য বাঁকানো\n\nটিপ! F এবং J কী'তে ছোট উঁচু দাগ অনুভব করছেন? এগুলো কীবোর্ড না দেখেও হোম রো খুঁজে পেতে সাহায্য করে।",
              image:   "/hands/left-home-row-1.png",
            },
            {
              title:   "Pressing Keys",
              titleBn: "কী চাপার পদ্ধতি",
              body:    "The Rule:\nEach key is pressed by the nearest home-row finger. After pressing any key, return your finger to its home position immediately.\n\nExample — How to Type A:\n1. Make sure your fingers are on the home row\n2. Your left pinky naturally rests on A\n3. Press A with a quick, light touch\n4. Return your pinky to A right away\n\nThe Space Bar:\n\u2022 Use your right thumb for the space bar\n\u2022 Left-handed? Use your left thumb instead\n\u2022 Choose one thumb and always stick with it\n\u2022 Never use both thumbs at the same time",
              bodyBn:  "নিয়মটি হলো:\nপ্রতিটি কী হোম রোর নিকটতম আঙ্গুল দিয়ে চাপতে হয়। কী চাপার পরপরই আঙ্গুলকে হোম পজিশনে ফিরিয়ে আনতে হবে।\n\nউদাহরণ — A টাইপ করা:\n১. আঙ্গুল হোম রোতে আছে কিনা নিশ্চিত করুন\n২. বাম হাতের কনিষ্ঠ আঙ্গুল স্বাভাবিকভাবেই A'তে থাকে\n৩. A হালকাভাবে চাপুন, হাত শিথিল রাখুন\n৪. সঙ্গে সঙ্গে কনিষ্ঠ আঙ্গুল A'তে ফিরিয়ে আনুন\n\nস্পেসবার সম্পর্কে:\n\u2022 ডান বুড়ো আঙ্গুল দিয়ে স্পেস চাপুন\n\u2022 বাঁহাতি হলে বাম বুড়ো আঙ্গুল ব্যবহার করুন\n\u2022 একটি বুড়ো আঙ্গুল বেছে নিন এবং সেটাতেই থাকুন\n\u2022 একসাথে দুটো বুড়ো আঙ্গুল কখনো ব্যবহার করবেন না",
              image:   "/hands/right-home-row-1.png",
            },
            {
              title:   "Learning Tips",
              titleBn: "শেখার টিপস",
              body:    "Eyes on the Monitor:\nYou learn key positions much faster when you resist peeking at the keyboard while training. Trust your fingers!\n\nKeep Wrists Up:\nResting wrists on the desk creates an awkward angle — fingers are harder to move, errors increase and speed drops. Keep wrists elevated.\n\nFocus on Accuracy:\n\u2022 Accuracy is the foundation of fast typing\n\u2022 Speed builds naturally with practice\n\u2022 Aim for high accuracy before chasing WPM\n\u2022 You will have an accuracy target in every drill",
              bodyBn:  "মনিটরের দিকে তাকান:\nট্রেনিংয়ের সময় কীবোর্ডের দিকে না তাকালে কী অবস্থান অনেক দ্রুত মনে থাকে। আঙ্গুলের উপর ভরসা রাখুন!\n\nকব্জি উঁচুতে রাখুন:\nকব্জি ডেস্কে রাখলে অস্বস্তিকর কোণ তৈরি হয় — আঙ্গুল নাড়ানো কঠিন হয়, ভুল বাড়ে এবং গতি কমে। কব্জি সবসময় উঁচুতে রাখুন।\n\nনির্ভুলতায় মনোযোগ দিন:\n\u2022 নির্ভুলতা হলো দ্রুত টাইপিংয়ের ভিত্তি\n\u2022 গতি অনুশীলনের সাথে নিজে থেকেই আসে\n\u2022 WPM তাড়ানোর আগে নির্ভুলতায় মনোযোগ দিন\n\u2022 প্রতিটি ড্রিলে একটি নির্ভুলতার লক্ষ্যমাত্রা থাকবে",
            },
            {
              title:   "Ready to Start",
              titleBn: "শুরু করার জন্য প্রস্তুত",
              body:    "Posture Checklist:\n\u2022 Sit up straight, elbows close to your body\n\u2022 Keep shoulders, arms and hands relaxed\n\u2022 Eyes on the screen — never on the keyboard\n\u2022 Fingers resting lightly on the home row\n\nTaking Breaks:\n\u2022 Rest between exercises to stay sharp\n\u2022 Do only 1\u20132 lessons per day\n\u2022 Short daily sessions beat long marathons\n\nYou are ready!\nPress Forward below to begin your first key drill and start your touch typing journey!",
              bodyBn:  "ভঙ্গির চেকলিস্ট:\n\u2022 সোজা হয়ে বসুন, কনুই শরীরের কাছে রাখুন\n\u2022 কাঁধ, বাহু ও হাত শিথিল রাখুন\n\u2022 চোখ স্ক্রিনে — কখনো কীবোর্ডে নয়\n\u2022 আঙ্গুল হোম রোতে আলতোভাবে রাখুন\n\nবিরতি নেওয়ার নিয়ম:\n\u2022 মনোযোগ ধরে রাখতে ব্যায়ামের মাঝে বিরতি নিন\n\u2022 দিনে মাত্র ১\u20132টি পাঠ পড়ুন\n\u2022 প্রতিদিন অল্প অনুশীলন দীর্ঘ সেশনের চেয়ে বেশি কার্যকর\n\nআপনি প্রস্তুত!\nনিচের সামনে যান বাটন চেপে প্রথম কী ড্রিল শুরু করুন এবং টাচ টাইপিং যাত্রা শুরু করুন!",
            },
          ],
        },
        // 1.2
        {
          id:        "d-01-2-intro-homerow",
          title:     "New keys: Home row",
          type:      "intro",
          content:   "",
          difficulty:"BEGINNER",
          timeLimit: 0,
          targetWpm: 0,
          starsThresholds: [],
          pages: [
            {
              title:   "The Home Row Keys",
              titleBn: "হোম রো কী",
              body:    "The home row is the most important row on the keyboard. Your fingers return here after every keystroke.\n\nLeft Hand — place each finger on:\n\u2022 Pinky → A\n\u2022 Ring finger → S\n\u2022 Middle finger → D\n\u2022 Index finger → F\n\nRight Hand — place each finger on:\n\u2022 Index finger → J\n\u2022 Middle finger → K\n\u2022 Ring finger → L\n\u2022 Pinky → ;\n\nBoth thumbs rest on the Space bar. Feel the raised bumps on F and J — these are your anchor keys.",
              bodyBn:  "হোম রো হলো কীবোর্ডের সবচেয়ে গুরুত্বপূর্ণ সারি। প্রতিটি কীস্ট্রোকের পর আঙ্গুল এখানেই ফিরে আসে।\n\nবাম হাত — প্রতিটি আঙ্গুল রাখুন:\n\u2022 কনিষ্ঠ আঙ্গুল → A\n\u2022 অনামিকা → S\n\u2022 মধ্যমা → D\n\u2022 তর্জনী → F\n\nডান হাত — প্রতিটি আঙ্গুল রাখুন:\n\u2022 তর্জনী → J\n\u2022 মধ্যমা → K\n\u2022 অনামিকা → L\n\u2022 কনিষ্ঠ আঙ্গুল → ;\n\nউভয় বুড়ো আঙ্গুল স্পেসবারে। F ও J'তে উঁচু দাগ অনুভব করুন — এগুলো আপনার নোঙ্গর কী।",
              image:   "/hands/left-home-row-1.png",
            },
            {
              title:   "Home Row Practice Tips",
              titleBn: "হোম রো অনুশীলনের টিপস",
              body:    "Before You Start the Key Drill:\n1. Place your fingers on the home row right now\n2. Close your eyes and feel the F and J bumps\n3. Curl your fingers slightly — not flat, not stiff\n4. Keep your wrists lifted off the desk\n5. Look at the screen, not the keyboard\n\nGood to Know:\n\u2022 Every letter here — A S D F J K L — is home row only\n\u2022 No finger needs to move away from home row\n\u2022 This is the perfect drill to build muscle memory",
              bodyBn:  "কী ড্রিল শুরুর আগে:\n১. এখনই আঙ্গুল হোম রোতে রাখুন\n২. চোখ বন্ধ করুন এবং F ও J'এর উঁচু দাগ অনুভব করুন\n৩. আঙ্গুল সামান্য বাঁকান — সম্পূর্ণ সোজাও না, শক্তও না\n৪. কব্জি ডেস্ক থেকে উঁচুতে রাখুন\n৫. স্ক্রিনের দিকে তাকান, কীবোর্ডের দিকে নয়\n\nজানা দরকার:\n\u2022 এই পাঠের প্রতিটি অক্ষর — A S D F J K L — শুধুই হোম রো\n\u2022 কোনো আঙ্গুলকে হোম রো থেকে সরাতে হবে না\n\u2022 মাসল মেমোরি তৈরির জন্য এটি সেরা ড্রিল",
              image:   "/hands/right-home-row-1.png",
            },
          ],
        },
        // 1.3
        {
          id:        "d-01-3-intro-results",
          title:     "Understanding results",
          type:      "intro",
          content:   "",
          difficulty:"BEGINNER",
          timeLimit: 0,
          targetWpm: 0,
          starsThresholds: [],
          pages: [
            {
              title:   "Understanding Your Results",
              titleBn: "ফলাফল বোঝা",
              body:    "After each drill you will see two key measurements:\n\nWPM \u2014 Words Per Minute\nThis is your typing speed. One \"word\" = 5 characters (including spaces). A beginner typically starts at 10\u201320 WPM. With practice, 60+ WPM is achievable.\n\nAccuracy\nThis is the percentage of keystrokes you typed correctly. Always aim for accuracy before speed. Typing at 95%+ accuracy is more important than going fast with many mistakes.\n\nStars\n\u2605\u2605\u2605 Three stars = excellent speed AND accuracy\n\u2605\u2605\u2606 Two stars = good \u2014 keep practising\n\u2605\u2606\u2606 One star = completed \u2014 try again to improve\n\nTip: Focus on hitting the right keys first. Speed comes naturally as accuracy builds.",
              bodyBn:  "প্রতিটি ড্রিল শেষে আপনি দুটি গুরুত্বপূর্ণ পরিমাপ দেখবেন:\n\nWPM \u2014 প্রতি মিনিটে শব্দ\nএটি আপনার টাইপিং গতি। একটি শব্দ = ৫টি অক্ষর (স্পেসসহ)। শুরুতে ১০\u201320 WPM স্বাভাবিক। নিয়মিত অনুশীলনে 60+ WPM সম্ভব।\n\nনির্ভুলতা\nআপনি কতটি কী সঠিকভাবে চেপেছেন তার শতকরা হার। গতির আগে সবসময় নির্ভুলতাকে প্রাধান্য দিন। 95%+ নির্ভুল থাকা অনেক বেশি গুরুত্বপূর্ণ।\n\nতারা\n\u2605\u2605\u2605 তিন তারা = চমৎকার গতি ও নির্ভুলতা\n\u2605\u2605\u2606 দুই তারা = ভালো \u2014 আরো অনুশীলন করুন\n\u2605\u2606\u2606 এক তারা = সম্পন্ন \u2014 উন্নতির জন্য আবার চেষ্টা করুন\n\nটিপ: প্রথমে সঠিক কী চাপায় মনোযোগ দিন। নির্ভুলতা বাড়লে গতি এমনিই আসবে।",
            },
          ],
        },
        // 1.4
        {
          id:        "d-01-4-key",
          title:     "Key drill",
          type:      "key",
          content:   "a s d f j k l a s d f j k l f d s a l k j f j d k s l a f j d k a f s j d k l a s f d j k l",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 10,
          hint:      "Left fingers rest on A S D F. Right fingers rest on J K L ; — never look at the keys!",
          starsThresholds: stars(10,98, 6,92, 3,80),
        },
        // 1.5
        {
          id:        "d-01-5-tip-tests",
          title:     "Tip: Typing tests (Online)",
          type:      "tip",
          content:   "",
          difficulty:"BEGINNER",
          timeLimit: 0,
          targetWpm: 0,
          starsThresholds: [],
          pages: [
            {
              title:   "Typing Tests Online",
              titleBn: "অনলাইন টাইপিং টেস্ট",
              body:    "Once you have finished the home row drill, try measuring your real-world speed on a free online typing test.\n\nPopular sites:\n\u2022 keybr.com \u2014 adaptive key practice\n\u2022 10fastfingers.com \u2014 1-minute speed tests\n\u2022 monkeytype.com \u2014 clean, customisable tests\n\nHow often should you test?\nTest yourself once per day after your lesson. Watching your WPM rise over time is one of the best motivators to keep going.\n\nRemember: consistent daily practice of 15 to 20 minutes leads to faster improvement than occasional long sessions.",
              bodyBn:  "হোম রো ড্রিল শেষ করার পর, বিনামূল্যের অনলাইন টাইপিং টেস্টে আপনার আসল গতি পরিমাপ করুন।\n\nজনপ্রিয় সাইট:\n\u2022 keybr.com \u2014 অভিযোজিত কী অনুশীলন\n\u2022 10fastfingers.com \u2014 ১ মিনিটের গতি পরীক্ষা\n\u2022 monkeytype.com \u2014 পরিষ্কার, কাস্টমাইজযোগ্য পরীক্ষা\n\nকতবার টেস্ট করবেন?\nপাঠের পর প্রতিদিন একবার নিজেকে পরীক্ষা করুন। সময়ের সাথে WPM বাড়তে দেখা সবচেয়ে ভালো অনুপ্রেরণার মধ্যে একটি।\n\nমনে রাখুন: দীর্ঘ বিরতিহীন সেশনের চেয়ে প্রতিদিন ১৫\u2013২০ মিনিট অনুশীলন অনেক বেশি কার্যকর।",
            },
          ],
        },
        // 1.6
        {
          id:        "d-01-6-word",
          title:     "Word drill",
          type:      "word",
          content:   "add fad sad ask dad all fall shall flask salad lads disk jaded skill",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 12,
          hint:      "Stay on the home row — every letter here uses only A S D F J K L.",
          starsThresholds: stars(12,97, 8,90, 4,78),
        },
        // 1.7
        {
          id:        "d-01-7-paragraph",
          title:     "Paragraph drill",
          type:      "paragraph",
          content:   "A sad dad asked a lad. All flasks fall. Jaded kids ask dad a sad fad. A lass asks a lad. Dad adds a flask. Skill falls flat if a lad asks all.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 15,
          starsThresholds: stars(15,97, 10,90, 5,78),
        },
      ],
    },

    // ── Lesson 2 — Keys E and I ───────────────────────────────────────────────
    {
      id:          "les-02-e-i",
      title:       "Keys E and I",
      description: "E is typed with your left middle finger reaching up from D. I is typed with your right middle finger reaching up from K.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-02-1-key",
          title:     "Key Drill: e i",
          type:      "key",
          content:   "d e d e d e k i k i k i de ed ki ik dei iek edi ikd dede kiki",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 12,
          hint:      "Middle finger up from D reaches E. Middle finger up from K reaches I.",
          starsThresholds: stars(12,97, 8,90, 4,78),
        },
        {
          id:        "d-02-2-word",
          title:     "Word Drill: E and I Words",
          type:      "word",
          content:   "see led die kid silk idea deal else file idle isle like side life",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 14,
          starsThresholds: stars(14,97, 9,90, 5,78),
        },
        {
          id:        "d-02-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "She liked the idea. I said it is ideal. Jeff filed a ski lease deal.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 16,
          starsThresholds: stars(16,96, 11,88, 6,76),
        },
      ],
    },

    // ── Lesson 3 — Keys R and U ───────────────────────────────────────────────
    {
      id:          "les-03-r-u",
      title:       "Keys R and U",
      description: "R is reached with your left index finger stretching up from F. U is reached with your right index finger stretching up from J.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-03-1-key",
          title:     "Key Drill: r u",
          type:      "key",
          content:   "f r f r f r j u j u j u fr rf ju uj frf juj rfu ujr rfr uju",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 12,
          hint:      "Index finger stretches up from F to reach R. Right index stretches up from J to reach U.",
          starsThresholds: stars(12,97, 8,90, 4,78),
        },
        {
          id:        "d-03-2-word",
          title:     "Word Drill: R and U Words",
          type:      "word",
          content:   "rule ruse ride sure lure rude urge pure rise user real rural fuse",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 15,
          starsThresholds: stars(15,97, 10,90, 5,78),
        },
        {
          id:        "d-03-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "She will rule. Use a ruler. A sure cure is pure juice. Drive further.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 17,
          starsThresholds: stars(17,96, 12,88, 7,76),
        },
      ],
    },

    // ── Lesson 4 — Keys T and O ───────────────────────────────────────────────
    {
      id:          "les-04-t-o",
      title:       "Keys T and O",
      description: "T is reached with your left index finger. O is reached with your right ring finger stretching up from L.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-04-1-key",
          title:     "Key Drill: t o",
          type:      "key",
          content:   "f t f t f t l o l o l o ft tf lo ol ftf lol tfo olt fto",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "Left index reaches T from F. Right ring finger reaches O from L.",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-04-2-word",
          title:     "Word Drill: T and O Words",
          type:      "word",
          content:   "too lot note tool told torn soft sort root total other store floor",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 16,
          starsThresholds: stars(16,97, 11,90, 6,78),
        },
        {
          id:        "d-04-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "She took the tools to the store. The total cost of those roses is too low.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 18,
          starsThresholds: stars(18,96, 13,88, 7,76),
        },
      ],
    },

    // ── Lesson 5 — Capital Letters and Period ─────────────────────────────────
    {
      id:          "les-05-capitals-period",
      title:       "Capital Letters and Period",
      description: "Use the Shift key for capitals. The period (.) is typed with your right ring finger reaching down from L.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-05-1-key",
          title:     "Key Drill: Shift + period",
          type:      "key",
          content:   "A S D F J K L Al As Jk Fl Sd Ka l. s. d. f. j. k. Al. As. Jf.",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 12,
          hint:      "Hold Shift with your pinky while striking the letter key. Keep all other fingers on home row.",
          starsThresholds: stars(12,97, 8,90, 4,78),
        },
        {
          id:        "d-05-2-word",
          title:     "Word Drill: Capitalized Words",
          type:      "word",
          content:   "Ali Sara Dora Fela Joel Karl Lisa Jeff Dale Isla Real True Fill",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 14,
          starsThresholds: stars(14,97, 9,90, 5,78),
        },
        {
          id:        "d-05-3-sentence",
          title:     "Sentence Drill: Capitals and Periods",
          type:      "sentence",
          content:   "Ali said hello. Sara liked the idea. Joel took the last seat. Dora left.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 18,
          starsThresholds: stars(18,96, 13,88, 7,76),
        },
      ],
    },

    // ── Lesson 6 — Keys C and Comma ──────────────────────────────────────────
    {
      id:          "les-06-c-comma",
      title:       "Keys C and Comma",
      description: "C is typed with your left middle finger reaching down from D. The comma (,) is typed with your right middle finger reaching down from K.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-06-1-key",
          title:     "Key Drill: c ,",
          type:      "key",
          content:   "d c d c d c k , k , k , dc cd k, ,k cdc k,k dcd ,k, dc k,",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "Left middle finger reaches down from D to C. Right middle finger reaches down from K to comma.",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-06-2-word",
          title:     "Word Drill: C Words and Comma Phrases",
          type:      "word",
          content:   "rice, ice, ace, circle, ocean, code, slice, clock, score, office, once,",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 15,
          starsThresholds: stars(15,97, 10,90, 5,78),
        },
        {
          id:        "d-06-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "I like coffee, rice, and ice. She scored a circle of success, of course.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 18,
          starsThresholds: stars(18,96, 13,88, 7,76),
        },
      ],
    },

    // ── Lesson 7 — Keys G H and Apostrophe ───────────────────────────────────
    {
      id:          "les-07-g-h-apos",
      title:       "Keys G H and Apostrophe",
      description: "G is reached with your left index finger stretching from F. H is reached with your right index finger stretching from J. The apostrophe (') sits right of the semicolon.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-07-1-key",
          title:     "Key Drill: g h '",
          type:      "key",
          content:   "f g f g j h j h fg gf jh hj fgf jhj gh hg fg' jh' g'h h'g",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "G and H are inner index-finger keys. Your right pinky reaches for the apostrophe.",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-07-2-word",
          title:     "Word Drill: G H and Contractions",
          type:      "word",
          content:   "he's she'll I'd that's it's good high ghost eight rightough they'd",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 15,
          starsThresholds: stars(15,97, 10,90, 5,78),
        },
        {
          id:        "d-07-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "He's a great judge. She'll go high. It's a light right here. That's good.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 19,
          starsThresholds: stars(19,96, 14,88, 8,76),
        },
      ],
    },

    // ── Lesson 8 — Keys V N and Question Mark ────────────────────────────────
    {
      id:          "les-08-v-n-qmark",
      title:       "Keys V N and Question Mark",
      description: "V is typed with your left index finger reaching down from F. N is typed with your right index finger reaching down from J. The question mark (?) uses Shift + /.",
      difficulty:  "BEGINNER",
      drills: [
        {
          id:        "d-08-1-key",
          title:     "Key Drill: v n ?",
          type:      "key",
          content:   "f v f v j n j n fv vf jn nj fvf jnj vn nv? fv? jn? v? n?",
          difficulty:"BEGINNER",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "Left index reaches down to V. Right index reaches down to N. Shift+/ gives ?",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-08-2-word",
          title:     "Word Drill: V and N Words",
          type:      "word",
          content:   "vine,iven, never, novel, venue, invent, olive, nation, nerve, eleven,",
          difficulty:"BEGINNER",
          timeLimit: 90,
          targetWpm: 15,
          starsThresholds: stars(15,97, 10,90, 5,78),
        },
        {
          id:        "d-08-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "Have you ever driven to Nevada? No? Never visit in November? I've never gone.",
          difficulty:"BEGINNER",
          timeLimit: 120,
          targetWpm: 19,
          starsThresholds: stars(19,96, 14,88, 8,76),
        },
      ],
    },

    // ── Lesson 9 — Keys W and M ───────────────────────────────────────────────
    {
      id:          "les-09-w-m",
      title:       "Keys W and M",
      description: "W is reached with your left ring finger stretching up from S. M is reached with your right index finger stretching down and right from J.",
      difficulty:  "INTERMEDIATE",
      drills: [
        {
          id:        "d-09-1-key",
          title:     "Key Drill: w m",
          type:      "key",
          content:   "s w s w j m j m sw ws jm mj sws jmj wm mw sw jm wm sw mw",
          difficulty:"INTERMEDIATE",
          timeLimit: 60,
          targetWpm: 14,
          hint:      "Left ring finger reaches up from S to W. Right index finger sweeps down-right to M.",
          starsThresholds: stars(14,97, 10,90, 5,78),
        },
        {
          id:        "d-09-2-word",
          title:     "Word Drill: W and M Words",
          type:      "word",
          content:   "swim, warm, woman, world, wisdom, market, storm, welcome, medium, reward,",
          difficulty:"INTERMEDIATE",
          timeLimit: 90,
          targetWpm: 17,
          starsThresholds: stars(17,96, 12,88, 7,76),
        },
        {
          id:        "d-09-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "We must work with more wisdom. The whole team swam more often this warm summer.",
          difficulty:"INTERMEDIATE",
          timeLimit: 120,
          targetWpm: 20,
          starsThresholds: stars(20,96, 15,88, 9,76),
        },
      ],
    },

    // ── Lesson 10 — Keys Q and P ──────────────────────────────────────────────
    {
      id:          "les-10-q-p",
      title:       "Keys Q and P",
      description: "Q is reached with your left pinky stretching up from A. P is reached with your right pinky stretching up from ;.",
      difficulty:  "INTERMEDIATE",
      drills: [
        {
          id:        "d-10-1-key",
          title:     "Key Drill: q p",
          type:      "key",
          content:   "a q a q ; p ; p aq qa ;p p; aqa ;p; qp pq aq ;p qa p;",
          difficulty:"INTERMEDIATE",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "Pinky fingers handle Q and P — they need more practice reaching up.",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-10-2-word",
          title:     "Word Drill: Q and P Words",
          type:      "word",
          content:   "plan, quick, epic, equal, prior, quest, paper, pride, require, sequel,",
          difficulty:"INTERMEDIATE",
          timeLimit: 90,
          targetWpm: 17,
          starsThresholds: stars(17,96, 12,88, 7,76),
        },
        {
          id:        "d-10-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "The pilot prepared a proper plan. A quick pro equipped the squad for the project.",
          difficulty:"INTERMEDIATE",
          timeLimit: 120,
          targetWpm: 20,
          starsThresholds: stars(20,96, 15,88, 9,76),
        },
      ],
    },

    // ── Lesson 11 — Keys B and Y ──────────────────────────────────────────────
    {
      id:          "les-11-b-y",
      title:       "Keys B and Y",
      description: "B is typed with your left index finger reaching down from F. Y is typed with your right index finger reaching up from J.",
      difficulty:  "INTERMEDIATE",
      drills: [
        {
          id:        "d-11-1-key",
          title:     "Key Drill: b y",
          type:      "key",
          content:   "f b f b j y j y fb bf jy yj fbf jyj by yb bfy yjb fby yjf",
          difficulty:"INTERMEDIATE",
          timeLimit: 60,
          targetWpm: 14,
          hint:      "Left index reaches down to B. Right index reaches up to Y — same finger does both.",
          starsThresholds: stars(14,97, 10,90, 5,78),
        },
        {
          id:        "d-11-2-word",
          title:     "Word Drill: B and Y Words",
          type:      "word",
          content:   "body, byte, buddy, lobby, by, boyish, busy, baby, boldly, anybody, beauty,",
          difficulty:"INTERMEDIATE",
          timeLimit: 90,
          targetWpm: 17,
          starsThresholds: stars(17,96, 12,88, 7,76),
        },
        {
          id:        "d-11-3-sentence",
          title:     "Sentence Drill",
          type:      "sentence",
          content:   "By the bay, a baby bird built a nest. Bobby already typed every byte boldly.",
          difficulty:"INTERMEDIATE",
          timeLimit: 120,
          targetWpm: 21,
          starsThresholds: stars(21,96, 15,88, 9,76),
        },
      ],
    },

    // ── Lesson 12 — Keys Z and X ──────────────────────────────────────────────
    {
      id:          "les-12-z-x",
      title:       "Keys Z and X",
      description: "Z is reached with your left pinky reaching down from A. X is reached with your left ring finger reaching down from S.",
      difficulty:  "INTERMEDIATE",
      drills: [
        {
          id:        "d-12-1-key",
          title:     "Key Drill: z x",
          type:      "key",
          content:   "a z a z s x s x az za sx xs aza sxs zx xz azs sxa zxa xza",
          difficulty:"INTERMEDIATE",
          timeLimit: 60,
          targetWpm: 13,
          hint:      "Left pinky reaches down to Z. Left ring finger reaches down to X. These are your weakest keys — give them extra focus!",
          starsThresholds: stars(13,97, 9,90, 5,78),
        },
        {
          id:        "d-12-2-word",
          title:     "Word Drill: Z and X Words",
          type:      "word",
          content:   "zone, exact, froze, excel, oxide, blaze, fixed, prize, extra, six, exist,",
          difficulty:"INTERMEDIATE",
          timeLimit: 90,
          targetWpm: 17,
          starsThresholds: stars(17,96, 12,88, 7,76),
        },
        {
          id:        "d-12-3-sentence",
          title:     "Final Sentence Drill",
          type:      "sentence",
          content:   "The fox exited the zone exactly at six. Twelve zebras fixed extra exam boxes.",
          difficulty:"INTERMEDIATE",
          timeLimit: 120,
          targetWpm: 21,
          starsThresholds: stars(21,96, 16,88, 10,76),
        },
      ],
    },

  ],
};

// =============================================================================
//  FULL ENGLISH COURSE
// =============================================================================

export const ENGLISH_COURSE: Course = {
  id:      "course-en-full",
  title:   "Fast Touch Typing Course",
  locale:  "en",
  modules: [FAST_TOUCH_MODULE],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flatten all drills from a course for DB seeding */
export function getAllDrills(course: Course): (Drill & { moduleId: string; lessonId: string })[] {
  return course.modules.flatMap((mod) =>
    mod.lessons.flatMap((les) =>
      les.drills.map((d) => ({ ...d, moduleId: mod.id, lessonId: les.id }))
    )
  );
}

/** Find a drill by its ID */
export function findDrill(course: Course, drillId: string): Drill | undefined {
  return getAllDrills(course).find((d) => d.id === drillId);
}

/** Get total drill count for a module */
export function moduleDrillCount(mod: Module): number {
  return mod.lessons.reduce((sum, les) => sum + les.drills.length, 0);
}

/** Calculate earned stars from WPM + Accuracy */
export function calcStars(drill: Drill, wpm: number, accuracy: number): 0 | 1 | 2 | 3 {
  for (const t of drill.starsThresholds) {
    if (wpm >= t.minWpm && accuracy >= t.minAccuracy) return t.stars;
  }
  return 0;
}

/** Calculate XP earned from a drill result */
export function calcXp(wpm: number, accuracy: number, maxCombo: number): number {
  const base   = Math.floor((wpm * accuracy) / 100);
  const combo  = Math.floor(maxCombo / 10) * 5;
  return base + combo;
}
