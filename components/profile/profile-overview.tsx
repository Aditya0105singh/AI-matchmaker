"use client";
import { CircularProgress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatHeight, formatCurrency, formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
  value !== undefined && value !== null && value !== "" ? (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  ) : null;

export function ProfileOverview({ profile }: { profile: Profile }) {
  const missingFields = [];
  if (!profile.bio) missingFields.push("Bio");
  if (!profile.mastersUniversity) missingFields.push("Masters degree");
  if (profile.profileCompleteness < 80) missingFields.push("Additional details");

  return (
    <div className="space-y-6">
      {/* Completeness */}
      <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50 flex items-center gap-4">
        <CircularProgress value={profile.profileCompleteness} size={56} strokeWidth={5} />
        <div>
          <p className="text-sm font-semibold text-zinc-200">{profile.profileCompleteness}% Complete</p>
          {missingFields.length > 0 ? (
            <p className="text-xs text-zinc-500 mt-0.5">
              Missing: {missingFields.join(", ")}
            </p>
          ) : (
            <p className="text-xs text-emerald-400 mt-0.5">Profile fully completed ✓</p>
          )}
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          {profile.tags.map((tag) => (
            <Badge key={tag} variant="brand" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">About</p>
          <p className="text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Readiness */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
          <p className="text-xs text-zinc-500 mb-1">Relationship Readiness</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-fuchsia-600 to-violet-500 rounded-full"
                style={{ width: `${profile.relationshipReadinessScore}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-fuchsia-300">{profile.relationshipReadinessScore}</span>
          </div>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30">
          <p className="text-xs text-zinc-500 mb-1">Personality</p>
          <div className="flex items-center gap-2">
            {profile.personalityType && (
              <Badge variant="violet">{profile.personalityType}</Badge>
            )}
            <span className="text-xs text-zinc-400">
              {profile.introvertExtrovertScore <= 4 ? "Introverted" : profile.introvertExtrovertScore >= 7 ? "Extroverted" : "Ambivert"}
            </span>
          </div>
        </div>
      </div>

      {/* Core details grid */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Personal Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Full Name" value={`${profile.firstName} ${profile.lastName}`} />
          <Field label="Gender" value={profile.gender === "male" ? "Male" : "Female"} />
          <Field label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
          <Field label="Age" value={`${profile.age} years`} />
          <Field label="Height" value={formatHeight(profile.heightCm)} />
          <Field label="Weight" value={`${profile.weightKg} kg`} />
          <Field label="Body Type" value={profile.bodyType.replace("_", " ")} />
          <Field label="Complexion" value={profile.complexion.replace("_", " ")} />
          <Field label="City" value={profile.city} />
          <Field label="State" value={profile.state} />
          <Field label="Country" value={profile.country} />
          <Field label="Mother Tongue" value={profile.motherTongue} />
          <Field label="Languages" value={profile.languages.join(", ")} />
          <Field label="Marital Status" value={profile.maritalStatus.replace("_", " ")} />
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Contact Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Email" value={profile.email} />
          <Field label="Phone" value={profile.phone} />
        </div>
      </div>

      {/* Career */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Education & Career</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Undergraduate College" value={profile.undergraduateCollege} />
          <Field label="Degree" value={profile.degree} />
          {profile.mastersUniversity && <Field label="Masters University" value={profile.mastersUniversity} />}
          {profile.mastersDegree && <Field label="Masters Degree" value={profile.mastersDegree} />}
          <Field label="Current Company" value={profile.currentCompany} />
          <Field label="Designation" value={profile.designation} />
          <Field label="Industry" value={profile.industry} />
          <Field label="Experience" value={`${profile.experienceYears} years`} />
          <Field label="Annual Income" value={`${formatCurrency(profile.annualIncomeINR)} LPA`} />
        </div>
      </div>
    </div>
  );
}
