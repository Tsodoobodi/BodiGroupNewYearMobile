// app/directors/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  UserX, 
  Phone,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Undo2,
  RefreshCw,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Director {
  id: string;
  full_name: string;
  mobile_phone: string;
  desk_no: string;
  is_attended: boolean;
  attended_at?: string;
}

interface Statistics {
  total: number;
  attended: number;
  pending: number;
}

export default function DirectorsPage() {
  const router = useRouter();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    attended: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [directorsRes, statsRes] = await Promise.all([
        fetch('/api/directors'),
        fetch('/api/directors/stats')
      ]);

      const directorsData = await directorsRes.json();
      const statsData = await statsRes.json();

      if (directorsData.success) {
        setDirectors(directorsData.data);
      }

      if (statsData.success) {
        setStatistics(statsData.data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Өгөгдөл татахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttended = async (id: string) => {
    try {
      const response = await fetch(`/api/directors/${id}/attend`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (data.success) {
        setDirectors(directors.map(d => 
          d.id === id ? data.data : d
        ));
        setStatistics(prev => ({
          ...prev,
          attended: prev.attended + 1,
          pending: prev.pending - 1
        }));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Алдаа гарлаа');
    }
  };

  const handleUndo = async (id: string) => {
    try {
      const response = await fetch(`/api/directors/${id}/unattend`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (data.success) {
        setDirectors(directors.map(d => 
          d.id === id ? data.data : d
        ));
        setStatistics(prev => ({
          ...prev,
          attended: prev.attended - 1,
          pending: prev.pending + 1
        }));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Алдаа гарлаа');
    }
  };

  const filteredDirectors = directors.filter(d =>
    d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.mobile_phone.includes(searchTerm) ||
    d.desk_no.includes(searchTerm)
  );

  const pendingDirectors = filteredDirectors.filter(d => !d.is_attended);
  const attendedDirectors = filteredDirectors.filter(d => d.is_attended);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0C1B5C] to-[#0240E0] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-20 w-20 md:h-24 md:w-24 border-t-4 border-b-4 border-white mb-6"></div>
          <p className="text-white text-2xl md:text-3xl font-bold">Ачааллаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0C1B5C] to-[#0240E0] py-4 md:py-8 px-4 md:px-6 relative overflow-hidden">
      {/* ❄️ SNOWFLAKES */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={`snow-${i}`}
            className="absolute text-white animate-snowfall"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
              fontSize: `${Math.random() * 15 + 12}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
              opacity: Math.random() * 0.5 + 0.3,
            }}
          >
            ❄️
          </div>
        ))}
      </div>

      {/* ⭐ STARS */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {[...Array(40)].map((_, i) => {
          const size = Math.random() * 2 + 1;
          
          return (
            <div
              key={`star-${i}`}
              className="absolute rounded-full bg-white star-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
                boxShadow: `0 0 ${size * 2}px ${size / 2}px rgba(255, 255, 255, 0.8)`,
              }}
            />
          );
        })}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back Button */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white/95 hover:bg-white backdrop-blur-lg rounded-2xl shadow-2xl transition-all active:scale-95 text-gray-800 font-bold text-base md:text-lg"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            <span>Буцах</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 md:mb-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 md:mb-5 drop-shadow-2xl leading-tight">
            🎊 Зочид 🎉
          </h1>
          <p className="text-white/90 text-lg md:text-2xl font-bold">
            Шинэ жилийн баяр
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border-4 border-white/30 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="p-3 md:p-4 bg-blue-100 rounded-xl md:rounded-2xl">
                <Users className="w-6 h-6 md:w-10 md:h-10 text-blue-600" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-bold text-xs md:text-base">Нийт</p>
                <p className="text-3xl md:text-5xl font-black text-blue-600">{statistics.total}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border-4 border-white/30 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="p-3 md:p-4 bg-green-100 rounded-xl md:rounded-2xl">
                <CheckCircle2 className="w-6 h-6 md:w-10 md:h-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-bold text-xs md:text-base">Ирсэн</p>
                <p className="text-3xl md:text-5xl font-black text-green-600">{statistics.attended}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border-4 border-white/30 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-2 md:gap-3">
              <div className="p-3 md:p-4 bg-orange-100 rounded-xl md:rounded-2xl">
                <Clock className="w-6 h-6 md:w-10 md:h-10 text-orange-600" />
              </div>
              <div className="text-center">
                <p className="text-gray-600 font-bold text-xs md:text-base">Хүлээгдэж буй</p>
                <p className="text-3xl md:text-5xl font-black text-orange-600">{statistics.pending}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search & Refresh */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 mb-6 md:mb-10 border-4 border-white/30 shadow-2xl">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 md:w-6 md:h-6" />
              <input
                type="text"
                placeholder="Хайх..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-4 md:py-5 border-3 border-gray-300 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-400 focus:border-blue-500 text-base md:text-xl font-bold"
              />
            </div>
            <button
              onClick={fetchData}
              className="px-6 md:px-8 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl md:rounded-2xl shadow-lg flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 text-base md:text-xl"
            >
              <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
              <span>Шинэчлэх</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 md:mb-8 bg-red-500/95 backdrop-blur-lg border-4 border-red-300 rounded-2xl md:rounded-3xl p-5 md:p-6">
            <p className="text-white font-bold text-center text-base md:text-xl">{error}</p>
          </div>
        )}

        {/* Directors Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
          {/* Pending */}
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Clock className="w-7 h-7 md:w-10 md:h-10" />
              Хүлээгдэж буй ({pendingDirectors.length})
            </h2>
            <div className="space-y-3 md:space-y-5 max-h-[55vh] md:max-h-[65vh] overflow-y-auto pr-2 md:pr-3">
              <AnimatePresence>
                {pendingDirectors.map((director) => (
                  <DirectorCard
                    key={director.id}
                    director={director}
                    onMarkAttended={handleMarkAttended}
                  />
                ))}
              </AnimatePresence>
              {pendingDirectors.length === 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-10 md:p-16 text-center border-4 border-white/30">
                  <UserX className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4 md:mb-6" />
                  <p className="text-gray-500 font-bold text-lg md:text-2xl">
                    Хүлээгдэж буй зочид байхгүй
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Attended */}
          <div>
            <h2 className="text-2xl md:text-4xl font-black text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <CheckCircle2 className="w-7 h-7 md:w-10 md:h-10" />
              Ирсэн ({attendedDirectors.length})
            </h2>
            <div className="space-y-3 md:space-y-5 max-h-[55vh] md:max-h-[65vh] overflow-y-auto pr-2 md:pr-3">
              <AnimatePresence>
                {attendedDirectors.map((director) => (
                  <DirectorCard
                    key={director.id}
                    director={director}
                    onUndo={handleUndo}
                    isAttended
                  />
                ))}
              </AnimatePresence>
              {attendedDirectors.length === 0 && (
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-10 md:p-16 text-center border-4 border-white/30">
                  <UserCheck className="w-16 h-16 md:w-24 md:h-24 text-gray-300 mx-auto mb-4 md:mb-6" />
                  <p className="text-gray-500 font-bold text-lg md:text-2xl">
                    Ирсэн зочид байхгүй
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(100px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .animate-snowfall {
          animation: snowfall linear infinite;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }

        @keyframes star-twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .star-twinkle {
          animation: star-twinkle ease-in-out infinite;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }

        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 6px;
          }
        }
      `}</style>
    </div>
  );
}

// Director Card Component - Mobile Optimized
function DirectorCard({ 
  director, 
  onMarkAttended, 
  onUndo,
  isAttended = false
}: { 
  director: Director;
  onMarkAttended?: (id: string) => void;
  onUndo?: (id: string) => void;
  isAttended?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      className={`bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-5 md:p-7 border-4 shadow-2xl transition-all ${
        isAttended 
          ? 'border-green-400 bg-green-50/60' 
          : 'border-white/40'
      }`}
    >
      <div className="mb-4 md:mb-5">
        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-800 mb-2 md:mb-3 leading-tight">
          {director.full_name}
        </h3>
        <div className="space-y-1.5 md:space-y-2">
          {director.mobile_phone && (
            <div className="flex items-center gap-2 md:gap-3 text-gray-600 text-sm md:text-lg">
              <Phone className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-bold">{director.mobile_phone}</span>
            </div>
          )}
          {director.desk_no && (
            <div className="flex items-center gap-2 md:gap-3 text-gray-600 text-sm md:text-lg">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="font-bold">Ширээ: {director.desk_no}</span>
            </div>
          )}
        </div>
      </div>

      {!isAttended ? (
        <button
          onClick={() => onMarkAttended?.(director.id)}
          className="w-full px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 text-base md:text-xl"
        >
          <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
          Ирсэн
        </button>
      ) : (
        <>
          <button
            onClick={() => onUndo?.(director.id)}
            className="w-full px-5 md:px-6 py-4 md:py-5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black rounded-xl md:rounded-2xl shadow-xl flex items-center justify-center gap-2 md:gap-3 transition-all active:scale-95 text-base md:text-xl"
          >
            <Undo2 className="w-5 h-5 md:w-6 md:h-6" />
            Буцаах
          </button>
          {director.attended_at && (
            <p className="text-sm md:text-base text-gray-600 text-center mt-3 md:mt-4 font-bold bg-gray-100 py-2 md:py-3 px-3 md:px-4 rounded-lg">
              ⏰ {new Date(director.attended_at).toLocaleString('mn-MN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

interface Director {
  id: string;
  full_name: string;
  mobile_phone: string;
  desk_no: string;
  is_attended: boolean;
  attended_at?: string;
}

interface Statistics {
  total: number;
  attended: number;
  pending: number;
}