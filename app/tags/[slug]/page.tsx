import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";

interface Props {
  params: { slug: string };
}

export default function TagDetailPage({ params }: Props) {
  if (!params.slug) notFound();

  return (
    <>
      <SiteHeader />
      <main className="page"><section className="section"><h2>태그: {params.slug}</h2><p>준비 중입니다.</p></section></main>
    </>
  );
}
