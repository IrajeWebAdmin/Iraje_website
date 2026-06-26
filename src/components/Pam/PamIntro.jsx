import pam from "@/data/pam";

export default function PamIntro() {
  const { eyebrow, heading, body, listTitle, accounts, note } = pam.intro;

  return (
    <section className="text-ink bg-white py-20 md:py-28">
      <div className="container-global">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: typography only (no card) */}
          <div>
            <p className="epm-eyebrow epm-eyebrow-normal text-brand text-2xl font-medium">
              {eyebrow}
            </p>
            <h2 className="font-display mt-4 text-3xl leading-[1.12] font-semibold md:text-[2.6rem]">
              {heading}
            </h2>
            <div className="mt-6 space-y-4">
              {body.map((para) => (
                <p
                  key={para}
                  className="text-[#707070] text-base leading-relaxed md:text-xl"
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Right: square white card (619 x 424) with account pills */}
          <div className="lg:justify-self-end">
            <div className="border-mist w-full max-w-[619px] rounded-3xl border bg-white p-8 shadow-[0_10px_40px_rgba(12,30,58,0.07)] md:p-10 lg:h-[424px]">
              <h3 className="text-brand text-2xl font-medium tracking-[0.02em]">
                {listTitle}
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                {accounts.map((account) => (
                  <span
                    key={account}
                    className="text-[#707070] flex items-center gap-2.5 rounded-xl bg-[#F5F7FE] px-4 py-2.5 text-sm font-normal"
                  >
                    <span className="bg-brand h-2 w-2 shrink-0 rounded-full" />
                    {account}
                  </span>
                ))}
                <p className="text-slate-soft mt-6 w-full max-w-[619px] text-sm leading-relaxed">
                  {note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
