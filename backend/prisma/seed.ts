import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning existing data...');

  // Clean DB
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding new rich dummy data...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Moderator',
      email: 'admin@alumni.edu',
      password: hashedPassword,
      role: 'ADMIN',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    },
  });

  // 2. Create Students
  const students = [
    { name: 'Yash Sharma', email: 'student1@alumni.edu', photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face' },
    { name: 'Julianna Rivers', email: 'student2@alumni.edu', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face' },
    { name: 'Kevin Zhang', email: 'student3@alumni.edu', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' },
    { name: 'Priya Patel', email: 'student4@alumni.edu', photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face' },
    { name: 'Alex Mercer', email: 'student5@alumni.edu', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face' }
  ];

  const studentUsers = [];
  for (const s of students) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: 'STUDENT',
        photo: s.photo,
      }
    });
    studentUsers.push(user);
  }

  // 3. Create Mentor Users and Profiles
  const mentorData = [
    {
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@alumni.edu',
      domain: 'Technology',
      company: 'TechGiant',
      designation: 'Senior Architect',
      experience: 12,
      bio: 'Helping mid-level engineers transition into architectural roles. Focus on system design, microservices, and cloud infrastructure.',
      skills: JSON.stringify(['Cloud Infrastructure', 'System Design', 'Microservices', 'AWS', 'Kubernetes']),
      languages: JSON.stringify(['English', 'Greek']),
      linkedin: 'https://linkedin.com/in/aris-thorne',
      photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Monday', 'Wednesday'],
        timeSlots: ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM', '4:00 PM - 5:00 PM']
      })
    },
    {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@alumni.edu',
      domain: 'Technology',
      company: 'FinStream',
      designation: 'Product Lead',
      experience: 8,
      bio: 'Passionate about scaling fintech products from 0 to 1. Mentoring students on product management, agile delivery, and UI design.',
      skills: JSON.stringify(['Product Strategy', 'FinTech', 'Agile Product Management', 'UI Design', 'Wireframing']),
      languages: JSON.stringify(['English']),
      linkedin: 'https://linkedin.com/in/sarah-jenkins',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Tuesday', 'Thursday'],
        timeSlots: ['1:00 PM - 2:00 PM', '3:00 PM - 4:00 PM']
      })
    },
    {
      name: 'Marcus Chen',
      email: 'marcus.chen@alumni.edu',
      domain: 'Technology',
      company: 'AI.Native',
      designation: 'Founder',
      experience: 10,
      bio: 'Serial entrepreneur with a background in academic research. Happy to discuss startups, raising capital, and generative AI systems.',
      skills: JSON.stringify(['Machine Learning', 'Startups', 'Generative AI', 'Venture Capital', 'Deep Learning']),
      languages: JSON.stringify(['English', 'Mandarin']),
      linkedin: 'https://linkedin.com/in/marcus-chen',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Friday'],
        timeSlots: ['9:00 AM - 10:00 AM', '11:00 AM - 12:00 PM', '4:00 PM - 5:00 PM']
      })
    },
    {
      name: 'Elena Rodriguez',
      email: 'elena.rodriguez@alumni.edu',
      domain: 'Technology',
      company: 'GlobalScale',
      designation: 'VP of Engineering',
      experience: 15,
      bio: 'Specializing in mentoring new engineering managers and helping developers grow their career. Expert in engineering culture.',
      skills: JSON.stringify(['Management', 'Engineering Culture', 'Team Growth', 'Agile', 'Scalability']),
      languages: JSON.stringify(['English', 'Spanish']),
      linkedin: 'https://linkedin.com/in/elena-rodriguez',
      photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Monday', 'Friday'],
        timeSlots: ['11:00 AM - 12:00 PM', '2:00 PM - 3:00 PM']
      })
    },
    {
      name: 'Julian Webb',
      email: 'julian.webb@alumni.edu',
      domain: 'Creative Arts',
      company: 'PixelPerfect',
      designation: 'Design Director',
      experience: 9,
      bio: 'Bridging the gap between design theory and business requirements. Specializing in UX Research, Visual Design, and branding.',
      skills: JSON.stringify(['UX Research', 'Visual Design', 'Branding', 'Figma', 'Typography']),
      languages: JSON.stringify(['English', 'French']),
      linkedin: 'https://linkedin.com/in/julian-webb',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Wednesday', 'Thursday'],
        timeSlots: ['10:00 AM - 11:30 AM', '4:00 PM - 5:30 PM']
      })
    },
    {
      name: 'Dr. Naomi Kim',
      email: 'naomi.kim@alumni.edu',
      domain: 'Healthcare',
      company: 'BioGen',
      designation: 'Principal Scientist',
      experience: 11,
      bio: 'Expert in transitioning from academic research to corporate biotechnology roles. Happy to guide bioengineering students.',
      skills: JSON.stringify(['Biotechnology', 'Career Transition', 'R&D Management', 'Genomics', 'Bioinformatics']),
      languages: JSON.stringify(['English', 'Korean']),
      linkedin: 'https://linkedin.com/in/naomi-kim',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Monday', 'Tuesday'],
        timeSlots: ['3:00 PM - 4:30 PM']
      })
    },
    {
      name: 'Julian Verrick',
      email: 'julian.verrick@alumni.edu',
      domain: 'Finance',
      company: 'FinTech Corp',
      designation: 'Director of Strategy',
      experience: 14,
      bio: 'Alumnus of Class of 2012. Specializing in Financial modeling, corporate strategy and product positioning.',
      skills: JSON.stringify(['Product Strategy', 'FinTech', 'Financial Modeling', 'Risk Assessment']),
      languages: JSON.stringify(['English']),
      linkedin: 'https://linkedin.com/in/julian-verrick',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Tuesday'],
        timeSlots: ['2:00 PM - 3:00 PM', '3:00 PM - 4:00 PM']
      })
    },
    {
      name: 'Aria Chen',
      email: 'aria.chen@alumni.edu',
      domain: 'Creative Arts',
      company: 'DesignLabs',
      designation: 'UX Architect',
      experience: 6,
      bio: 'Class of 2018. Experienced in interface systems design, mobile applications UX, and user empathy maps.',
      skills: JSON.stringify(['Interface Systems', 'UX Design', 'User Research', 'Mobile UX']),
      languages: JSON.stringify(['English', 'Mandarin']),
      linkedin: 'https://linkedin.com/in/aria-chen',
      photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Thursday'],
        timeSlots: ['5:00 PM - 6:00 PM']
      })
    },
    {
      name: 'Dr. Rohan Mehra',
      email: 'rohan.mehra@alumni.edu',
      domain: 'Healthcare',
      company: 'HealthVibe Solutions',
      designation: 'Medical Director',
      experience: 16,
      bio: 'Advising students on medical research careers and hospital administration strategies.',
      skills: JSON.stringify(['Medical Strategy', 'Clinical Trials', 'Healthcare IT']),
      languages: JSON.stringify(['English', 'Hindi']),
      linkedin: 'https://linkedin.com/in/rohan-mehra',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Monday'],
        timeSlots: ['4:00 PM - 5:00 PM']
      })
    },
    {
      name: 'Sophia Sterling',
      email: 'sophia.sterling@alumni.edu',
      domain: 'Finance',
      company: 'Apex Capital',
      designation: 'Investment Analyst',
      experience: 7,
      bio: 'Specializing in private equity models and venture capital portfolio metrics.',
      skills: JSON.stringify(['Portfolio Management', 'Private Equity', 'Asset Valuations']),
      languages: JSON.stringify(['English', 'German']),
      linkedin: 'https://linkedin.com/in/sophia-sterling',
      photo: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
      availability: JSON.stringify({
        days: ['Wednesday'],
        timeSlots: ['1:00 PM - 2:00 PM']
      })
    }
  ];

  const mentorsList = [];

  for (const m of mentorData) {
    const user = await prisma.user.create({
      data: {
        name: m.name,
        email: m.email,
        password: hashedPassword,
        role: 'MENTOR',
        photo: m.photo
      },
    });

    const mentor = await prisma.mentor.create({
      data: {
        userId: user.id,
        domain: m.domain,
        company: m.company,
        designation: m.designation,
        experience: m.experience,
        bio: m.bio,
        skills: m.skills,
        languages: m.languages,
        linkedin: m.linkedin,
        photo: m.photo,
        availability: m.availability,
      },
    });
    mentorsList.push(mentor);
  }

  // 4. Create Discussion Posts
  const post1 = await prisma.post.create({
    data: {
      userId: studentUsers[1].id, // Julianna Rivers
      title: 'How to balance a full-time internship with final year thesis?',
      content: "I've just been offered a dream internship at a top-tier consultancy, but my thesis supervisor is concerned about my availability. Has anyone successfully managed both in their final year? What boundaries did you set, and how did you structure your study schedule?",
      category: 'Career',
      tags: JSON.stringify(['Career Advice', 'Productivity', 'Internship']),
      likes: 24,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: mentorsList[1].userId, // Sarah Jenkins
      title: 'Announcement: Upcoming Virtual Networking Mixer for Engineering Grads',
      content: "We are excited to host our first quarterly mixer of 2026. This is a unique opportunity to connect with alumni at Google, NVIDIA, and Tesla. Registration opens next Monday. Don't forget to polish your LinkedIn profiles!",
      category: 'General',
      tags: JSON.stringify(['Events', 'Networking', 'Career']),
      likes: 45,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: studentUsers[2].id, // Kevin Zhang
      title: 'Is a Master\'s degree essential for Data Science roles in 2026?',
      content: "I'm seeing conflicting advice online. Some say portfolios and project experience matter more, others say HR filters out anyone without an MS. For alumni working in big tech—what's the reality during the hiring process?",
      category: 'Higher Studies',
      tags: JSON.stringify(['Data Science', 'Higher Studies', 'CareerPaths']),
      likes: 52,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      userId: studentUsers[3].id, // Priya Patel
      title: 'Common mistakes to avoid in Product Management resumes',
      content: "I am drafting my resume for APM applications. Are there specific keyword-stuffing patterns or metric descriptions that product leads find annoying? Would love any advice or template reviews.",
      category: 'Resume',
      tags: JSON.stringify(['Resume', 'ProductManagement', 'JobHunting']),
      likes: 18,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      userId: mentorsList[2].userId, // Marcus Chen
      title: 'Founder\'s Journal: Why you should build in public',
      content: "Early-stage founders often keep their products stealth. From experience, building in public generates organic waitlists and lets you receive continuous feedback. Don't hide your progress.",
      category: 'Startups',
      tags: JSON.stringify(['Startups', 'SaaS', 'Marketing']),
      likes: 31,
    },
  });

  // 5. Create Comments
  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: mentorsList[1].userId, // Sarah Jenkins replies
      content: 'I managed this during my final year! It is all about strict boundary settings. Set aside 2 fixed hours every evening for the thesis and treat it like an unskippable meeting. Let your manager know your academic constraints early on.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      userId: studentUsers[0].id, // Yash Sharma
      content: 'I am in the exact same boat right now. Good luck Julianna, following this thread closely!',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      userId: mentorsList[2].userId, // Marcus Chen replies
      content: 'At AI.Native, we care much more about your GitHub portfolio and your ability to build functional pipelines than a title. Focus on startups if you want to skip the MS requirement.',
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      userId: mentorsList[1].userId, // Sarah Jenkins replies
      content: 'Make sure your metrics show impact, not just activities. For example: "Designed feature X which improved retention by 14%" instead of "Worked on user stories for retention features."',
    },
  });

  // 6. Create Bookings
  // Booking 1: Pending
  await prisma.booking.create({
    data: {
      studentId: studentUsers[0].id,
      mentorId: mentorsList[0].id, // Dr. Aris Thorne
      date: '2026-07-15',
      time: '10:00 AM - 11:00 AM',
      duration: '60 mins',
      purpose: 'Resume review and mock interview for AWS System Architecture role.',
      status: 'PENDING',
      notes: 'I uploaded my latest project links in my profile. I have some specific questions on scaling RDS databases.',
    },
  });

  // Booking 2: Accepted/Upcoming
  await prisma.booking.create({
    data: {
      studentId: studentUsers[1].id,
      mentorId: mentorsList[1].id, // Sarah Jenkins
      date: '2026-07-12',
      time: '1:00 PM - 2:00 PM',
      duration: '60 mins',
      purpose: 'Discussing Product Management career roadmap.',
      status: 'ACCEPTED',
      notes: 'Excited to speak with you! I want to prepare for APM interviews.',
    },
  });

  // Booking 3: Completed
  await prisma.booking.create({
    data: {
      studentId: studentUsers[0].id,
      mentorId: mentorsList[2].id, // Marcus Chen
      date: '2026-06-25',
      time: '9:00 AM - 10:00 AM',
      duration: '60 mins',
      purpose: 'Startup pitch feedback.',
      status: 'COMPLETED',
      notes: 'Session went very well. Got valuable feedback on PMF.',
    },
  });

  // Booking 4: Rescheduled Pending
  await prisma.booking.create({
    data: {
      studentId: studentUsers[3].id,
      mentorId: mentorsList[6].id, // Julian Verrick
      date: '2026-07-14',
      time: '3:00 PM - 4:00 PM',
      duration: '30 mins',
      purpose: 'Venture Capital career path advice.',
      status: 'PENDING',
    },
  });

  // 7. Create Notifications
  await prisma.notification.create({
    data: {
      userId: mentorsList[0].userId, // Dr. Aris Thorne notification
      message: 'New mentorship session requested by Yash Sharma for 2026-07-15.',
      type: 'BOOKING_REQUESTED',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: studentUsers[1].id, // Julianna Rivers notification
      message: 'Your booking request with Sarah Jenkins on 2026-07-12 has been accepted.',
      type: 'BOOKING_ACCEPTED',
      isRead: false,
    },
  });

  console.log('Database seeded with rich dummy data successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
