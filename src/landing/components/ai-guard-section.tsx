import { Eye, ScrollText, Server } from "lucide-react";
import { SectionTag } from "./placeholder";

const WATCHES = [
  { icon: Server, title: "The server", text: "Keeps an eye on how our server behaves." },
  { icon: ScrollText, title: "The logs", text: "Reads what the server writes down, as it is written." },
  { icon: Eye, title: "Anything suspicious", text: "Checks that nothing looks wrong, and says so if it does." },
];

/** The agent that watches the server and its logs, after the release checks of the security section. */
export function AiGuardSection() {
  return (
    <section
      id="ai-guard"
      className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center gap-x-16 gap-y-10 px-[clamp(20px,4vw,40px)] pt-24"
    >
      <div className="min-w-0 flex-[1_1_440px] max-[900px]:order-2">
        <div className="flex flex-col gap-5 rounded-3xl bg-(--lp-yellow) p-[clamp(22px,3vw,32px)] text-(--lp-ink)">
          <div className="text-[14px] font-extrabold tracking-[0.02em]">AI Guard</div>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {WATCHES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span aria-hidden="true" className="flex size-11 flex-none items-center justify-center rounded-xl bg-(--lp-ink) text-(--lp-yellow)">
                  <Icon size={22} strokeWidth={2} />
                </span>
                <div className="flex min-w-0 flex-col gap-1">
                  <h3 className="m-0 text-[20px] font-extrabold leading-[1.25]">{title}</h3>
                  <p className="m-0 text-(--lp-text-yellow)">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-5 max-[900px]:order-1">
        <SectionTag>AI Guard</SectionTag>
        <h2 className="m-0 text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-balance">
          An AI agent watches the server and its logs
        </h2>
        <p className="m-0 max-w-[460px] text-(--lp-text-white)">
          AI Guard keeps checking that nothing suspicious is going on. It works with what the server has, and the server has none of your files, their names or your password.
        </p>
      </div>
    </section>
  );
}
