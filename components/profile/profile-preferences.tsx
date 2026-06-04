import { Badge } from "@/components/ui/badge";
import { formatHeight, formatCurrency } from "@/lib/utils";
import type { Profile } from "@/types";

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-start justify-between py-3 border-b border-zinc-800/60 last:border-0">
    <span className="text-sm text-zinc-500">{label}</span>
    <span className="text-sm text-zinc-200 text-right max-w-xs">{value}</span>
  </div>
);

export function ProfilePreferences({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-800/30 rounded-xl border border-zinc-700/30 px-5">
        <h3 className="text-sm font-semibold text-zinc-300 py-3 border-b border-zinc-800/60">Partner Preferences</h3>
        <Row label="Age Range" value={`${profile.partnerAgeMin} – ${profile.partnerAgeMax} years`} />
        <Row label="Height Range" value={`${formatHeight(profile.partnerHeightMinCm)} – ${formatHeight(profile.partnerHeightMaxCm)}`} />
        <Row
          label="Min Income Preferred"
          value={profile.partnerIncomeMinLPA > 0 ? `${formatCurrency(profile.partnerIncomeMinLPA)} LPA` : "No preference"}
        />
        <Row
          label="Education Preference"
          value={
            <div className="flex flex-wrap gap-1 justify-end">
              {profile.partnerEducationPref.map((e) => <Badge key={e} variant="default">{e}</Badge>)}
            </div>
          }
        />
        <Row
          label="Religion Preference"
          value={
            <div className="flex flex-wrap gap-1 justify-end">
              {profile.partnerReligionPref.map((r) => <Badge key={r} variant="brand">{r}</Badge>)}
            </div>
          }
        />
        <Row
          label="City Preference"
          value={
            <div className="flex flex-wrap gap-1 justify-end">
              {profile.partnerCityPref.map((c) => <Badge key={c} variant="info">{c}</Badge>)}
            </div>
          }
        />
        <Row
          label="Open to Relocate"
          value={
            <Badge variant={profile.openToRelocate === "yes" ? "success" : profile.openToRelocate === "no" ? "danger" : "warning"}>
              {profile.openToRelocate}
            </Badge>
          }
        />
        <Row
          label="Open to Pets"
          value={
            <Badge variant={profile.openToPets === "yes" ? "success" : profile.openToPets === "no" ? "danger" : "warning"}>
              {profile.openToPets}
            </Badge>
          }
        />
        <Row
          label="Want Kids"
          value={
            <Badge variant={profile.wantKids === "yes" ? "success" : profile.wantKids === "no" ? "danger" : "warning"}>
              {profile.wantKids}
            </Badge>
          }
        />
      </div>

      <div className="bg-zinc-800/30 rounded-xl border border-zinc-700/30 px-5">
        <h3 className="text-sm font-semibold text-zinc-300 py-3 border-b border-zinc-800/60">Their Own Profile</h3>
        <Row label="Religion" value={profile.religion} />
        <Row label="Caste" value={profile.caste} />
        <Row label="Family Values" value={profile.familyValues} />
        <Row label="Diet" value={profile.diet.replace("_", " ")} />
        <Row label="Smoking" value={profile.smoking} />
        <Row label="Drinking" value={profile.drinking} />
        {profile.personalityType && <Row label="MBTI Type" value={<Badge variant="violet">{profile.personalityType}</Badge>} />}
      </div>
    </div>
  );
}
