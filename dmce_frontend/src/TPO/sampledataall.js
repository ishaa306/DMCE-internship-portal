// ---------- AUTO STATIC DATA FOR DEMO ----------

const departments = ["IT", "CS", "AI"];

const names = [
  "Aarav",
  "Vihaan",
  "Aditya",
  "Arjun",
  "Sai",
  "Ishaan",
  "Riya",
  "Ananya",
  "Sneha",
  "Pooja",
  "Megha",
  "Ishita",
  "Rohit",
  "Kunal",
  "Vikas",
  "Siddharth",
  "Tanvi",
  "Neha",
  "Aman",
  "Ritika",
  "Harsh",
  "Kavya",
  "Dev",
  "Nisha",
];

const companies = [
  { name: "TCS", role: "Software Engineer", salary: 6 },
  { name: "Infosys", role: "System Engineer", salary: 5.5 },
  { name: "Wipro", role: "Associate Engineer", salary: 5 },
  { name: "IBM", role: "Developer Associate", salary: 8 },
  { name: "Accenture", role: "Software Analyst", salary: 6.8 },
  { name: "Capgemini", role: "Software Engineer", salary: 7 },
  { name: "Google", role: "Software Developer", salary: 45 },
  { name: "Microsoft", role: "Software Engineer", salary: 38 },
  { name: "Amazon", role: "SDE-1", salary: 30 },
];

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateStudents() {
  const students = [];

  for (let year = 2020; year <= 2025; year++) {
    for (let i = 1; i <= 50; i++) {
      const dept = departments[random(0, 2)];
      const name = names[random(0, names.length - 1)];
      const gender = random(0, 1) === 0 ? "Male" : "Female";
      const isPlaced = Math.random() < 0.88;

      let companyName = "";
      let roleOffered = "";
      let salary = 0;
      let placementType = "N/A";
      let placedStatus = "Unregistered";

      if (isPlaced) {
        const selectedCompany = companies[random(0, companies.length - 1)];
        companyName = selectedCompany.name;
        roleOffered = selectedCompany.role;
        salary = selectedCompany.salary;
        placementType = random(0, 1) === 0 ? "On Campus" : "Off Campus";
        placedStatus = "Selected";
      } else {
        const statusOptions = ["Rejected", "Applied", "Unregistered"];
        placedStatus = statusOptions[random(0, 2)];
      }

      students.push({
        stdID: `${year}FH${dept}${String(i).padStart(3, "0")}`,
        department: dept,
        name: name + " Kumar",
        passoutYear: year.toString(),
        contact: "9" + random(100000000, 999999999),
        mailID: `${name.toLowerCase()}${year}${i}@example.com`,
        gender,
        grade10: random(70, 95),
        grade12: random(70, 95),
        cgpa: Number((Math.random() * (9.8 - 6.0) + 6.0).toFixed(1)),
        placedStatus,
        placementType,
        companyName,
        roleOffered,
        salary,
        companiesPlaced: isPlaced ? 1 : 0,
      });
    }
  }

  return students;
}

const sampleDataall = {
  students: generateStudents(),

  // ---------- COMPANY DATA (UNCHANGED) ----------
  companyData: [
    {
      name: "TCS",
      field: "IT Services",
      mail: "hr@tcs.com",
      role: "Software Engineer",
      eligibleStudents: 200,
      placedStudents: 55,
      location: "Mumbai",
      salary: "6 LPA",
      driveDate: "2025-03-15",
      rounds: 3,
      eligibility: { tenth: 60, twelfth: 60, cgpa: 6.0, ktsAllowed: 0 },
    },
    {
      name: "Infosys",
      field: "IT Services",
      mail: "jobs@infosys.com",
      role: "System Engineer",
      eligibleStudents: 180,
      placedStudents: 48,
      location: "Bangalore",
      salary: "5.5 LPA",
      driveDate: "2025-02-20",
      rounds: 2,
      eligibility: { tenth: 65, twelfth: 65, cgpa: 6.5, ktsAllowed: 1 },
    },
    {
      name: "Google",
      field: "Software",
      mail: "jobs@google.com",
      role: "Software Developer",
      eligibleStudents: 60,
      placedStudents: 12,
      location: "Hyderabad",
      salary: "45 LPA",
      driveDate: "2025-01-25",
      rounds: 5,
      eligibility: { tenth: 80, twelfth: 85, cgpa: 8.5, ktsAllowed: 0 },
    },
    // you can paste rest of your original companies here
  ],

  // ---------- YEARWISE DATA (UNCHANGED) ----------
  yearwiseData: [
    {
      year: 2020,
      studentsPlaced: 120,
      companiesVisited: 25,
      avgSalary: "5 LPA",
      highestSalary: "15 LPA",
      lowestSalary: "3 LPA",
      placedPercentage: 75,
      totalRegistered: 160,
    },
    {
      year: 2021,
      studentsPlaced: 140,
      companiesVisited: 28,
      avgSalary: "6 LPA",
      highestSalary: "18 LPA",
      lowestSalary: "3.5 LPA",
      placedPercentage: 80,
      totalRegistered: 175,
    },
    {
      year: 2022,
      studentsPlaced: 155,
      companiesVisited: 30,
      avgSalary: "7 LPA",
      highestSalary: "22 LPA",
      lowestSalary: "4 LPA",
      placedPercentage: 82,
      totalRegistered: 190,
    },
    {
      year: 2023,
      studentsPlaced: 165,
      companiesVisited: 31,
      avgSalary: "8 LPA",
      highestSalary: "28 LPA",
      lowestSalary: "4.5 LPA",
      placedPercentage: 84,
      totalRegistered: 196,
    },
    {
      year: 2024,
      studentsPlaced: 180,
      companiesVisited: 35,
      avgSalary: "9 LPA",
      highestSalary: "45 LPA",
      lowestSalary: "5 LPA",
      placedPercentage: 88,
      totalRegistered: 205,
    },
    {
      year: 2025,
      studentsPlaced: 190,
      companiesVisited: 38,
      avgSalary: "9.6 LPA",
      highestSalary: "50 LPA",
      lowestSalary: "5.5 LPA",
      placedPercentage: 90,
      totalRegistered: 210,
    },
  ],
};

export default sampleDataall;
