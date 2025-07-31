import { HEADING_H1 } from "@/lib/utils/styles";

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center -mt-16">
      <h1 className={`${HEADING_H1} mb-8`}>
        Rainbow Comp
      </h1>
    </div>
  );
}
