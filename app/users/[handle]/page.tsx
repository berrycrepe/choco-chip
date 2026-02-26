import { redirect } from "next/navigation";

interface Props {
  params: { handle: string };
}

export default function LegacyUserPage({ params }: Props) {
  const handle = encodeURIComponent(params.handle ?? "");
  redirect(`/profile/${handle}`);
}
