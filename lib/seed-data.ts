import type { Profile, Matchmaker, Note } from "@/types";

const religions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Parsi"];
const castes = {
  Hindu: ["Brahmin", "Kshatriya", "Vaishya", "Kayastha", "Rajput", "Maratha", "Yadav", "Nair", "Iyer", "Iyengar"],
  Muslim: ["Syed", "Sheikh", "Pathan", "Mughal", "Ansari"],
  Christian: ["Catholic", "Protestant", "Orthodox"],
  Sikh: ["Jat", "Khatri", "Arora"],
  Jain: ["Digambar", "Shwetambar"],
  Parsi: ["Parsi"],
};
const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow", "Chandigarh", "Coimbatore", "Kochi", "Nagpur", "Surat"];
const states = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh", "Punjab", "Kerala", "West Bengal"];
const companies = ["TCS", "Infosys", "Wipro", "HCL", "Accenture", "Microsoft", "Google", "Amazon", "Flipkart", "Zomato", "Razorpay", "HDFC Bank", "ICICI Bank", "Deloitte", "PwC", "McKinsey", "Byju's", "PhonePe", "Ola", "Paytm"];
const designations = ["Software Engineer", "Senior Engineer", "Product Manager", "Data Scientist", "Business Analyst", "Consultant", "Manager", "Associate Director", "VP Engineering", "CTO", "Doctor", "CA", "Lawyer", "Professor", "Architect"];
const industries = ["Technology", "Finance", "Healthcare", "Education", "Consulting", "Media", "E-commerce", "Manufacturing", "Law", "Architecture"];
const colleges = ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIM Ahmedabad", "BITS Pilani", "NIT Trichy", "VIT Vellore", "Mumbai University", "Delhi University", "Pune University", "AIIMS Delhi", "NLU Delhi"];
const degrees = ["B.Tech", "B.E.", "B.Com", "B.Sc", "BCA", "MBA", "M.Tech", "M.Sc", "MD", "LLB", "B.Arch"];
const languages = ["Hindi", "English", "Marathi", "Tamil", "Telugu", "Kannada", "Malayalam", "Bengali", "Gujarati", "Punjabi"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomBool(trueProbability = 0.5): boolean {
  return Math.random() < trueProbability;
}

const maleFirstNames = ["Arjun", "Rahul", "Vikram", "Rohan", "Amit", "Karan", "Aditya", "Nikhil", "Siddharth", "Raj", "Prateek", "Vivek", "Saurabh", "Ankit", "Gaurav", "Deepak", "Manish", "Akash", "Ishaan", "Dev", "Kartik", "Neel", "Varun", "Harsh", "Yash", "Pranav", "Ayush", "Parth", "Rishabh", "Samar", "Kabir", "Dhruv", "Raghav", "Aarav", "Vihaan", "Arnav", "Tanmay", "Abhishek", "Mohit", "Sachin"];
const femaleFirstNames = ["Priya", "Neha", "Anjali", "Sneha", "Divya", "Pooja", "Riya", "Shruti", "Ananya", "Kavya", "Nisha", "Megha", "Swati", "Pallavi", "Ishita", "Aisha", "Simran", "Tanya", "Kritika", "Aditi", "Sakshi", "Nikita", "Shreya", "Preeti", "Alisha", "Rhea", "Zara", "Tanvi", "Veda", "Meera", "Aarohi", "Diya", "Siya", "Naina", "Ruhi", "Trisha", "Mansi", "Komal", "Isha", "Lakshmi", "Anika", "Bhavna", "Charvi", "Deepika", "Esha", "Fatima", "Gauri", "Hina", "Inaya", "Juhi"];
const lastNames = ["Sharma", "Verma", "Singh", "Gupta", "Mehta", "Patel", "Joshi", "Kumar", "Agarwal", "Mishra", "Nair", "Reddy", "Iyer", "Pillai", "Bose", "Chatterjee", "Malhotra", "Kapoor", "Khan", "Ansari", "Siddiqui", "Fernandes", "D'souza", "Thomas", "Menon", "Rao", "Desai", "Shah", "Trivedi", "Bhatt"];

let idCounter = 1;
function generateId(prefix: string): string {
  return `${prefix}_${String(idCounter++).padStart(4, "0")}`;
}

function generateProfile(gender: "male" | "female", clientStatus?: Profile["clientStatus"]): Profile {
  const religion = randomFrom(religions);
  const casteOptions = castes[religion as keyof typeof castes] || ["General"];
  const firstName = gender === "male" ? randomFrom(maleFirstNames) : randomFrom(femaleFirstNames);
  const lastName = randomFrom(lastNames);
  const age = gender === "male" ? randomInt(26, 38) : randomInt(24, 34);
  const year = new Date().getFullYear() - age;
  const dob = `${year}-${String(randomInt(1, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`;
  const city = randomFrom(cities);
  const cityIndex = cities.indexOf(city);
  const state = states[Math.min(cityIndex, states.length - 1)];
  const heightCm = gender === "male" ? randomInt(168, 188) : randomInt(152, 172);
  const income = randomInt(8, 80); // LPA
  const id = generateId(gender === "male" ? "M" : "F");

  const wantKids: Profile["wantKids"] = randomFrom(["yes", "yes", "yes", "no", "maybe"]);
  const openToRelocate: Profile["openToRelocate"] = randomFrom(["yes", "yes", "no", "maybe"]);
  const openToPets: Profile["openToPets"] = randomFrom(["yes", "no", "maybe"]);

  const college = randomFrom(colleges);
  const degree = randomFrom(degrees);
  const company = randomFrom(companies);
  const designation = randomFrom(designations);
  const langCount = randomInt(2, 4);
  const userLangs = ["English", "Hindi"];
  while (userLangs.length < langCount) {
    const l = randomFrom(languages);
    if (!userLangs.includes(l)) userLangs.push(l);
  }

  const completeness = randomInt(65, 100);
  const tags: string[] = [];
  if (income > 30) tags.push("High Earner");
  if (college.includes("IIT") || college.includes("IIM")) tags.push("Premier Institution");
  if (openToRelocate === "yes") tags.push("Open to Relocate");
  if (wantKids === "yes") tags.push("Wants Family");
  if (completeness > 90) tags.push("Complete Profile");

  const statuses: Profile["clientStatus"][] = ["active", "active", "active", "paused", "matched", "onboarding"];

  return {
    id,
    firstName,
    lastName,
    gender,
    dateOfBirth: dob,
    age,
    heightCm,
    weightKg: randomInt(50, 90),
    bodyType: randomFrom(["slim", "average", "athletic", "heavy"]),
    complexion: randomFrom(["very_fair", "fair", "wheatish", "dark"]),
    city,
    state,
    country: "India",
    languages: userLangs,
    motherTongue: userLangs[randomInt(0, userLangs.length - 1)],
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@gmail.com`,
    phone: `+91 ${randomInt(7, 9)}${String(randomInt(0, 999999999)).padStart(9, "0")}`,
    undergraduateCollege: college,
    degree,
    mastersUniversity: randomBool(0.4) ? randomFrom(colleges) : undefined,
    mastersDegree: randomBool(0.4) ? "MBA" : undefined,
    currentCompany: company,
    designation,
    industry: randomFrom(industries),
    experienceYears: Math.max(1, age - 22 - randomInt(0, 3)),
    annualIncomeINR: income,
    religion,
    caste: randomFrom(casteOptions),
    subcaste: randomBool(0.3) ? "Sub-" + randomFrom(casteOptions) : undefined,
    familyType: randomFrom(["nuclear", "nuclear", "joint", "extended"]),
    familyValues: randomFrom(["traditional", "moderate", "liberal"]),
    fatherOccupation: randomFrom(["Business", "Government Service", "Private Service", "Retired", "Doctor"]),
    motherOccupation: randomFrom(["Homemaker", "Teacher", "Doctor", "Business", "Government Service"]),
    siblings: randomInt(0, 3),
    manglikStatus: randomFrom(["yes", "no", "no", "no", "partial", "unknown"]),
    horoscopeAvailable: randomBool(0.6),
    maritalStatus: randomFrom(["never_married", "never_married", "never_married", "divorced"]),
    previousMarriage: randomBool(0.1),
    children: 0,
    wantKids,
    diet: randomFrom(["vegetarian", "vegetarian", "non_vegetarian", "eggetarian", "vegan"]),
    smoking: randomFrom(["no", "no", "no", "occasionally"]),
    drinking: randomFrom(["no", "no", "occasionally", "yes"]),
    fitnessLevel: randomFrom(["sedentary", "light", "moderate", "active"]),
    sleepSchedule: randomFrom(["early_bird", "night_owl", "flexible"]),
    travelFrequency: randomFrom(["rarely", "occasionally", "frequently"]),
    personalityType: randomFrom(["INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP", "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"]),
    introvertExtrovertScore: randomInt(2, 9),
    politicalViews: randomFrom(["conservative", "moderate", "liberal", "apolitical"]),
    partnerAgeMin: gender === "male" ? age - 5 : age - 1,
    partnerAgeMax: gender === "male" ? age + 2 : age + 8,
    partnerHeightMinCm: gender === "male" ? 150 : 168,
    partnerHeightMaxCm: gender === "male" ? 175 : 190,
    partnerIncomeMinLPA: gender === "female" ? randomInt(10, 25) : 0,
    partnerEducationPref: randomBool(0.5) ? ["B.Tech", "MBA"] : ["Any"],
    partnerReligionPref: randomBool(0.6) ? [religion] : ["Any"],
    partnerCityPref: randomBool(0.5) ? [city, randomFrom(cities)] : ["Any"],
    openToRelocate,
    openToPets,
    clientStatus: clientStatus || randomFrom(statuses),
    assignedMatchmakerId: "MM_001",
    profileCompleteness: completeness,
    joinedAt: new Date(Date.now() - randomInt(7, 365) * 86400000).toISOString(),
    lastContactedAt: randomBool(0.7) ? new Date(Date.now() - randomInt(1, 30) * 86400000).toISOString() : undefined,
    matchCount: randomInt(0, 15),
    relationshipReadinessScore: randomInt(50, 95),
    tags,
    bio: `${firstName} is a ${designation} at ${company} based in ${city}. ${gender === "male" ? "He" : "She"} values family and is looking for a life partner who shares similar values.`,
  };
}

// --- Seed the data ---
// 70 male clients managed by the matchmaker
export const maleClients: Profile[] = Array.from({ length: 70 }, (_, i) => {
  let status: Profile["clientStatus"];
  if (i < 42)      status = "active";
  else if (i < 55) status = "paused";
  else if (i < 62) status = "matched";
  else if (i < 68) status = "onboarding";
  else             status = "churned";
  return generateProfile("male", status);
});

// 30 female clients managed by the matchmaker
export const femaleClients: Profile[] = Array.from({ length: 30 }, (_, i) => {
  let status: Profile["clientStatus"];
  if (i < 18)      status = "active";
  else if (i < 23) status = "paused";
  else if (i < 27) status = "matched";
  else if (i < 29) status = "onboarding";
  else             status = "churned";
  return generateProfile("female", status);
});

export const allClients: Profile[] = [...maleClients, ...femaleClients];

// 100 female candidates (matching pool for male clients)
export const femalePool: Profile[] = Array.from({ length: 100 }, () =>
  generateProfile("female")
);

// 100 male candidates (matching pool for female clients)
export const malePool: Profile[] = Array.from({ length: 100 }, () =>
  generateProfile("male")
);

export const matchmaker: Matchmaker = {
  id: "MM_001",
  name: "Riya Kapoor",
  email: "riya@thedatecrew.com",
  clientIds: allClients.map((c) => c.id),
};

export const sampleNotes: Note[] = allClients.slice(0, 5).flatMap((client) =>
  Array.from({ length: randomInt(2, 4) }, (_, i) => ({
    id: generateId("NOTE"),
    clientId: client.id,
    matchmakerId: "MM_001",
    type: (["meeting", "call", "feedback"] as const)[i % 3],
    content: [
      "Initial profile review completed. Client seems serious and well-prepared.",
      "Had a 30-min call. Discussed preferences around relocation — client open to moving to Bangalore or Pune.",
      "Shared 3 match profiles. Client shortlisted 2 for further discussion.",
      "Follow-up required — client hasn't responded to last 2 matches.",
    ][i % 4],
    createdAt: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - (i + 1) * 7 * 86400000).toISOString(),
  }))
);
