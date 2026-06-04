import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types";

const Field = ({ label, value }: { label: string; value?: string | number | null }) =>
  value !== undefined && value !== null && value !== "" ? (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
      <p className="text-sm text-zinc-200">{value}</p>
    </div>
  ) : null;

const YesNoMaybeBadge = ({ value }: { value: "yes" | "no" | "maybe" }) => {
  const map = { yes: "success", no: "danger", maybe: "warning" } as const;
  return <Badge variant={map[value]}>{value.charAt(0).toUpperCase() + value.slice(1)}</Badge>;
};

export function ProfileFamily({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Religion & Culture</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Religion" value={profile.religion} />
          <Field label="Caste" value={profile.caste} />
          {profile.subcaste && <Field label="Subcaste" value={profile.subcaste} />}
          <Field label="Mother Tongue" value={profile.motherTongue} />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Manglik</p>
            <Badge variant={profile.manglikStatus === "no" ? "success" : profile.manglikStatus === "yes" ? "warning" : "default"}>
              {profile.manglikStatus}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-0.5">Horoscope</p>
            <Badge variant={profile.horoscopeAvailable ? "success" : "default"}>
              {profile.horoscopeAvailable ? "Available" : "Not Available"}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Family Background</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Family Type" value={profile.familyType.replace("_", " ")} />
          <Field label="Family Values" value={profile.familyValues} />
          <Field label="Siblings" value={profile.siblings} />
          <Field label="Father's Occupation" value={profile.fatherOccupation} />
          <Field label="Mother's Occupation" value={profile.motherOccupation} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Children & Future</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Want Kids</p>
            <YesNoMaybeBadge value={profile.wantKids} />
          </div>
          <Field label="Current Children" value={profile.children} />
          <Field label="Previous Marriage" value={profile.previousMarriage ? "Yes" : "No"} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-zinc-300 mb-3">Lifestyle</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Diet" value={profile.diet.replace("_", " ")} />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Smoking</p>
            <Badge variant={profile.smoking === "no" ? "success" : profile.smoking === "yes" ? "danger" : "warning"}>
              {profile.smoking}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Drinking</p>
            <Badge variant={profile.drinking === "no" ? "success" : profile.drinking === "yes" ? "danger" : "warning"}>
              {profile.drinking}
            </Badge>
          </div>
          <Field label="Fitness Level" value={profile.fitnessLevel.replace("_", " ")} />
          <Field label="Sleep Schedule" value={profile.sleepSchedule.replace("_", " ")} />
          <Field label="Travel Frequency" value={profile.travelFrequency} />
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Open to Pets</p>
            <YesNoMaybeBadge value={profile.openToPets} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Open to Relocate</p>
            <YesNoMaybeBadge value={profile.openToRelocate} />
          </div>
          {profile.politicalViews && <Field label="Political Views" value={profile.politicalViews} />}
        </div>
      </div>
    </div>
  );
}
