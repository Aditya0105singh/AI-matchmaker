import { CircularProgress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatHeight, formatCurrency, formatDate } from "@/lib/utils";
import type { Profile } from "@/types";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 border-b border-gray-100 pb-1.5">
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

export function ProfileOverview({ profile }: { profile: Profile }) {
  const missing: string[] = [];
  if (!profile.bio) missing.push("Bio");
  if (!profile.mastersUniversity) missing.push("Masters degree");
  if (profile.profileCompleteness < 85) missing.push("Additional details");

  return (
    <div className="space-y-6">
      {/* Completeness bar */}
      <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <CircularProgress value={profile.profileCompleteness} size={44} strokeWidth={4} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{profile.profileCompleteness}% profile complete</p>
          {missing.length > 0 ? (
            <p className="text-xs text-gray-500 mt-0.5">Missing: {missing.join(", ")}</p>
          ) : (
            <p className="text-xs text-green-600 mt-0.5">All fields completed ✓</p>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          {profile.tags.map((t) => (
            <Badge key={t} variant="default" className="text-[10px]">{t}</Badge>
          ))}
        </div>
      </div>

      {profile.bio && (
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">About</p>
          <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}

      <Section title="Personal">
        <Field label="Full Name"     value={`${profile.firstName} ${profile.lastName}`} />
        <Field label="Gender"        value={profile.gender === "male" ? "Male" : "Female"} />
        <Field label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
        <Field label="Age"           value={`${profile.age} years`} />
        <Field label="Height"        value={formatHeight(profile.heightCm)} />
        <Field label="Weight"        value={`${profile.weightKg} kg`} />
        <Field label="City"          value={profile.city} />
        <Field label="State"         value={profile.state} />
        <Field label="Languages"     value={profile.languages.join(", ")} />
        <Field label="Marital Status" value={profile.maritalStatus.replace("_", " ")} />
      </Section>

      <Section title="Contact">
        <Field label="Email" value={profile.email} />
        <Field label="Phone" value={profile.phone} />
      </Section>

      <Section title="Education & Career">
        <Field label="Undergraduate"  value={profile.undergraduateCollege} />
        <Field label="Degree"         value={profile.degree} />
        {profile.mastersUniversity && <Field label="Masters"  value={profile.mastersUniversity} />}
        {profile.mastersDegree     && <Field label="Masters Degree" value={profile.mastersDegree} />}
        <Field label="Company"        value={profile.currentCompany} />
        <Field label="Designation"    value={profile.designation} />
        <Field label="Industry"       value={profile.industry} />
        <Field label="Experience"     value={`${profile.experienceYears} years`} />
        <Field label="Annual Income"  value={`${formatCurrency(profile.annualIncomeINR)} LPA`} />
      </Section>

      <Section title="Personality">
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">MBTI Type</p>
          {profile.personalityType
            ? <Badge variant="default">{profile.personalityType}</Badge>
            : <span className="text-sm text-gray-400">—</span>}
        </div>
        <Field label="Introvert/Extrovert"
          value={profile.introvertExtrovertScore <= 4 ? "Introverted"
            : profile.introvertExtrovertScore >= 7 ? "Extroverted"
            : "Ambivert"} />
        {profile.politicalViews && <Field label="Political Views" value={profile.politicalViews} />}
      </Section>
    </div>
  );
}
