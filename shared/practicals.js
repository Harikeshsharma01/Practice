// Original solutions. Photo references establish a teacher-supplied journal list,
// not official board verification or a confirmed academic-year requirement.
const XI = ["mh-11-cs1"],
  XII = ["mh-12-cs1"],
  CIRCUITS = ["mh-11-cs2"];
const PY11 = ["cbse-11-cs"],
  PY12 = ["cbse-12-cs"];
const cpp = (body, extra = "") =>
  `#include <iostream>\n${extra}\nusing namespace std;\n${body}`;
const main = (body, extra = "") =>
  cpp(`int main() {\n${body}\n    return 0;\n}`, extra);
function program(id, title, courseIds, concept, code, output, options = {}) {
  return {
    id,
    title,
    courseIds,
    kind: "program",
    language: courseIds[0].startsWith("mh") ? "C++17" : "Python 3",
    source: courseIds[0].startsWith("mh") ? "teacher-photo" : "suggested",
    sourceDetail:
      courseIds[0] === "mh-11-cs1"
        ? "Photo 2, upper C++ list; class inferred from the adjacent FYJC heading."
        : courseIds[0] === "mh-12-cs1"
          ? "Photo 1, HTML/C++ list; Class XII CS–I assignment inferred and awaiting teacher confirmation."
          : "Original supplementary exercise; inclusion in the current official practical list is not verified.",
    concept,
    code,
    output,
    steps: [
      "Write the aim and identify the input and expected output.",
      "Trace the supplied example by hand before running the program.",
      "Run the solution in the stated environment and record the observed output.",
      "Change the input, include a boundary case, and explain the result in your journal.",
    ],
    pitfalls:
      "Do not copy only the final output. Record the input and explain the state changes that produced it.",
    viva: [
      "What is the input, processing step and output?",
      "Which boundary case should you test, and why?",
    ],
    extension:
      "Modify one input or condition, predict the output, then check your prediction.",
    lab: "journey-program",
    ...options,
  };
}
const cpp11 = [
  program(
    "cpp-hello",
    "Basic C++ program: input and output",
    XI,
    "A C++ program starts at main. cin reads a value; cout writes a result. The compiler translates source before execution.",
    main(
      '    int age;\n    cin >> age;\n    cout << "Next year: " << age + 1 << "\\n";',
    ),
    "Input: 16\nOutput: Next year: 17",
    {
      sourceRow: "1",
      pitfalls:
        "A semicolon terminates a statement; << sends data to cout while >> reads through cin.",
    },
  ),
  program(
    "cpp-arithmetic",
    "Arithmetic at compile time and runtime",
    XI,
    "A constexpr expression can be evaluated during compilation. A value read through cin is available only while the program runs. Integer division discards the fractional part.",
    main(
      '    constexpr int fixed = 12 + 8;\n    double a, b;\n    cin >> a >> b;\n    cout << "Fixed: " << fixed << "\\n";\n    cout << a + b << " " << a - b << " " << a * b << "\\n";\n    if (b != 0) cout << a / b << "\\n";\n    else cout << "Division by zero is undefined\\n";',
    ),
    "Input: 10 2\nFixed: 20\n12 8 20\n5",
    { sourceRow: "2" },
  ),
  program(
    "cpp-maximum-three",
    "Greatest of three numbers using if / else",
    XI,
    "Compare each candidate with the current greatest value. Independent comparisons handle equality correctly.",
    main(
      '    int a, b, c;\n    cin >> a >> b >> c;\n    int greatest = a;\n    if (b > greatest) greatest = b;\n    if (c > greatest) greatest = c;\n    cout << greatest << "\\n";',
    ),
    "Input: 8 14 14\nOutput: 14",
    {
      sourceRow: "3",
      extension: "Test all negative inputs and three equal values.",
    },
  ),
  program(
    "cpp-parity",
    "Even and odd numbers",
    XI,
    "An integer is even when its remainder after division by 2 is zero. This also works for zero and negative even integers.",
    main(
      '    int n;\n    cin >> n;\n    cout << (n % 2 == 0 ? "Even" : "Odd") << "\\n";',
    ),
    "Input: -8\nOutput: Even",
    { sourceRow: "4" },
  ),
  program(
    "cpp-switch",
    "Menu selection using switch",
    XI,
    "switch chooses a branch by a discrete value. break prevents execution from falling into the next case.",
    main(
      '    int choice;\n    cin >> choice;\n    switch (choice) {\n        case 1: cout << "Notes\\n"; break;\n        case 2: cout << "Practicals\\n"; break;\n        default: cout << "Invalid choice\\n";\n    }',
    ),
    "Input: 2\nOutput: Practicals",
    {
      sourceRow: "5",
      extension: "Add a third menu item and test an invalid choice.",
    },
  ),
  program(
    "cpp-sequence",
    "Number sequence using while and do / while",
    XI,
    "while checks its condition before the body. do / while checks after the body, so it runs at least once unless an outer guard prevents entry.",
    main(
      '    int n;\n    cin >> n;\n    int i = 1;\n    while (i <= n) cout << i++ << " ";\n    cout << "\\n";\n    i = 1;\n    if (n >= 1) {\n        do { cout << i++ << " "; } while (i <= n);\n    }\n    cout << "\\n";',
    ),
    "Input: 4\n1 2 3 4\n1 2 3 4",
    { sourceRow: "6" },
  ),
  program(
    "cpp-factorial",
    "Factorial of a number",
    XI,
    "n! is the product of integers 1 through n, and 0! = 1. A 64-bit unsigned integer fits 20! but not 21!, so validate the range.",
    main(
      '    int n;\n    cin >> n;\n    if (n < 0 || n > 20) { cout << "Use 0 to 20\\n"; return 0; }\n    unsigned long long result = 1;\n    for (int i = 2; i <= n; ++i) result *= i;\n    cout << result << "\\n";',
    ),
    "Input: 5\nOutput: 120",
    {
      sourceRow: "7 (printed wording is unclear; interpreted as factorial)",
      lab: "recursion",
    },
  ),
  program(
    "cpp-prime",
    "Prime number check",
    XI,
    "A prime integer is greater than 1 and has no divisor other than 1 and itself. If a composite has a factor above its square root, its paired factor lies below it.",
    main(
      '    int n;\n    cin >> n;\n    bool prime = n >= 2;\n    for (int d = 2; prime && d <= n / d; ++d) {\n        if (n % d == 0) prime = false;\n    }\n    cout << (prime ? "Prime" : "Not prime") << "\\n";',
    ),
    "Input: 29\nOutput: Prime",
    { sourceRow: "8" },
  ),
  program(
    "cpp-fibonacci",
    "Fibonacci series",
    XI,
    "Each term after 0 and 1 is the sum of the preceding two. Updating the pair preserves the previous values needed by the next iteration.",
    main(
      '    int count;\n    cin >> count;\n    if (count < 0 || count > 90) return 0;\n    unsigned long long a = 0, b = 1;\n    for (int i = 0; i < count; ++i) {\n        cout << a << " ";\n        auto next = a + b; a = b; b = next;\n    }\n    cout << "\\n";',
    ),
    "Input: 7\nOutput: 0 1 1 2 3 5 8",
    { sourceRow: "9" },
  ),
  program(
    "cpp-array-max",
    "Greatest of three numbers using an array",
    XI,
    "An array groups elements of the same type. Initialise the maximum from the first element so that negative inputs remain valid.",
    main(
      '    int a[3];\n    for (int &value : a) cin >> value;\n    int greatest = a[0];\n    for (int value : a) if (value > greatest) greatest = value;\n    cout << greatest << "\\n";',
    ),
    "Input: -9 -3 -7\nOutput: -3",
    { sourceRow: "10", lab: "array" },
  ),
  program(
    "cpp-pattern",
    "Triangle pattern using nested loops",
    XI,
    "The outer loop chooses a row. The inner loop prints the number of symbols required for that row, followed by a newline.",
    main(
      '    int rows;\n    cin >> rows;\n    if (rows < 1 || rows > 20) return 0;\n    for (int r = 1; r <= rows; ++r) {\n        for (int c = 1; c <= r; ++c) cout << "*";\n        cout << "\\n";\n    }',
    ),
    "Input: 3\n*\n**\n***",
    { sourceRow: "11" },
  ),
  program(
    "cpp-area-function",
    "Area of a rectangle using a function",
    XI,
    "A function receives parameters and returns a result. Keeping input and output separate from the calculation makes it easier to reuse.",
    cpp(
      'double area(double length, double width) { return length * width; }\nint main() {\n    double l, w; cin >> l >> w;\n    if (l < 0 || w < 0) { cout << "Invalid dimensions\\n"; return 0; }\n    cout << area(l, w) << "\\n";\n}',
    ),
    "Input: 8 5\nOutput: 40",
    { sourceRow: "12" },
  ),
];
const cpp12 = [
  program(
    "html-background-link",
    "HTML page with background colour and hyperlink",
    XII,
    "HTML gives the page structure. CSS changes appearance. An anchor href identifies the destination that the browser opens when activated.",
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>My classroom</title>\n<style>body { background: #eaf7cf; color: #17351e; font: 20px sans-serif; }</style>\n</head><body><h1>My classroom</h1>\n<a href="https://books.ebalbharati.in/">Visit eBalbharati</a>\n</body></html>',
    "A pale green page with a heading and a working eBalbharati hyperlink.",
    { language: "HTML + CSS", sourceRow: "1", lab: "journey-web" },
  ),
  program(
    "html-table-image",
    "HTML page with a table and image",
    XII,
    "Use table headings to explain columns and alt text to describe an image. A relative image path resolves from the document location.",
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Journal</title></head>\n<body><h1>Practical journal</h1>\n<img src="classroom.jpg" alt="Students working in a computer lab" width="320">\n<table><caption>Practical progress</caption>\n<tr><th scope="col">Topic</th><th scope="col">Status</th></tr>\n<tr><td>HTML</td><td>Complete</td></tr></table></body></html>',
    "The browser shows the image (when classroom.jpg is present), a caption, and a two-column table.",
    {
      language: "HTML",
      sourceRow: "2",
      lab: "journey-web",
      pitfalls:
        "Save classroom.jpg beside the HTML file. A missing image still displays its descriptive alternative text.",
    },
  ),
  program(
    "cpp-bubble-sort",
    "Bubble sort an integer array",
    XII,
    "Compare adjacent values and swap those that are out of order. Each pass places the largest remaining value at the end of the active range.",
    main(
      '    int a[] = {5, 1, 4, 2};\n    for (int pass = 0; pass < 3; ++pass) {\n        bool changed = false;\n        for (int j = 0; j < 3 - pass; ++j) {\n            if (a[j] > a[j + 1]) { swap(a[j], a[j + 1]); changed = true; }\n        }\n        if (!changed) break;\n    }\n    for (int value : a) cout << value << " ";\n    cout << "\\n";',
      "#include <utility>",
    ),
    "1 2 4 5",
    {
      sourceRow: "3",
      lab: "journey-sort",
      extension:
        "Trace an already sorted array and count comparisons; explain the early-exit condition.",
    },
  ),
  program(
    "cpp-binary-search",
    "Binary search in a sorted array",
    XII,
    "Compare the target with the middle of a sorted range. Discard the half that cannot contain it. The sorted-input precondition is essential.",
    main(
      '    int a[] = {2, 5, 8, 12, 16};\n    int target; cin >> target;\n    int low = 0, high = 4, found = -1;\n    while (low <= high) {\n        int mid = low + (high - low) / 2;\n        if (a[mid] == target) { found = mid; break; }\n        if (a[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    cout << found << "\\n";',
    ),
    "Input: 12\nOutput: 3 (zero-based index)",
    { sourceRow: "4", lab: "binary-search" },
  ),
  program(
    "cpp-string-reverse",
    "Reverse a string — crossed out in the supplied list",
    XII,
    "Reverse the sequence of characters without dropping spaces. getline reads the complete line rather than stopping at the first space.",
    main(
      '    string text; getline(cin, text);\n    reverse(text.begin(), text.end());\n    cout << text << "\\n";',
      "#include <string>\n#include <algorithm>",
    ),
    "Input: Sewestian\nOutput: naitseweS",
    {
      sourceRow: "5, crossed out",
      review:
        "This entry is crossed out in Photo 1. Included as optional revision; confirm whether it belongs in the journal.",
    },
  ),
  program(
    "cpp-rectangle-class",
    "Rectangle area using a class",
    XII,
    "A class combines data and behaviour. An object stores its own dimensions and exposes an area function without exposing its representation.",
    cpp(
      'class Rectangle {\n    double length, width;\npublic:\n    Rectangle(double l, double w) : length(l), width(w) {}\n    double area() const { return length * width; }\n};\nint main() { Rectangle r(8, 5); cout << r.area() << "\\n"; }',
    ),
    "40",
    { sourceRow: "6" },
  ),
  program(
    "cpp-lifecycle",
    "Constructor and destructor execution",
    XII,
    "A constructor initialises an object. Its destructor runs when the object leaves scope. Nested blocks make lifetime boundaries visible.",
    cpp(
      'class Marker {\npublic:\n    Marker() { cout << "Created\\n"; }\n    ~Marker() { cout << "Destroyed\\n"; }\n};\nint main() {\n    cout << "Before\\n";\n    { Marker m; cout << "Inside\\n"; }\n    cout << "After\\n";\n}',
    ),
    "Before\nCreated\nInside\nDestroyed\nAfter",
    { sourceRow: "7" },
  ),
  program(
    "cpp-circle",
    "Circle class with a default constructor",
    XII,
    "A default constructor can be called without arguments. Member functions calculate area and circumference from the stored radius.",
    cpp(
      'class Circle {\n    double radius;\npublic:\n    Circle() : radius(1.0) {}\n    double area() const { return 3.141592653589793 * radius * radius; }\n    double circumference() const { return 2 * 3.141592653589793 * radius; }\n};\nint main() {\n    Circle c;\n    cout << c.area() << "\\n" << c.circumference() << "\\n";\n}',
    ),
    "Approximately:\n3.14159\n6.28319",
    { sourceRow: "8" },
  ),
  program(
    "cpp-ratio",
    "Ratio class: assign, convert and invert",
    XII,
    "A ratio stores a numerator and denominator. Conversion uses floating-point division. Inversion exchanges numerator and denominator but is invalid for a zero ratio.",
    cpp(
      'class Ratio {\n    int numerator = 0, denominator = 1;\npublic:\n    bool assign(int n, int d) {\n        if (d == 0) return false;\n        numerator = n; denominator = d; return true;\n    }\n    double convert() const { return double(numerator) / denominator; }\n    bool invert() {\n        if (numerator == 0) return false;\n        swap(numerator, denominator); return true;\n    }\n};\nint main() {\n    Ratio r; r.assign(2, 5); cout << r.convert() << "\\n";\n    if (r.invert()) cout << r.convert() << "\\n";\n}',
      "#include <utility>",
    ),
    "0.4\n2.5",
    { sourceRow: "9" },
  ),
  program(
    "cpp-inheritance",
    "Implement inheritance",
    XII,
    "Public inheritance allows a derived class to reuse the public interface of its base. Derived classes can add specialised behaviour.",
    cpp(
      'class Person {\npublic:\n    void introduce() const { cout << "I am a person\\n"; }\n};\nclass Student : public Person {\npublic:\n    void study() const { cout << "I study computer science\\n"; }\n};\nint main() { Student s; s.introduce(); s.study(); }',
    ),
    "I am a person\nI study computer science",
    { sourceRow: "10" },
  ),
  program(
    "cpp-array-pointers",
    "Array addresses and sum using pointers",
    XII,
    "A pointer stores an address. Incrementing an int pointer moves to the next int element. One-past-the-end is a valid boundary pointer but must not be dereferenced.",
    main(
      '    int a[] = {3, 7, 9};\n    int sum = 0;\n    cout << "First element: " << static_cast<void*>(a) << "\\n";\n    cout << "Last element: " << static_cast<void*>(a + 2) << "\\n";\n    for (int* p = a; p != a + 3; ++p) sum += *p;\n    cout << "Sum: " << sum << "\\n";',
    ),
    "First and last addresses vary by run.\nSum: 19",
    { sourceRow: "11", lab: "array" },
  ),
  program(
    "cpp-virtual",
    "Virtual function and runtime dispatch",
    XII,
    "A virtual function dispatches according to the actual object type when called through a base reference or pointer. override lets the compiler check the intended override.",
    cpp(
      'class Shape {\npublic:\n    virtual double area() const { return 0; }\n    virtual ~Shape() = default;\n};\nclass Square : public Shape {\n    double side;\npublic:\n    explicit Square(double s) : side(s) {}\n    double area() const override { return side * side; }\n};\nint main() { Square s(4); Shape& ref = s; cout << ref.area() << "\\n"; }',
    ),
    "16",
    { sourceRow: "12" },
  ),
  program(
    "cpp-reference-swap",
    "Swap two values using references",
    XII,
    "A reference parameter aliases its caller’s variable. Assignments therefore change the original objects, unlike ordinary pass-by-value parameters.",
    cpp(
      'void exchange(int& a, int& b) { int temp = a; a = b; b = temp; }\nint main() { int a = 4, b = 9; exchange(a, b); cout << a << " " << b << "\\n"; }',
    ),
    "9 4",
    {
      sourceRow: "Handwritten insertion near rows 11–12",
      review:
        "Handwritten “swap (pass by ref)” appears in Photo 1. Confirm its journal number and whether it replaces another entry.",
    },
  ),
];
function circuit(id, title, concept, table, row, options = {}) {
  return program(
    id,
    title,
    CIRCUITS,
    concept,
    table,
    "Observed outputs should match the truth/state table. Record any mismatches before changing connections.",
    {
      kind: "circuit",
      language: "Digital logic / circuit simulator",
      sourceRow: row,
      sourceDetail:
        "Photo 2, FYJC Practical Computer Science–II, Part A: Experiments.",
      steps: [
        "Write the Boolean expression or state transition and construct its truth table.",
        "Use a digital circuit simulator or teacher-approved trainer. Identify supply, ground and input pins from the IC datasheet.",
        "Set each input combination. For sequential circuits, apply one clock edge at a time.",
        "Record the output for every input or clock step and compare it with the predicted table.",
      ],
      pitfalls:
        "Do not leave inputs floating. Actual IC pinouts and active-high/active-low signals depend on the selected device; ask the teacher to check physical connections.",
      viva: [
        "Is the circuit combinational or sequential?",
        "What changes at the output when one input changes?",
      ],
      lab: "journey-circuit",
      ...options,
    },
  );
}
const circuits = [
  circuit(
    "logic-basic",
    "Implement basic logic gates",
    "AND requires both inputs high, OR needs at least one high, and NOT inverts a single input.",
    "A B | AND OR\n0 0 |  0   0\n0 1 |  0   1\n1 0 |  0   1\n1 1 |  1   1\nNOT: 0 → 1; 1 → 0",
    "1",
    { lab: "gates" },
  ),
  circuit(
    "logic-universal",
    "Implement universal gates",
    "NAND and NOR are universal: either can construct NOT, AND and OR. Tie both inputs of a NAND together to make NOT.",
    "NOT A = A NAND A\nA AND B = (A NAND B) NAND (A NAND B)\nA OR B = (A NAND A) NAND (B NAND B)\nA NOR B = NOT(A OR B)",
    "2",
    { lab: "gates" },
  ),
  circuit(
    "logic-half-adder",
    "Half adder",
    "Adding two bits produces a sum bit and a carry bit. Sum = A XOR B; carry = A AND B.",
    "A B | S C\n0 0 | 0 0\n0 1 | 1 0\n1 0 | 1 0\n1 1 | 0 1",
    "3",
    { lab: "adder" },
  ),
  circuit(
    "logic-full-adder",
    "Full adder",
    "A full adder includes an incoming carry. S = A XOR B XOR Cin. Cout = AB OR (Cin AND (A XOR B)).",
    "A B Cin | S Cout\n0 0 0   | 0 0\n0 0 1   | 1 0\n0 1 0   | 1 0\n0 1 1   | 0 1\n1 0 0   | 1 0\n1 0 1   | 0 1\n1 1 0   | 0 1\n1 1 1   | 1 1",
    "4",
    { lab: "full-adder" },
  ),
  circuit(
    "logic-half-subtractor",
    "Half subtractor",
    "Subtract B from A. Difference = A XOR B. Borrow = NOT A AND B. Borrow indicates that the next higher position must supply a unit.",
    "A B | Difference Borrow\n0 0 | 0          0\n0 1 | 1          1\n1 0 | 1          0\n1 1 | 0          0",
    "5",
  ),
  circuit(
    "logic-full-subtractor",
    "Full subtractor",
    "Subtract B and Bin from A. D = A XOR B XOR Bin. Bout = (NOT A AND B) OR (NOT(A XOR B) AND Bin).",
    "A B Bin | D Bout\n0 0 0   | 0 0\n0 0 1   | 1 1\n0 1 0   | 1 1\n0 1 1   | 0 1\n1 0 0   | 1 0\n1 0 1   | 0 0\n1 1 0   | 0 0\n1 1 1   | 1 1",
    "6",
  ),
  circuit(
    "logic-three-circuits",
    "Any three circuits — teacher selection required",
    "The photo leaves this item open-ended. Suggested practice circuits are an XOR from basic gates, a 2-to-1 multiplexer, and an equality comparator.",
    "XOR: Y = (NOT A AND B) OR (A AND NOT B)\nMUX: Y = (NOT S AND A) OR (S AND B)\nEquality: Y = NOT(A XOR B)",
    "7",
    {
      review:
        "The printed list says “Any three circuits”. These three choices are suggestions, not a confirmed institutional requirement.",
    },
  ),
  circuit(
    "logic-rs",
    "R–S latch / flip-flop",
    "For an active-high NOR latch: S=1 sets Q, R=1 resets Q, and S=R=0 holds the stored bit. S=R=1 is forbidden. A clocked version additionally gates these inputs.",
    "S R | Next Q\n0 0 | Previous Q\n0 1 | 0\n1 0 | 1\n1 1 | Forbidden",
    "8",
    {
      review:
        "The sheet says “R S flip flop”. Confirm whether the trainer expects a NOR latch, NAND latch or clocked circuit.",
    },
  ),
  circuit(
    "logic-jk",
    "J–K flip-flop",
    "At the active clock edge: J=K=0 holds Q, J=0 K=1 resets, J=1 K=0 sets, and J=K=1 toggles. Unlike an RS latch, the 11 input is defined.",
    "J K | Next Q\n0 0 | Previous Q\n0 1 | 0\n1 0 | 1\n1 1 | NOT Previous Q",
    "9",
  ),
  circuit(
    "logic-counter",
    "Three-bit binary counter",
    "Three stored bits represent eight states. A rising edge increments the unsigned count modulo 8. Observe reset and the selected clock edge.",
    "Clock pulses | Q2 Q1 Q0\n0            | 0  0  0\n1            | 0  0  1\n2            | 0  1  0\n3            | 0  1  1\n4            | 1  0  0\n5            | 1  0  1\n6            | 1  1  0\n7            | 1  1  1\n8            | 0  0  0",
    "10",
  ),
];
const python = [
  program(
    "py-arithmetic",
    "Python input, arithmetic and formatted output",
    PY11,
    "input returns a string. Convert it before numeric calculation. f-strings interpolate expressions into readable output.",
    'length = float(input("Length: "))\nwidth = float(input("Width: "))\nif length < 0 or width < 0:\n    print("Use non-negative dimensions")\nelse:\n    print(f"Area = {length * width:.2f}")',
    "Input: 8, 5\nArea = 40.00",
    { lab: "journey-program" },
  ),
  program(
    "py-grade",
    "Selection: grade and validation",
    PY11,
    "Order thresholds from highest to lowest so the first matching branch is the intended grade.",
    'marks = int(input("Marks: "))\nif not 0 <= marks <= 100:\n    print("Invalid marks")\nelif marks >= 75:\n    print("Distinction")\nelif marks >= 60:\n    print("First class")\nelif marks >= 40:\n    print("Pass")\nelse:\n    print("Needs improvement")',
    "Input: 75\nDistinction",
  ),
  program(
    "py-factorial",
    "Iteration: factorial with input validation",
    PY11,
    "A running product is an accumulator. Initialise it to the multiplicative identity 1.",
    'n = int(input("n: "))\nif n < 0:\n    print("Use a non-negative integer")\nelse:\n    result = 1\n    for value in range(2, n + 1):\n        result *= value\n    print(result)',
    "Input: 6\n720",
    { lab: "recursion" },
  ),
  program(
    "py-prime",
    "Prime numbers in a range",
    PY11,
    "An inner divisor loop classifies each candidate. A loop else runs only when that loop completes without break.",
    'for n in range(2, 21):\n    for d in range(2, int(n ** 0.5) + 1):\n        if n % d == 0:\n            break\n    else:\n        print(n, end=" ")',
    "2 3 5 7 11 13 17 19",
  ),
  program(
    "py-palindrome",
    "Strings: palindrome and normalisation",
    PY11,
    "Normalisation decides which differences matter. Here spaces, punctuation and case are ignored before comparing the string with its reverse.",
    'text = input("Text: ")\nclean = "".join(ch.lower() for ch in text if ch.isalnum())\nprint("Palindrome" if clean == clean[::-1] else "Not a palindrome")',
    "Input: Never odd or even\nPalindrome",
  ),
  program(
    "py-list-statistics",
    "Lists: total, mean, minimum and maximum",
    PY11,
    "A list preserves order and supports iteration. Guard the empty case before dividing or calling min and max.",
    'values = [12, 18, 9, 21]\nif values:\n    print("Total:", sum(values))\n    print("Mean:", sum(values) / len(values))\n    print("Range:", min(values), max(values))\nelse:\n    print("No data")',
    "Total: 60\nMean: 15.0\nRange: 9 21",
    { lab: "array" },
  ),
  program(
    "py-linear-search",
    "Linear search in a list",
    PY11,
    "Inspect elements from left to right. The first match gives its index. Unlike binary search, the list need not be sorted.",
    "values = [9, 3, 7, 3]\ntarget = 3\nfound = -1\nfor i in range(len(values)):\n    if values[i] == target:\n        found = i\n        break\nprint(found)",
    "1",
    { lab: "array" },
  ),
  program(
    "py-word-frequency",
    "Dictionary word frequencies",
    PY11,
    "A dictionary maps each distinct word to a count. get supplies zero when a word has not been seen before.",
    'words = "learn code learn share".split()\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nprint(counts)',
    "{'learn': 2, 'code': 1, 'share': 1}",
  ),
  program(
    "py-tuple-record",
    "Tuple records and unpacking",
    PY11,
    "A tuple is an immutable sequence. Unpacking binds its elements to names, making a record easier to read.",
    'record = (17, "Asha", 92)\nroll, name, marks = record\nprint(f"{roll}: {name} scored {marks}")',
    "17: Asha scored 92",
  ),
  program(
    "py-function",
    "Functions with parameters and a return value",
    PY12,
    "A function separates a reusable calculation from the caller. Return produces a value; printing only displays it.",
    'def rectangle_area(length, width=1):\n    if length < 0 or width < 0:\n        raise ValueError("Dimensions cannot be negative")\n    return length * width\n\nprint(rectangle_area(8, 5))\nprint(rectangle_area(8))',
    "40\n8",
  ),
  program(
    "py-text-file",
    "Text files: write, read and count words",
    PY12,
    "A context manager closes the file even when an operation raises an error. UTF-8 encoding makes text handling explicit.",
    'from pathlib import Path\npath = Path("journal_demo.txt")\n# Use a dedicated practice folder: this replaces this demo file.\npath.write_text("Learn together\\nBuild understanding\\n", encoding="utf-8")\nwith path.open(encoding="utf-8") as file:\n    text = file.read()\nprint("Lines:", len(text.splitlines()))\nprint("Words:", len(text.split()))',
    "Lines: 2\nWords: 4",
    { lab: "journey-file" },
  ),
  program(
    "py-filter-file",
    "Copy selected lines from a text file",
    PY12,
    "Process a file one line at a time. A filtering condition decides which lines reach the destination.",
    'from pathlib import Path\nPath("source_demo.txt").write_text("Apple\\nBanana\\nApricot\\n", encoding="utf-8")\nwith open("source_demo.txt", encoding="utf-8") as source, open("selected_demo.txt", "w", encoding="utf-8") as target:\n    for line in source:\n        if line.startswith("A"):\n            target.write(line)\nprint(Path("selected_demo.txt").read_text(encoding="utf-8"))',
    "Apple\nApricot",
    { lab: "journey-file" },
  ),
  program(
    "py-csv",
    "CSV student records",
    PY12,
    'The csv module handles separators and quoting correctly. newline="" lets the module manage line endings.',
    'import csv\nwith open("students_demo.csv", "w", newline="", encoding="utf-8") as file:\n    writer = csv.writer(file)\n    writer.writerow(["roll", "name", "marks"])\n    writer.writerows([[1, "Asha", 92], [2, "Kabir", 78]])\nwith open("students_demo.csv", newline="", encoding="utf-8") as file:\n    for row in csv.DictReader(file):\n        if int(row["marks"]) >= 80:\n            print(row["name"], row["marks"])',
    "Asha 92",
    { lab: "journey-file" },
  ),
  program(
    "py-binary",
    "Binary files with trusted pickle records",
    PY12,
    "pickle serialises Python objects into bytes and restores them. Only unpickle files you created and trust because pickle loading can execute code.",
    'import pickle\nrecords = [{"roll": 1, "name": "Asha"}, {"roll": 2, "name": "Kabir"}]\nwith open("records_demo.dat", "wb") as file:\n    pickle.dump(records, file)\nwith open("records_demo.dat", "rb") as file:\n    restored = pickle.load(file)\nprint(next(record["name"] for record in restored if record["roll"] == 2))',
    "Kabir",
    { lab: "journey-file" },
  ),
  program(
    "py-stack",
    "Stack using a Python list",
    PY12,
    "A stack is last-in, first-out. append pushes; pop removes the newest item. Check for an empty stack before popping.",
    'stack = []\nstack.append("Notes")\nstack.append("Practical")\nprint("Popped:", stack.pop() if stack else "Underflow")\nprint("Top:", stack[-1] if stack else "Empty")',
    "Popped: Practical\nTop: Notes",
    { lab: "stack-queue" },
  ),
  program(
    "py-exceptions",
    "Handle invalid input and division errors",
    PY12,
    "Specific exception handlers distinguish a conversion failure from division by zero. finally runs whether the operation succeeds or fails.",
    'try:\n    a = int(input("a: "))\n    b = int(input("b: "))\n    print(a / b)\nexcept ValueError:\n    print("Enter integers")\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")\nfinally:\n    print("Attempt finished")',
    "Input: 10, 0\nCannot divide by zero\nAttempt finished",
  ),
];
const sqlPrograms = [
  program(
    "sql-create",
    "SQL: create and populate a student table",
    ["cbse-12-cs", "cbse-12-it"],
    "A primary key uniquely identifies a row. Column types and constraints express valid data. Work in a dedicated practice database.",
    "CREATE TABLE Student (\n  roll INTEGER PRIMARY KEY,\n  name VARCHAR(40) NOT NULL,\n  marks INTEGER CHECK (marks BETWEEN 0 AND 100)\n);\nINSERT INTO Student VALUES (1, 'Asha', 92), (2, 'Kabir', 78), (3, 'Meera', 85);\nSELECT * FROM Student ORDER BY roll;",
    "1 Asha 92\n2 Kabir 78\n3 Meera 85",
    { language: "SQL", lab: "journey-sql" },
  ),
  program(
    "sql-filter",
    "SQL: filter and order rows",
    ["cbse-12-cs", "cbse-12-it"],
    "WHERE filters records. ORDER BY determines display order. Without ORDER BY, row order is not guaranteed.",
    "SELECT name, marks FROM Student\nWHERE marks >= 80\nORDER BY marks DESC;",
    "Asha 92\nMeera 85\nRequires the Student table from the create-table practical.",
    { language: "SQL", lab: "journey-sql" },
  ),
  program(
    "sql-aggregate",
    "SQL: aggregate results",
    ["cbse-12-cs", "cbse-12-it"],
    "Aggregate functions summarise rows. COUNT(*) counts records; AVG considers non-NULL values in its column.",
    "SELECT COUNT(*) AS total, MIN(marks) AS lowest,\n       MAX(marks) AS highest, AVG(marks) AS average\nFROM Student;",
    "total=3; lowest=78; highest=92; average=85\nRequires the Student table.",
    { language: "SQL", lab: "journey-sql" },
  ),
  program(
    "sql-join",
    "SQL: join related tables",
    ["cbse-12-cs", "cbse-12-it"],
    "A join combines rows on a stated relationship. A foreign key documents the relationship between attendance and a student.",
    "CREATE TABLE Attendance (\n  roll INTEGER PRIMARY KEY REFERENCES Student(roll),\n  days_present INTEGER NOT NULL\n);\nINSERT INTO Attendance VALUES (1, 42), (2, 38), (3, 41);\nSELECT Student.name, Attendance.days_present\nFROM Student JOIN Attendance ON Student.roll = Attendance.roll\nORDER BY Student.roll;",
    "Asha 42\nKabir 38\nMeera 41\nRequires the Student table.",
    { language: "SQL", lab: "journey-sql" },
  ),
  program(
    "py-mysql",
    "Python and MySQL: parameterised query",
    PY12,
    "A database connector sends a query and returns rows. Bind parameters instead of constructing SQL with input text. Keep credentials outside source code.",
    'import os\nimport mysql.connector  # install mysql-connector-python in your environment\nconnection = mysql.connector.connect(\n    host=os.environ.get("MYSQL_HOST", "localhost"),\n    user=os.environ["MYSQL_USER"],\n    password=os.environ["MYSQL_PASSWORD"],\n    database=os.environ["MYSQL_DATABASE"]\n)\ntry:\n    cursor = connection.cursor()\n    cursor.execute("SELECT name, marks FROM Student WHERE marks >= %s ORDER BY marks DESC", (80,))\n    for row in cursor:\n        print(*row)\n    cursor.close()\nfinally:\n    connection.close()',
    "Asha 92\nMeera 85\nRequires a running MySQL database and the Student table.",
    { lab: "journey-sql" },
  ),
];
const itAndProcessor = [
  program(
    "sheet-gradebook",
    "Spreadsheet gradebook and summary chart",
    ["cbse-11-it"],
    "Cell references let one formula work across rows. Relative references move when filled; absolute references stay fixed.",
    "Columns: A Name | B Theory | C Practical | D Total\nD2: =SUM(B2:C2)\nFill D2 down to D4.\nD5: =AVERAGE(D2:D4)\nSelect A1:A4 and D1:D4; insert a column chart.\nSample rows:\nAsha | 65 | 28\nKabir | 54 | 25\nMeera | 61 | 27",
    "Totals: 93, 79, 88. Average: 86.6667.",
    { language: "Spreadsheet", lab: null },
  ),
  program(
    "java-class",
    "Java class and object — supplementary IT exercise",
    ["cbse-11-it", "cbse-12-it"],
    "A class defines fields and methods. A constructed object holds field values used by its methods. Confirm the prescribed language and IDE from the current 802 syllabus.",
    "public class Rectangle {\n    private final double length, width;\n    public Rectangle(double l, double w) { length = l; width = w; }\n    public double area() { return length * width; }\n    public static void main(String[] args) {\n        Rectangle r = new Rectangle(8, 5);\n        System.out.println(r.area());\n    }\n}",
    "40.0\nSave as Rectangle.java; compile with javac Rectangle.java; run java Rectangle.",
    { language: "Java", lab: "journey-program" },
  ),
  program(
    "html-form",
    "Accessible web form and input validation",
    ["cbse-11-it", "cbse-12-it"],
    "A label identifies a field. Native HTML constraints guide input. A real service must also validate on the server; this exercise does not submit data.",
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><title>Student form</title></head>\n<body><form onsubmit="event.preventDefault(); alert(\'Practice form validated; nothing sent\');">\n<label for="name">Name</label><input id="name" name="name" required maxlength="60">\n<label for="email">Email</label><input id="email" name="email" type="email" required>\n<button type="submit">Check form</button></form></body></html>',
    "Blank required fields and invalid email values are rejected by the browser.",
    { language: "HTML", lab: "journey-web" },
  ),
  program(
    "8085-add",
    "8085: add two eight-bit values",
    ["mh-12-cs2"],
    "ADD changes the accumulator and status flags. FFH + 01H wraps the eight-bit accumulator to 00H and sets carry. The carry flag is not an extra accumulator bit.",
    "MVI A, FFH\nMVI B, 01H\nADD B\nSTA 2500H\nHLT",
    "A=00H; carry=1; zero=1; memory[2500H]=00H.\nUse a teacher-approved 8085 simulator; syntax may vary.",
    {
      language: "8085 assembly",
      source: "suggested",
      sourceDetail:
        "Original 8085 practice suggestion. The supplied photos do not show the Class XII CS–II journal list.",
      lab: "journey-cpu",
    },
  ),
  program(
    "8085-transfer",
    "8085: transfer a byte between registers and memory",
    ["mh-12-cs2"],
    "MOV copies a register value without erasing the source. STA stores the accumulator at the specified address; LDA loads it back.",
    "MVI A, 2AH\nMOV B, A\nSTA 2500H\nMVI A, 00H\nLDA 2500H\nHLT",
    "B=2AH; A=2AH; memory[2500H]=2AH.",
    {
      language: "8085 assembly",
      source: "suggested",
      sourceDetail:
        "Original 8085 practice suggestion. Current board requirements are awaiting an official source.",
      lab: "journey-cpu",
    },
  ),
];
const aliases = {
  recursion: "trace",
  array: "arrays",
  "binary-search": "search",
  "full-adder": "adder",
  "stack-queue": "stack",
};
export const practicals = [
  ...cpp11,
  ...cpp12,
  ...circuits,
  ...python,
  ...sqlPrograms,
  ...itAndProcessor,
].map((p) => ({ ...p, lab: aliases[p.lab] || p.lab }));
export const practicalLessons = practicals.map((p) => ({
  id: `practical-${p.id}`,
  title: p.title,
  category: p.kind === "circuit" ? "Digital electronics" : p.language,
  minutes: p.kind === "circuit" ? 45 : 35,
  lab: p.lab,
  courseIds: p.courseIds,
  summary: p.concept.slice(0, 399),
  objectives: [
    "Trace the input-to-output process.",
    "Complete the practical and explain the observed result.",
    "Test a changed input and document your reasoning.",
  ],
  notes: [
    ["Aim and environment", `${p.title}. Environment: ${p.language}.`],
    ["How it works", p.concept],
    ["Procedure", p.steps.join("\n")],
    ["Expected observation", p.output],
    ["Common mistakes", p.pitfalls],
    ["Viva preparation", p.viva.join("\n")],
    ["Try a variation", p.extension],
    [
      "Journal source",
      `${p.sourceDetail}${p.sourceRow ? ` Entry: ${p.sourceRow}.` : ""}${p.review ? ` ${p.review}` : ""}`,
    ],
  ],
  example: {
    title: p.title,
    problem: `Complete this ${p.language} exercise and predict the observation.`,
    solution: p.concept,
    code: p.code,
  },
  practical: {
    task: p.title,
    steps: p.steps,
    answer: `${p.code}\n\nEXPECTED OBSERVATION\n${p.output}`,
  },
  quiz: {
    question: "What makes this practical journal entry complete?",
    options: [
      "Only the copied source code",
      "Aim, procedure, observed results and an explanation",
      "Only a screenshot of the final screen",
    ],
    answer: 1,
    explanation:
      "Record what you ran, what you observed, why it happened, and how a changed input affects the result.",
  },
  practicalId: p.id,
  practicalDetails: {
    expectedOutput: p.output,
    pitfalls: p.pitfalls,
    viva: p.viva,
    extension: p.extension,
  },
}));
