import type {
  ChatMessage,
  MessageConversationDetail,
  MessagesPageData,
} from "./types";

const MESSAGES_PAGE_MOCK: MessagesPageData = {
  unreadTotal: 3,
  activeFilter: "all",
  quickTip: {
    title: "Quick responses available",
    description: "Vendors reply within 30 mins on average",
  },
  conversations: [
    {
      id: "makola-fashion-hub",
      title: "Makola Fashion Hub",
      preview: "We have restocked the Ankara print dress in size L! Check it out 🎉",
      timeLabel: "10:24",
      avatarType: "emoji",
      avatarValue: "👗",
      unreadCount: 2,
      isUnread: true,
      category: "chat",
      isOnline: true,
    },
    {
      id: "order-sk-7821",
      title: "Order #SK-7821",
      preview: "Your package from Makola Market has shipped! Tracking: GH7821KA",
      timeLabel: "Yesterday",
      avatarType: "emoji",
      avatarValue: "📦",
      unreadCount: 1,
      isUnread: true,
      category: "order",
      statusTag: {
        label: "Shipped",
        tone: "warning",
      },
    },
    {
      id: "tech-city-ghana",
      title: "Tech City Ghana",
      preview: "The Infinix Hot 40 Pro is available. Do you want extended warranty?",
      timeLabel: "Yesterday",
      avatarType: "emoji",
      avatarValue: "📱",
      unreadCount: 0,
      isUnread: false,
      category: "chat",
      isOnline: true,
    },
    {
      id: "order-sk-7804",
      title: "Order #SK-7804",
      preview: "Your order has been delivered! Please leave a review for Ghana Naturals.",
      timeLabel: "Mon",
      avatarType: "emoji",
      avatarValue: "✅",
      unreadCount: 0,
      isUnread: false,
      category: "order",
      statusTag: {
        label: "Delivered",
        tone: "success",
      },
    },
    {
      id: "ghana-naturals",
      title: "Ghana Naturals",
      preview: "Thank you for your purchase! Your shea butter set will arrive tomorrow.",
      timeLabel: "Sun",
      avatarType: "emoji",
      avatarValue: "🌿",
      unreadCount: 0,
      isUnread: false,
      category: "chat",
    },
    {
      id: "order-sk-7799",
      title: "Order #SK-7799",
      preview: "Out for delivery in East Legon! Expected by 4 PM today.",
      timeLabel: "Sun",
      avatarType: "emoji",
      avatarValue: "🚚",
      unreadCount: 0,
      isUnread: false,
      category: "order",
      statusTag: {
        label: "On the Way",
        tone: "danger",
      },
    },
    {
      id: "kente-kingdom",
      title: "Kente Kingdom",
      preview: "Your custom Kente is being woven. Ready in 3-5 days, Yoo!",
      timeLabel: "Sat",
      avatarType: "emoji",
      avatarValue: "🧶",
      unreadCount: 0,
      isUnread: false,
      category: "chat",
      isOnline: true,
    },
  ],
};

const MAKOLA_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "other",
    content: "We have restocked the Ankara print dress in size L! Check it out 🎉",
    timestamp: "10:24",
  },
  {
    id: "msg-2",
    sender: "me",
    content: "Okay, thanks! When will it arrive in East Legon?",
    timestamp: "10:26",
    readState: "read",
  },
];

const MESSAGE_DETAILS_MOCK: Record<string, MessageConversationDetail> = {
  "makola-fashion-hub": {
    id: "makola-fashion-hub",
    title: "Makola Fashion Hub",
    avatarType: "emoji",
    avatarValue: "👗",
    isOnline: true,
    messages: MAKOLA_MESSAGES,
  },
  "tech-city-ghana": {
    id: "tech-city-ghana",
    title: "Tech City Ghana",
    avatarType: "emoji",
    avatarValue: "📱",
    isOnline: true,
    messages: [
      {
        id: "msg-1",
        sender: "other",
        content: "The Infinix Hot 40 Pro is available. Do you want extended warranty?",
        timestamp: "09:10",
      },
    ],
  },
  "ghana-naturals": {
    id: "ghana-naturals",
    title: "Ghana Naturals",
    avatarType: "emoji",
    avatarValue: "🌿",
    messages: [
      {
        id: "msg-1",
        sender: "other",
        content: "Thank you for your purchase! Your shea butter set will arrive tomorrow.",
        timestamp: "08:42",
      },
    ],
  },
  "kente-kingdom": {
    id: "kente-kingdom",
    title: "Kente Kingdom",
    avatarType: "emoji",
    avatarValue: "🧶",
    isOnline: true,
    messages: [
      {
        id: "msg-1",
        sender: "other",
        content: "Your custom Kente is being woven. Ready in 3-5 days, Yoo!",
        timestamp: "07:55",
      },
    ],
  },
};

export async function getMessagesPageData(): Promise<MessagesPageData> {
  return Promise.resolve(MESSAGES_PAGE_MOCK);
}

export async function getMessageConversationDetail(
  conversationId: string,
): Promise<MessageConversationDetail | null> {
  const directMatch = MESSAGE_DETAILS_MOCK[conversationId];

  if (directMatch) {
    return Promise.resolve(directMatch);
  }

  const listMatch = MESSAGES_PAGE_MOCK.conversations.find(
    (conversation) => conversation.id === conversationId,
  );

  if (!listMatch) {
    return Promise.resolve(null);
  }

  return Promise.resolve({
    id: listMatch.id,
    title: listMatch.title,
    avatarType: listMatch.avatarType,
    avatarValue: listMatch.avatarValue,
    avatarImageUrl: listMatch.avatarImageUrl,
    isOnline: listMatch.isOnline,
    messages: [
      {
        id: `${listMatch.id}-seed`,
        sender: "other",
        content: listMatch.preview,
        timestamp: listMatch.timeLabel === "10:24" ? "10:24" : "09:00",
      },
    ],
  });
}

export { MESSAGES_PAGE_MOCK, MESSAGE_DETAILS_MOCK };
