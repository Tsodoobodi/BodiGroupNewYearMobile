// app/checkin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GuestInfo {
  ft_code: string;
  first_name: string;
  last_name: string;
  mobile_phone: string;
  desk_no: string;
  is_checked_in: boolean; // ← Нэмэх
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
      <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        {/* Confetti Effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    "#FFD700",
                    "#FF69B4",
                    "#00CED1",
                    "#FF4500",
                    "#32CD32",
                  ][Math.floor(Math.random() * 5)],
                }}
              />
            ))}
          </div>
        )}

        {/* Success Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 max-w-lg w-full text-center animate-scale-in">
          {/* Success Icon */}
          <div className="mb-6 relative">
            <div className="mx-auto w-24 h-24 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce-once">
              <svg
                className="w-14 h-14 text-white"
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
            <div className="absolute inset-0 bg-green-400/30 rounded-full blur-xl animate-pulse"></div>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-fade-in-up">
            Тавтай морил!
          </h1>
          <p className="text-lg text-gray-600 mb-8 animate-fade-in-up delay-100">
            Таныг амжилттай бүртгэлээ
          </p>

          {/* Info Cards */}
          <div className="space-y-4 mb-8">
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 animate-fade-in-up delay-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">
                  Ширээний дугаар
                </span>
                <span className="text-3xl font-black text-indigo-600">
                  {guestInfo?.desk_no}
                </span>
              </div>
            </div>
            <div className="bg-linear-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 animate-fade-in-up delay-300">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Таны код</span>
                <span className="text-2xl font-bold text-purple-600 font-mono">
                  {guestInfo?.ft_code}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-linear-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8 animate-fade-in-up delay-400">
            <div className="flex items-center justify-center gap-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-green-700 font-semibold">
                Сугалаанд амжилттай бүртгэгдлээ!
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
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                🔄 Reset хийх (Dev only)
              </button>
            )}
          </div>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
          >
            Буцах
          </button>
        </div>

        <style jsx>{`
          @keyframes confetti-fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }

          .confetti {
            position: absolute;
            width: 10px;
            height: 10px;
            top: -10px;
            animation: confetti-fall 3s linear forwards;
          }

          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes bounce-once {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }

          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-scale-in {
            animation: scale-in 0.5s ease-out;
          }

          .animate-bounce-once {
            animation: bounce-once 1s ease-in-out;
          }

          .animate-fade-in-up {
            animation: fade-in-up 0.6s ease-out;
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
        `}</style>
      </div>
    );
  }

  // Main Check-in Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-2xl mb-4 animate-bounce-slow">
            <Image
              src="/images/logosolo.png"
              alt="logo"
              width={80}
              height={80}
              className="animate-spin-slow"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            SPHERE NIGHT
          </h1>
        </div>

        {!guestInfo ? (
          <>
            {!scanning ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input Field */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                    FT КОД ОРУУЛАНА УУ!
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={ftCode}
                      onChange={(e) => setFtCode(e.target.value)}
                      placeholder="FT0000"
                      className="w-full px-6 py-4 border-3 border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 text-center text-2xl font-bold font-mono uppercase transition-all duration-300 shadow-lg"
                      required
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl -z-10"></div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 animate-shake">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-red-600 shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <p className="text-red-700 font-semibold">{error}</p>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !ftCode}
                  className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
                      Шалгаж байна...
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
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Бүртгүүлэх
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div
                  id="qr-reader"
                  className="rounded-2xl overflow-hidden shadow-xl"
                ></div>
                <button
                  onClick={() => setScanning(false)}
                  className="w-full bg-linear-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Болих
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Guest Info Card */}
            {/* Guest Info Card */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
                <svg
                  className="w-7 h-7 text-indigo-600"
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
                <div className="flex justify-between items-center pb-3 border-b border-indigo-200">
                  <span className="text-gray-600 font-medium">Код:</span>
                  <span className="text-xl font-bold text-indigo-600 font-mono">
                    {guestInfo.ft_code}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-indigo-200">
                  <span className="text-gray-600 font-medium">Нэр:</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {guestInfo.first_name} {guestInfo.last_name}
                  </span>
                </div>
                {guestInfo.mobile_phone && (
                  <div className="flex justify-between items-center pb-3 border-b border-indigo-200">
                    <span className="text-gray-600 font-medium">Утас:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {guestInfo.mobile_phone}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Ширээ:</span>
                  <span className="text-3xl font-black text-indigo-600">
                    {guestInfo.desk_no}
                  </span>
                </div>
              </div>
            </div>
            {guestInfo.is_checked_in && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5"
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
                    <p className="text-yellow-800 font-bold mb-1">
                      Анхааруулга
                    </p>
                    <p className="text-yellow-700 text-sm">
                      Та аль хэдийн бүртгүүлсэн байна.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 animate-shake">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setGuestInfo(null);
                  setFtCode("");
                  setError("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Буцах
              </button>

              {/* ✅ Бүртгүүлсэн бол товч идэвхгүй */}
              <button
                onClick={handleConfirm}
                disabled={loading || guestInfo.is_checked_in}
                className={`font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:shadow-xl flex items-center justify-center gap-2 ${
                  guestInfo.is_checked_in
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:scale-105"
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                    Баталгаажуулах
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
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

        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
