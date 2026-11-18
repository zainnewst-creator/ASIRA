import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ExternalLink, 
  Headphones, 
  Sparkles,
  FastForward
} from 'lucide-react';
import { sanitizeUrl } from '../../utils/security';

interface AudioLessonPlayerProps {
  title: string;
  courseTitle?: string;
  instructorName?: string;
  audioUrl?: string;
  driveAudioUrl?: string;
  durationMinutes?: number;
}

export const AudioLessonPlayer: React.FC<AudioLessonPlayerProps> = ({
  title,
  courseTitle,
  instructorName,
  audioUrl = '',
  driveAudioUrl = '',
  durationMinutes = 30,
}) => {
  const rawUrl = (audioUrl || driveAudioUrl).trim();

  // استخراج معرف ملف Google Drive إذا كان الرابط من درايف
  const extractDriveFileId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  };

  const driveFileId = extractDriveFileId(rawUrl);
  const isDriveAudio = !!driveFileId || rawUrl.includes('drive.google.com');

  // رابط التضمين لمشغل Google Drive
  const driveEmbedUrl = driveFileId 
    ? `https://drive.google.com/file/d/${driveFileId}/preview`
    : rawUrl;

  // حالة مشغل الـ HTML5 الصوتي عند وجود ملف صوتي مباشر
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(durationMinutes * 60);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [useEmbedDrivePlayer, setUseEmbedDrivePlayer] = useState<boolean>(isDriveAudio);

  // تحديث مدة الصوت عند تحميل الملف الصوتي
  const handleLoadedMetadata = () => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMuted = !isMuted;
    audioRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      style={{
        background: 'linear-gradient(135deg, #09132b 0%, #0d1e44 50%, #152c63 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        color: '#ffffff',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        marginBottom: '1.25rem',
      }}
    >
      {/* رأس المشغل الصوتي */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
          }}>
            <Headphones size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '1px', background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                تسجيل صوتي
              </span>
              {isDriveAudio && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                  Google Drive Audio
                </span>
              )}
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.2rem 0 0', color: '#ffffff' }}>
              {title}
            </h3>
          </div>
        </div>

        {/* أزرار التبديل والرابط الخارجي */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isDriveAudio && (
            <button
              onClick={() => setUseEmbedDrivePlayer(!useEmbedDrivePlayer)}
              className="btn btn-outline"
              style={{
                fontSize: '0.75rem',
                padding: '0.35rem 0.65rem',
                color: '#93c5fd',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                background: useEmbedDrivePlayer ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              }}
              title="التبديل بين مشغل Drive والمشغل المدمج"
            >
              {useEmbedDrivePlayer ? 'مشغل المنصة المدمج' : 'مشغل Google Drive'}
            </button>
          )}

          {rawUrl && (
            <a
              href={sanitizeUrl(rawUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{
                fontSize: '0.78rem',
                padding: '0.35rem 0.65rem',
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              title="فتح التسجيل الأصلي في Google Drive"
            >
              <ExternalLink size={13} />
              <span>فتح الملف</span>
            </a>
          )}
        </div>
      </div>

      {/* الحالة 1: مشغل تضمين Google Drive */}
      {isDriveAudio && useEmbedDrivePlayer ? (
        <div>
          <div style={{
            width: '100%',
            height: '110px',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: '#040916',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '0.75rem',
          }}>
            <iframe
              src={driveEmbedUrl}
              title={title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay"
            />
          </div>
          <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: 0, textAlign: 'center' }}>
            💡 يتم تشغيل التسجيل الصوتي مباشرة عبر خوادم Google Drive الآمنة بتدفق عالي النقاء.
          </p>
        </div>
      ) : (
        /* الحالة 2: مشغل HTML5 المدمج الأنيق */
        <div>
          {/* عنصر الصوت الخفي */}
          {rawUrl && (
            <audio
              ref={audioRef}
              src={rawUrl}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
            />
          )}

          {/* محاكاة الأمواج الصوتية التفاعلية */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            height: '45px',
            margin: '0.75rem 0 1rem',
            padding: '0 1rem',
          }}>
            {[40, 75, 30, 90, 60, 45, 85, 95, 55, 70, 80, 50, 65, 90, 40, 60, 80, 50, 70, 95, 45, 65, 85, 35, 75, 50].map((h, idx) => (
              <div
                key={idx}
                style={{
                  width: '3px',
                  height: isPlaying ? `${Math.max(15, (h * Math.sin((currentTime * 3) + idx) + 100) / 2)}%` : `${h * 0.4}%`,
                  background: isPlaying ? 'linear-gradient(180deg, #60a5fa, #3b82f6)' : 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '2px',
                  transition: 'height 0.15s ease',
                }}
              />
            ))}
          </div>

          {/* شريط التقدم والوقت */}
          <div style={{ marginBottom: '0.85rem' }}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                height: '6px',
                accentColor: '#3b82f6',
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            {/* زر إعادة التشغيل والتقديم */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
                  }
                }}
                className="btn btn-ghost"
                style={{ color: '#cbd5e1', padding: '0.4rem', fontSize: '0.78rem' }}
                title="إرجاع 10 ثوانٍ"
              >
                <RotateCcw size={16} />
                <span>-10s</span>
              </button>

              {/* زر التشغيل والإيقاف الكبير */}
              <button
                onClick={togglePlay}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التسجيل'}
              >
                {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginRight: '-2px' }} />}
              </button>

              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
                  }
                }}
                className="btn btn-ghost"
                style={{ color: '#cbd5e1', padding: '0.4rem', fontSize: '0.78rem' }}
                title="تقديم 10 ثوانٍ"
              >
                <FastForward size={16} />
                <span>+10s</span>
              </button>
            </div>

            {/* التحكم في السرعة ومستوى الصوت */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* تبديل سرعة التشغيل */}
              <button
                onClick={cyclePlaybackRate}
                className="btn btn-outline"
                style={{
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#93c5fd',
                  borderColor: 'rgba(59, 130, 246, 0.35)',
                  minWidth: '45px',
                }}
                title="تغيير سرعة التشغيل"
              >
                {playbackRate}x
              </button>

              {/* التحكم في الصوت */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={toggleMute}
                  className="btn btn-ghost"
                  style={{ color: '#cbd5e1', padding: '0.35rem' }}
                  title={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '70px',
                    height: '4px',
                    accentColor: '#3b82f6',
                    cursor: 'pointer',
                  }}
                  title="مستوى الصوت"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* معلومات المحاضر والمقرر في أسفل المشغل */}
      <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span>المحاضر: <strong style={{ color: '#ffffff' }}>{instructorName || 'أستاذ المقرر'}</strong></span>
        {courseTitle && <span>المقرر: <strong style={{ color: '#ffffff' }}>{courseTitle}</strong></span>}
      </div>
    </div>
  );
};
