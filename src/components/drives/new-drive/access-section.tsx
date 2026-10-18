import { Link2, Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormSection } from "./form-parts";

export type NewDriveVisibility = "private" | "shared" | "public";

const OPTIONS: { value: NewDriveVisibility, title: string, text: string, Icon: typeof Lock }[] = [
    { value: "private", title: "Private", text: "Only you can open this drive.", Icon: Lock },
    { value: "shared", title: "Shared", text: "You and the people you add.", Icon: Users },
    { value: "public", title: "Public", text: "Anyone with the link, no sign-in needed.", Icon: Link2 },
];

/** What to tell the person under the chosen visibility; none for a private drive. */
const NEXT_STEP: Partial<Record<NewDriveVisibility, string>> = {
    shared: "You add the people in the next step: the drive's settings open after it is created. Tell them the drive's password yourself, outside Owload.",
    public: "The link is made when the drive is created, and the drive's settings open to show it. The link only lets people view the encrypted drive; they still need its password to read anything.",
};

/**
 * Who can open the drive. The visibility is set once the drive is created; people are not chosen here but in the drive's settings,
 * which open right after for a shared or a public drive.
 */
export function AccessSection({ visibility, onChange }: { visibility: NewDriveVisibility, onChange: (visibility: NewDriveVisibility) => void }) {
    const next = NEXT_STEP[visibility];
    return (
        <FormSection number={2} title="Access">
            <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className="pb-2 text-[13px] font-semibold">Visibility</legend>
                {OPTIONS.map(({ value, title, text, Icon }) => {
                    const selected = visibility === value;
                    return (
                        <label key={value} className={cn("flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-[7px]", selected ? "border-sunny-ink bg-sunny-yellow-soft" : "border-sunny-line bg-white hover:bg-sunny-field")}>
                            <input type="radio" name="visibility" value={value} checked={selected} onChange={() => onChange(value)} className="m-0 size-[18px] flex-none accent-sunny-ink" />
                            <span className="flex min-w-0 flex-1 flex-col">
                                <span className="text-sm font-semibold">{title}</span>
                                <span className={cn("text-xs", selected ? "text-sunny-text-on-yellow" : "text-sunny-muted")}>{text}</span>
                            </span>
                            <Icon aria-hidden="true" className={cn("size-[18px] flex-none", selected ? "text-sunny-ink" : "text-sunny-muted")} strokeWidth={2} />
                        </label>
                    );
                })}
            </fieldset>
            {next && <p role="note" className="m-0 rounded-xl bg-sunny-field px-3.5 py-3 text-[13px] leading-normal text-sunny-ink">{next}</p>}
        </FormSection>
    );
}
