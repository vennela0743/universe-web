"use client";

import styles from "../../auth.module.css";

export default function DiscoverSpacePage() {
  return (
    <div className={styles.profileCard} style={{ maxWidth: "420px" }}>
      <h1 className={styles.profileUserName} style={{ marginBottom: "8px", fontSize: "1.25rem" }}>
        Discover
      </h1>
      <p className={styles.profileUserEmail}>
        Trending posts and people. This space is coming soon.
      </p>
    </div>
  );
}
