import React, { useEffect, useRef, useState, type ReactNode } from "react";

interface Props {
  isDark: boolean;
}

interface FaqItem {
  question: string;
  answer: ReactNode;
}

type FaqLanguage = "en" | "tl";

const HANDBOOK_URL = "https://oad.clsu.edu.ph/student-handbook";

const FAQ_ITEMS: Record<FaqLanguage, FaqItem[]> = {
  en: [
    {
      question: "What are the Academic Scholarship ranges?",
      answer: (
        <>
          <p>These are the reference ranges used in the calculator:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>1.00–1.50: University Scholar</li>
            <li>1.51–1.75: College Scholar</li>
            <li>1.76–2.00: Dean&apos;s Lister</li>
          </ul>
          <p className="mt-3">
            Official scholarship awards may have additional requirements, such
            as a minimum academic load or subject-grade rules.
          </p>
        </>
      ),
    },
    {
      question: "What are the Latin Honors ranges?",
      answer: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>1.00–1.20: Summa Cum Laude</li>
            <li>1.21–1.45: Magna Cum Laude</li>
            <li>1.46–1.75: Cum Laude</li>
          </ul>
          <p className="mt-3">
            These are calculator reference ranges. CLSU&apos;s official
            eligibility rules may include other requirements, so check the
            latest handbook.
          </p>
        </>
      ),
    },
    {
      question: "My GWA is 1.509999. Which scholarship range does it fall into?",
      answer: (
        <p>
          It falls under University Scholar. The calculator compares the exact
          GWA with the 1.51 cutoff; it does not round the value before deciding.
          So 1.509999 is still below 1.51, even if the displayed GWA rounds to
          1.5100.
        </p>
      ),
    },
    {
      question: "Are NSTP or PE included in the Latin Honors computation?",
      answer: (
        <p>
          PE is included in the computation, while NSTP is excluded. In Latin
          Honors mode, leave <strong>Include in Latin Honors GWA</strong>{" "}
          checked for PE and uncheck it for NSTP. Check the current CLSU and
          program rules for any updates.
        </p>
      ),
    },
    {
      question: "Is Latin Honors based on one semester or my cumulative GWA?",
      answer: (
        <p>
          Latin Honors are generally based on your cumulative GWA across your
          degree program, not on one semester alone. Add the courses from every
          applicable year and semester to estimate your overall result.
        </p>
      ),
    },
    {
      question: "Can a failing, dropped, or incomplete grade affect eligibility?",
      answer: (
        <p>
          Yes. Failing, dropped, or unresolved incomplete grades may affect
          eligibility. CLSU&apos;s rules include requirements beyond GWA, so
          check the latest handbook or ask the Office of Admissions or your
          college. An earlier published CLSU handbook sets the subject-grade
          floor at 3.00, so a 3.00 meets that specific requirement; a 5.00 is
          failing and may disqualify you. Other eligibility requirements still
          apply.
        </p>
      ),
    },
    {
      question: "Is there a minimum number of units I need to take each semester?",
      answer: (
        <p>
          CLSU&apos;s published handbook lists at least 15 units or the normal
          load prescribed by your curriculum. Special semesters, such as OJT or
          thesis, may have a different prescribed load. Confirm the current
          rule with your program or the Office of Admissions.
        </p>
      ),
    },
    {
      question:
        "Can an individual subject grade affect my Latin Honors eligibility?",
      answer: (
        <p>
          Yes. Meeting the cumulative GWA range may not be enough if other
          requirements apply to individual grades, repeated courses, or
          incomplete grades. These rules can change, so check the latest CLSU
          Student Handbook and your program&apos;s guidance.
        </p>
      ),
    },
  ],
  tl: [
    {
      question: "Ano ang range ng Academic Scholarship?",
      answer: (
        <>
          <p>Ito ang ranges na gamit ng calculator:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>1.00–1.50: University Scholar</li>
            <li>1.51–1.75: College Scholar</li>
            <li>1.76–2.00: Dean&apos;s Lister</li>
          </ul>
          <p className="mt-3">
            Puwedeng may iba pang rules ang official scholarship, tulad ng
            minimum units o requirements sa grades ng subjects.
          </p>
        </>
      ),
    },
    {
      question: "Ano ang range ng Latin Honors?",
      answer: (
        <>
          <ul className="list-disc space-y-1 pl-5">
            <li>1.00–1.20: Summa Cum Laude</li>
            <li>1.21–1.45: Magna Cum Laude</li>
            <li>1.46–1.75: Cum Laude</li>
          </ul>
          <p className="mt-3">
            Ito ang ranges na ginagamit ng calculator. Puwedeng may iba pang
            rules ang CLSU, kaya i-check ang latest handbook.
          </p>
        </>
      ),
    },
    {
      question: "Kung 1.509999 ang GWA ko, saan ako pasok?",
      answer: (
        <p>
          Pasok ito sa University Scholar. Tinitingnan ng calculator ang exact
          GWA at hindi ito niroround bago pumili ng scholarship. Kaya pasok pa
          rin sa 1.00–1.50 range ang 1.509999, kahit 1.5100 na ang lumabas na
          rounded GWA.
        </p>
      ),
    },
    {
      question: "Kasama ba ang NSTP o PE sa Latin Honors computation?",
      answer: (
        <p>
          Kasama ang PE sa computation, pero hindi kasama ang NSTP. Sa Latin
          Honors mode, iwanang naka-check ang{" "}
          <strong>Include in Latin Honors GWA</strong> para sa PE. I-uncheck ito
          para sa NSTP para hindi ito maisama. Silipin pa rin ang latest rules
          ng CLSU at ng program ninyo.
        </p>
      ),
    },
    {
      question:
        "Isang semester lang ba ang basehan ng Latin Honors?",
      answer: (
        <p>
          Hindi. Kadalasan, basehan ang cumulative GWA mo sa buong degree
          program, hindi lang isang semester. Idagdag ang subjects mula sa bawat
          year at semester para makita ang estimate ng overall result.
        </p>
      ),
    },
    {
      question:
        "Maaapektuhan ba ako ng bagsak, dropped, o incomplete na grade?",
      answer: (
        <p>
          Oo. Puwedeng makaapekto sa eligibility ang bagsak, dropped, o hindi pa
          naaayos na incomplete na grade. May iba pang rules ang CLSU bukod sa
          GWA, kaya i-check ang latest handbook o magtanong sa Office of
          Admissions o sa college ninyo. Sa naunang CLSU handbook, dapat 3.00 o
          mas maganda ang grade sa bawat subject. Pasok ang 3.00 sa rule na
          iyon; bagsak ang 5.00 at puwedeng makaapekto sa eligibility. May iba
          pang requirements na kailangang sundin.
        </p>
      ),
    },
    {
      question: "May minimum units ba na kailangan kada semester?",
      answer: (
        <p>
          Ayon sa published handbook ng CLSU, kailangan ng at least 15 units o
          yung normal load sa curriculum. Puwedeng iba ang load sa OJT o thesis
          semester. I-check sa program ninyo o sa Office of Admissions ang
          latest rule.
        </p>
      ),
    },
    {
      question:
        "May epekto ba ang grade sa bawat subject sa Latin Honors?",
      answer: (
        <p>
          Oo. Kahit pasok ang cumulative GWA mo, puwedeng may iba pang rules
          tungkol sa grades sa bawat subject, mga inulit na subject, o
          incomplete. Puwedeng magbago ang rules, kaya i-check ang latest CLSU
          Student Handbook at magtanong sa program ninyo.
        </p>
      ),
    },
  ],
};

