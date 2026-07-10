import resources from "@/data/resources";
import ResourceCard from "./ResourceCard";

export default function ResourceSection() {
  return (
    <section className="bg-[#FFF] py-15">
      {/* <div className="mx-auto max-w-7xl px-6"> */}
      <div className="container-global">
        <div className="mx-auto max-w-[1200px]">
             {/* <div className="grid grid-cols-1 gap-10 lg:grid-cols-2"> */}
             <div className="flex flex-wrap justify-center gap-18">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} {...resource} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
