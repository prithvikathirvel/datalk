import { redirect } from "next/navigation";

/** Legacy path — the studio lives at /studio now. */
export default function EmbedRedirect() {
  redirect("/studio");
}