const FloatingFaqButton: React.FC<Props> = ({ isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<FaqLanguage>("en");
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialogContent = useRef<HTMLElement>(null);

  const copy =
    language === "tl"
      ? {
        triggerLabel: "Buksan ang FAQs",
        triggerText: "Mga Tanong",
        title: "FAQs",
        description: "Mga sagot tungkol sa scholarship at Latin Honors.",
        languageLabel: "Wika ng FAQs",
        switchLanguage: (name: string) => `Palitan sa ${name}`,
        officialInfo: "Para sa official requirements, tingnan ang",
        contact: "o magtanong sa college ninyo o sa Office of Admissions.",
        estimate: "Estimate lang ang GCalc; CLSU pa rin ang magdedesisyon kung qualified ka.",
        closeLabel: "Isara ang FAQs",
      }
      : {
        triggerLabel: "Open frequently asked questions",
        triggerText: "FAQs",
        title: "Frequently Asked Questions",
        description: "Quick answers about scholarship ranges and Latin Honors.",
        languageLabel: "FAQ language",
        switchLanguage: (name: string) => `Switch FAQ language to ${name}`,
        officialInfo: "For official requirements, refer to the",
        contact: "or contact your college or the Office of Admissions.",
        estimate: "GCalc provides estimates only; the university determines official eligibility.",
        closeLabel: "Close frequently asked questions",
      };

  const panelStyle = isDark
    ? "bg-dark-primary text-dark-content"
    : "bg-light-primary text-light-content";
  const mutedStyle = isDark ? "text-dark-content/70" : "text-light-content/70";
  const borderStyle = isDark ? "border-dark-content/10" : "border-light-content/10";
  const itemStyle = isDark ? "bg-dark-background" : "bg-light-secondary";
  const buttonStyle = isDark
    ? "bg-dark-accent-1 text-light-content hover:bg-dark-accent-2"
    : "bg-light-accent-1 text-light-accent-text hover:bg-light-accent-2";

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialogContent.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), summary, a[href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => {
        const closedDetails = element.closest("details:not([open])");
        if (!closedDetails) return true;
        return element.tagName === "SUMMARY" && element.parentElement === closedDetails;
      });
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        aria-label={copy.triggerLabel}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-32 right-4 z-40 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-lg ring-2 transition hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonStyle} ${
          isDark ? "ring-dark-background" : "ring-light-background"
        }`}>
        <span
          aria-hidden="true"
          className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-sm leading-none">
          ?
        </span>
        {copy.triggerText}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="faq-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}>
          <section
            ref={dialogContent}
            lang={language}
            className={`relative my-auto flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl shadow-2xl ${panelStyle}`}>
            <header className={`sticky top-0 z-10 flex items-start justify-between gap-3 border-b p-5 ${panelStyle} ${borderStyle}`}>
              <div>
                <h2 id="faq-modal-title" className="text-lg font-bold sm:text-xl">
                  {copy.title}
                </h2>
                <p className={`mt-1 text-sm ${mutedStyle}`}>
                  {copy.description}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={`flex rounded-full border p-1 ${borderStyle}`}
                  role="group"
                  aria-label={copy.languageLabel}>
                  {(["en", "tl"] as const).map((option) => {
                    const selected = language === option;
                    const label = option === "en" ? "EN" : "TL";
                    const languageName = option === "en" ? "English" : "Tagalog";
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-label={copy.switchLanguage(languageName)}
                        aria-pressed={selected}
                        onClick={() => setLanguage(option)}
                        className={`rounded-full px-2.5 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${selected ? buttonStyle : ` ${mutedStyle} hover:opacity-80`}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>
                <button
                  ref={closeButton}
                  type="button"
                  aria-label={copy.closeLabel}
                  onClick={() => setIsOpen(false)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonStyle}`}>
                  ×
                </button>
              </div>
            </header>

            <div className="overflow-y-auto p-4 sm:p-5">
              <div className="flex flex-col gap-3">
                {FAQ_ITEMS[language].map((item) => (
                  <details
                    key={item.question}
                    className={`rounded-xl border ${borderStyle} ${itemStyle}`}>
                    <summary className="cursor-pointer px-4 py-3 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                      {item.question}
                    </summary>
                    <div className={`px-4 pb-4 text-sm leading-relaxed ${mutedStyle}`}>
                      {item.answer}
                    </div>
                  </details>
                ))}
              </div>
              <p className={`mt-5 text-sm ${mutedStyle}`}>
                {copy.officialInfo}{" "}
                <a
                  href={HANDBOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2">
                  CLSU Student Handbook
                </a>
                {" "}{copy.contact}
              </p>
              <p className={`mt-3 text-xs ${mutedStyle}`}>
                {copy.estimate}
              </p>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default FloatingFaqButton;
