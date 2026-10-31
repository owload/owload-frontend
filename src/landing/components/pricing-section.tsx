import { Check } from "lucide-react";
import { useRegister } from "@/auth-context-provider";
import { SectionTag } from "./placeholder";

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check size={20} strokeWidth={2.4} className="mt-[3px] flex-none text-(--lp-ink)" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

/** One plan, free, with 3 GB; more space comes from the person's own S3 storage. Paid plans are only announced. */
export function PricingSection() {
  const register = useRegister();
  return (
    <div id="pricing" className="lp-dark mt-24 bg-(--lp-ink) text-white">
      <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-12 px-[clamp(20px,4vw,40px)] py-24">
        <div className="flex max-w-[720px] flex-col gap-4">
          <SectionTag>Pricing</SectionTag>
          <h2 className="m-0 text-[clamp(30px,3.4vw,44px)] font-extrabold leading-[1.12] tracking-[-0.02em] text-balance">
            Start free with 3 GB. Need more space? Bring your own S3
          </h2>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
          <div className="flex flex-col gap-6 rounded-[20px] bg-(--lp-yellow) p-7 text-(--lp-ink)">
            <div className="flex flex-col gap-2">
              <div className="text-[18px] font-extrabold">Free</div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[44px] font-extrabold leading-none tracking-[-0.02em]">3 GB</span>
                <span className="text-[15px] text-(--lp-text-yellow)">of storage, free</span>
              </div>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-(--lp-text-yellow)">
              <Item>Files encrypted on your device before they are uploaded</Item>
              <Item>Public source code you can inspect</Item>
              <Item>AI Guard watching the server and its logs</Item>
            </ul>
            <button type="button" onClick={() => register()} className="lp-btn mt-auto flex min-h-[52px] cursor-pointer items-center justify-center rounded-[14px] bg-(--lp-ink) px-6 font-bold text-(--lp-yellow) hover:bg-(--lp-ink-2)">
              Start free
            </button>
          </div>
          <div className="flex flex-col gap-6 rounded-[20px] bg-white p-7 text-(--lp-ink)">
            <div className="flex flex-col gap-2">
              <div className="text-[18px] font-extrabold">More space</div>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-[30px] font-extrabold leading-[1.3] tracking-[-0.02em]">Your own S3</span>
              </div>
            </div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-(--lp-text-white)">
              <Item>Connect an S3 storage of your own and keep as much as it holds</Item>
              <Item>Your files are encrypted on your device first, so the storage only gets unreadable data</Item>
              <Item>You choose the provider and where your data lives</Item>
            </ul>
            <button type="button" onClick={() => register()} className="lp-btn mt-auto flex min-h-[52px] cursor-pointer items-center justify-center rounded-[14px] bg-(--lp-yellow) px-6 font-bold hover:bg-(--lp-yellow-edge)">
              Start free and connect S3
            </button>
          </div>
        </div>
        <p className="m-0 text-[16px] text-(--lp-on-dark)">Paid plans with more space are coming soon.</p>
      </section>
    </div>
  );
}
