export type Gender = "male" | "female";
export type MaritalStatus = "never_married" | "divorced" | "widowed" | "separated";
export type Diet = "vegetarian" | "non_vegetarian" | "vegan" | "jain" | "eggetarian";
export type SmokingStatus = "no" | "occasionally" | "yes";
export type DrinkingStatus = "no" | "occasionally" | "yes";
export type FamilyType = "nuclear" | "joint" | "extended";
export type FamilyValues = "traditional" | "moderate" | "liberal";
export type BodyType = "slim" | "average" | "athletic" | "heavy";
export type Complexion = "very_fair" | "fair" | "wheatish" | "dark";
export type YesNoMaybe = "yes" | "no" | "maybe";
export type MatchStatus = "pending" | "sent" | "accepted" | "rejected" | "in_conversation";
export type ClientStatus = "active" | "paused" | "matched" | "onboarding" | "churned";
export type NoteType = "meeting" | "call" | "feedback" | "system";
export type PersonalityType = "INTJ" | "INTP" | "ENTJ" | "ENTP" | "INFJ" | "INFP" | "ENFJ" | "ENFP" | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ" | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export interface Profile {
  id: string;
  // Personal
  firstName: string;
  lastName: string;
  gender: Gender;
  dateOfBirth: string; // ISO date
  age: number;
  heightCm: number;
  weightKg: number;
  bodyType: BodyType;
  complexion: Complexion;
  city: string;
  state: string;
  country: string;
  languages: string[];
  motherTongue: string;
  photoUrl?: string;

  // Contact
  email: string;
  phone: string;

  // Education
  undergraduateCollege: string;
  degree: string;
  mastersUniversity?: string;
  mastersDegree?: string;

  // Career
  currentCompany: string;
  designation: string;
  industry: string;
  experienceYears: number;
  annualIncomeINR: number; // in lakhs

  // Family
  religion: string;
  caste: string;
  subcaste?: string;
  familyType: FamilyType;
  familyValues: FamilyValues;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: number;
  manglikStatus: "yes" | "no" | "partial" | "unknown";
  horoscopeAvailable: boolean;

  // Marital
  maritalStatus: MaritalStatus;
  previousMarriage: boolean;
  children: number;
  wantKids: YesNoMaybe;

  // Lifestyle
  diet: Diet;
  smoking: SmokingStatus;
  drinking: DrinkingStatus;
  fitnessLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  sleepSchedule: "early_bird" | "night_owl" | "flexible";
  travelFrequency: "rarely" | "occasionally" | "frequently";

  // Personality
  personalityType?: PersonalityType;
  introvertExtrovertScore: number; // 1-10, 1=introverted 10=extroverted
  politicalViews?: "conservative" | "moderate" | "liberal" | "apolitical";

  // Preferences
  partnerAgeMin: number;
  partnerAgeMax: number;
  partnerHeightMinCm: number;
  partnerHeightMaxCm: number;
  partnerIncomeMinLPA: number;
  partnerEducationPref: string[];
  partnerReligionPref: string[];
  partnerCityPref: string[];
  openToRelocate: YesNoMaybe;
  openToPets: YesNoMaybe;

  // Matchmaker metadata
  clientStatus: ClientStatus;
  assignedMatchmakerId: string;
  profileCompleteness: number; // 0-100
  joinedAt: string;
  lastContactedAt?: string;
  matchCount: number;
  relationshipReadinessScore: number; // 0-100
  tags: string[];
  bio?: string;
}

export interface MatchScore {
  profileId: string;
  candidateId: string;
  totalScore: number;
  confidenceScore: number;
  breakdown: {
    kidsPreference: number;
    locationCompatibility: number;
    educationCompatibility: number;
    religionAlignment: number;
    lifestyleCompatibility: number;
    careerCompatibility: number;
    familyValues: number;
    incomeExpectations: number;
    personalityFit: number;
  };
  compatibilityTags: string[];
  status: MatchStatus;
  matchedAt: string;
  aiExplanation?: AIMatchExplanation;
}

export interface AIMatchExplanation {
  summary: string;
  strengths: string[];
  concerns: string[];
  conversationStarters: string[];
  generatedAt: string;
}

export interface Note {
  id: string;
  clientId: string;
  matchmakerId: string;
  type: NoteType;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Matchmaker {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  clientIds: string[];
}

export interface DashboardStats {
  totalClients: number;
  activeMatches: number;
  matchSuccessRate: number;
  feedbackPending: number;
  newThisWeek: number;
}

export interface SmartInsight {
  id: string;
  type: "warning" | "info" | "success";
  message: string;
  clientIds?: string[];
  action?: string;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface SendMatchPayload {
  fromClientId: string;
  toProfileId: string;
  matchScore: MatchScore;
  aiIntroduction?: string;
  sentAt: string;
}
