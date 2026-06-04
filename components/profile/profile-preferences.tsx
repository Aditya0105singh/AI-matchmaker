import { Badge } from "@/components/ui/badge";
import { formatHeight, formatCurrency } from "@/lib/utils";
import type { Profile } from "@/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs font-medium text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right flex-1">{children}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <span className="h-3.5 w-0.5 bg-indigo-500 rounded-full inline-block" />
        <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="px-4">{children}</div>
    </div>
  );
}

export function ProfilePreferences({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      <Section title="Partner Preferences">
        <Row label="Age Range">{profile.partnerAgeMin}–{profile.partnerAgeMax} years</Row>
        <Row label="Height Range">
          {formatHeight(profile.partnerHeightMinCm)} – {formatHeight(profile.partnerHeightMaxCm)}
        </Row>
        <Row label="Min Income">
          {profile.partnerIncomeMinLPA > 0 ? `${formatCurrency(profile.partnerIncomeMinLPA)} LPA` : "No preference"}
        </Row>
        <Row label="Education Pref">
          <div className="flex flex-wrap gap-1 justify-end">
            {profile.partnerEducationPref.map((e) => <Badge key={e}>{e}</Badge>)}
          </div>
        </Row>
        <Row label="Religion Pref">
          <div className="flex flex-wrap gap-1 justify-end">
            {profile.partnerReligionPref.map((r) => <Badge key={r} variant="info">{r}</Badge>)}
          </div>
        </Row>
        <Row label="City Preference">
          <div className="flex flex-wrap gap-1 justify-end">
            {profile.partnerCityPref.map((c) => <Badge key={c}>{c}</Badge>)}
          </div>
        </Row>
        <Row label="Open to Relocate">
          <Badge variant={profile.openToRelocate === "yes" ? "success" : profile.openToRelocate === "no" ? "danger" : "warning"}>
            {profile.openToRelocate}
          </Badge>
        </Row>
        <Row label="Want Kids">
          <Badge variant={profile.wantKids === "yes" ? "success" : profile.wantKids === "no" ? "danger" : "warning"}>
            {profile.wantKids}
          </Badge>
        </Row>
        <Row label="Open to Pets">
          <Badge variant={profile.openToPets === "yes" ? "success" : profile.openToPets === "no" ? "danger" : "warning"}>
            {profile.openToPets}
          </Badge>
        </Row>
      </Section>

      <Section title="Their Own Profile">
        <Row label="Religion">{profile.religion}</Row>
        <Row label="Caste">{profile.caste}</Row>
        <Row label="Family Values">{profile.familyValues}</Row>
        <Row label="Diet">{profile.diet.replace("_", " ")}</Row>
        <Row label="Smoking">{profile.smoking}</Row>
        <Row label="Drinking">{profile.drinking}</Row>
        {profile.personalityType && (
          <Row label="MBTI Type"><Badge variant="purple">{profile.personalityType}</Badge></Row>
        )}
      </Section>
    </div>
  );
}
