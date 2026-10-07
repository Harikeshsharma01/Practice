// Original short Hindi explanations; technical terms stay recognisable in English.
export const hindiExplanations = {
  "computer-systems":
    "कंप्यूटर में input पहले memory में आता है। CPU निर्देश के अनुसार data पर काम करता है और output देता है। Storage में सहेजी गई जानकारी बिजली बंद होने पर भी रह सकती है।",
  "number-systems":
    "Binary में केवल 0 और 1 होते हैं। दाईं ओर से हर स्थान का मान 1, 2, 4, 8 होता है। जिन स्थानों पर 1 है, उनके मान जोड़कर दशमलव संख्या मिलती है।",
  "logic-gates":
    "Logic gate का output उसके inputs पर निर्भर करता है। AND में सभी inputs 1 होने चाहिए, OR में कोई एक 1 काफी है और NOT input को उलटता है।",
  algorithms:
    "Algorithm समस्या हल करने के स्पष्ट और क्रमबद्ध चरण हैं। पहले input और अपेक्षित output लिखें, फिर हर चरण को छोटे उदाहरण पर जाँचें।",
  "python-basics":
    "Python में variable किसी value का नाम है। input से मिला text जरूरत के अनुसार संख्या में बदलें। फिर calculation करें और print से परिणाम देखें।",
  "control-flow":
    "if शर्त के आधार पर रास्ता चुनता है। Loop किसी काम को दोहराता है। हर चक्कर में क्या बदलता है और loop कब रुकेगा, यह समझना जरूरी है।",
  "data-structures":
    "List, tuple और dictionary जानकारी को अलग ढंग से रखते हैं। List बदल सकती है, tuple के तत्व बदले नहीं जाते और dictionary में key से value मिलती है।",
  "functions-files":
    "Function बार-बार होने वाले काम को नाम देता है। File में data सहेजने के लिए सही mode और encoding चुनें। with block file को बंद करने में मदद करता है।",
  sql: "SQL से table में रखी जानकारी पूछ सकते हैं। WHERE rows चुनता है, SELECT columns चुनता है और ORDER BY परिणाम का क्रम तय करता है।",
  networks:
    "Network में जानकारी packets के रूप में जाती है। हर उपकरण का पता होता है। Router destination की ओर अगला रास्ता चुनता है; DNS नाम को पते से जोड़ता है।",
  "cyber-safety":
    "अनजान link पर तुरंत भरोसा न करें। भेजने वाले और असली domain की जाँच करें। Password या OTP साझा न करें और जरूरत पड़ने पर भरोसेमंद व्यक्ति से मदद लें।",
  html: "HTML वेब पेज की संरचना बताता है। Heading, paragraph, link और image के लिए सही element चुनें। रूप और रंग का काम CSS करता है।",
  cpp: "C++ source code को compiler executable में बदलता है। Variable का type तय करता है कि किस तरह की value रखी जा सकती है। cin input लेता है और cout output देता है।",
  "operating-systems":
    "Operating system programs और hardware के बीच संसाधन सँभालता है। यह CPU समय, memory, files और devices का उपयोग व्यवस्थित करता है।",
  spreadsheets:
    "Spreadsheet में formula बराबर के चिन्ह से शुरू होता है। Cell references के कारण input बदलते ही परिणाम दोबारा निकलता है। SUM और AVERAGE अलग सवाल हल करते हैं।",
  "python-functions":
    "Function में arguments भेजे जाते हैं और return से परिणाम मिलता है। Local variable function के भीतर रहता है। print दिखाता है, return value वापस देता है।",
  "lists-and-tuples":
    "Index शून्य से शुरू होता है। Negative index अंत से गिनता है। List के तत्व बदल सकते हैं, लेकिन tuple की entries बदली नहीं जातीं।",
  recursion:
    "Recursion में function छोटे रूप में उसी समस्या को बुलाता है। Base case रुकने की शर्त है। उसके बिना calls लगातार बढ़ सकती हैं।",
  searching:
    "Linear search एक-एक item देखता है। Binary search के लिए data sorted होना चाहिए; हर कदम में खोज का लगभग आधा हिस्सा हटता है।",
  "data-structures-plus":
    "Stack में आखिरी आया item पहले निकलता है। Queue में पहले आया item पहले निकलता है। Undo stack का और टिकट की लाइन queue का उदाहरण है।",
  "database-design":
    "अलग entities के लिए अलग tables बनाएँ। Primary key record की पहचान करती है और foreign key संबंधित record से जोड़ती है। इससे दोहराव और गलती कम हो सकती है।",
  "network-addressing":
    "IP address और subnet mask मिलकर बताते हैं कि कौन-से addresses एक network में हैं। उसी network के लिए local delivery और बाहर के लिए gateway काम आता है।",
  cybersecurity:
    "लंबा और अलग password रखें। Multi-factor authentication सुरक्षा की एक और परत जोड़ता है। Password manager और recovery codes सुरक्षित ढंग से सँभालें।",
  "css-layout":
    "CSS में flex और grid चीजों को व्यवस्थित करते हैं। छोटे screen पर जगह कम होती है, इसलिए flexible widths और responsive rules इस्तेमाल करें।",
  "colour-codes":
    "RGB में red, green और blue की मात्रा से रंग बनता है। केवल सुंदर रंग काफी नहीं; text और background में पढ़ने योग्य contrast भी होना चाहिए।",
  "half-adder":
    "Full adder में A, B और carry-in तीन inputs होते हैं। Sum और carry-out दो outputs मिलते हैं। तीनों inputs 1 हों तो sum 1 और carry 1 होता है।",
  "hardware-io":
    "Input device बाहरी जानकारी को कंप्यूटर तक पहुँचाता है। Output device परिणाम दिखाता है। Touchscreen input और output दोनों काम करता है।",
  "memory-hierarchy":
    "Registers और cache तेज लेकिन छोटे होते हैं। RAM बड़ी working memory है। Storage अधिक data रखता है पर आम तौर पर धीमा होता है।",
  "data-units":
    "एक byte में 8 bits होते हैं। kB में 1000 bytes और KiB में 1024 bytes होते हैं। दोनों इकाइयों को एक जैसा मानने से गणना गलत हो सकती है।",
  "signed-binary":
    "Two’s complement में n bits की सीमा माइनस 2 की घात n-1 से लेकर 2 की घात n-1 से एक कम तक होती है। Carry और signed overflow अलग बातें हैं।",
  "unicode-encoding":
    "Unicode हर character को code point देता है। UTF-8 उसे bytes में encode करता है। एक character हमेशा एक byte नहीं होता।",
  "boot-process":
    "बिजली मिलने पर firmware hardware की शुरुआती जाँच करता है। Bootloader operating system का kernel load करता है, फिर services और login शुरू होते हैं।",
  "process-states":
    "Process ready, running या waiting अवस्था में हो सकता है। CPU मिलने पर ready से running जाता है; input की प्रतीक्षा में waiting हो सकता है।",
  "cpu-scheduling":
    "Scheduler तय करता है कि CPU अगला कौन-सा process चलाए। Waiting time और turnaround time अलग माप हैं। नीति बदलने से इनके मान बदल सकते हैं।",
  "virtual-memory":
    "Virtual address को operating system और hardware physical memory से जोड़ते हैं। जरूरी page RAM में न हो तो page fault होता है।",
  "file-systems":
    "File system नाम और folders को storage में रखे blocks से जोड़ता है। File का नाम, metadata और असली content अलग भूमिकाएँ निभाते हैं।",
  permissions:
    "Read, write और execute permissions अलग अधिकार हैं। हर user को केवल उतना अधिकार दें जितना उसके काम के लिए जरूरी है।",
  deadlocks:
    "Deadlock में processes एक-दूसरे के पास मौजूद संसाधन की प्रतीक्षा करते रहते हैं। Resource लेने का तय क्रम इस स्थिति को रोकने में मदद कर सकता है।",
  "os-services":
    "Program file या device तक सीधे मनमाने तरीके से नहीं जाता। System calls के जरिए operating system से नियंत्रित सेवा माँगता है।",
  "backup-recovery":
    "Backup तभी उपयोगी है जब उससे data वापस लाया जा सके। अलग स्थान पर प्रतियाँ रखें और समय-समय पर restore करके जाँचें।",
  "boolean-laws":
    "Boolean algebra logic expression को सरल बनाती है। De Morgan नियम में AND और OR बदलते हैं तथा हर input का complement लिया जाता है।",
  multiplexer:
    "Multiplexer कई inputs में से एक चुनता है। Select bits तय करते हैं कि कौन-सा data input output तक पहुँचेगा।",
  decoder:
    "Decoder binary code के अनुसार एक output line सक्रिय करता है। दो input bits से चार अलग outputs चुने जा सकते हैं।",
  "cpu-buses":
    "Address bus स्थान बताती है, data bus value ले जाती है और control signals read या write का काम तय करते हैं।",
  "8085-architecture":
    "8085 में accumulator, registers, ALU और control unit मिलकर instruction चलाते हैं। Program counter अगले instruction का पता रखता है।",
  "8085-addressing":
    "Immediate addressing में value instruction में होती है। Register addressing में register का data लिया जाता है; memory addressing में पते से data मिलता है।",
  "8085-flags":
    "8085 flags पिछले arithmetic या logic परिणाम की स्थिति बताते हैं। Zero और carry अलग संकेत हैं। FF में 01 जोड़ने पर 8-bit परिणाम 00 और carry 1 मिलता है।",
  "8085-stack":
    "Stack last-in first-out तरीके से काम करता है। PUSH और POP जोड़े में उपयोग करें। CALL return address सहेजता है और RET उसे वापस लेता है।",
  "8085-branch":
    "Conditional jump किसी flag को जाँचकर रास्ता बदलता है। CMP तुलना के लिए flags बदलता है, लेकिन accumulator की value नहीं बदलता।",
  interrupts:
    "Interrupt CPU का ध्यान किसी घटना की ओर खींचता है। सेवा पूरी होने के बाद program आगे चल सकता है। सभी interrupts की priority एक जैसी नहीं होती।",
  "network-layers":
    "हर network layer अलग जिम्मेदारी सँभालती है। भेजते समय headers जुड़ते हैं और प्राप्त करते समय सही क्रम में पढ़े और हटाए जाते हैं।",
  dns: "DNS domain name का address खोजने में मदद करता है। Cache में उत्तर मिलने पर दोबारा पूरी खोज जरूरी नहीं होती। DNS खुद webpage नहीं भेजता।",
  "tcp-udp":
    "TCP क्रम और delivery की reliability सँभालता है। UDP छोटे स्वतंत्र datagrams भेजता है; application को जरूरत के अनुसार अतिरिक्त व्यवस्था करनी पड़ सकती है।",
  "http-tls":
    "HTTP request और response का नियम है। TLS रास्ते में data को encrypt करता है और server की पहचान जाँचने में मदद करता है। HTTPS वेबसाइट की हर बात सही होने की गारंटी नहीं है।",
  "network-devices":
    "Switch local network में frames आगे भेजता है। Router अलग networks को जोड़ता है। Access point wireless devices को network से जोड़ता है।",
  "network-topologies":
    "Topology बताती है कि devices किस ढंग से जुड़े हैं। Star में central device जरूरी है। किसी connection के टूटने का असर व्यवस्था पर निर्भर करता है।",
  dhcp: "DHCP device को सीमित समय के लिए IP configuration दे सकता है। Address, mask, gateway और DNS settings सही होने पर network का उपयोग आसान होता है।",
  "html-semantics":
    "Semantic HTML content का अर्थ बताता है। nav navigation के लिए और main मुख्य content के लिए है। सही structure screen reader और keyboard users को मदद देता है।",
  "css-box-model":
    "CSS box में content, padding, border और margin अलग हिस्से हैं। box-sizing बदलने से घोषित width की गणना का तरीका बदलता है।",
  "forms-validation":
    "हर form field के साथ label होना चाहिए। Browser validation उपयोगकर्ता की मदद करती है, लेकिन server को भी input की जाँच करनी चाहिए।",
  "dom-events":
    "Browser HTML से DOM tree बनाता है। Event listener click जैसी घटना पर function चलाता है, जो page के दिखते content को बदल सकता है।",
  "spreadsheet-references":
    "Relative reference formula copy करने पर बदलता है। Dollar चिन्ह से row या column स्थिर किया जाता है। Tax rate के लिए fixed cell उपयोगी है।",
  "spreadsheet-functions":
    "SUM जोड़ता है, AVERAGE औसत निकालता है और IF शर्त के अनुसार परिणाम चुनता है। Blank cell और zero को हमेशा समान न समझें।",
  charts:
    "Chart सवाल के अनुसार चुनें। समय के साथ बदलाव के लिए line chart और categories की तुलना के लिए bar chart उपयोगी है। Axis और units स्पष्ट रखें।",
  documents:
    "Styles से headings और paragraphs का रूप एक जैसा रहता है। केवल बड़ा और bold text बनाने के बजाय सही heading style लगाने से navigation भी बेहतर होता है।",
  presentations:
    "हर slide पर एक मुख्य विचार रखें। बड़ा readable text और अर्थपूर्ण visual चुनें। Speaker notes में विस्तार रखें और presentation का अभ्यास करें।",
  communication:
    "अच्छे communication में स्पष्ट संदेश और feedback दोनों होते हैं। सुनकर अपने शब्दों में अर्थ दोहराएँ ताकि गलतफहमी पकड़ी जा सके।",
  "self-management":
    "बड़े काम को छोटे measurable steps में बाँटें। प्राथमिकता तय करें, समय रखें और अंत में अपने परिणाम की समीक्षा करें।",
  teamwork:
    "Team में जिम्मेदारियाँ स्पष्ट रखें और dependencies पहचानें। असहमति में व्यक्ति के बजाय काम और प्रमाण पर चर्चा करें।",
  entrepreneurship:
    "व्यवसाय शुरू करने से पहले ग्राहक की समस्या समझें। Revenue और profit अलग हैं; लागत घटाने के बाद ही profit मिलता है।",
  "green-skills":
    "उपकरण का जीवन बढ़ाना, ऊर्जा बचाना और e-waste को सही जगह देना उपयोगी green practices हैं। केवल नया उपकरण खरीदना हमेशा सबसे अच्छा विकल्प नहीं होता।",
  "digital-citizenship":
    "Online व्यवहार का असर दूसरे लोगों पर पड़ता है। किसी की photo साझा करने से पहले सहमति लें और अपुष्ट जानकारी आगे न बढ़ाएँ।",
  "copyright-licensing":
    "Internet पर उपलब्ध सामग्री अपने-आप public domain नहीं बनती। License की शर्तें पढ़ें; attribution देना और अनुमति होना अलग बातें हैं।",
  "database-keys":
    "Primary key हर row की अलग पहचान है। Foreign key किसी संबंधित table की key को reference करती है और संबंध की वैधता बनाए रखने में मदद करती है।",
  normalisation:
    "Normalization में dependencies देखकर tables बाँटे जाते हैं। उद्देश्य अनावश्यक duplication और update anomalies कम करना है, केवल ज्यादा tables बनाना नहीं।",
  "sql-grouping":
    "GROUP BY rows को समूहों में बाँटता है। WHERE grouping से पहले rows छाँटता है, जबकि HAVING aggregate के बाद groups छाँटता है।",
  transactions:
    "Transaction संबंधित changes को एक काम की तरह सँभालता है। सफल होने पर COMMIT और गलती पर ROLLBACK उपयोगी है। पैसे transfer में दोनों updates साथ सफल होने चाहिए।",
};
const practicalHindi = {
  "cpp-hello":
    "cin से नाम लें और cout से स्वागत संदेश दिखाएँ। Program में header, main और सही punctuation जरूरी हैं।",
  "cpp-arithmetic":
    "Integer division दशमलव भाग हटा देती है। Division से पहले zero divisor जाँचें और decimal परिणाम के लिए सही numeric type चुनें।",
  "cpp-maximum-three":
    "तीनों values की तुलना करें। बराबर values भी test करें; केवल तीन अलग positive numbers पर जाँचना पर्याप्त नहीं है।",
  "cpp-parity":
    "संख्या को 2 से भाग देने पर शेष 0 हो तो वह even है। Negative even numbers के लिए भी यही जाँच काम करती है।",
  "cpp-switch":
    "switch में matching case चलता है। break न लगाने पर अगला case भी चल सकता है। Invalid choice के लिए default रखें।",
  "cpp-sequence":
    "while शर्त पहले जाँचता है। do-while body कम से कम एक बार चलाता है। Counter update भूलने पर loop रुक नहीं सकता।",
  "cpp-factorial":
    "Factorial में 1 से n तक गुणा होता है और 0 factorial का मान 1 है। Negative input और बड़े परिणाम से overflow की जाँच करें।",
  "cpp-prime":
    "Prime संख्या 1 से बड़ी होती है और उसके केवल दो positive divisors होते हैं। 1 prime नहीं है; divisor की जाँच square root तक की जा सकती है।",
  "cpp-fibonacci":
    "Fibonacci में अगला term पिछले दो terms का जोड़ है। दोनों पुराने values को सही क्रम में update करें ताकि एक value समय से पहले न खोए।",
  "cpp-array-max":
    "पहले element को current maximum मानें, फिर बाकी से तुलना करें। शुरुआत zero से करने पर सभी negative values का उत्तर गलत हो सकता है।",
  "cpp-pattern":
    "Outer loop rows तय करता है और inner loop हर row में symbols की संख्या। Row खत्म होने पर ही newline दें।",
  "cpp-area-function":
    "Function length और breadth लेकर उनका गुणनफल लौटाता है। Input और output की इकाइयाँ लिखें; area वर्ग इकाइयों में आता है।",
  "html-background-link":
    "Background colour CSS से दें और hyperlink के लिए anchor का href लिखें। Link text से destination समझ आना चाहिए।",
  "html-table-image":
    "Table में headers और data cells अलग रखें। Image का सही path और अर्थपूर्ण alt text दें, ताकि image न दिखने पर भी अर्थ मिले।",
  "cpp-bubble-sort":
    "पास-पास की values गलत क्रम में हों तो swap करें। हर pass के बाद सबसे बड़ी बची value अंत में पहुँचती है। कोई swap न हो तो जल्दी रुक सकते हैं।",
  "cpp-binary-search":
    "Binary search में sorted array का बीच वाला element जाँचें। Target छोटा हो तो बायाँ हिस्सा, बड़ा हो तो दायाँ हिस्सा लें।",
  "cpp-string-reverse":
    "String के दोनों छोर के characters swap करके अंदर की ओर बढ़ें। यह entry दी गई photo में काटी गई है; इसे अनिवार्य practical न मानें।",
  "cpp-rectangle-class":
    "Class rectangle का data और area निकालने का काम साथ रखती है। Object की length और breadth से उसी object का area मिलता है।",
  "cpp-lifecycle":
    "Constructor object बनते समय और destructor उसके जीवन के अंत में चलता है। Scope खत्म होने पर automatic objects का destruction देखें।",
  "cpp-circle":
    "Default constructor शुरुआती radius देता है। Area pi गुणा radius का square है और circumference 2 pi radius है।",
  "cpp-ratio":
    "Ratio में numerator और denominator सँभालें। Denominator zero नहीं होना चाहिए। Invert करते समय numerator zero हो तो inverse valid नहीं होगा।",
  "cpp-inheritance":
    "Derived class base class की उपलब्ध सुविधाएँ ले सकती है। Access modifiers तय करते हैं कि कौन-सा member कहाँ से उपयोग होगा।",
  "cpp-array-pointers":
    "Pointer array element का पता रखता है। Pointer में एक जोड़ने पर अगले element पर जाते हैं, केवल अगले byte पर नहीं। Bounds के बाहर dereference न करें।",
  "cpp-virtual":
    "Base pointer से virtual function बुलाने पर actual object का override चल सकता है। यही runtime polymorphism है।",
  "cpp-reference-swap":
    "Reference parameters caller की असली values से जुड़े होते हैं। Temporary variable से swap करने पर caller के दोनों variables बदलते हैं।",
  "logic-basic":
    "AND, OR और NOT gates की truth tables सभी input combinations पर भरें। केवल एक सफल combination से पूरी gate जाँच नहीं होती।",
  "logic-universal":
    "केवल NAND या केवल NOR gates से बाकी basic gates बना सकते हैं। पहले NOT बनाएँ और फिर De Morgan नियम से दूसरा operation बनाएँ।",
  "logic-half-adder":
    "Half adder दो bits जोड़ता है। Sum के लिए XOR और carry के लिए AND होता है। इसमें carry-in input नहीं होता।",
  "logic-full-adder":
    "Full adder में तीसरा input carry-in है। Sum A XOR B XOR carry-in है। आठ combinations की truth table बनाएँ।",
  "logic-half-subtractor":
    "Half subtractor में difference XOR से मिलता है। Borrow तब होता है जब A zero और B one हो।",
  "logic-full-subtractor":
    "Full subtractor पिछले स्थान का borrow-in भी लेता है। Difference और borrow-out को अलग निकालें और सभी आठ combinations जाँचें।",
  "logic-three-circuits":
    "Photo में किसी भी तीन circuits का निर्देश है, नाम तय नहीं हैं। Teacher पहले circuits चुनें; हर circuit की truth table और observations अलग रखें।",
  "logic-rs":
    "R-S latch एक bit याद रख सकता है। NOR और NAND implementations के active levels अलग होते हैं; forbidden combination सही circuit के अनुसार पहचानें।",
  "logic-jk":
    "J-K flip-flop में J और K दोनों one होने पर clock edge पर state toggle होती है। State केवल input से नहीं, पिछली state से भी तय होती है।",
  "logic-counter":
    "तीन bits से आठ states बनती हैं। Counter zero से seven तक जाकर वापस zero हो सकता है। हर clock पर state का बदलाव दर्ज करें।",
  "py-arithmetic":
    "Python input से string मिलती है। Numeric calculation के लिए conversion करें और division से पहले denominator जाँचें।",
  "py-grade":
    "पहले marks की valid सीमा जाँचें। फिर सबसे ऊँची grade की शर्त से नीचे आएँ ताकि overlapping conditions सही क्रम में लागू हों।",
  "py-factorial":
    "Negative input अस्वीकार करें। Accumulator one से शुरू करें और one से n तक multiply करें; zero के लिए उत्तर one रहता है।",
  "py-prime":
    "Range के हर candidate के divisors जाँचें। Two सबसे छोटा prime है। Composite मिलते ही उस candidate की जाँच रोकी जा सकती है।",
  "py-palindrome":
    "Text को उलटकर तुलना करें। पहले तय करें कि case, spaces और punctuation को तुलना में रखना है या normalize करना है।",
  "py-list-statistics":
    "Total और count से mean मिलता है। Empty list पर division और min/max से बचें। Negative values वाला test भी करें।",
  "py-linear-search":
    "List में क्रम से target खोजें। Found index और not-found परिणाम अलग रखें; index zero को गलती से false result न मानें।",
  "py-word-frequency":
    "Dictionary में word key और count value रखें। हर बार word मिलने पर count बढ़ाएँ। Case और punctuation के नियम पहले तय करें।",
  "py-tuple-record":
    "Tuple के fields को तय क्रम में रखें। Unpacking में variables की संख्या values से मेल खानी चाहिए।",
  "py-function":
    "Parameters से function को input मिलता है। Return value को caller आगे इस्तेमाल कर सकता है। केवल print करना return करने जैसा नहीं है।",
  "py-text-file":
    "with और सही encoding के साथ text file खोलें। Write mode पुरानी file को overwrite कर सकता है। पढ़कर शब्द गिनने के नियम स्पष्ट रखें।",
  "py-filter-file":
    "Source file की हर line जाँचें और शर्त पूरी होने पर अलग destination में लिखें। उसी file को गलत mode में खोलकर data न मिटाएँ।",
  "py-csv":
    "CSV में comma और quote वाले fields हो सकते हैं। csv module escaping सँभालता है; केवल comma पर split करना भरोसेमंद नहीं है।",
  "py-binary":
    "pickle Python objects सहेज सकता है, पर untrusted pickle पढ़ना सुरक्षित नहीं है। केवल भरोसेमंद file पर यह practical करें।",
  "py-stack":
    "List append से push और pop से आखिरी item निकलता है। Empty stack से pop करने से पहले जाँच करें।",
  "py-exceptions":
    "गलत numeric input ValueError और zero division ZeroDivisionError दे सकता है। संबंधित exception पकड़ें और उपयोगकर्ता को स्पष्ट संदेश दें।",
  "sql-create":
    "Table बनाते समय types और constraints चुनें। INSERT में values सही columns से मिलाएँ और SELECT से inserted rows जाँचें।",
  "sql-filter":
    "WHERE rows चुनता है और ORDER BY क्रम लगाता है। Text literal quotes में लिखें और numeric तुलना सही column पर करें।",
  "sql-aggregate":
    "COUNT, SUM और AVG अलग calculations करते हैं। NULL values और empty input के व्यवहार को समझकर परिणाम की जाँच करें।",
  "sql-join":
    "JOIN related tables की keys मिलाता है। गलत condition बहुत ज्यादा rows दे सकती है। Match न होने पर INNER JOIN row नहीं देता।",
  "py-mysql":
    "Database query में values parameters के रूप में भेजें। User input जोड़कर SQL string बनाना unsafe है। Connection और cursor बंद करना न भूलें।",
  "sheet-gradebook":
    "Marks के लिए numeric cells रखें। Total और average formulas बनाएँ, copy करते समय references जाँचें और chart में सही range लें।",
  "java-class":
    "Java class data और methods रखती है, object उसका instance है। यह supplementary exercise है; इसे verified IT board requirement न मानें।",
  "html-form":
    "Input के label और id जोड़ें। Required fields और सही input types रखें। Server पर validation फिर भी जरूरी है।",
  "8085-add":
    "पहली value accumulator में load करें और दूसरी जोड़ें। आठ bits से बड़ा परिणाम हो तो carry flag देखें; accumulator में निचले आठ bits रहते हैं।",
  "8085-transfer":
    "Register और memory transfer में address और value अलग समझें। MOV और MVI का काम एक जैसा नहीं है; instruction के अनुसार data trace करें।",
};
for (const [id, value] of Object.entries(practicalHindi))
  hindiExplanations[`practical-${id}`] = value;
