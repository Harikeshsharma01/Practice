const topic = ({
  id,
  title,
  category = "Computer science",
  minutes = 15,
  lab = null,
  summary,
  objectives,
  notes,
  example,
  practical,
  quiz,
}) => ({
  id,
  title,
  category,
  minutes,
  lab,
  summary,
  objectives,
  notes,
  example,
  practical,
  quiz,
});

// Original foundation supplements. The board unit and assessment alignments
// remain provisional until the applicable official documents can be checked.
export const expandedLessons = [
  topic({
    id: "python-functions",
    title: "Small functions, big ideas",
    category: "Programming",
    lab: "trace",
    summary: "Turn a repeated task into a clear, reusable Python function.",
    objectives: [
      "Define functions with parameters and return values.",
      "Trace a function call and its local variables.",
    ],
    notes: [
      [
        "Make a function",
        "Use def followed by a name, parentheses and a colon. The indented body runs when the function is called.",
      ],
      [
        "Inputs and outputs",
        "Parameters are names in a definition; arguments are values in a call. return sends a value to the caller. print displays text without returning the displayed value.",
      ],
      [
        "Scope",
        "Variables created inside a function are local to that call. Prefer arguments and returned results to changing global state.",
      ],
      [
        "Test the contract",
        "State valid inputs and expected outputs. Test a typical value, boundary cases and invalid values.",
      ],
    ],
    example: {
      title: "A safe percentage function",
      problem: "Return a percentage for a score out of a maximum.",
      solution:
        "Check that the maximum is positive and the score is in range, then return the calculation.",
      code: 'def percentage(score, maximum):\n    if maximum <= 0 or not 0 <= score <= maximum:\n        raise ValueError("Invalid score")\n    return score / maximum * 100\n\nprint(percentage(45, 50))  # 90.0',
    },
    practical: {
      task: "Return the larger of two numeric inputs.",
      steps: [
        "Define a function with two parameters.",
        "Compare the values.",
        "Return the larger value and call the function.",
      ],
      answer:
        "def larger(a, b):\n    if a >= b:\n        return a\n    return b\n\nresult = larger(8, 5)",
    },
    quiz: {
      question: "Which statement sends a function's result to its caller?",
      options: ["print", "return", "input", "break"],
      answer: 1,
      explanation:
        "return provides a value to the calling expression; print displays text.",
    },
  }),
  topic({
    id: "lists-and-tuples",
    title: "Lists, tuples & index detective",
    category: "Programming",
    lab: "arrays",
    summary:
      "Trace sequence positions and choose a mutable or fixed collection.",
    objectives: [
      "Trace zero-based positions and slices.",
      "Distinguish mutable lists from immutable tuples.",
    ],
    notes: [
      [
        "Positions begin at zero",
        "The first element has index 0; the last has index length−1. Negative indices count from the end, so −1 means the last item.",
      ],
      [
        "Lists can change",
        "Lists are mutable sequences. append adds at the end. A slice scores[1:4] includes index 1 and stops before index 4.",
      ],
      [
        "Tuples keep their shape",
        "Tuples are immutable sequences. A one-element tuple requires a trailing comma, as in (5,).",
      ],
      [
        "Aliasing",
        "Two variable names can reference the same list. Changes through either name affect that same object; list(original) makes a shallow copy.",
      ],
    ],
    example: {
      title: "The middle three readings",
      problem: "Select 21, 19 and 25 from [18, 21, 19, 25, 20].",
      solution:
        "The first element is index 0 and a slice excludes the stop index; use [1:4].",
      code: "readings = [18, 21, 19, 25, 20]\nprint(readings[1:4])  # [21, 19, 25]\nprint(readings[-1])   # 20",
    },
    practical: {
      task: "Update the second of three readings and display the last.",
      steps: [
        "Create a three-value list.",
        "Replace the value at index 1.",
        "Use a negative index to display the final item.",
      ],
      answer:
        "readings = [18, 21, 19]\nreadings[1] = 22\nprint(readings[-1])  # 19",
    },
    quiz: {
      question: "Which positions are selected by items[1:4]?",
      options: ["1, 2 and 3", "1, 2, 3 and 4", "Only 4", "The first four"],
      answer: 0,
      explanation:
        "A slice includes its starting position and excludes its ending position.",
    },
  }),
  topic({
    id: "recursion",
    title: "Recursion: a problem calls itself",
    category: "Problem solving",
    lab: "trace",
    summary: "Watch recursive calls build up and return their results.",
    objectives: [
      "Identify a recursive function's base case and step.",
      "Trace calls as they use the call stack.",
    ],
    notes: [
      [
        "Reduce the problem",
        "Recursion solves a problem using a smaller instance of that same problem.",
      ],
      [
        "Base case",
        "A base case returns an answer without making another call. Without one, calls can continue until Python raises RecursionError.",
      ],
      [
        "Make progress",
        "Each recursive step must move the input measurably closer to the base case.",
      ],
      [
        "Follow the stack",
        "Each call retains its own local variables while waiting for its child. Returned results then unwind through the waiting calls.",
      ],
    ],
    example: {
      title: "Count down to ready",
      problem: "Trace countdown(3) until all calls return.",
      solution:
        "Calls progress through 3, 2, 1 and 0. Zero stops recursion; the waiting calls then finish.",
      code: 'def countdown(n):\n    if n == 0:\n        print("Ready!")\n        return\n    print(n)\n    countdown(n - 1)',
    },
    practical: {
      task: "Return the sum from 1 to n with a recursive function.",
      steps: [
        "Reject negative input.",
        "Return zero for the base case n == 0.",
        "Otherwise return n plus the result for n−1.",
      ],
      answer:
        'def sum_to(n):\n    if n < 0:\n        raise ValueError("n must be non-negative")\n    if n == 0:\n        return 0\n    return n + sum_to(n - 1)',
    },
    quiz: {
      question: "What makes a recursive function stop safely?",
      options: [
        "A base case and progress toward it",
        "A global variable",
        "An import",
        "An extra print",
      ],
      answer: 0,
      explanation:
        "The base case ends the calls; the recursive step must move closer to it.",
    },
  }),
  topic({
    id: "searching",
    title: "Find it faster: linear & binary search",
    category: "Algorithms",
    lab: "search",
    summary: "Compare search strategies and follow every comparison.",
    objectives: [
      "Trace linear search and binary search.",
      "Explain binary search's sorted-data requirement.",
    ],
    notes: [
      [
        "Linear search",
        "Inspect values one by one until the target is found or the collection ends. Linear search works on unsorted data.",
      ],
      [
        "Binary search",
        "Inspect the middle of a sorted range. Keep the half that could contain the target and discard the other half.",
      ],
      [
        "Order is essential",
        "A middle comparison can rule out half the values only if their sorted order is known.",
      ],
      [
        "Compare the work",
        "Linear search may inspect every value: O(n). Binary search halves the remaining range: O(log n). Check empty inputs and missing targets.",
      ],
    ],
    example: {
      title: "Look for 23",
      problem: "Binary-search [4, 8, 12, 17, 23, 29, 31] for 23.",
      solution:
        "Check index 3: 17 is small, so keep the right side. Check index 5: 29 is large. Check index 4 and find 23.",
      code: "low, high = 0, 6\n# mid=3 → 17: search right\n# mid=5 → 29: search left\n# mid=4 → found 23",
    },
    practical: {
      task: "Trace linear search for 29 in [4, 8, 12, 17, 23, 29].",
      steps: [
        "Begin at index zero.",
        "Compare every value with 29 in order.",
        "Record the final index and number of comparisons.",
      ],
      answer:
        "Compare 4, 8, 12, 17, 23, then 29. The target is at index 5 after six comparisons.",
    },
    quiz: {
      question:
        "What must be true before binary search can discard half the values?",
      options: [
        "The values are sorted",
        "The target is first",
        "There are no integers",
        "The list is mutable",
      ],
      answer: 0,
      explanation:
        "Sorted order makes each middle comparison sufficient to choose a side.",
    },
  }),
  topic({
    id: "data-structures-plus",
    title: "Stacks & queues: two very different lines",
    category: "Data structures",
    lab: "stack",
    summary: "Explore last-in-first-out stacks and first-in-first-out queues.",
    objectives: [
      "Distinguish stack and queue ordering.",
      "Trace common insertion and removal operations.",
    ],
    notes: [
      [
        "Stack: last in, first out",
        "Push inserts at the top. Pop removes the newest item; a pile of plates is a familiar analogy.",
      ],
      [
        "Queue: first in, first out",
        "Enqueue inserts at the back. Dequeue removes from the front; a waiting line preserves arrival order.",
      ],
      [
        "Guard empty and full states",
        "Check whether a structure is empty before removing values. A fixed-capacity structure also checks that it is not full before insertion.",
      ],
      [
        "Choose by the task",
        "Use a stack when newest work is handled first, as with simple undo history. Use a queue for tasks handled in arrival order.",
      ],
    ],
    example: {
      title: "Help-desk tickets",
      problem:
        "Tickets A, B and C arrive in that order. Which does a queue handle first?",
      solution:
        "The queue removes ticket A first, preserving the arrival order.",
      code: 'from collections import deque\nqueue = deque(["A", "B", "C"])\nprint(queue.popleft())  # A\nqueue.append("D")',
    },
    practical: {
      task: "Push 3 and 8 on a stack, pop one, and show the remainder.",
      steps: [
        "Create an empty list.",
        "Append 3 and then 8.",
        "Pop once and display the value and list.",
      ],
      answer:
        "stack = []\nstack.extend([3, 8])\nremoved = stack.pop()\nprint(removed, stack)  # 8 [3]",
    },
    quiz: {
      question: "Which item does a queue normally remove first?",
      options: [
        "Newest arrival",
        "Oldest arrival",
        "Middle item",
        "Random item",
      ],
      answer: 1,
      explanation:
        "FIFO means first in, first out: the oldest item is removed first.",
    },
  }),
  topic({
    id: "database-design",
    title: "Design a tidy relational database",
    category: "Databases",
    lab: "query",
    summary: "Connect students, courses and marks without repeating each fact.",
    objectives: [
      "Choose primary and foreign keys.",
      "Trace a one-to-many relationship and a join.",
    ],
    notes: [
      [
        "One fact, one home",
        "Store a student's name in the students table instead of copying it beside every mark. Reducing repeated facts helps prevent inconsistent updates.",
      ],
      [
        "Primary key",
        "A primary key uniquely identifies a row. A stable identifier such as student_id can remain unchanged if a student's name changes.",
      ],
      [
        "Foreign key",
        "A foreign key refers to a related table's key. It describes a relationship and helps the database protect referential integrity.",
      ],
      [
        "Join related facts",
        "A JOIN combines rows whose keys match. One student can relate to many result records.",
      ],
    ],
    example: {
      title: "Keep each student's name once",
      problem: "A student may sit many tests. Where should each fact live?",
      solution:
        "Store students in students(student_id, name) and test results in results(result_id, student_id, assessment, marks). student_id in results refers to the student.",
      code: "SELECT s.name, r.assessment, r.marks\nFROM students AS s\nJOIN results AS r\n ON r.student_id = s.student_id;",
    },
    practical: {
      task: "Sketch books and loans tables with the key connecting them.",
      steps: [
        "Give each book a unique book_id.",
        "Give every loan a unique loan_id and book_id.",
        "Explain what happens when the referenced book does not exist.",
      ],
      answer:
        "books(book_id PRIMARY KEY, title)\nloans(loan_id PRIMARY KEY, book_id FOREIGN KEY, borrower, returned_on)\nA foreign-key rule can prevent a loan from referencing a missing book.",
    },
    quiz: {
      question: "What does a foreign key do?",
      options: [
        "Refer to a row in a related table",
        "Sort all rows",
        "Count columns",
        "Replace every name",
      ],
      answer: 0,
      explanation: "A foreign key refers to a row's key in a related table.",
    },
  }),
  topic({
    id: "network-addressing",
    title: "IP addresses & the subnet lens",
    category: "Networks",
    lab: "address",
    summary: "Separate a network prefix from host addresses with a /24.",
    objectives: [
      "Read IPv4 address octets and prefix length.",
      "Find the network part of a /24 example.",
    ],
    notes: [
      [
        "IPv4 addresses",
        "Four decimal octets form an IPv4 address. Each ranges from 0 through 255 and represents eight bits.",
      ],
      [
        "Prefix length",
        "/24 means the leading 24 bits identify the network. The remaining eight bits identify addresses in that subnet.",
      ],
      [
        "A familiar subnet",
        "For 192.168.10.0/24, the network address is 192.168.10.0. Under ordinary subnet addressing, .255 is its broadcast address.",
      ],
      [
        "Private networks",
        "Private IPv4 ranges are intended for networks such as homes and schools. NAT and router rules affect how those devices reach external networks.",
      ],
    ],
    example: {
      title: "Same neighbourhood?",
      problem: "Are 192.168.10.20 and .80 in the same /24 subnet?",
      solution:
        "Yes. Both share the three octets covered by the 24-bit network prefix: 192.168.10.0/24.",
      code: "192.168.10.20/24 → network 192.168.10.0\n192.168.10.80/24 → network 192.168.10.0",
    },
    practical: {
      task: "Find the shared /24 subnet for 10.5.7.12 and 10.5.7.200.",
      steps: [
        "Compare the first three octets.",
        "Write zero for the network address's final octet.",
        "Explain what /24 denotes.",
      ],
      answer:
        "Both addresses are in 10.5.7.0/24. The first 24 bits identify the network prefix.",
    },
    quiz: {
      question: "How many leading network bits does /24 describe?",
      options: ["8", "16", "24", "32"],
      answer: 2,
      explanation:
        "The number after the slash gives the number of leading prefix bits.",
    },
  }),
  topic({
    id: "cybersecurity",
    title: "Safer passwords & stronger sign-ins",
    category: "Digital citizenship",
    summary: "Build habits around unique passwords, MFA and phishing.",
    objectives: [
      "Choose a unique password strategy.",
      "Identify phishing and explain multifactor authentication.",
    ],
    notes: [
      [
        "Use long, unique passwords",
        "A long unique password resists guessing better than predictable substitutions. Avoid reusing sensitive passwords.",
      ],
      [
        "Store them safely",
        "A reputable password manager can generate and remember unique credentials. Protect its account and recovery route.",
      ],
      [
        "Add a second factor",
        "Multifactor authentication uses different kinds of proof. Use phishing-resistant security keys when available, or another supported authenticator.",
      ],
      [
        "Resist urgency",
        "Verify unexpected links, attachments, payments and login alerts through a trusted channel. Never share an OTP or recovery code.",
      ],
    ],
    example: {
      title: "A surprise school-login alert",
      problem:
        "A message asks you to open a link and read your OTP to support.",
      solution:
        "Do not open the link or share the code. Contact school IT using a known official address and report the message.",
      code: "PAUSE → verify through a known channel → report\nNever share an OTP or recovery code.",
    },
    practical: {
      task: "Make a secure-account checklist without writing an actual password.",
      steps: [
        "Create a unique password with a password manager.",
        "Enable a supported second factor.",
        "Store recovery codes securely and privately.",
      ],
      answer:
        "Use a unique managed password, enable MFA, secure recovery codes privately, and verify unexpected sign-in messages independently.",
    },
    quiz: {
      question: "What is the safest response to an unexpected OTP request?",
      options: [
        "Share it if the sender sounds official",
        "Post it to a class chat",
        "Do not share it; verify independently",
        "Share it after class",
      ],
      answer: 2,
      explanation:
        "An OTP can grant access. Never disclose it, even to a person claiming to be support.",
    },
  }),
  topic({
    id: "css-layout",
    title: "Make a web page find its shape",
    category: "Web development",
    lab: "layout",
    summary:
      "Try responsive columns and watch a layout adapt to smaller screens.",
    objectives: [
      "Describe how CSS Grid shares space.",
      "Use a media query to change a layout at a breakpoint.",
    ],
    notes: [
      [
        "HTML and CSS",
        "HTML describes content and meaning; CSS controls its presentation.",
      ],
      [
        "Flexible columns",
        "CSS Grid can divide free room using fractions such as repeat(3, minmax(0, 1fr)).",
      ],
      [
        "Responsive change",
        "A media query applies styles when the viewport meets a condition such as max-width: 640px.",
      ],
      [
        "Check usability",
        "Review text wrapping, horizontal overflow, keyboard focus and zoom with realistic content.",
      ],
    ],
    example: {
      title: "Three columns, one phone",
      problem: "Show three desktop cards in one column on a narrow screen.",
      solution:
        "Use three flexible Grid columns, then change the grid to one column at a 640px breakpoint.",
      code: ".cards { display: grid;\n grid-template-columns: repeat(3, minmax(0, 1fr));\n gap: 1rem; }\n@media (max-width: 640px) {\n .cards { grid-template-columns: 1fr; }\n}",
    },
    practical: {
      task: "Add two flexible columns that become one at 480px.",
      steps: [
        "Give the container a class.",
        "Use Grid and a gap.",
        "Add a max-width media query and check a narrow viewport.",
      ],
      answer:
        ".cards { display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:1rem; }\n@media(max-width:480px) { .cards { grid-template-columns:1fr; } }",
    },
    quiz: {
      question:
        "Which CSS feature applies styles when a screen meets a condition?",
      options: [
        "An alt attribute",
        "A media query",
        "A primary key",
        "A tuple",
      ],
      answer: 1,
      explanation:
        "A media query lets CSS respond to viewport conditions such as its width.",
    },
  }),
  topic({
    id: "colour-codes",
    title: "Pixels, colour & accessible contrast",
    category: "Digital media",
    lab: "rgb",
    summary:
      "Blend RGB light, read a hexadecimal colour and check text contrast.",
    objectives: [
      "Read RGB and hex colour notation.",
      "Explain a contrast ratio check.",
    ],
    notes: [
      [
        "Screens mix light",
        "A screen combines red, green and blue light. Each RGB channel ranges from 0 to 255.",
      ],
      [
        "Read hexadecimal",
        "CSS #RRGGBB contains two hexadecimal digits for each colour channel. #00FF00 represents full green.",
      ],
      [
        "Check readability",
        "WCAG AA generally calls for a contrast ratio of 4.5:1 for ordinary text and 3:1 for large text.",
      ],
      [
        "Do not rely on colour alone",
        "Add text, patterns or shape differences so meaning remains clear when colours are hard to distinguish.",
      ],
    ],
    example: {
      title: "A colour from three channels",
      problem: "Convert RGB(0, 128, 255) into #RRGGBB.",
      solution:
        "0 is 00, 128 is 80 and 255 is FF; write the channels in that order: #0080FF.",
      code: "RGB(0, 128, 255) → #0080FF\n00 red · 80 green · FF blue",
    },
    practical: {
      task: "Make a bright orange pixel with half-strength green.",
      steps: [
        "Set red to 255, green to 128 and blue to 0.",
        "Convert each channel to a two-digit hexadecimal value.",
        "Check text contrast before putting text on that colour.",
      ],
      answer: "RGB(255, 128, 0) converts to #FF8000.",
    },
    quiz: {
      question: "What does #0000FF represent?",
      options: ["Maximum red", "Maximum green", "Maximum blue", "Black"],
      answer: 2,
      explanation:
        "CSS hex pairs are red, green and blue. FF is the highest channel value.",
    },
  }),
  topic({
    id: "half-adder",
    title: "A full adder: two outputs from three bits",
    category: "Digital logic",
    lab: "adder",
    summary: "Toggle A, B and carry-in to see sum and carry change.",
    objectives: [
      "Construct a full-adder truth table.",
      "Distinguish a sum bit from carry-out.",
    ],
    notes: [
      [
        "Three inputs",
        "A full adder combines A, B and carry-in (Cin), producing a sum bit S and carry-out Cout.",
      ],
      [
        "Sum uses parity",
        "S is 1 when an odd number of input bits are 1; equivalently S = A XOR B XOR Cin.",
      ],
      [
        "Carry uses majority",
        "Cout is 1 when at least two inputs are 1: AB + ACin + BCin.",
      ],
      [
        "Check 1+1+1",
        "The inputs total three, or binary 11. Thus S=1 and Cout=1.",
      ],
    ],
    example: {
      title: "One plus one plus one",
      problem: "Find S and Cout when A, B and Cin are all 1.",
      solution:
        "1+1+1 is 3, or binary 11. The lower bit is S and the next bit is carry-out.",
      code: "total = A + B + Cin\nS = total % 2\nCout = total // 2\n# 3 → binary 11: S=1, Cout=1",
    },
    practical: {
      task: "Calculate all eight full-adder outputs.",
      steps: [
        "List input rows 000 through 111.",
        "Add each row's three bits.",
        "Find S from remainder modulo 2 and Cout from integer division by 2.",
      ],
      answer:
        "ABCin→SCout\n000→00, 001→10, 010→10, 011→01\n100→10, 101→01, 110→01, 111→11",
    },
    quiz: {
      question:
        "A full adder combines three inputs to produce which two outputs?",
      options: [
        "A sum bit and carry-out",
        "Two decimal digits",
        "One output only",
        "Three carry bits",
      ],
      answer: 0,
      explanation:
        "The sum bit and the carry-out represent a binary addition result.",
    },
  }),
];
