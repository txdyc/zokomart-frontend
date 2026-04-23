"use client";

import { useEffect, useMemo, useState } from "react";

type PaymentCountdownProps = {
  expiresAt: string;
};

function getRemainingMs(expiresAt: string) {
  const expiresAtTime = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtTime)) {
    return 0;
  }

  return Math.max(0, expiresAtTime - Date.now());
}

function formatRemaining(remainingMs: number) {
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export default function PaymentCountdown({ expiresAt }: PaymentCountdownProps) {
  const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(expiresAt));

  useEffect(() => {
    const updateRemaining = () => {
      setRemainingMs(getRemainingMs(expiresAt));
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [expiresAt]);

  const isExpired = remainingMs <= 0;
  const displayValue = useMemo(() => formatRemaining(remainingMs), [remainingMs]);

  return (
    <div
      className={`rounded-xl border p-4 ${
        isExpired ? "border-rose-200 bg-rose-50" : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className={`text-sm font-medium ${isExpired ? "text-rose-800" : "text-amber-800"}`}>
        支付倒计时
      </p>
      <p className={`mt-2 text-2xl font-semibold ${isExpired ? "text-rose-900" : "text-amber-900"}`}>
        {isExpired ? "已到期" : displayValue}
      </p>
      <p className={`mt-2 text-sm ${isExpired ? "text-rose-700" : "text-amber-700"}`}>
        {isExpired
          ? "支付时限已到，系统将很快自动关闭订单。"
          : "请在支付时限内完成支付，超时后系统会自动关闭订单。"}
      </p>
    </div>
  );
}

