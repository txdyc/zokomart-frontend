import Link from "next/link";

type CampaignPlaceholderPageProps = {
  params: Promise<{
    campaignKey: string;
  }>;
};

function humanizeCampaignKey(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function CampaignPlaceholderPage({
  params,
}: CampaignPlaceholderPageProps) {
  const { campaignKey } = await params;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top, rgba(255,255,255,0.2), rgba(255,255,255,0) 36%), linear-gradient(145deg, #1a0a0e 0%, #0a1f14 55%, #1a1a0a 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "24px",
          background: "#ffffff",
          padding: "28px 24px",
          boxShadow: "0 24px 80px rgba(0, 0, 0, 0.28)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            minHeight: "24px",
            alignItems: "center",
            borderRadius: "999px",
            background: "#fff7d6",
            color: "#7b5b00",
            padding: "0 12px",
            fontSize: "12px",
            fontWeight: 700,
          }}
        >
          Campaign Preview
        </div>
        <h1 style={{ margin: "16px 0 10px", fontSize: "28px", lineHeight: 1.15 }}>
          {humanizeCampaignKey(campaignKey) || "Upcoming Campaign"}
        </h1>
        <p style={{ margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.6 }}>
          This activity landing page is not live yet. The homepage banner target is already wired,
          so admins can prepare campaigns before the full experience ships.
        </p>
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gap: "10px",
            borderRadius: "18px",
            background: "#f8fafc",
            padding: "16px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>
            Campaign key
          </div>
          <code
            style={{
              borderRadius: "12px",
              background: "#e2e8f0",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#0f172a",
            }}
          >
            {campaignKey}
          </code>
        </div>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            minHeight: "40px",
            alignItems: "center",
            justifyContent: "center",
            marginTop: "20px",
            padding: "0 18px",
            borderRadius: "999px",
            background: "#111827",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
