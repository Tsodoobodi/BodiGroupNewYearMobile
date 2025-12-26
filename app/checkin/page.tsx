// app/checkin/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface GuestInfo {
  ft_code: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
  desk_no: string;
  is_checked_in: boolean;
}

export default function CheckInPage() {
  const [ftCode, setFtCode] = useState("");
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ FIX: Generate random values once and memoize them
  const snowflakes = useMemo(
    () =>
      Array.from({ length: 50 }, () => ({
        left: Math.random() * 100,
        top: -(Math.random() * 20),
        size: Math.random() * 15 + 10,
        delay: Math.random() * 8,
        duration: Math.random() * 8 + 8,
        opacity: Math.random() * 0.7 + 0.3,
      })),
    []
  );

  const trees = useMemo(
    () =>
      Array.from({ length: 4 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 25 + 35,
        delay: Math.random() * 4,
        duration: Math.random() * 6 + 10,
      })),
    []
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 12 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 15 + 12,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2,
      })),
    []
  );

  const gifts = useMemo(
    () =>
      Array.from({ length: 6 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 20 + 25,
        delay: Math.random() * 3,
        duration: Math.random() * 5 + 7,
      })),
    []
  );

  const confettiParticles = useMemo(
    () =>
      Array.from({ length: 120 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: Math.random() * 2 + 2,
        color: [
          "#FFD700",
          "#FF1493",
          "#00CED1",
          "#FF4500",
          "#32CD32",
          "#FF69B4",
        ][Math.floor(Math.random() * 6)],
      })),
    []
  );

  // QR Scanner
  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setFtCode(decodedText.toUpperCase());
        scanner.clear();
        setScanning(false);
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear();
    };
  }, [scanning]);

  // Confetti animation
  useEffect(() => {
    if (confirmed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [confirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/checkin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ftCode: ftCode.toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setGuestInfo(data);
      } else {
        setError(data.message || "Код олдсонгүй");
      }
    } catch (err) {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/checkin/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ftCode: ftCode.toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmed(true);
      } else {
        setError(data.message || "Баталгаажуулахад алдаа гарлаа");
      }
    } catch (err) {
      setError("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  // Success Page
  if (confirmed) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-red-700 flex items-center justify-center p-4">
        {/* ❄️ SNOWFLAKES */}
        {isMounted && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {snowflakes.map((flake, i) => (
              <div
                key={`snow-${i}`}
                className="absolute snowflake"
                style={{
                  left: `${flake.left}%`,
                  top: `${flake.top}px`,
                  fontSize: `${flake.size}px`,
                  animationDelay: `${flake.delay}s`,
                  animationDuration: `${flake.duration}s`,
                  opacity: flake.opacity,
                }}
              >
                ❄️
              </div>
            ))}
          </div>
        )}

        {/* 🎄 TREES */}
        {isMounted && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {trees.map((tree, i) => (
              <div
                key={`tree-${i}`}
                className="absolute floating-tree"
                style={{
                  left: `${tree.left}%`,
                  top: `${tree.top}%`,
                  fontSize: `${tree.size}px`,
                  animationDelay: `${tree.delay}s`,
                  animationDuration: `${tree.duration}s`,
                }}
              >
                🎄
              </div>
            ))}
          </div>
        )}

        {/* ⭐ STARS */}
        {isMounted && (
          <div className="fixed inset-0 pointer-events-none z-0">
            {stars.map((star, i) => (
              <div
                key={`star-${i}`}
                className="absolute floating-star"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  fontSize: `${star.size}px`,
                  animationDelay: `${star.delay}s`,
                  animationDuration: `${star.duration}s`,
                }}
              >
                ⭐
              </div>
            ))}
          </div>
        )}

        {/* ✨ GLOWING LIGHTS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-glow-pulse"></div>
          <div className="absolute top-40 right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-glow-pulse-delay-1"></div>
          <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-glow-pulse-delay-2"></div>
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-glow-pulse-delay-3"></div>
        </div>

        {/* 🎊 Confetti Effect */}
        {showConfetti && isMounted && (
          <div className="absolute inset-0 pointer-events-none z-40">
            {confettiParticles.map((particle, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${particle.left}%`,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                  backgroundColor: particle.color,
                }}
              />
            ))}
          </div>
        )}

        {/* Success Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center animate-scale-in border-4 border-white/30 shadow-glow-success">
          {/* Success Icon */}
          <div className="mb-6 relative">
            <div className="mx-auto w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce-celebration shadow-glow-green">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="absolute inset-0 bg-green-400/40 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -top-2 -right-2 text-4xl animate-spin-slow">
              ⭐
            </div>
            <div className="absolute -bottom-2 -left-2 text-4xl animate-spin-slow-reverse">
              🎁
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-black mb-3 animate-fade-in-up christmas-title-success">
            🎊 Тавтай морил! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-in-up delay-100 font-semibold">
            Таныг амжилттай бүртгэлээ
          </p>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-100 border-3 border-indigo-300 rounded-2xl p-6 animate-fade-in-up delay-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🪑</span>
                  <span className="text-gray-700 font-bold">
                    Ширээний дугаар
                  </span>
                </div>
                <span className="text-4xl font-black text-indigo-600 animate-pulse">
                  {guestInfo?.desk_no}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-100 border-3 border-purple-300 rounded-2xl p-6 animate-fade-in-up delay-300 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🎫</span>
                  <span className="text-gray-700 font-bold">Таны код</span>
                </div>
                <span className="text-2xl font-black text-purple-600 font-mono">
                  {guestInfo?.ft_code}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-100 border-3 border-green-400 rounded-2xl p-6 mb-8 animate-fade-in-up delay-400 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-3">
              <svg
                className="w-7 h-7 text-green-600 animate-bounce"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-700 font-bold text-lg">
                🎁 Сугалаанд амжилттай бүртгэгдлээ! 🎄
              </p>
            </div>
            {process.env.NODE_ENV === "development" && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/checkin/reset", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ftCode: ftCode.toUpperCase() }),
                    });

                    if (response.ok) {
                      setConfirmed(false);
                      setGuestInfo(null);
                      setFtCode("");
                      alert("Reset хийгдлээ! Дахин бүртгүүлж болно.");
                    }
                  } catch (error) {
                    alert("Алдаа гарлаа");
                  }
                }}
                className="mt-4 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Reset хийх (Dev only)
              </button>
            )}
          </div>
          <button
            onClick={() => {
              console.log("Navigating to home...");
              window.location.href = "/";
            }}
            className="relative h-14 z-50 w-full bg-slate-500 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-3 text-lg shadow-xl"
          >
            Буцах
          </button>
        </div>

        <style jsx>{`
          @keyframes confetti-fall {
            to {
              transform: translateY(100vh) rotate(720deg);
            }
          }

          .confetti {
            position: absolute;
            width: 12px;
            height: 12px;
            top: -10px;
            animation: confetti-fall linear forwards;
            border-radius: 50%;
          }

          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes bounce-celebration {
            0%,
            100% {
              transform: translateY(0) scale(1);
            }
            25% {
              transform: translateY(-15px) scale(1.1);
            }
            50% {
              transform: translateY(-30px) scale(1);
            }
            75% {
              transform: translateY(-15px) scale(1.1);
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-scale-in {
            animation: scale-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          }

          .animate-bounce-celebration {
            animation: bounce-celebration 1.5s ease-in-out infinite;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.8s ease-out;
          }

          .christmas-title-success {
            background: linear-gradient(
              45deg,
              #ef4444,
              #22c55e,
              #3b82f6,
              #eab308,
              #ef4444
            );
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradient-shift 4s ease infinite;
          }

          .delay-100 {
            animation-delay: 0.1s;
          }
          .delay-200 {
            animation-delay: 0.2s;
          }
          .delay-300 {
            animation-delay: 0.3s;
          }
          .delay-400 {
            animation-delay: 0.4s;
          }
          .delay-700 {
            animation-delay: 0.7s;
          }

          /* SHARED ANIMATIONS */
          @keyframes snowfall {
            0% {
              transform: translateY(-10px) translateX(0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) translateX(100px) rotate(360deg);
              opacity: 0;
            }
          }

          .snowflake {
            animation: snowfall linear infinite;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
          }

          @keyframes float-tree {
            0%,
            100% {
              transform: translateY(0) translateX(0) rotate(-10deg);
            }
            50% {
              transform: translateY(-40px) translateX(-20px) rotate(10deg);
            }
          }

          .floating-tree {
            animation: float-tree ease-in-out infinite;
            filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.6));
          }

          @keyframes twinkle-star {
            0%,
            100% {
              transform: scale(1) rotate(0deg);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.3) rotate(180deg);
              opacity: 1;
            }
          }

          .floating-star {
            animation: twinkle-star ease-in-out infinite;
            filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.8));
          }

          @keyframes glow-pulse {
            0%,
            100% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.8;
            }
          }

          .animate-glow-pulse {
            animation: glow-pulse 4s ease-in-out infinite;
          }
          .animate-glow-pulse-delay-1 {
            animation: glow-pulse 4s ease-in-out infinite;
            animation-delay: 1s;
          }
          .animate-glow-pulse-delay-2 {
            animation: glow-pulse 4s ease-in-out infinite;
            animation-delay: 2s;
          }
          .animate-glow-pulse-delay-3 {
            animation: glow-pulse 4s ease-in-out infinite;
            animation-delay: 3s;
          }

          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }
          .animate-spin-slow-reverse {
            animation: spin-slow 8s linear infinite reverse;
          }

          @keyframes gradient-shift {
            0%,
            100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          .shadow-glow-success {
            box-shadow: 0 0 60px rgba(34, 197, 94, 0.3),
              0 0 100px rgba(147, 51, 234, 0.2);
          }

          .shadow-glow-green {
            box-shadow: 0 0 40px rgba(34, 197, 94, 0.5);
          }
        `}</style>
      </div>
    );
  }

  // Main Check-in Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-purple-800 to-red-700 flex items-center justify-center p-4">
      {/* ❄️ SNOWFLAKES */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {snowflakes.map((flake, i) => (
            <div
              key={`snow-${i}`}
              className="absolute snowflake"
              style={{
                left: `${flake.left}%`,
                top: `${flake.top}px`,
                fontSize: `${flake.size}px`,
                animationDelay: `${flake.delay}s`,
                animationDuration: `${flake.duration}s`,
                opacity: flake.opacity,
              }}
            >
              ❄️
            </div>
          ))}
        </div>
      )}

      {/* 🎄 TREES */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {trees.map((tree, i) => (
            <div
              key={`tree-${i}`}
              className="absolute floating-tree"
              style={{
                left: `${tree.left}%`,
                top: `${tree.top}%`,
                fontSize: `${tree.size}px`,
                animationDelay: `${tree.delay}s`,
                animationDuration: `${tree.duration}s`,
              }}
            >
              🎄
            </div>
          ))}
        </div>
      )}

      {/* ⭐ STARS */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {stars.map((star, i) => (
            <div
              key={`star-${i}`}
              className="absolute floating-star"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                fontSize: `${star.size}px`,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      {/* 🎁 GIFTS */}
      {isMounted && (
        <div className="fixed inset-0 pointer-events-none z-0">
          {gifts.map((gift, i) => (
            <div
              key={`gift-${i}`}
              className="absolute floating-gift"
              style={{
                left: `${gift.left}%`,
                top: `${gift.top}%`,
                fontSize: `${gift.size}px`,
                animationDelay: `${gift.delay}s`,
                animationDuration: `${gift.duration}s`,
              }}
            >
              🎁
            </div>
          ))}
        </div>
      )}

      {/* ✨ GLOWING LIGHTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-red-500/20 rounded-full blur-3xl animate-glow-pulse"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-green-500/20 rounded-full blur-3xl animate-glow-pulse-delay-1"></div>
        <div className="absolute bottom-32 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-glow-pulse-delay-2"></div>
        <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-glow-pulse-delay-3"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-glow-pulse"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full border border-white/50 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20 blur-3xl"></div>
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-6">
            <div className="p-4 animate-float">
              <Image
                src="/images/modgif.gif"
                alt="logo"
                width={120}
                height={120}
                className="animate-rotate-slow"
              />
            </div>
            <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
              🎄
            </div>
            <div className="absolute -bottom-2 -left-2 text-3xl animate-bounce delay-300">
              ⭐
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 christmas-title">
            🎊 SPHERE NIGHT 🎉
          </h1>
          <p className="text-gray-700 text-md font-bold">
            Бодь Групп Шинэ жилийн баяр
          </p>
        </div>

        {!guestInfo ? (
          <>
            {!scanning ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-center bg-gradient-to-r from-purple-100 to-pink-100 py-2 px-4 rounded-xl border-2 border-purple-200">
                    🎫 FT КОД ОРУУЛНА УУ!
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ftCode}
                      onChange={(e) => setFtCode(e.target.value)}
                      placeholder="FT0000"
                      className="w-full px-6 py-5 border-3 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-400 focus:border-purple-500 text-center text-3xl font-bold font-mono uppercase transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-br from-white to-purple-50"
                      required
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl -z-10"></div>
                  </div>
                </div>

                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border-3 border-red-400 rounded-2xl p-4 animate-shake shadow-lg">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-7 h-7 text-red-600 shrink-0 animate-bounce"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-700 font-bold">{error}</p>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !ftCode}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-xl"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-7 w-7"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Шалгаж байна...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-7 h-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Бүртгүүлэх
                    </>
                  )}
                </button>
                <Link
                  href="/directors"
                  className="block text-center text-purple-700 font-semibold hover:underline"
                >
                  Зочид
                </Link>
              </form>
            ) : (
              <div className="space-y-4">
                <div
                  id="qr-reader"
                  className="rounded-2xl overflow-hidden shadow-xl border-4 border-purple-300"
                ></div>
                <button
                  onClick={() => setScanning(false)}
                  className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Болих
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-3 border-indigo-300 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 text-center flex items-center justify-center gap-2">
                <svg
                  className="w-8 h-8 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                Таны мэдээлэл
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b-2 border-indigo-200">
                  <span className="text-gray-600 font-bold flex items-center gap-2">
                    <span className="text-2xl">🎫</span> Код:
                  </span>
                  <span className="text-xl font-black text-indigo-600 font-mono">
                    {guestInfo.ft_code}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b-2 border-indigo-200">
                  <span className="text-gray-600 font-bold flex items-center gap-2">
                    <span className="text-2xl">👤</span> Нэр:
                  </span>
                  <span className="text-lg font-bold text-gray-800">
                    {guestInfo.first_name} {guestInfo.last_name}
                  </span>
                </div>
                {guestInfo.mobile_phone && (
                  <div className="flex justify-between items-center pb-3 border-b-2 border-indigo-200">
                    <span className="text-gray-600 font-bold flex items-center gap-2">
                      <span className="text-2xl">📱</span> Утас:
                    </span>
                    <span className="text-lg font-bold text-gray-800">
                      {guestInfo.mobile_phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-bold flex items-center gap-2">
                    <span className="text-2xl">🪑</span> Ширээ:
                  </span>
                  <span className="text-4xl font-black text-indigo-600 animate-pulse">
                    {guestInfo.desk_no}
                  </span>
                </div>
              </div>
            </div>

            {guestInfo.is_checked_in && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-3 border-yellow-400 rounded-2xl p-6 animate-fade-in-up shadow-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-7 h-7 text-yellow-600 shrink-0 mt-0.5 animate-bounce"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="text-yellow-800 font-black mb-1 text-lg">
                      ⚠️ Анхааруулга
                    </p>
                    <p className="text-yellow-700 font-semibold">
                      Та аль хэдийн бүртгүүлсэн байна.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border-3 border-red-400 rounded-2xl p-4 animate-shake shadow-lg">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-7 h-7 text-red-600 shrink-0 animate-bounce"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 font-bold">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setGuestInfo(null);
                  setFtCode("");
                  setError("");
                }}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl shadow-lg"
              >
                Буцах
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading || guestInfo.is_checked_in}
                className={`font-bold py-5 px-6 rounded-2xl transition-all duration-300 transform hover:shadow-xl flex items-center justify-center gap-2 shadow-lg ${
                  guestInfo.is_checked_in
                    ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </>
                ) : guestInfo.is_checked_in ? (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Бүртгэсэн
                  </>
                ) : (
                  <>
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Би ирлээ
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* SHARED ANIMATIONS */
        @keyframes snowfall {
          0% {
            transform: translateY(-10px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }

        .snowflake {
          animation: snowfall linear infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        @keyframes float-tree {
          0%,
          100% {
            transform: translateY(0) translateX(0) rotate(-10deg);
          }
          50% {
            transform: translateY(-40px) translateX(-20px) rotate(10deg);
          }
        }

        .floating-tree {
          animation: float-tree ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.6));
        }

        @keyframes twinkle-star {
          0%,
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.3) rotate(180deg);
            opacity: 1;
          }
        }

        .floating-star {
          animation: twinkle-star ease-in-out infinite;
          filter: drop-shadow(0 0 15px rgba(234, 179, 8, 0.8));
        }

        @keyframes float-gift {
          0%,
          100% {
            transform: translateY(0) rotate(0deg) scale(1);
          }
          50% {
            transform: translateY(-30px) rotate(-10deg) scale(1.1);
          }
        }

        .floating-gift {
          animation: float-gift ease-in-out infinite;
          filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));
        }

        @keyframes glow-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .animate-glow-pulse {
          animation: glow-pulse 4s ease-in-out infinite;
        }
        .animate-glow-pulse-delay-1 {
          animation: glow-pulse 4s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-glow-pulse-delay-2 {
          animation: glow-pulse 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-glow-pulse-delay-3 {
          animation: glow-pulse 4s ease-in-out infinite;
          animation-delay: 3s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-15px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes rotate-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-rotate-slow {
          animation: rotate-slow 20s linear infinite;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }

        .christmas-title {
          background: linear-gradient(
            45deg,
            #ef4444,
            #22c55e,
            #3b82f6,
            #eab308,
            #ef4444
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradient-shift 4s ease infinite;
          text-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
        }

        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .shadow-glow-multi {
          box-shadow: 0 0 50px rgba(147, 51, 234, 0.3),
            0 0 100px rgba(239, 68, 68, 0.2), 0 0 150px rgba(34, 197, 94, 0.2);
        }

        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
