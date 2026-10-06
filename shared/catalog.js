export const sources = [
  {
    title: "CBSE academic curriculum",
    url: "https://cbseacademic.nic.in/",
    note: "Check the current session’s Senior Secondary Computer Science (083) curriculum.",
  },
  {
    title: "CBSE skill education",
    url: "https://cbseacademic.nic.in/skill-education.html",
    note: "Check Information Technology (802), including employability skills and practical assessment.",
  },
  {
    title: "Maharashtra State Board",
    url: "https://mahahsscboard.in/",
    note: "Confirm the current bifocal Computer Science I and II theory and practical requirements.",
  },
  {
    title: "eBalbharati textbook library",
    url: "https://books.ebalbharati.in/",
    note: "Use the applicable official textbook and your institution’s approved practical list.",
  },
];
export const lessons = [
  {
    id: "computer-systems",
    title: "Inside a computer",
    category: "Foundations",
    minutes: 12,
    lab: "cpu",
    summary: "Follow a single instruction from memory to the processor.",
    objectives: [
      "Distinguish input, processing, storage and output.",
      "Explain the roles of the ALU, control unit and registers.",
    ],
    notes: [
      [
        "The big picture",
        "A computer accepts input, processes it using instructions, stores data and produces output. Hardware is physical; software supplies the instructions.",
      ],
      [
        "The processor",
        "The CPU contains the arithmetic logic unit (ALU), control unit and registers. Registers hold small amounts of data close to the processing circuitry.",
      ],
      [
        "Memory and storage",
        "RAM stores active programs and data and is usually volatile. Secondary storage retains data without power. Cache reduces average access time for frequently needed data.",
      ],
      [
        "Fetch → decode → execute",
        "The control unit fetches an instruction from memory, decodes what it means, and coordinates its execution. The program counter identifies the next instruction.",
      ],
    ],
    example: {
      title: "A calculator in your pocket",
      problem: "What happens when you enter 7 + 5 in a calculator?",
      solution:
        "The keys provide input. The processor executes an addition instruction using the ALU. Working memory holds the operands and result. The display produces the output: 12.",
      code: "INPUT 7, 5\nLOAD R1, 7\nADD R1, 5\nOUTPUT R1  // 12",
    },
    practical: {
      task: "Draw the input–process–output path for a supermarket barcode scanner.",
      steps: [
        "Identify the scanner as an input device.",
        "Describe looking up the product and calculating the total.",
        "Identify the receipt and display as output.",
      ],
      answer:
        "Scanner → product lookup and total calculation → displayed bill / printed receipt. The product database provides stored data.",
    },
    quiz: {
      question: "Which unit performs arithmetic operations?",
      options: ["Control unit", "ALU", "Secondary storage", "Input unit"],
      answer: 1,
      explanation:
        "The arithmetic logic unit performs arithmetic and logical operations.",
    },
  },
  {
    id: "number-systems",
    title: "The language of 0s & 1s",
    category: "Foundations",
    minutes: 15,
    lab: "binary",
    summary: "Turn everyday numbers into binary and see every bit light up.",
    objectives: [
      "Convert non-negative integers between decimal and binary.",
      "Explain positional place values and the role of a bit.",
    ],
    notes: [
      [
        "Why binary?",
        "Digital circuits reliably distinguish two states. We represent these states using the digits 0 and 1. Each binary digit is a bit; eight bits form a byte.",
      ],
      [
        "Place values",
        "In an unsigned 8-bit number, the places from left to right are 128, 64, 32, 16, 8, 4, 2 and 1. Add the values of the positions containing 1.",
      ],
      [
        "Decimal to binary",
        "Repeatedly divide the decimal number by 2. Record each remainder and read the remainders from bottom to top. Zero is represented as 0.",
      ],
      [
        "Hexadecimal",
        "Base 16 uses digits 0–9 and A–F. One hexadecimal digit represents exactly four binary bits: 1111₂ = F₁₆ = 15₁₀.",
      ],
    ],
    example: {
      title: "One byte, many possibilities",
      problem: "Convert decimal 42 to binary.",
      solution:
        "42 = 32 + 8 + 2. Set those bit positions to 1: 00101010₂. Check by adding 32 + 8 + 2 = 42.",
      code: "Place: 128 64 32 16 8 4 2 1\nBit:     0  0  1  0 1 0 1 0\n42₁₀ = 00101010₂ = 2A₁₆",
    },
    practical: {
      task: "Convert decimal 73 to an unsigned 8-bit binary number and verify it.",
      steps: [
        "Find the largest power of two no greater than 73.",
        "Subtract it and continue with the remainder.",
        "Write all eight bits and add their place values to check.",
      ],
      answer: "73 = 64 + 8 + 1, so the 8-bit answer is 01001001.",
    },
    quiz: {
      question: "What is the decimal value of 1010₂?",
      options: ["8", "10", "12", "14"],
      answer: 1,
      explanation: "1×8 + 0×4 + 1×2 + 0×1 = 10.",
    },
  },
  {
    id: "logic-gates",
    title: "Small gates. Big possibilities.",
    category: "Digital logic",
    minutes: 18,
    lab: "gates",
    summary:
      "Build your intuition for AND, OR, NOT and XOR with live switches.",
    objectives: [
      "Construct truth tables for basic logic gates.",
      "Relate Boolean operations to everyday decisions.",
    ],
    notes: [
      [
        "Boolean values",
        "Boolean algebra uses two values: false (0) and true (1). A truth table lists the output for every possible combination of inputs.",
      ],
      [
        "AND and OR",
        "AND gives 1 only when both inputs are 1. OR gives 1 when at least one input is 1; it is inclusive.",
      ],
      [
        "NOT and XOR",
        "NOT inverts a single input. XOR gives 1 when the two inputs are different. NAND and NOR invert the outputs of AND and OR respectively.",
      ],
      [
        "From logic to circuits",
        "Logic gates combine to build adders, comparators and processors. A half adder uses XOR for its sum bit and AND for its carry bit.",
      ],
    ],
    example: {
      title: "The two-key safety system",
      problem:
        "A machine should start only when the safety cover is closed AND the start button is pressed. Which gate models this?",
      solution:
        "Use an AND gate. Let A mean cover closed and B mean start pressed. Output = A AND B. Only A=1 and B=1 starts the machine.",
      code: "A B | AND OR XOR\n0 0 |  0   0   0\n0 1 |  0   1   1\n1 0 |  0   1   1\n1 1 |  1   1   0",
    },
    practical: {
      task: "Write the truth table for a NAND gate.",
      steps: [
        "List the four input combinations.",
        "Evaluate AND for each pair.",
        "Invert each AND output.",
      ],
      answer: "For inputs 00, 01, 10, 11 the NAND outputs are 1, 1, 1, 0.",
    },
    quiz: {
      question: "Which gate outputs 1 when its two inputs differ?",
      options: ["AND", "NOR", "XOR", "NOT"],
      answer: 2,
      explanation: "XOR is true for 01 and 10, and false for 00 and 11.",
    },
  },
  {
    id: "algorithms",
    title: "Think first. Code second.",
    category: "Problem solving",
    minutes: 14,
    lab: "sorting",
    summary: "Break a problem into steps and watch an algorithm come to life.",
    objectives: [
      "Write an unambiguous, finite algorithm.",
      "Trace a comparison-based sorting algorithm.",
    ],
    notes: [
      [
        "An algorithm",
        "An algorithm is a finite sequence of precise steps for solving a problem. State its input, expected output and stopping condition.",
      ],
      [
        "Pseudocode and flowcharts",
        "Pseudocode describes logic without tying it to a programming language. A flowchart uses a diamond for a decision and a rectangle for a processing step.",
      ],
      [
        "Tracing",
        "A trace table records variable values as each statement executes. Test normal cases, boundary cases and invalid inputs.",
      ],
      [
        "Bubble sort",
        "Compare adjacent values and swap them if they are out of order. After each complete pass, the largest remaining value reaches its final position. Worst-case time is O(n²).",
      ],
    ],
    example: {
      title: "Arrange the class scores",
      problem: "Show the first bubble-sort pass for [7, 3, 5, 2].",
      solution:
        "Compare 7 and 3 → [3,7,5,2]; compare 7 and 5 → [3,5,7,2]; compare 7 and 2 → [3,5,2,7]. More passes are needed to finish sorting.",
      code: "FOR each pass\n  FOR each adjacent unsorted pair\n    IF left > right\n      SWAP left and right",
    },
    practical: {
      task: "Write steps to find the largest of three different numbers.",
      steps: [
        "Read a, b and c.",
        "Set largest to a.",
        "Replace largest if b is larger; repeat for c.",
        "Display largest.",
      ],
      answer:
        "largest = a; if b > largest: largest = b; if c > largest: largest = c; output largest.",
    },
    quiz: {
      question:
        "After the first full pass of ascending bubble sort, which element is in its final position?",
      options: ["Smallest", "Largest", "Middle", "None"],
      answer: 1,
      explanation:
        "Each comparison moves the larger value right, so the largest reaches the end.",
    },
  },
  {
    id: "python-basics",
    title: "Your first lines of Python",
    category: "Programming",
    minutes: 20,
    lab: null,
    summary:
      "Use variables, expressions and input to solve a familiar problem.",
    objectives: [
      "Read and convert user input.",
      "Use Python variables and arithmetic operators.",
    ],
    notes: [
      [
        "Names and values",
        "A variable name refers to a value. Python determines the type of a value at runtime. Use meaningful names such as total_marks.",
      ],
      [
        "Core types",
        "Common types include int, float, bool and str. The + operator adds numbers but joins strings. Explicit conversion is needed when appropriate.",
      ],
      [
        "Input and output",
        "input() returns a string. Use int() or float() to convert valid numeric text. print() displays values. Invalid conversion raises ValueError.",
      ],
      [
        "Operators",
        "Use +, -, *, /, //, % and ** for arithmetic. / performs true division; // performs floor division. Parentheses make evaluation order explicit.",
      ],
    ],
    example: {
      title: "The class average",
      problem: "Read marks for three subjects and display their average.",
      solution:
        "Convert each input to a numeric type, add the three marks and divide the total by 3.",
      code: 'maths = float(input("Maths: "))\nscience = float(input("Science: "))\nenglish = float(input("English: "))\naverage = (maths + science + english) / 3\nprint(f"Average: {average:.2f}")',
    },
    practical: {
      task: "Calculate the area of a rectangle from user-entered length and breadth.",
      steps: [
        "Read length and breadth as floats.",
        "Reject negative dimensions.",
        "Multiply the dimensions and print the area.",
      ],
      answer:
        'length = float(input("Length: "))\nbreadth = float(input("Breadth: "))\nif length < 0 or breadth < 0:\n    print("Dimensions cannot be negative")\nelse:\n    print(length * breadth)',
    },
    quiz: {
      question: "What type does input() return?",
      options: ["int", "float", "str", "bool"],
      answer: 2,
      explanation: "input() returns text, even when the user types digits.",
    },
  },
  {
    id: "control-flow",
    title: "Decisions, loops & possibilities",
    category: "Programming",
    minutes: 20,
    lab: null,
    summary: "Make programs choose a path and repeat useful work.",
    objectives: ["Use conditional branches.", "Trace for and while loops."],
    notes: [
      [
        "Selection",
        "if, elif and else select a block based on Boolean conditions. Python uses indentation to group statements.",
      ],
      [
        "Iteration",
        "A for loop visits the items in an iterable. A while loop repeats while its condition remains true.",
      ],
      [
        "Ranges",
        "range(start, stop, step) excludes stop. range(1, 5) produces 1, 2, 3 and 4. A zero step is invalid.",
      ],
      [
        "Loop control",
        "break leaves the nearest enclosing loop. continue skips to its next iteration. Always ensure a while loop can terminate.",
      ],
    ],
    example: {
      title: "Add up a week of practice",
      problem: "Find the sum of the integers from 1 to 7.",
      solution:
        "Start total at zero and add each number produced by range(1, 8). The result is 28.",
      code: "total = 0\nfor day in range(1, 8):\n    total += day\nprint(total)  # 28",
    },
    practical: {
      task: "Determine whether an entered integer is even or odd.",
      steps: [
        "Read an integer n.",
        "Calculate n % 2.",
        "If the remainder is zero, print Even; otherwise print Odd.",
      ],
      answer:
        'n = int(input("Number: "))\nif n % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")',
    },
    quiz: {
      question: "How many values does range(2, 8, 2) produce?",
      options: ["2", "3", "4", "6"],
      answer: 1,
      explanation: "It produces 2, 4 and 6. The stop value 8 is excluded.",
    },
  },
  {
    id: "data-structures",
    title: "A place for every piece of data",
    category: "Programming",
    minutes: 18,
    lab: null,
    summary: "Choose between lists, tuples and dictionaries for real tasks.",
    objectives: [
      "Compare ordered sequences and key-value mappings.",
      "Select an appropriate structure for a simple problem.",
    ],
    notes: [
      [
        "Lists",
        "Lists are mutable sequences. Indexing starts at 0; negative indices count from the end. append() adds one item to the end.",
      ],
      [
        "Tuples",
        "Tuples are immutable sequences. A one-element tuple needs a trailing comma, such as (5,).",
      ],
      [
        "Dictionaries",
        "Dictionaries associate unique keys with values. Use get() to retrieve a value with an optional default when a key is absent.",
      ],
      [
        "Stacks",
        "A stack follows last in, first out. A list can implement a simple stack using append() and pop(). Check for an empty stack before removing an item.",
      ],
    ],
    example: {
      title: "A student scorebook",
      problem: "Store marks by student name and look up Asha’s score.",
      solution: "A dictionary provides an intuitive name-to-score mapping.",
      code: 'marks = {"Asha": 87, "Kabir": 92}\nprint(marks["Asha"])  # 87\nmarks["Asha"] = 90\nprint(marks.get("Riya", "Not recorded"))',
    },
    practical: {
      task: "Implement a stack that pushes two values and pops the last one.",
      steps: [
        "Create an empty list.",
        "Append 10 and then 20.",
        "Pop once and display the result and remaining stack.",
      ],
      answer:
        "stack = []\nstack.append(10)\nstack.append(20)\nprint(stack.pop())  # 20\nprint(stack)        # [10]",
    },
    quiz: {
      question:
        "Which operation removes the most recently added item from a list-based stack?",
      options: ["append()", "pop()", "get()", "count()"],
      answer: 1,
      explanation: "pop() without an index removes and returns the last item.",
    },
  },
  {
    id: "functions-files",
    title: "Reusable code, lasting data",
    category: "Programming",
    minutes: 22,
    lab: null,
    summary: "Organise work into functions and save results to a text file.",
    objectives: [
      "Distinguish parameters, arguments and return values.",
      "Use context managers for file access.",
    ],
    notes: [
      [
        "Functions",
        "def creates a function. Parameters are names in its definition; arguments are the values supplied in a call. return sends a result back to the caller.",
      ],
      [
        "Scope",
        "Names created inside a function are usually local to it. Prefer passing inputs and returning outputs over relying on global state.",
      ],
      [
        "Text files",
        "Open files with an explicit encoding. Mode r reads, w writes and truncates an existing file, and a appends.",
      ],
      [
        "Safe cleanup",
        "A with statement closes the file when its block exits, even if an exception occurs. Handle specific errors such as FileNotFoundError when needed.",
      ],
    ],
    example: {
      title: "Save an attendance note",
      problem: "Write a greeting function and save its result.",
      solution:
        "Return the greeting from a function, then write it with a context manager.",
      code: 'def greet(name):\n    return f"Welcome, {name}!"\n\nwith open("greeting.txt", "w", encoding="utf-8") as file:\n    file.write(greet("Asha"))',
    },
    practical: {
      task: "Count the number of lines in a UTF-8 text file.",
      steps: [
        "Open the file in read mode.",
        "Iterate over its lines.",
        "Increment a counter for each line and print it.",
      ],
      answer:
        'with open("notes.txt", encoding="utf-8") as file:\n    count = sum(1 for line in file)\nprint(count)',
    },
    quiz: {
      question: "Which file mode appends without truncating existing content?",
      options: ["r", "w", "a", "x"],
      answer: 2,
      explanation: "Mode a writes at the end, creating the file if needed.",
    },
  },
  {
    id: "sql",
    title: "Ask your data better questions",
    category: "Databases",
    minutes: 20,
    lab: null,
    summary: "Find, filter and organise records using SQL.",
    objectives: [
      "Describe rows, columns and primary keys.",
      "Write a basic SELECT query with filtering.",
    ],
    notes: [
      [
        "Relational tables",
        "A table contains rows (records) and columns (attributes). A primary key uniquely identifies each row and cannot be NULL.",
      ],
      [
        "SELECT and WHERE",
        "SELECT chooses columns; FROM chooses a table; WHERE filters rows according to a condition. Quote string literals using single quotes.",
      ],
      [
        "Sorting and aggregation",
        "ORDER BY sorts results. COUNT, SUM, AVG, MIN and MAX aggregate values. GROUP BY forms groups; HAVING filters grouped results.",
      ],
      [
        "NULL and safe queries",
        "NULL represents a missing or unknown value. Test it using IS NULL. Application code should use parameterised queries instead of joining user input into SQL strings.",
      ],
    ],
    example: {
      title: "Find the distinction students",
      problem:
        "List names and marks for students scoring at least 75, highest first.",
      solution:
        "Filter with WHERE and sort the remaining rows with ORDER BY marks DESC.",
      code: "SELECT name, marks\nFROM students\nWHERE marks >= 75\nORDER BY marks DESC;",
    },
    practical: {
      task: "Count the students in each class.",
      steps: [
        "Select class and COUNT(*).",
        "Read from students.",
        "Group records by class.",
      ],
      answer:
        "SELECT class, COUNT(*) AS student_count\nFROM students\nGROUP BY class;",
    },
    quiz: {
      question: "Which clause filters rows before grouping?",
      options: ["ORDER BY", "HAVING", "WHERE", "GROUP BY"],
      answer: 2,
      explanation: "WHERE filters individual rows; HAVING filters groups.",
    },
  },
  {
    id: "networks",
    title: "How the internet finds you",
    category: "Networks",
    minutes: 16,
    lab: "network",
    summary: "Follow a web request through DNS, the network and a server.",
    objectives: [
      "Explain IP addresses, DNS and HTTP.",
      "Distinguish a switch from a router.",
    ],
    notes: [
      [
        "Networks",
        "A network connects devices so they can exchange data and share resources. A LAN covers a limited local area; a WAN spans larger geographical regions.",
      ],
      [
        "Addressing and routing",
        "An IP address identifies a network interface for delivery. Routers forward packets between networks. Switches generally forward frames within a local network using MAC addresses.",
      ],
      [
        "DNS",
        "The Domain Name System resolves domain names into records such as IP addresses. Cached answers may avoid repeating a full lookup.",
      ],
      [
        "A web request",
        "After name resolution, a browser establishes a connection and sends an HTTP request. HTTPS protects HTTP using TLS. A server sends back a response; the browser interprets it.",
      ],
    ],
    example: {
      title: "Opening your classroom portal",
      problem: "Describe the main steps after typing a website address.",
      solution:
        "The browser resolves the hostname, connects to the server, negotiates TLS for HTTPS, sends an HTTP request, receives the response and renders the page.",
      code: "Browser → DNS lookup → server address\nBrowser → HTTPS request → server\nBrowser ← HTTP response ← server\nBrowser → render page",
    },
    practical: {
      task: "Identify two devices in a school network and explain their roles.",
      steps: [
        "Draw two classroom computers connected to a switch.",
        "Connect the switch to a router.",
        "Explain local forwarding and external routing.",
      ],
      answer:
        "The switch forwards frames between local devices; the router forwards packets between the school network and other networks.",
    },
    quiz: {
      question: "What is DNS primarily used for?",
      options: [
        "Encrypting files",
        "Resolving domain names",
        "Displaying images",
        "Compiling code",
      ],
      answer: 1,
      explanation:
        "DNS supplies records associated with names, including IP address records.",
    },
  },
  {
    id: "cyber-safety",
    title: "Be the safest person online",
    category: "Digital citizenship",
    minutes: 12,
    lab: null,
    summary: "Recognise phishing, protect accounts and respect digital work.",
    objectives: [
      "Identify common phishing signals.",
      "Apply responsible account and data practices.",
    ],
    notes: [
      [
        "Phishing",
        "Attackers may impersonate trusted organisations to steal information. Verify the sender and destination independently; urgency and unusual payment requests are warning signs.",
      ],
      [
        "Account protection",
        "Use long, unique passwords and a reputable password manager. Enable multi-factor authentication. Never share an OTP or recovery code.",
      ],
      [
        "Privacy and consent",
        "Collect only necessary information and obtain appropriate consent. Avoid posting personal details about classmates. Review sharing permissions.",
      ],
      [
        "Digital responsibility",
        "Credit other people’s work, respect licences and communicate respectfully. Preserve evidence and report harassment through appropriate institutional channels.",
      ],
    ],
    example: {
      title: "An urgent scholarship message",
      problem:
        "A message says your scholarship expires in ten minutes unless you share an OTP. What should you do?",
      solution:
        "Do not share the OTP or follow the message’s link. Verify through the institution’s independently known website or office and report the suspicious message.",
      code: "PAUSE → VERIFY INDEPENDENTLY → REPORT\nNever disclose an OTP or recovery code.",
    },
    practical: {
      task: "Create a three-point checklist for checking a suspicious message.",
      steps: [
        "Check the sender identity independently.",
        "Inspect the destination and request.",
        "Avoid sharing secrets and report suspicious content.",
      ],
      answer:
        "Verify using a known official contact; avoid unexpected links or downloads; never disclose passwords, OTPs or recovery codes.",
    },
    quiz: {
      question: "Which action best protects an account?",
      options: [
        "Reuse a familiar password",
        "Share an OTP with support",
        "Use a unique password and MFA",
        "Post your recovery code",
      ],
      answer: 2,
      explanation:
        "Unique passwords reduce reuse risk; MFA adds another layer of protection.",
    },
  },
  {
    id: "html",
    title: "Give an idea a home on the web",
    category: "Web development",
    minutes: 18,
    lab: null,
    summary: "Structure an accessible page using semantic HTML.",
    objectives: [
      "Create a basic HTML document.",
      "Use headings, links and alternative text appropriately.",
    ],
    notes: [
      [
        "Structure",
        "HTML gives content meaning and structure. The head holds metadata; the body holds page content. CSS controls presentation and JavaScript adds behaviour.",
      ],
      [
        "Semantic elements",
        "Use header, nav, main, section and footer where they describe the content. Keep headings in a logical hierarchy.",
      ],
      [
        "Links and images",
        "An anchor’s href identifies its destination. Informative images need meaningful alt text; purely decorative images normally use empty alt text.",
      ],
      [
        "Forms",
        "Associate every form control with a visible label. Choose appropriate input types, and validate submitted data on the server as well as in the browser.",
      ],
    ],
    example: {
      title: "Your class noticeboard",
      problem: "Create a heading, a paragraph and a link for your class page.",
      solution:
        "Place meaningful content inside main and use descriptive link text.",
      code: '<!doctype html>\n<html lang="en">\n<title>Our classroom</title>\n<main>\n  <h1>Welcome to class XI</h1>\n  <p>Our practical session is on Friday.</p>\n  <a href="notes.html">Read our class notes</a>\n</main>\n</html>',
    },
    practical: {
      task: "Create an accessible email input field.",
      steps: [
        "Add a label with a for attribute.",
        "Give the input a matching id.",
        'Use type="email" and a name.',
      ],
      answer:
        '<label for="email">Email address</label>\n<input id="email" name="email" type="email" required>',
    },
    quiz: {
      question: "Which element identifies the main page content?",
      options: ["span", "main", "b", "br"],
      answer: 1,
      explanation: "main identifies the dominant content of the document.",
    },
  },
  {
    id: "cpp",
    title: "Meet C++",
    category: "Programming",
    minutes: 20,
    lab: null,
    summary: "Read, calculate and print using a compiled language.",
    objectives: [
      "Describe a compile-and-run workflow.",
      "Use input, output and numeric variables.",
    ],
    notes: [
      [
        "Compilation",
        "A C++ compiler translates source into a program for the target platform. Fix compiler errors before running and test runtime behaviour separately.",
      ],
      [
        "Program structure",
        "A hosted C++ program starts at main(). Include the headers required for library features. Statements generally end with a semicolon.",
      ],
      [
        "Types",
        "Common types include int, double, char and bool. Integer division discards the fractional part for positive operands; convert to a floating type when needed.",
      ],
      [
        "Input and output",
        "The iostream library provides std::cin for input and std::cout for output. Check input success before using values.",
      ],
    ],
    example: {
      title: "Calculate a rectangle’s area",
      problem: "Read length and breadth and print their product.",
      solution:
        "Use double for fractional dimensions and reject invalid input.",
      code: '#include <iostream>\nint main() {\n  double length, breadth;\n  if (!(std::cin >> length >> breadth) || length < 0 || breadth < 0) return 1;\n  std::cout << length * breadth << "\\n";\n  return 0;\n}',
    },
    practical: {
      task: "Print integers from 1 through 5 with a for loop.",
      steps: [
        "Initialise an integer counter at 1.",
        "Continue while it is no greater than 5.",
        "Print the counter and increment it.",
      ],
      answer: 'for (int i = 1; i <= 5; ++i) {\n  std::cout << i << "\\n";\n}',
    },
    quiz: {
      question: "Which header provides std::cout?",
      options: ["iostream", "string.h", "math.h", "fstream only"],
      answer: 0,
      explanation:
        "The C++ iostream header declares standard stream objects such as std::cout.",
    },
  },
  {
    id: "operating-systems",
    title: "The conductor inside your computer",
    category: "Systems",
    minutes: 14,
    lab: null,
    summary: "See how an operating system coordinates programs and hardware.",
    objectives: [
      "Explain core operating-system responsibilities.",
      "Distinguish a program from a process.",
    ],
    notes: [
      [
        "The operating system",
        "An OS manages hardware resources and provides services to applications. Examples include Linux, Windows and Android.",
      ],
      [
        "Processes",
        "A program is a set of instructions; a process is an executing instance. Scheduling selects which ready process gets CPU time.",
      ],
      [
        "Memory and files",
        "The OS manages memory allocation and the file system. Permissions control which users or processes may access resources.",
      ],
      [
        "Interfaces",
        "A graphical interface uses visual controls. A command-line interface accepts text commands. Both can provide access to OS services.",
      ],
    ],
    example: {
      title: "Music while you write",
      problem: "How can a computer play music while you edit a document?",
      solution:
        "The OS schedules processes and coordinates memory and devices. CPU time is shared in short intervals; multiple cores can also execute work simultaneously.",
      code: "Ready tasks → scheduler → CPU\nApplications → OS services → hardware",
    },
    practical: {
      task: "Observe processes in your operating system’s task manager.",
      steps: [
        "Open a process monitor.",
        "Identify one application process.",
        "Record its CPU and memory usage without ending unfamiliar processes.",
      ],
      answer:
        "The process monitor shows executing programs and their resource usage. Values change as workloads change.",
    },
    quiz: {
      question: "An executing instance of a program is a…",
      options: ["Folder", "Process", "Compiler", "Peripheral"],
      answer: 1,
      explanation:
        "A process includes executing instructions and their associated state and resources.",
    },
  },
  {
    id: "spreadsheets",
    title: "Let your spreadsheet do the maths",
    category: "IT skills",
    minutes: 18,
    lab: null,
    summary: "Turn a marks sheet into useful totals, averages and decisions.",
    objectives: [
      "Distinguish relative and absolute cell references.",
      "Use common spreadsheet formulas.",
    ],
    notes: [
      [
        "Cells and formulas",
        "A cell is identified by column and row, such as B2. Formulas typically begin with =. Keep source data separate from calculated results.",
      ],
      [
        "References",
        "A relative reference changes when copied. An absolute reference such as $B$1 fixes both the row and column.",
      ],
      [
        "Functions",
        "SUM adds values; AVERAGE finds their arithmetic mean; COUNT counts numeric values. IF chooses between two results based on a condition.",
      ],
      [
        "Presenting data",
        "Use clear column labels, appropriate number formats and a chart suited to the question. Check missing values and formulas before drawing conclusions.",
      ],
    ],
    example: {
      title: "An automatic result sheet",
      problem:
        "Calculate the average of marks in B2 through D2 and label a pass at 35 or above.",
      solution:
        "Put the average in E2, then use IF on E2 to determine the label.",
      code: 'E2: =AVERAGE(B2:D2)\nF2: =IF(E2>=35,"Pass","Review")',
    },
    practical: {
      task: "Use a fixed tax-rate cell when calculating totals for multiple rows.",
      steps: [
        "Put the tax rate in B1.",
        "Put a price in A3.",
        "Use an absolute reference to B1 and copy the formula down.",
      ],
      answer:
        "=A3*(1+$B$1) keeps the tax rate fixed while the price row changes.",
    },
    quiz: {
      question: "Which reference keeps both its row and column fixed?",
      options: ["B1", "$B1", "B$1", "$B$1"],
      answer: 3,
      explanation: "The dollar signs fix the column B and row 1.",
    },
  },
];
const unit = (title, ids = [], pending = []) => ({
  title,
  lessons: ids,
  pending,
});
export const courses = [
  {
    id: "mh-11-cs1",
    board: "Maharashtra",
    grade: "XI",
    subject: "Computer Science I",
    code: "CS–I",
    color: "mint",
    description: "From the foundations of computing to your first C++ program.",
    units: [
      unit("Computer fundamentals", ["computer-systems", "number-systems"]),
      unit("Operating systems", ["operating-systems"]),
      unit(
        "Algorithms & programming",
        ["algorithms", "cpp"],
        ["Board-specific C++ practical list"],
      ),
      unit(
        "Web foundations",
        ["html"],
        ["Prescribed textbook chapter mapping"],
      ),
    ],
  },
  {
    id: "mh-11-cs2",
    board: "Maharashtra",
    grade: "XI",
    subject: "Computer Science II",
    code: "CS–II",
    color: "peach",
    description:
      "Discover the circuits and hardware that make computing possible.",
    units: [
      unit("Digital foundations", ["number-systems", "logic-gates"]),
      unit(
        "Computer organisation",
        ["computer-systems"],
        ["Prescribed electronics and hardware units"],
      ),
      unit(
        "Practical journal",
        [],
        ["Official CS–II experiments and assessment scheme"],
      ),
    ],
  },
  {
    id: "mh-12-cs1",
    board: "Maharashtra",
    grade: "XII",
    subject: "Computer Science I",
    code: "CS–I",
    color: "lavender",
    description: "Connect programming, systems and the modern web.",
    units: [
      unit("Systems & programming", ["operating-systems", "cpp", "algorithms"]),
      unit(
        "Web development",
        ["html"],
        ["Prescribed HTML and scripting coverage"],
      ),
      unit(
        "Theory & practical journal",
        [],
        ["Current board unit list, marks and required programs"],
      ),
    ],
  },
  {
    id: "mh-12-cs2",
    board: "Maharashtra",
    grade: "XII",
    subject: "Computer Science II",
    code: "CS–II",
    color: "blue",
    description:
      "Explore digital logic, processor architecture and communication.",
    units: [
      unit("Digital logic", ["logic-gates", "number-systems"]),
      unit(
        "Processor foundations",
        ["computer-systems"],
        ["8085 architecture, instruction set and assembly practicals"],
      ),
      unit(
        "Communication",
        ["networks"],
        ["Prescribed hardware and networking practicals"],
      ),
    ],
  },
  {
    id: "cbse-11-cs",
    board: "CBSE",
    grade: "XI",
    subject: "Computer Science",
    code: "083",
    color: "lavender",
    description:
      "Build a strong foundation in Python and computational thinking.",
    units: [
      unit("Computer systems & organisation", [
        "computer-systems",
        "number-systems",
        "logic-gates",
      ]),
      unit("Computational thinking & programming", [
        "algorithms",
        "python-basics",
        "control-flow",
        "data-structures",
      ]),
      unit("Society, law & ethics", ["cyber-safety"]),
      unit(
        "Practical portfolio",
        [],
        ["Official session-specific practical counts and assessment weights"],
      ),
    ],
  },
  {
    id: "cbse-12-cs",
    board: "CBSE",
    grade: "XII",
    subject: "Computer Science",
    code: "083",
    color: "mint",
    description:
      "Go deeper with Python, data management and computer networks.",
    units: [
      unit(
        "Computational thinking & programming",
        ["python-basics", "functions-files", "data-structures"],
        ["Exception handling, binary/CSV files and prescribed programs"],
      ),
      unit("Computer networks", ["networks"]),
      unit(
        "Database management",
        ["sql"],
        ["Python–SQL connectivity and prescribed project requirements"],
      ),
    ],
  },
  {
    id: "cbse-11-it",
    board: "CBSE",
    grade: "XI",
    subject: "Information Technology",
    code: "802",
    color: "blue",
    description:
      "Develop practical digital skills for learning and everyday work.",
    units: [
      unit(
        "Employability skills",
        ["cyber-safety"],
        ["Official employability skills units"],
      ),
      unit("IT foundations", ["computer-systems", "operating-systems"]),
      unit(
        "Productivity & web skills",
        ["spreadsheets", "html"],
        ["Current 802 subject-specific units and practical list"],
      ),
    ],
  },
  {
    id: "cbse-12-it",
    board: "CBSE",
    grade: "XII",
    subject: "Information Technology",
    code: "802",
    color: "peach",
    description:
      "Bring databases, digital tools and workplace skills together.",
    units: [
      unit(
        "Employability skills",
        ["cyber-safety"],
        ["Official employability skills units"],
      ),
      unit(
        "Data & web foundations",
        ["sql", "networks", "html"],
        [
          "Current 802 programming environment, subject units and practical list",
        ],
      ),
    ],
  },
].map((c) => ({
  ...c,
  syllabusStatus: "provisional",
  session: "2026–27 verification pending",
}));
export const lessonIds = (course) => [
  ...new Set(course.units.flatMap((u) => u.lessons)),
];
export const getLesson = (id) => lessons.find((l) => l.id === id);
