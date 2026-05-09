import { redirect } from "next/navigation";

import { buyerApi } from "../../../lib/api";
import { getServerAccessToken } from "../../../lib/server-auth";

import { EditProfilePageClient } from "./EditProfilePageClient";
import { buildEditProfileData } from "./edit-profile-data";

export default async function EditProfilePage() {
  const authToken = await getServerAccessToken();
  if (!authToken) {
    redirect("/login?redirect=%2Fme%2Fedit");
  }

  try {
    const me = await buyerApi.getMe(authToken);
    return <EditProfilePageClient initialData={buildEditProfileData(me)} />;
  } catch {
    return <EditProfilePageClient initialData={buildEditProfileData(null)} />;
  }
}
