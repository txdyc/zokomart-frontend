import { buyerApi } from "../../lib/api";
import { getApiErrorMessage } from "../../lib/view";
import { MePageClient } from "./MePageClient";
import styles from "./page.module.css";

export default async function MePage() {
  try {
    const me = await buyerApi.getMe();
    return <MePageClient initialMe={me} />;
  } catch (error) {
    return (
      <main className={styles.page}>
        <div className={styles.phoneFrame}>
          <div className={styles.errorState}>
            <p className={styles.errorEyebrow}>My Account</p>
            <h1 className={styles.errorTitle}>账户暂时不可用</h1>
            <p className={styles.errorText}>
              {getApiErrorMessage(error, "个人中心暂时不可用，请稍后重试。")}
            </p>
          </div>
        </div>
      </main>
    );
  }
}
