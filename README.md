Assignment #10 - Final Design Reports - Group Assignment
Your Final Fall Design Report should be formatted as a professional looking repository with language that documents your project work with consistency and clarity. You may consider using the Github guide to help you construct your final design report: https://guides.github.com/features/wikis/
Links to an external site.
The contents of your report will come from the revisions of all your assignments. We expect that assignments will be updated since your original submission. Included in your report should be a Table of Contents, and your report should include a README.md page that lists these following section titles with links.
Table of Contents for Fall Design Reports
Team names (include Advisor) and Project Abstract (limit of 400 ascii chars)
Project Description (Assignment #2)
User Stories and Design Diagrams (Assignment #4)
User Stories
Design Diagrams: Level 0, Level 1 and Level 2 
Description of the Diagrams: including conventions and a brief description of the purpose of each component.
Project Tasks and Timeline (Assignment #5-6)
Task List
Timeline
Effort Matrix
ABET Concerns Essay (Assignment #7)
PPT Slideshow (includes ABET Concerns) (Assignment #8)
Self-Assessment Essays (Assignment #3)
Professional Biographies  (Assignment #1)
Budget
expenses to date or statement that there have not been any.
show monetary value of donated items and donation sources.
Appendix
include appropriate references, citations, links to code repositories, and meeting notes.
there should be evidence justifying 45 hours of effort for each team member


Team Members
[Zaid Najar] - [najarzs@mail.uc.edu]
[Russell Toney] - [toneyrl@mail.uc.edu]
[Jacob Sayatovic] - [sayatojb@mail.uc.edu]
[Prabhjot Singh] - [singh2pt@mail.uc.edu]
[Asad Patel] - [patel5a4@mail.uc.edu]
[Ibrahim Ahmed] - [ahmedik@mail.uc.edu]
Abstract

QuickShift is a brand new, innovative way for restaurants and other businesses to quickly staff their work dynamically based on real time demands.   It allows restaurants to post shifts that workers can claim quickly, reducing staffing gaps that might impact service.   The app will include a shift management system, notifications for workers who are available, and a very flexible way to schedule.   QuickShift will finally address the needs for efficient, adaptable, and reliable staffing that restaurants have been struggling with forever.

Project Description

	Across the globe, there are many many restaurants, stores, and other establishments that need constant staffing.   Unfortunately, many of these restaurants have dealt with lack of proper staffing, busy seasons, and other issues.   At the moment, these restaurants rely on unreliable methods like calling employees directly, or posting last minute ads which tends to fail to fill the available shifts.   Quickshift provides a much better solution - on demand work.   The application will allow businesses to post shifts in real-time, allowing workers to quickly fill the positions based on the establishments requirements. 

User Stories
As an employee starting on QuickShift, I want to be able to easily pick up jobs in my location at various places, so I can make some extra money on the side easily.

As an employer starting on QuickShift, I want to be able to quickly fill positions that require little training overhead in order to keep the business running smoothly.

As a returning employee on QuickShift, I want to be able to access better positions and jobs with my rating, in order to make more money than I had before.

As a returning employer on QuickShift, I want to have high-quality workers at any moment of the day in case of cancellations and busy days by paying more, in order to generate more revenue and prohibit slowdowns.

Design Diagrams

Project Tasks and Timeline
Design the user interface (UI) and user experience (UX) for both the web and mobile applications to ensure intuitive navigation for employers and workers. (Prabhjot)
Develop the frontend of the web application using React.js to create a responsive and dynamic user interface. (Prabhjot)
Build the mobile application for iOS and Android platforms using Flutter to provide cross-platform compatibility and a seamless user experience.
Implement the backend architecture using Node.js and Express.js to handle API requests and manage server-side operations efficiently. (Jacob, Prabhjot)
Set up a scalable cloud infrastructure on AWS or Microsoft Azure (to be discussed) to support real-time data processing and ensure high availability of the QuickShift platform. (Russell)
Integrate secure payment gateways such as Stripe or PayPal (simulate for now) to facilitate instant and reliable financial transactions between businesses and freelancers. (Russell)
Create a robust matching algorithm using Python and machine learning techniques to efficiently connect businesses with available workers based on location, availability, and required competencies. (Jacob, Prabhjot)
Develop RESTful APIs to enable communication between the frontend and backend systems, ensuring smooth data flow and functionality (Ibrahim).
Implement user authentication and authorization mechanisms using OAuth 2.0 and JWT to ensure secure access for all users. (Russell)
Design and deploy a relational database schema using PostgreSQL to manage user data, shift postings, and transaction records effectively.
Develop real-time notification systems using WebSockets to inform users about shift availability and application statuses instantly. (Prabhjot)
Implement data encryption and security protocols to safeguard personal and financial information of all users, ensuring compliance with relevant regulations (Ibrahim).
Set up continuous integration and continuous deployment (CI/CD) pipelines using Jenkins or GitHub Actions to automate testing and deployment processes. (Russell)
Conduct comprehensive unit and integration testing using Jest and Mocha to identify and fix bugs, ensuring a smooth user experience upon full deployment (Ibrahim).
Optimize the matching algorithm by incorporating machine learning models to enhance accuracy and speed in connecting employers with suitable workers. (Jacob)
Develop a feedback system that allows users to rate and review shifts and employers, using technologies like React and Node.js to integrate it seamlessly into the platform.
Implement analytics dashboards using tools like Tableau or Power BI to monitor platform performance metrics and user engagement (Ibrahim).
Create automated scripts for data backup and recovery to ensure data integrity and availability in case of system failures. (Asad)
Integrate third-party services such as Google Maps API to provide location-based shift listings and improve the matching process.
Develop a comprehensive testing framework to perform load testing and ensure the platform can handle high traffic during peak periods. (Jacob)
Set up version control using Git and GitHub to manage codebase efficiently and facilitate collaboration among development team members. (Prabhjot)
Conduct code reviews and implement best practices for code quality and maintainability, ensuring a robust and scalable codebase. (Asad)
Implement push notification services using Firebase to keep users informed about shift updates and important platform announcements. (Russell)
Develop data analytics modules to track user behavior and platform usage, enabling data-driven decision-making for future enhancements. (Asad)
Ensure compliance with labor laws and regulations by implementing necessary features in the platform that handle worker classifications and payment processing accurately. (Asad)

ABET Concerns Essay

PPT Slideshow










Self-Assessment Essays

JACOB
Our senior design idea, QuickShift, is aimed towards building an equivalent of gig platforms (Doordash) but for restaurant employees, and where restaurants can assign shifts for workers. From an academic point of view, being a senior computer science major this project would afford the practical application of software development, user interface design and data management skills I've learned thus far in my degree. QuickShift aims to solve a common problem in the restaurant sector: maintenance problems such as staff availability which hampers the normal running of activities. The operation of intelligent matching algorithms and convenient user interface that will be used in our platform will make the process of filling the open shifts fast. In this project we are actually able to blend or combine both the theoretical and practical aspects that we learn in class. It will be inspiring to apply this idea and observe it affect the given field. The college courses which I have taken have gone a long way in preparing me for the development of QuickShift. In the course CS 2028C Data Structures, I came across efficient algorithms that shall be helpful in sorting and pairing of shifts in the platform. CS-3003 Programming Languages exposed me to the entire functionality of software development process giving me the skills to plan, design, implement and test software systems. From CS-5156 Computer Networks (in progress), I understood databases, hence designing and managing the data structures required to store information about the users and shifts. The course CS 5064: Artificial Intelligence made me develop interest in adding intelligence to software, which we will deploy in our project to facilitate appropriate matching of the users. Apart from technical competencies, these courses also introduced me to analytical thinking and decision making which are what will enable us overcome some of the difficulties that may be encountered in the process of development. With the academic experiences I have made, I will be in a position to apply quick shift where I will be of utmost importance. My co-op experiences have also impacted overall strategy for QuickShift project too. During my course, I did three co-op terms at Siemens Digital Industries Software and was employed as Software Engineer Intern and I had practical experience in the development of software. I developed in C++ and Tcl/TK; the projects were to clean up, refactor, and improve the quality of existing code, which I personally will use for QuickShift. Moreover, while on my double rotation, I was privileged to mentor another intern and therefore I strengthened my leadership and communication skills apart from being able to learn the process of working within a team setting. The use of GitLab for version control and project management also helped me improve my organizational skills that will help me intended to coordinate the team’s working process in QuickShift. These five experiences above have taught me both technical and non-technical skills that I will use to help make our project well structured, efficient, and successful. QuickShift is exciting for me to work on as it aims to solve a real-life problem within the food sector especially the restaurants industry, which sometimes experience staff changes at the last minute. The opportunity to work on designing the solution that can has a real impact on business motivates me to the greatest extent of my ability as I have wanted to create a product that will impact restaurants by providing them with flexible staff options and employees would be glad to get job offers from the restaurants applying this solution. This project also resonates with my passion of building technology applications that address real life challenges in people’s lives. It is my hope that I will be able to assist in developing a tool that de-sweats the whole process of staffing and consequently make things easier for restaurants to run. Joining this project means that I can contribute to something that is valuable while continuing working on myself. As far as QuickShift evolution is concerned, our strategy is to create the initial version, which includes significant features, like shift postings and sign-up, and then generate a series of modifications according to the users’ feedback. We want to incorporate the best practices we will identify throughout the development process so that we can enhance the platform as we continue to gain insight into our users’ requirements. The anticipated result is a functional system that matches restaurants with employees on job boards and help relieve the pressure of last minute hiring. To self-assess my contributions, I will review my work with benchmarks that have been set in terms of progress and guarantee that the quality of the work is up to par. The fact that the platform is workable, easy to navigate, effectively obtained positive feedbacks from test users will be an indication that I have done a good job. Success, therefore, will be in terms of effectiveness and efficiency of the platform in terms of usability, reliability, and functionality of the platform to these key stakeholders: the restaurants, and the workers.  

Zaid
	Introduction My senior design project focuses on the development of a new software with a social purpose to solve existing issues. Being a computer science student, I consciously strive to develop the concept for my senior design, which would combine the knowledge and experience I have acquired during my study and bring a positive and worthy change to the people. This project will afford me a chance to practice the theories that I study in class, think critically, and work in a team to develop a more efficient, integrated, and reliable software system. Guidance from College Curriculum While studying at the University of Cincinnati, I have completed several computer science classes, each of which will be critical in determining the elements of my senior design project. Courses like CS2028C: Data Structures and CS4071: Design and Analysis of Algorithms have taught me how to approach program development in the most efficient way, by using the right data structures and designing the right algorithms. Additionally, CS4092: Database Design and Development will guide the design of the backend of the project and optimize the database structure. I've also gained valuable insights into software security through IT2030C: Information Security and Assurance, which will assist me in ensuring that the project adopts best security practices from the developmental stage. These courses have equipped me with the technical and theoretical knowledge to implement a high-quality product. Advices from Co-op and Work Experience Both my co-ops at Siemens as a full-stack engineer have also helped build my capacity to contribute to the senior design project. I had the opportunity to experience both the front end and the back end, working with technologies such as React, C#, and SQL to enhance web applications. I also worked with advanced methodologies and frameworks such as Agile, which help in defining the roles and responsibilities of every team member, communicating with the team members of a software development project, and monitoring the progress of the project from initiation to implementation. Additionally, working at various restaurants over time and driving for Uber and DoorDash, I learned important aspects of customer interaction and quick decision-making in problem-solving. These technical and non-technical skills will assist in my ability to work with my fellow colleagues and contribute to all aspects of the senior design project. Motivation for the Project I have a lot of enthusiasm for participating in the senior design project because it presents opportunities to address real-life challenges and demonstrate my personal growth as a software engineer. Another reason is to find a job in which I can freely utilize my abilities and maybe make a small change that could enhance the functioning of companies or people’s lives. Particularly, I have done work in restaurants and other gig economy jobs, so I am thrilled about designing software that will help these businesses. This passion for software development and the quest to continue improving my understanding of how to develop software drive my interest in taking on increasingly complex projects. Preliminary Project Approach and Evaluation There will be planning and understanding of the requirements that have to be met, as well as designing a good architecture that can be expanded and is secure. To achieve this, I intend to incorporate Agile methodologies to maintain general flexibility and improvement throughout the process. In order to meet the goals of the project, I anticipate delivering a well-organized, easily navigable software solution. Depending on the progress, I will make a self-assessment based on the simplicity of the code, optimized algorithms, and system efficiency. I will know I have done a good job when I complete all the functional requirements of the project, encounter a few bugs in the final product, and receive favorable feedback from my colleagues and instructors. Impact and Future Potential This senior design project has the potential of presenting more than just academic satisfaction. When creating software, I have long-term objectives of delivering a socially responsible product that rejects ineffective solutions for communities and businesses. Perhaps, the researched project might be used as the basis for further advancements in the given field, with the opportunity of expanding the size of the application and bringing it to larger markets and various applications. I believe that the knowledge I am going to use in this project, such as database tuning, security, and Agile development, will help me achieve success in this project as well as in future projects as I progress in my career. Furthermore, it must also be noted that the success of the project may extend further into how technology fosters positive change and may consequently encourage more students as well as professionals to work towards similar objectives.

Russell
For my team's senior design project, we are going to be working on a full stack
application called QuickShift. A common challenge affecting restaurants and other
forms of businesses is the inconsistency in the availability of staff where businesses
may be forced to close during times when they would normally be open due to lack of
employees. This mainly inconveniences both the staff and the impatient customers
especially within the region of Cincinnati which has an active dining and shopping
industry. QuickShift is proposed to provide the solution as an on demand staffing service
that allows the hiring organization to engage the independent workers on a short term
basis. QuickShift empowers restaurants, stores, and various other small businesses to
advertise shifts for jobs that do not require any training, including; bussers, hosts,
dishwashers, cashiers, and food runners among others. Through the described
approach, experienced independent workers in these positions can search and choose
the shifts according to availability, location, and competencies to meet the demand; on
the other hand, businesses can quickly fill the vacancies and function efficiently.
Both my college curriculum and my co-op experiences has helped me develop
the skills I need in order to complete this project. Courses like CS4071 Design and
Analysis of Algorithms have sharpened my problem-solving skills and helped me create
efficient algorithms that I can use in making sure that the projects performance is good.
CS3093C: Software Engineering* introduced me to agile development practices,
version control, and code quality assurance, which will help me maintain a streamlined,
collaborative workflow throughout the project lifecycle. Additionally, courses such as
4092 Database Design have given me a better understanding of both relational and non relational (NoSQL) databases, giving me a better understanding to be able to effectively
manage backend database operations in a scalable and better way.
My co-op experiences have further honed my technical and non-technical skills,
allowing me to bring real-world knowledge to the project. While working as a Software
Engineer Co-op at Siemens PLM Software, I contributed to a large codebase using
technologies like C++, .NET , and Docker, which helped my ability to work in very large
codebases, and also greatly increased my communication skills as there were many
things in the codebase I didn’t understand or know and had to ask for help. My work at
both Cincinnati Children’s Hospital and Cincinnati Incorporated as a Software
Developer/Engineer Co-op enhanced more of technical skills, where I was mostly
focusing mostly on backend development using .NET , but I also had the opportunity to
work on frontend applications using primarily React .NET MAUI/Blazor.
I am excited about the technical challenges and innovative potential that
QuickShift presents. One of the things motivating me is the opportunity to design a
solution that will have a direct impact on local restaurants and shops in the Cincinnati
area. This project not only leverages my technical expertise in full-stack development,
but it also addresses a real-world problem. My approach to the problem would be designing a scalable and performant application. I believe that I would probably be focusing on the backend of the application as that’s what my experience is mostly focusing on. I’m expecting a fully working app that can at least have shops registered to the app, and can hire people to take on shifts, which would also be the final expected product. I can self evaluate my contributions by
checking out the tasks i’ve done and lines added and deleted.

Prabhjot
After a lengthy discussion, the team and I concluded one idea that my team and I desired to work on. Our idea is called QuickShift which is an app that allows businesses to find individuals to cover shifts that don’t require training. The goal of this project is to make a fully functional app that is both easy to use and powerful for businesses and those looking to work quick jobs. While the scope is largely a web application with a backend, I plan on trying it out on other platforms natively and receiving input from businesses. This is significant to me because I always wanted to pursue a career in full stack applications, and I am excited to work on something that is very marketable. I feel that this application can empower employers and employees by offering both workers and customizable schedules. With this project I hope to use the information I learned through our time at the University of Cincinnati.
	 Throughout University, there are many classes I have taken that will help me be a valuable member on this project. I have taken classes like Data Structures (CS 2028C) to better understand how to manage large-scale data and organize it. Classes like Software Engineering (EECE 3093C) allowed me to work with a team and deliver a small-scale app. In this class I got to go through the full software development lifecycle. Lastly, a class I am taking right now is called User Interface (CS 5167). This class will be very helpful when designing an interface for people that are not as technical. This will be a huge help when creating an app for the public. Although classes are a major help when creating this app, my COOP experience will also be valuable.
	For my COOP experiences I worked as a Software Developer at both Siemens and London Computer Systems. At both companies I learned how the content I learn in class is used in the real world. I also learned how to create complex apps and work with others on an already established code base and sometimes I even created a new code base and explained it to others. Other skills I learned are debugging, testing, project structure, project management, and implementing large changes. During this project I plan on using the knowledge I learned to deliver a robust project. COOP has taught me how to make software that is production ready and satisfies the needs of the public.
	This project is something I am very excited and motivated about. Firstly, I get to work with modern web technologies which is something I really wanted more experience in as it is used everywhere. I also aspire to be a business owner someday and creating something that will help small businesses fix staffing issues is something I can see leaving a big impact. I plan on designing the app first in Figma and getting lots of input from my team and then some small business owners, then I plan on starting with the code. With this I plan on getting approvals from small businesses and people that would like to work quick jobs. Success for this project will be determined by the satisfaction data I collect on our small-scale demos and from the knowledge my team and I gain. In terms of my contribution, I will be measuring it by how the app looks and feels since my focus will be frontend.
	This project will be something that brings together everything I have learned throughout my academic career from both my COOP and my classes. Creating this project won’t only be necessary from an assignment perspective about also as proof to myself that I have truly gained from my university experience. This project will be something I can show to employers and discuss interviews. I can even use this project as educational experience to create more complex future works. I am looking forward to creating a fully functional application with a team of individuals who are both passionate and talented. I hope to deliver a strong and robust project and learn along the way


Professional Biographies

JACOB
# Professional Biography

Fourth-year Computer Science major with expected graduation date of May 2025. Experience in software development via multiple co-op rotations, which focused on programming, problem-solving, and team collaboration.

## Co-op Work Experience

### Software Engineer Intern
**Company:** Siemens Digital Industries Software
**Duration:** 3 semesters (May 2023 - August 2023, January 2024 - August 2024)
**Technical Skills:**
  - Tcl/TK
  - C++
  - C
  - GitLab
 **Non-Technical Skills:**
  - Mentorship and team support
  - Agile methodologies
  - Daily scrum participation
- **Responsibilities:**
  - Refactored legacy TCL code base to C/C++ to increase performance and handle TCL specific data leaks.
  - Mentored an intern, creating onboarding work and guiding them through project tasks.

## Other skills

- JavaScript
- HTML
- Python

## Type of Project Sought

- Development of lossy compression algorithms optimized with AI.
- Using public resources (YouTube, Discord) for storing encrypted data.

Russell
# Professional Biography
## Education
**University of Cincinnati**  
**Bachelor of Science in Computer Science**  
**Graduation Date:** May 2025  
**GPA:** 3.52
## Co-op Work Experience
### Software Engineer Co-op | Siemens PLM Software, Cincinnati, OH
**Dates of Employment:** January 2024 – Present  
- Contributed to NX development using technologies such as C++, .NET, Python, Bash, Redhat Linux.
- Identified and solved bugs in software development processes.
- Developed and deployed containerized applications using Docker.
- Created unit and integration tests using C++ and Python Jupyter Notebook to generate test data.
- Designed and implemented GitLab CI/CD pipelines using YAML.
### Software Developer Co-op | Cincinnati Children’s Hospital, Cincinnati, OH
**May 2023 – August 2023**  
- Created and deployed a full stack application in .NET and TypeScript REACT, using Azure DevOps Pipelines.
- Collaborated with a UI/UX team for frontend design, enhancing user experience.
- Integrated the application with an existing LDAP system, and improved code reliability with 60% unit test coverage in .NET backend using NUnit.
### Software Engineer Co-op | Cincinnati Incorporated, Cincinnati, OH
**August 2022 – December 2022**  
- Enhanced a .NET Entity Framework Core Web API, improving code coverage to 87% with XUnit tests.
- Refactored authentication processes away from paid service
- Developed a cross-platform admin application using .NET MAUI and Blazor.
### Software Engineer Co-op | Cincinnati Incorporated, Cincinnati, OH
**January 2022 – May 2022**
- Developed a multilingual Entity Framework Core RESTful Web API with JWT bearer token-based user identification.
- Refactored a MSSQL database to meet company standards.
- Implemented a responsive, multilingual web app using JavaScript, jQuery, and Bootstrap, integrating with the API.
## Skills
**Languages & Libraries:** C++, Java, JavaFX, Python, LabView, Excel, VBA, C#, CSS, HTML, JavaScript, SQL, NoSQL, XAML  
**Platforms & Frameworks:** .NET, MAUI, Blazor, React, React Native, Node.js, Express.js, MSSQL, MongoDB, Swagger, Docker, Azure, AWS
## Project Sought
I am seeking a  project that aligns with my experience in software engineering, particularly in full-stack development or a game


Prabhjot
## Biography
Hello! My name is Prabhjot but I go by Prabh. Currently, for my
co-op I work at Siemens as a developer. I am looking to create
something fun but impactful for my senior design project.
## Contact me
Email: singh2pt@mail.uc.edu\
Phone: (513)-883-5552
## Work Experience
Developer, Siemens\
May 2023-Present\
Develop tools using modern web frameworks\
Tested complex web applications\
Collaborated with a large team and completed sprints\
t have a preference of what I would like to work on. Although why
experience mostly in web applications, I am open to learning and
trying almost everything.
Zaid 
# Professional Biography - Zaid Najar


**Contact Info:**  
Email: [najarzs@mail.uc.edu](mailto:najarzs@mail.uc.edu)


## Co-op Work Experience
I have worked as a Front End and Full Stack developer at Siemens, utilizing technologies such as AngularJS, C#, React, SQL, HTML, CSS, and Java. During my time there, I gained valuable experience in teamwork, pair programming, and agile development practices. Before my co-op roles, I worked as a server at multiple restaurants, which honed my customer service and multitasking skills.


## Project Sought
I am looking for a project that would be impressive on my resume and potentially scalable into a business venture. My goal is to work on something unique and substantial, with real-world applications that can benefit a large user base. I am particularly interested in projects that align with my passions and allow me to collaborate effectively in a team, practicing efficient scrum and agile development methodologies.


I have several ideas in mind but am still assessing their feasibility and impact. My ideal project would not only showcase my technical skills but also foster innovation and create tangible value for users.






Budget
We estimate that we will need $200. This may be an overestimation, but we have plans to launch our simulation on an app store. This will require some developer fees. 
Appendix


Week 1: September 8–14, 2024
Attendees: Zaid Najar, Russell Toney, Jacob Sayatovic, Prabhjot Singh, Asad Patel, Ibrahim Ahmed
Topics Discussed:
Project Kick-off:
Introduction to QuickShift project objectives and deliverables.
Discussion on the importance of dynamic staffing solutions for businesses.
Assignment Distribution:
Professional Biographies: Zaid
Project Tasks and Timeline: Russell
Self-Assessment Essays: Jacob
User Stories and Design Diagrams: Prabhjot
Budget and Appendix: Asad
ABET Concerns Essay: Ibrahim
Scheduling:
Established a regular meeting schedule every Monday at 5 PM.
Agreed on communication channels (Slack and email).
Actions Assigned:
All Members:
Begin drafting assigned sections.
Set up personal development environments.
Prabhjot:
Create the GitHub repository and share access with the team.
Effort Hours:
Each Team Member: 3.75 hours

Week 2: September 15–21, 2024
Attendees: All Team Members
Topics Discussed:
Section Drafts Review:
Zaid presented the initial draft of Professional Biographies.
Russell shared the Project Tasks and Timeline outline.
Jacob discussed the structure for Self-Assessment Essays.
Prabhjot showcased preliminary User Stories.
Asad presented an initial Budget estimate.
Ibrahim outlined key points for the ABET Concerns Essay.
Feedback Session:
Provided constructive feedback on each section.
Discussed consistency in formatting and writing style.
Actions Assigned:
All Members:
Refine drafts based on feedback.
Ensure alignment with project objectives.
Prabhjot:
Start developing Level 0 Design Diagrams.
Asad:
Research potential expenses for app deployment.
Effort Hours:
Each Team Member: 3.75 hours

Week 3: September 22–28, 2024
Attendees: All Team Members
Topics Discussed:
Design Diagrams:
Prabhjot presented Level 0 diagrams.
Discussed system overview and main components.
Self-Assessment Essays:
Jacob shared progress; initiated peer reviews.
ABET Concerns Essay:
Ibrahim presented the initial draft.
Budget Refinement:
Asad discussed potential costs for app store deployment and developer fees.
Actions Assigned:
Prabhjot:
Develop Level 1 Design Diagrams.
Jacob:
Incorporate feedback into essays.
Ibrahim:
Continue refining the ABET Concerns Essay.
Asad:
Finalize Budget estimates.
Effort Hours:
Each Team Member: 3.75 hours

Week 4: September 29 – October 5, 2024
Attendees: All Team Members
Topics Discussed:
Design Diagrams Review:
Prabhjot presented Level 1 diagrams.
Team provided feedback on system processes.
Project Timeline:
Russell updated the timeline based on current progress.
Professional Biographies:
Zaid refined biographies; team suggested minor edits.
Budget Approval:
Asad confirmed budget estimates; no additional expenses identified.
Actions Assigned:
Prabhjot:
Complete Level 2 Design Diagrams.
Russell:
Adjust timeline as needed.
Zaid:
Finalize Professional Biographies.
Asad:
Prepare the Budget section for the report.
Effort Hours:
Each Team Member: 3.75 hours

Week 5: October 6–12, 2024
Attendees: All Team Members
Topics Discussed:
Level 2 Design Diagrams:
Prabhjot presented detailed diagrams.
Discussed data flow and component interactions.
Self-Assessment Essays:
Jacob submitted the final draft; team reviewed.
ABET Concerns Essay:
Ibrahim presented the updated essay.
Project Tasks and Timeline:
Russell confirmed all tasks are on track.
Actions Assigned:
All Members:
Review finalized sections for consistency.
Prepare to integrate sections into the main report.
Ibrahim:
Address any remaining ABET criteria.
Effort Hours:
Each Team Member: 3.75 hours

Week 6: October 13–19, 2024
Attendees: All Team Members
Topics Discussed:
Report Integration:
Discussed the structure and flow of the Final Design Report.
Emphasized the importance of a cohesive narrative.
Appendix Preparation:
Decided to include meeting notes, code repositories, and references.
Effort Justification:
Ensured each team member's effort hours are documented accurately.
README.md Planning:
Prabhjot proposed the linking structure for the Table of Contents.
Actions Assigned:
All Members:
Upload finalized sections to the shared GitHub repository.
Asad:
Compile the Appendix with all necessary references and links.
Prabhjot:
Begin setting up the README.md file.
Effort Hours:
Each Team Member: 3.75 hours

Week 7: October 20–26, 2024
Attendees: All Team Members
Topics Discussed:
Report Compilation:
Combined all sections into a cohesive document.
Appendix Review:
Asad presented the compiled Appendix; team reviewed for completeness.
README.md Setup:
Prabhjot shared the initial README.md file with links.
Quality Assurance:
Discussed proofreading strategies and assigned sections for review.
Actions Assigned:
All Members:
Perform a thorough review of the integrated report.
Check for consistency in formatting and style.
Prabhjot:
Finalize the README.md with all necessary links.
Zaid:
Verify the Professional Biographies section for accuracy.
Effort Hours:
Each Team Member: 3.75 hours

Week 8: October 27 – November 2, 2024
Attendees: All Team Members
Topics Discussed:
Final Report Review:
Conducted a comprehensive review of the entire Final Design Report.
Proofreading:
Identified and corrected grammatical errors and formatting issues.
Effort Hours Verification:
Confirmed that each member has documented 30 hours to date.
Final Adjustments:
Made minor adjustments based on review feedback.
Actions Assigned:
Each Member:
Sign off on their respective sections.
Prabhjot:
Ensure all links in README.md are functional.
Asad:
Double-check the Budget and Appendix for completeness.
Effort Hours:
Each Team Member: 3.75 hours

Week 9: November 3–9, 2024
Attendees: All Team Members
Topics Discussed:
Final Approval:
Approved the Final Design Report for submission.
Repository Finalization:
Ensured all files are correctly uploaded to GitHub.
Backup Plans:
Created backups of all documents in multiple locations.
Presentation Planning:
Started outlining the PPT Slideshow structure.
Actions Assigned:
Russell:
Oversee the final submission process.
Prabhjot:
Begin developing the PPT Slideshow.
All Members:
Prepare for the presentation phase.
Effort Hours:
Each Team Member: 3.75 hours

Week 10: November 10–16, 2024
Attendees: All Team Members
Topics Discussed:
PPT Slideshow Development:
Prabhjot presented the initial slides, including ABET Concerns.
Presentation Roles:
Assigned sections of the presentation to each team member.
Rehearsal Plans:
Scheduled practice sessions for the final presentation.
Final Report Submission:
Confirmed the report has been submitted successfully.
Actions Assigned:
Each Member:
Refine their presentation slides.
Prepare talking points for their sections.
Ibrahim:
Finalize the ABET Concerns section in the slideshow.
Effort Hours:
Each Team Member: 3.75 hours

Week 11: November 17–23, 2024
Attendees: All Team Members
Topics Discussed:
Presentation Refinement:
Reviewed and polished PPT slides.
Rehearsal Feedback:
Conducted first rehearsal; collected feedback to improve delivery.
Final Adjustments:
Made necessary changes to both the report and presentation based on feedback.
Appendix Completion:
Ensured all meeting notes and references are included.
Actions Assigned:
All Members:
Practice their presentation segments individually.
Prabhjot:
Incorporate any additional ABET concerns into the slideshow.
Asad:
Ensure all Appendix links are active and correctly referenced.
Effort Hours:
Each Team Member: 3.75 hours

Week 12: November 24–30, 2024
Attendees: All Team Members
Topics Discussed:
Final Rehearsal:
Conducted a complete run-through of the presentation.
Feedback Implementation:
Addressed last-minute feedback to enhance presentation quality.
Budget Confirmation:
Rechecked the Budget section for accuracy before final submission.
Final Checklist:
Reviewed all components of the Final Design Report and repository for completeness.
Actions Assigned:
All Members:
Ensure they are comfortable with their presentation parts.
Perform a final review of the GitHub repository for any missing elements.
Prabhjot:
Finalize and submit the PPT Slideshow.
Effort Hours:
Each Team Member: 3.75 hours

Summary of Effort Hours
Total Weeks: 12
Effort per Week per Person: 3.75 hours
Total Effort per Team Member: 12 weeks × 3.75 hours/week = 45 hours
Team Member
Total Hours
Zaid Najar
45 hours
Russell Toney
45 hours
Jacob Sayatovic
45 hours
Prabhjot Singh
45 hours
Asad Patel
45 hours
Ibrahim Ahmed
45 hours




