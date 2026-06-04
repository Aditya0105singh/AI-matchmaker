import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="h-3.5 w-0.5 bg-indigo-500 rounded-full inline-block" />
        {title}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

function YNM({ label, value }: { label: string; value: "yes" | "no" | "maybe" }) {
  const v: Record<"yes"|"no"|"maybe", "success"|"danger"|"warning"> = { yes: "success", no: "danger", maybe: "warning" };
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <Badge variant={v[value]} className="capitalize">{value}</Badge>
    </div>
  );
}

export function ProfileFamily({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <Section title="Religion & Culture">
        <Field label="Religion"  value={profile.religion} />
        <Field label="Caste"     value={profile.caste} />
        {profile.subcaste && <Field label="Subcaste" value={profile.subcaste} />}
        <Field label="Mother Tongue" value={profile.motherTongue} />
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Manglik</p>
          <Badge variant={profile.manglikStatus === "no" ? "success" : profile.manglikStatus === "yes" ? "warning" : "default"}>
            {profile.manglikStatus}
          </Badge>
        </div>
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Horoscope</p>
          <Badge variant={profile.horoscopeAvailable ? "success" : "default"}>
            {profile.horoscopeAvailable ? "Available" : "Not available"}
          </Badge>
        </div>
      </Section>

      <Section title="Family">
        <Field label="Family Type"         value={profile.familyType.replace("_", " ")} />
        <Field label="Family Values"       value={profile.familyValues} />
        <Field label="Siblings"            value={profile.siblings} />
        <Field label="Father's Occupation" value={profile.fatherOccupation} />
        <Field label="Mother's Occupation" value={profile.motherOccupation} />
      </Section>

      <Section title="Relationship & Children">
        <YNM label="Want Kids"          value={profile.wantKids} />
        <Field label="Current Children" value={profile.children} />
        <Field label="Previous Marriage" value={profile.previousMarriage ? "Yes" : "No"} />
      </Section>

      <Section title="Lifestyle">
        <Field label="Diet"           value={profile.diet.replace("_", " ")} />
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Smoking</p>
          <Badge variant={profile.smoking === "no" ? "success" : profile.smoking === "yes" ? "danger" : "warning"}>{profile.smoking}</Badge>
        </div>
        <div>
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Drinking</p>
          <Badge variant={profile.drinking === "no" ? "success" : profile.drinking === "yes" ? "danger" : "warning"}>{profile.drinking}</Badge>
        </div>
        <Field label="Fitness"        value={profile.fitnessLevel.replace("_", " ")} />
        <Field label="Sleep"          value={profile.sleepSchedule.replace("_", " ")} />
        <Field label="Travel"         value={profile.travelFrequency} />
        <YNM label="Open to Pets"     value={profile.openToPets} />
        <YNM label="Open to Relocate" value={profile.openToRelocate} />
      </Section>
    </div>
  );
}
