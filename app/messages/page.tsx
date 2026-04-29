import { getMessagesPageData } from "../../lib/messages";
import { MessagesPageClient } from "./MessagesPageClient";

export default async function MessagesPage() {
  const initialData = await getMessagesPageData();

  return <MessagesPageClient initialData={initialData} />;
}
