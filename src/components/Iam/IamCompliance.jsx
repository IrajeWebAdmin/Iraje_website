import IamSection from "./IamSection";
import iam from "@/data/iam";

// "Evidence, not assurances" — the framework mapping table. Brand-blue header,
// hairline-separated rows, framework name in brand semibold and the two
// explanatory columns in Shuttle Gray, exactly as the Figma table sets them.
export default function IamCompliance() {
  const { eyebrow, heading, body, columns, rows } = iam.compliance;

  return (
    <IamSection
      id="compliance"
      eyebrow={eyebrow}
      heading={heading}
      intro={body}
      center
      headClassName="max-w-[1275px]"
      headingClassName="epm-heading mx-auto max-w-[877px]"
      eyebrowClassName="epm-eyebrow epm-eyebrow-normal"
      introClassName="epm-body"
      paddingClassName="py-15"
    >
      {/* Three columns never fit a phone, so the table scrolls inside its own
          wrapper rather than forcing the page to scroll sideways. */}
      <div className="mx-auto mt-14 max-w-[1110px] overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th
                  key={column}
                  className={`bg-brand px-[22px] py-[14.5px] text-[10.5px] font-medium tracking-[1.365px] text-white uppercase ${
                    i === 0 ? "w-[23.85%]" : "w-[38.1%]"
                  }`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.framework}>
                <td className="border-t border-botticelli px-[22px] pt-[15.5px] pb-[17.5px] align-top text-[14.5px] font-semibold text-brand">
                  {row.framework}
                </td>
                <td className="border-t border-botticelli px-[22px] pt-[15.5px] pb-[17.5px] align-top text-[14.5px] text-shuttle">
                  {row.expects}
                </td>
                <td className="border-t border-botticelli px-[22px] pt-[15.5px] pb-[17.5px] align-top text-[14.5px] text-shuttle">
                  {row.supports}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </IamSection>
  );
}
