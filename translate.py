import re

file_path = r'f:\BuiltUp\index-ar.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    # Navbar
    r'>Home<': r'>الرئيسية<',
    r'>About Us<': r'>من نحن<',
    r'>Services<': r'>خدماتنا<',
    r'>Products<': r'>منتجاتنا<',
    r'>Faqs<': r'>الأسئلة الشائعة<',
    r'>Contact Us<': r'>اتصل بنا<',
    r'>Contact us<': r'>اتصل بنا<',
    
    # Arabic / English button
    r'"index-ar.html"\s+class="ekit-menu-nav-link"\s*style="font-weight:800;">عربي<': r'"https://vsmartso.com/index.html" class="ekit-menu-nav-link" style="font-weight:800;">English<',

    # Hero
    r'Welcome to V Smart Solutions': r'مرحباً بكم في في سمارت سوليوشنز',
    r'Building Businesses\. From Vision to Reality\.': r'نبني الأعمال. من الرؤية إلى الواقع.',
    r'Vsmart Solutions delivers integrated business, technology, design, and infrastructure solutions — from the first idea to full execution\.': r'تقدم في سمارت سوليوشنز حلولاً متكاملة في الأعمال، التكنولوجيا، التصميم، والبنية التحتية — من الفكرة الأولى حتى التنفيذ الكامل.',
    r'Explore Services': r'استكشف خدماتنا',
    r'View Products': r'عرض المنتجات',

    # About Us
    r'Your One-Stop Partner for\s*Complete Business Solutions': r'شريكك الشامل لحلول الأعمال المتكاملة',
    r'V Smart Solutions is an integrated business solutions company that brings design,\s*technology, infrastructure, and\s*execution together under one roof\. From branding and web development to architecture,\s*interior finishing, electrical\s*works, security systems, and business setup, we help turn ideas into fully operational\s*businesses — from concept to\s*completion\.': r'في سمارت سوليوشنز هي شركة حلول أعمال متكاملة تجمع بين التصميم والتكنولوجيا والبنية التحتية والتنفيذ تحت سقف واحد. من بناء العلامة التجارية وتطوير الويب إلى الهندسة المعمارية، التشطيبات الداخلية، الأعمال الكهربائية، الأنظمة الأمنية، وتأسيس الأعمال، نحن نساعد في تحويل الأفكار إلى أعمال تشغيلية بالكامل — من الفكرة إلى الإنجاز.',
    r'End-to-End Solutions': r'حلول شاملة من الألف إلى الياء',
    r'One Team, Multiple Expertise': r'فريق واحد، خبرات متعددة',
    r'From Concept to Completion': r'من الفكرة إلى التنفيذ',
    r'Get a Free Consultation': r'احصل على استشارة مجانية',
    r'call support center 24X7': r'اتصل بمركز الدعم على مدار الساعة',
    r'Call Support Center 24/7': r'اتصل بمركز الدعم على مدار الساعة',
    r'>\+1 809 120 6705<': r'>01129314222<',

    # Services
    r'Our Services': r'خدماتنا',
    r'Complete Solutions for Every\s*Stage of Your Business': r'حلول متكاملة لكل مرحلة من مراحل عملك',
    r'From branding and digital solutions to architecture, infrastructure, and execution —\s*we bring everything your business\s*needs together under one roof\.': r'من بناء العلامة التجارية والحلول الرقمية إلى الهندسة المعمارية والبنية التحتية والتنفيذ — نجمع كل ما يحتاجه عملك تحت سقف واحد.',
    
    r'Branding & Creative Design': r'العلامة التجارية والتصميم الإبداعي',
    r'Brand identity, logo design, packaging, graphics, signage, and creative\s*materials that give your business a professional\s*and consistent visual identity\.': r'هوية الشركة، تصميم اللوجو، التغليف، الجرافيكس، اللافتات، والمواد الإبداعية التي تمنح عملك هوية بصرية احترافية ومتسقة.',
    
    r'Web & Digital Solutions': r'حلول الويب والحلول الرقمية',
    r'Custom websites, e-commerce stores, web applications, and digital\s*platforms designed to help businesses grow, connect,\s*and operate online\.': r'مواقع إلكترونية مخصصة، متاجر إلكترونية، تطبيقات ويب، ومنصات رقمية مصممة لمساعدة الشركات على النمو والتواصل والعمل عبر الإنترنت.',
    
    r'Architecture & Interior Design': r'الهندسة المعمارية والتصميم الداخلي',
    r'Architectural and interior design solutions for commercial spaces,\s*offices, retail stores, and businesses — from\s*planning and concepts to detailed design\.': r'حلول الهندسة المعمارية والتصميم الداخلي للمساحات التجارية، المكاتب، ومتاجر التجزئة — بدءاً من التخطيط وتطوير الأفكار وصولاً إلى التصاميم التفصيلية.',
    
    r'Construction & Fit-Out': r'البناء والتشطيبات',
    r'Complete site execution, interior finishing, renovation, fit-out, and\s*construction works delivered by skilled teams with\s*attention to quality and detail\.': r'تنفيذ كامل للمواقع، تشطيبات داخلية، تجديد، وأعمال البناء التي يتم تنفيذها بواسطة فرق متخصصة مع الحرص التام على الجودة وأدق التفاصيل.',
    
    r'Electrical & Security Systems': r'الأنظمة الكهربائية والأمنية',
    r'Electrical works, CCTV surveillance, networking, security systems, and\s*technical installations designed to keep your\s*business connected, secure, and operational\.': r'أعمال الكهرباء، كاميرات المراقبة، الشبكات، الأنظمة والأجهزة الأمنية، والتركيبات التقنية المصممة للحفاظ على استمرارية عملك بأمان.',
    
    r'Marketing & Business Setup': r'التسويق وتأسيس الأعمال',
    r'Digital marketing, advertising, business launch support, POS systems,\s*and operational solutions to help businesses start\s*strong and reach their customers\.': r'التسويق الرقمي، الإعلانات، دعم إطلاق الأعمال، أنظمة الكاشير \((POS)\)، والحلول التشغيلية لمساعدة الشركات على الانطلاق بقوة والوصول لعملائها.',

    # Portfolio
    r'Our Portfolio': r'سابقة أعمالنا',
    r'Our Trusted Partner': r'شركاء نعتز بهم',
    r'Proudly partnering with Dubai Real Estate and Supplies to deliver smart, reliable,\s*and integrated business solutions\.': r'نفخر بشراكتنا مع مؤسسة دبي للعقارات والتوريدات لتقديم حلول أعمال ذكية وموثوقة ومتكاملة.',

    # Why Choose Us
    r'Why choose us\?': r'لماذا تختارنا؟',
    r"Why we're your best choice": r'لماذا نحن الخيار الأفضل لك',
    r'Built on trust and technical excellence, our team combines deep industry knowledge with\s*cutting-edge technology to deliver smart, scalable solutions for every business\.': r'بناءً على الثقة والتميز الفني، يجمع فريقنا بين المعرفة العميقة بالصناعة والتكنولوجيا الحديثة لتقديم حلول ذكية وقابلة للتطوير لكل شركة.',
    
    r'Turnkey Solutions': r'حلول متكاملة \(تسليم المفتاح\)',
    r'From concept to completion, we bring design, technology, infrastructure, and\s*execution together under one roof\.': r'من الفكرة إلى التنفيذ، نجمع بين التصميم، التكنولوجيا، البنية التحتية، والتنفيذ تحت سقف واحد.',
    r'Business Solutions': r'حلول الأعمال',
    r'End-to-End': r'من البداية للنهاية',
    
    r'Smart Infrastructure': r'البنية التحتية الذكية',
    r'CCTV, electrical systems, networking, POS, and technical solutions designed\s*for reliable business operations\.': r'كاميرات المراقبة، الأنظمة الكهربائية، الشبكات، نقاط البيع، والحلول التقنية المصممة لتشغيل الأعمال باحترافية وتكامل.',
    r'Technical Solutions': r'حلول تقنية',
    
    r'Integrated Expertise': r'خبرات متكاملة',
    r'Multiple specialized teams working together to deliver complete solutions\s*tailored to your business needs\.': r'فرق متخصصة تعمل معًا لتقديم حلول متكاملة تتناسب مع احتياجات عملك.',
    r'Expert Teams': r'فرق متعددة التخصصات',
    r'Multi-Disciplinary': r'متخصصة',
    
    r'Ready to Build Your Business\?': r'هل أنت مستعد لبناء عملك؟',
    r'From concept to completion, V Smart Solutions brings design, technology, infrastructure,\s*and execution together under\s*one roof\.': r'من الفكرة إلى التنفيذ الكامل، تجمع في سمارت سوليوشنز المهارات والتكنولوجيا والبنية التحتية تحت سقف واحد.',
    r'Start Your Project': r'ابدأ مشروعك',

    # FAQs
    r"Got questions\? we've got answers": r'لديك أسئلة؟ لدينا الإجابات',
    r'Find answers to common questions about our services, project process, and complete\s*business solutions\.': r'اعثر على إجابات للأسئلة الشائعة حول خدماتنا، وعمليات المشاريع، وحلول الأعمال المتكاملة.',
    
    r'What services does V Smart Solutions provide\?': r'ما هي الخدمات التي تقدمها شركة V Smart Solutions؟',
    r'We provide end-to-end business solutions including branding and\s*creative design, web development, architecture and\s*interior design, construction and fit-out, electrical and\s*security systems, and digital marketing\.': r'نقدم حلول أعمال متكاملة من البداية للنهاية وتشمل خدماتنا العلامة التجارية والتصميم الإبداعي، تطوير الويب، الهندسة المعمارية والتصميم الداخلي، أعمال البناء والتشطيبات، الأنظمة الكهربائية والأمنية، والتسويق الرقمي.',
    
    r'Can V Smart Solutions handle a project from start to finish\?': r'هل يمكن لشركة V Smart Solutions التعامل مع المشروع من البداية إلى النهاية؟',
    r'Yes\. We can manage multiple stages of your project under one\s*roof, from planning and design to execution, technology,\s*infrastructure, and final setup — depending on your project\s*requirements\.': r'نعم. يمكننا إدارة مراحل إنشائية وتقنية ونظامية متعددة لمشروعك تحت سقف واحد، بدءًا من التخطيط والتصميم وحتى التنفيذ الكامل.',
    
    r'Can you work with an existing business or only new projects\?': r'هل يُمكنكم العمل مع شركة قائم أم تعملون فقط المشاريع الجديدة؟',
    r'Both\. We support new businesses from the initial concept through\s*launch, and we also help existing businesses with\s*redesign, renovation, digital solutions, infrastructure,\s*marketing, and operational improvements\.': r'كلاهما. نحن ندعم المشاريع الجديدة بدءاً من المفهوم الأولي وصولاً إلى الافتتاح، كما نساعد المشاريع التجارية القائمة في إعادة التصميم، الحلول الرقمية، البنية التحتية والتسويق.',
    
    r'How do you start a new project with V Smart Solutions\?': r'كيف تبدأ مشروعًا جديداً مع V Smart Solutions؟',
    r'Simply contact us and tell us about your project, goals, and\s*requirements\. Our team will review your needs, recommend\s*the right solutions, and prepare a proposal based on the scope\s*of work\.': r'ببساطة، تواصل معنا وأخبرنا عن مشروعك، أهدافك، ومتطلباتك، وسيقوم فريقنا بدور دراسة احتياجاتك، وإعداد عرض متكامل بناءً على نطاق العمل.',
    
    r'How can I request a quotation\?': r'كيف يمكنني طلب عرض سعر؟',
    r'Contact us through WhatsApp, phone, email, or our contact form\.\s*Once we understand your requirements, we can provide a\s*suitable quotation or project proposal\.': r'تواصل معنا عبر واتساب، الهاتف، الإيميل، أو نموذج الاتصال الخاص بنا، وبمجرد فهمنا لمتطلباتك بشكل كامل، سنقوم بتقديم عرض سعر مناسب لمشروعك.',

    r'Write To Us': r'اكتب إلينا',
    
    r'Dubai Real Estate and Supplies, Authorized Partner': r'وكيل معتمد لمؤسسة دبي للعقارات والتوريدات',

    # Footer
    r'Copyright © (2024|2025|2026)': r'حقوق النشر © 2026',
    r'All Rights Reserved': r'جميع الحقوق محفوظة',
    r'Our post-construction services gives you peace of mind knowing that we are still\s*here for you even after\.': r'خدمات الدعم الخاصة بنا تمنحك راحة البال بأننا متواجدون لخدمتك في جميع الأوقات.',
    r'>Company<': r'>الشركة<',
    
    # Form input placeholders
    r'placeholder="Enter Your name"': r'placeholder="الاسم"',
    r'placeholder="Enter Your email"': r'placeholder="البريد الإلكتروني"',
    r'placeholder="Phone number"': r'placeholder="رقم الهاتف"',
    r'placeholder="Subject"': r'placeholder="الموضوع"',
    r'placeholder="Message"': r'placeholder="رسالتك"',
    r'value="Submit"': r'value="إرسال"',
}

# Apply all regex replacements
for ext, arp in replacements.items():
    content = re.sub(ext, arp, content)

# Fix header direction dynamically: 
# Find <div class="ekit-template-content-markup ekit-template-content-header ekit-template-content-theme-support">
# And change to <div dir="ltr" class="ekit-template-content-markup ...
content = content.replace(
    '<div class="ekit-template-content-markup ekit-template-content-header ekit-template-content-theme-support">',
    '<div dir="ltr" class="ekit-template-content-markup ekit-template-content-header ekit-template-content-theme-support">'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Translation Applied and LTR set on Header.")
