// --- Google Apps Script API Wrapper (Proxy Polyfill) ---
window.google = window.google || {};
window.google.script = window.google.script || {};

// ** กำหนด URL ของ Google Apps Script Web App ที่ได้จากการ Deploy **
// เช่น const GAS_API_URL = "https://script.google.com/macros/s/AKfycb..._your_web_app_id.../exec";
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxihM-6DOTHsgnrRcCg7ZHwEVG8trET8SfWjGBBSyw94Ws9ycFv9vKHK0_suHwRXog3/exec";

window.google.script.run = (function() {
  class GASRun {
    constructor(successHandler = null, failureHandler = null) {
      this.successHandler = successHandler;
      this.failureHandler = failureHandler;
    }
    withSuccessHandler(handler) {
      return new GASRun(handler, this.failureHandler);
    }
    withFailureHandler(handler) {
      return new GASRun(this.successHandler, handler);
    }
  }

  return new Proxy(new GASRun(), {
    get: function(target, prop) {
      if (prop === 'withSuccessHandler' || prop === 'withFailureHandler') {
        return target[prop].bind(target);
      }
      return function(...args) {
        fetch(GAS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify({
            action: prop,
            args: args
          })
        })
        .then(response => {
          if (!response.ok) throw new Error('HTTP error status: ' + response.status);
          return response.json();
        })
        .then(res => {
          if (res.success) {
            if (target.successHandler) target.successHandler(res.data);
          } else {
            if (target.failureHandler) {
              target.failureHandler(res.error);
            } else {
              console.error("GAS Execution Error:", res.error);
            }
          }
        })
        .catch(err => {
          if (target.failureHandler) {
            target.failureHandler(err.toString());
          } else {
            console.error("Network or CORS Error:", err);
          }
        });
      };
    }
  });
})();

// --- End of Polyfill ---


    import React, { useState, useEffect, useMemo, useRef } from 'react';
    import { createRoot } from 'react-dom/client';
    import {
      Calendar as CalendarIcon, Users, Clock, Plus,
      ChevronLeft, ChevronRight, X, MapPin,
      CheckCircle2, Camera, Megaphone,
      Menu, Home, User, History, Info, Lock, Eye, EyeOff, LogOut,
      ListTodo, BarChart3, Check, FileText, FileEdit, Phone, Mail, XCircle, Bell, Search, Filter,
      Edit2, Trash2, Image as ImageIcon, Unlock, Printer, Download, Smartphone
    } from 'lucide-react';

    const getBezierPath = (points) => {
      if (!points || points.length === 0) return '';
      if (points.length === 1) return `M ${points[0][0]} ${points[0][1]}`;
      
      let d = `M ${points[0][0]} ${points[0][1]}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        
        const cp1x = p0[0] + (p1[0] - p0[0]) / 3;
        const cp1y = p0[1];
        const cp2x = p0[0] + 2 * (p1[0] - p0[0]) / 3;
        const cp2y = p1[1];
        
        d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1[0]} ${p1[1]}`;
      }
      return d;
    };

    // --- MOCK DATA ---
    const MOCK_ROOMS = [
      { id: 'r1', name: 'ห้องประชุมบอร์ดบริหาร', capacity: 12, amenities: ['Projector', 'Video', 'Coffee'], image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800&h=500', status: 'available' },
      { id: 'r2', name: 'พื้นที่ทำงานร่วม 1', capacity: 4, amenities: ['Monitor'], image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&q=80&w=800&h=500', status: 'available' },
      { id: 'r3', name: 'สตูดิโอสร้างสรรค์', capacity: 8, amenities: ['Monitor', 'Video', 'Coffee'], image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32d7?auto=format&fit=crop&q=80&w=800&h=500', status: 'available' },
      { id: 'r4', name: 'โซนสงบ', capacity: 2, amenities: ['Coffee'], image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&q=80&w=800&h=500', status: 'maintenance' },
    ];

    const getSafeDateStr = (dateObj) => {
      return `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    };

    const INITIAL_BOOKINGS = [
      { id: 'b1', room_id: 'r1', user_id: 'u1', date: getSafeDateStr(new Date()), startDate: getSafeDateStr(new Date()), endDate: getSafeDateStr(new Date()), startTime: '10:00', endTime: '11:00', timeColD: '10:00', purpose: 'วางแผนไตรมาส 3', priority: 'สำคัญ', status: 'confirmed', statusText: 'อนุมัติ', bookingCode: 'SCL5202601', attachment: '1qTjn3GAOeClPBk4T-sYBTqdH7CLBR9ea', lab: 'ห้องชีววิทยา อาคาร 13', reqName: 'สมชาย ใจดี' },
      { id: 'b2', room_id: 'r2', user_id: 'u2', date: getSafeDateStr(new Date(Date.now() + 86400000)), startDate: getSafeDateStr(new Date(Date.now() + 86400000)), endDate: getSafeDateStr(new Date(Date.now() + 86400000)), startTime: '14:00', endTime: '15:00', timeColD: '14:00', purpose: 'อัปเดตงาน', priority: 'ปกติ', status: 'confirmed', statusText: 'อนุมัติ', bookingCode: 'SCL5202602', attachment: '1qTjn3GAOeClPBk4T-sYBTqdH7CLBR9ea', lab: 'ห้องเคมี อาคาร 13', reqName: 'สมหญิง รักงาน' },
    ];

    const BANNER_IMAGES = [
      "https://lh3.googleusercontent.com/d/14YVGtzxoQtGOksaR7U4jegtI7UAotHVq",
    ];

    const PR_ITEMS = [
        { id: 'pr10', title: 'ประชาสัมพันธ์ 1', image: 'https://lh3.googleusercontent.com/d/1T8UaBYy6Fw7_r2oTYi0p2u4qGwYSiqmW' },
        { id: 'pr11', title: 'ประชาสัมพันธ์ 2', image: 'https://lh3.googleusercontent.com/d/11kaR1tUc6MU-Maoy6X5J1WukAxBUVOzl' },
    ];

    const MOCK_USERS = [
      { id: 'd1', username: 'director', password: '123', firstName: 'ท่านผู้อำนวยการ', lastName: '', position: 'Director', phone: '0999999999', email: 'director@local.com', role: 'director', isApproved: true, isUserBlocked: false, profileImage: null },
      { id: 'u1', username: 'admin', password: '1234', firstName: 'Admin', lastName: 'System', position: 'ผู้บริหาร', phone: '0812345678', email: 'admin@local.com', role: 'admin', regDate: '21/05/2026', regTime: '10:00:00', isApproved: true, isUserBlocked: false, profileImage: null },
      { id: 'u2', username: 'user1', password: '123', firstName: 'สมชาย', lastName: 'ใจดี', position: 'บุคลากรสามัญ', phone: '0899999999', email: 'somchai@local.com', role: 'user', regDate: '21/05/2026', regTime: '11:30:00', isApproved: true, isUserBlocked: false, profileImage: null },
      { id: 'u3', username: 'user2', password: '123', firstName: 'สมหญิง', lastName: 'รักงาน', position: 'พนักงาน', phone: '0888888888', email: 'somying@local.com', role: 'user', regDate: '22/05/2026', regTime: '09:15:00', isApproved: true, isUserBlocked: true, profileImage: null },
      { id: 'u4', username: 'usernew', password: '123', firstName: 'สมใหม่', lastName: 'เพิ่งสมัคร', position: 'พนักงาน', phone: '0877777777', email: 'sommai@local.com', role: 'user', regDate: '23/05/2026', regTime: '08:00:00', isApproved: false, isUserBlocked: false, profileImage: null }
    ];

    const MOCK_CHART_DATA = {
      week: [
        { label: 'อา.', value: 2 }, { label: 'จ.', value: 12 }, { label: 'อ.', value: 19 }, { label: 'พ.', value: 15 },
        { label: 'พฤ.', value: 25 }, { label: 'ศ.', value: 22 }, { label: 'ส.', value: 5 }
      ],
      month: [
        { label: 'สัปดาห์ 1', value: 45 }, { label: 'สัปดาห์ 2', value: 60 },
        { label: 'สัปดาห์ 3', value: 50 }, { label: 'สัปดาห์ 4', value: 80 }
      ],
      year: [
        { label: 'ม.ค.', value: 120 }, { label: 'ก.พ.', value: 150 }, { label: 'มี.ค.', value: 180 },
        { label: 'เม.ย.', value: 140 }, { label: 'พ.ค.', value: 200 }, { label: 'มิ.ย.', value: 170 }
      ]
    };

    // --- COMPONENTS ---
    const LoadingSpinner = React.memo(({ size = 20, className = "" }) => (
      <svg className={`animate-spin ${className}`} width={size} height={size} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ));

    const BentoBox = React.memo(({ children, className = "", noPadding = false, overflowVisible = false, onClick }) => (
      <div
        onClick={onClick}
        className={`bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col ${noPadding ? '' : 'p-6'} transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'} ${className}`}
      >
        {children}
      </div>
    ));

    const Modal = React.memo(({ isOpen, onClose, title, children, fullScreen = false }) => {
      if (!isOpen) return null;

      const containerClass = fullScreen
        ? "w-[96vw] h-[96vh] max-w-none"
        : "w-[90vw] sm:w-[85vw] max-w-md";
      const heightStyle = fullScreen ? {} : { maxHeight: '85vh' };

      return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 w-screen h-screen overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-overlay-fast" onClick={onClose} />
          <div className={`relative ${containerClass} bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col transform animate-modal-pop-fast`} style={heightStyle}>
            {title && (
              <div className="relative flex justify-center items-center p-5 sm:p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 text-center w-full">{title}</h2>
                <button onClick={onClose} className="absolute right-4 sm:right-6 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all duration-150 active:scale-90 active:bg-slate-300">
                  <X size={20} />
                </button>
              </div>
            )}
            {!title && (
              <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100/50 hover:bg-slate-200 rounded-full text-slate-500 transition-all duration-150 active:scale-90 active:bg-slate-300 z-10">
                <X size={20} />
              </button>
            )}
            <div className={`p-5 sm:p-6 overflow-y-auto custom-scroll flex-1 ${!title ? 'pt-8' : ''}`}>
              {children}
            </div>
          </div>
        </div>
      );
    });

    const InteractiveButterflies = React.memo(() => {
      const containerRef = useRef(null);
      const butterfliesRef = useRef([]);
      const mouseRef = useRef({ x: -1000, y: -1000 });

      const count = 7;
      const gradients = [
        'linear-gradient(135deg, rgba(2, 102, 112, 0.75) 0%, rgba(15, 23, 42, 0.45) 100%)',
        'linear-gradient(135deg, rgba(186, 156, 90, 0.75) 0%, rgba(90, 63, 37, 0.45) 100%)',
        'linear-gradient(135deg, rgba(139, 92, 246, 0.75) 0%, rgba(30, 27, 75, 0.45) 100%)',
        'linear-gradient(135deg, rgba(244, 63, 94, 0.75) 0%, rgba(76, 5, 25, 0.45) 100%)',
        'linear-gradient(135deg, rgba(16, 185, 129, 0.75) 0%, rgba(6, 78, 59, 0.45) 100%)',
        'linear-gradient(135deg, rgba(249, 115, 22, 0.75) 0%, rgba(124, 45, 18, 0.45) 100%)',
        'linear-gradient(135deg, rgba(6, 182, 212, 0.75) 0%, rgba(8, 51, 68, 0.45) 100%)'
      ];

      useEffect(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;

        const data = [];
        for (let i = 0; i < count; i++) {
          data.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            angle: Math.random() * 360,
            scale: 0.7 + Math.random() * 0.2,
            targetScale: 0.8,
            isFleeing: false,
            color: gradients[i % gradients.length],
            flapDuration: 0.35
          });
        }

        butterfliesRef.current = data;

        const handleMouseMove = (e) => {
          mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
          mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        let animId;
        const update = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          const mouse = mouseRef.current;

          const elements = containerRef.current?.children;
          if (!elements) return;

          for (let i = 0; i < butterfliesRef.current.length; i++) {
            const b = butterfliesRef.current[i];
            const el = elements[i];
            if (!el) continue;

            const dx = b.x - mouse.x;
            const dy = b.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 180) {
              b.isFleeing = true;
              b.targetScale = 1.35;

              const force = (180 - dist) / 180;
              const ax = (dx / (dist || 1)) * force * 4.5;
              const ay = (dy / (dist || 1)) * force * 4.5;
              b.vx += ax;
              b.vy += ay;
              b.flapDuration = 0.15;
            } else {
              b.isFleeing = false;
              b.targetScale = 0.75;
              b.flapDuration = 0.35;

              b.vx += (Math.random() - 0.5) * 0.4;
              b.vy += (Math.random() - 0.5) * 0.4;

              b.vx *= 0.95;
              b.vy *= 0.95;

              const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              if (speed < 0.8) {
                const angle = Math.random() * Math.PI * 2;
                b.vx = Math.cos(angle) * 1.2;
                b.vy = Math.sin(angle) * 1.2;
              } else if (speed > 4) {
                b.vx = (b.vx / speed) * 3;
                b.vy = (b.vy / speed) * 3;
              }
            }

            if (b.isFleeing) {
              const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
              if (speed > 8) {
                b.vx = (b.vx / speed) * 7.5;
                b.vy = (b.vy / speed) * 7.5;
              }
            }

            b.x += b.vx;
            b.y += b.vy;

            const pad = 40;
            if (b.x < pad) {
              b.vx += 0.8;
              b.x = pad;
            } else if (b.x > w - pad) {
              b.vx -= 0.8;
              b.x = w - pad;
            }
            if (b.y < pad) {
              b.vy += 0.8;
              b.y = pad;
            } else if (b.y > h - pad) {
              b.vy -= 0.8;
              b.y = h - pad;
            }

            const targetAngle = Math.atan2(b.vy, b.vx) * (180 / Math.PI) + 90;

            let diff = targetAngle - b.angle;
            while (diff < -180) diff += 360;
            while (diff > 180) diff -= 360;
            b.angle += diff * 0.15;

            b.scale += (b.targetScale - b.scale) * 0.12;

            el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0px) rotateZ(${b.angle}deg) scale(${b.scale})`;

            const wings = el.querySelectorAll('.butterfly-wing');
            wings.forEach(wEl => {
              wEl.style.animationDuration = `${b.flapDuration}s`;
            });
          }

          animId = requestAnimationFrame(update);
        };

        animId = requestAnimationFrame(update);

        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseleave', handleMouseLeave);
          cancelAnimationFrame(animId);
        };
      }, []);

      return (
        <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none z-[8]">
          {gradients.map((grad, idx) => (
            <div
              key={idx}
              className="absolute left-0 top-0 pointer-events-none transform-gpu"
              style={{
                width: '44px',
                height: '44px',
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
            >
              <div className="butterfly">
                <div className="butterfly-body"></div>
                <div className="butterfly-wing butterfly-wing-left" style={{ background: grad }}></div>
                <div className="butterfly-wing butterfly-wing-right" style={{ background: grad }}></div>
              </div>
            </div>
          ))}
        </div>
      );
    });

    const ClockDisplay = React.memo(() => {
      const [now, setNow] = useState(new Date());

      useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
      }, []);

      return (
        <div className="text-white flex flex-col items-end text-right shrink-0">
          <div className="hidden md:flex flex-col items-end">
            <div className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-sm leading-none">
              {now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-sm font-semibold mt-2">
              {now.toLocaleDateString('th-TH', { weekday: 'long' })} {now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <div className="md:hidden flex flex-col items-end">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter tabular-nums drop-shadow-sm leading-none mb-1">{now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</h1>
            <h2 className="font-semibold text-xs sm:text-sm mt-1">{now.toLocaleDateString('th-TH', { weekday: 'long' })}</h2>
            <h3 className="text-[10px] sm:text-[11px]">{now.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          </div>
        </div>
      );
    });

    function App() {
      // --- App Shell States ---
      // const [loadingProgress, setLoadingProgress] = useState(0);
      // const [showAppShell, setShowAppShell] = useState(true);

      const [currentView, setCurrentView] = useState('home');
      const [isLoading, setIsLoading] = useState(true);
      const [currentDate, setCurrentDate] = useState(new Date());

      const [bookings, setBookings] = useState([]);
      const [rawBookings, setRawBookings] = useState([]);
      const [rooms, setRooms] = useState([]);
      const [usersList, setUsersList] = useState([]);
      const [lockedDates, setLockedDates] = useState([]);

      const [homeData, setHomeData] = useState({
        announcement: 'กำลังโหลดข้อมูล',
        banners: BANNER_IMAGES,
        prItems: PR_ITEMS
      });

      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
      const [selectedDateForBooking, setSelectedDateForBooking] = useState(null);
      const [latestBookingCode, setLatestBookingCode] = useState('');
      const [createdBookingDetails, setCreatedBookingDetails] = useState(null);
      const [bookingAttachmentFile, setBookingAttachmentFile] = useState(null);

      const [currentSlide, setCurrentSlide] = useState(0);
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);
      const [chartFilter, setChartFilter] = useState('week');
      const [isChartDropdownOpen, setIsChartDropdownOpen] = useState(false);
      const [hoveredWaveIndex, setHoveredWaveIndex] = useState(null);

      // Auth States
      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [currentUser, setCurrentUser] = useState(null);
      const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
      const [authMode, setAuthMode] = useState('login');
      const [cardScaleClass, setCardScaleClass] = useState('scale-100');
      const switchAuthMode = (mode) => {
        setCardScaleClass('scale-[0.96] opacity-40');
        setTimeout(() => {
          setAuthMode(mode);
          setShowPassword(false);
          setTimeout(() => {
            setCardScaleClass('scale-100 opacity-100');
          }, 40);
        }, 220);
      };
      const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
      const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
      const [searchBookingText, setSearchBookingText] = useState('');
      const [bookingsStatusFilter, setBookingsStatusFilter] = useState('all');
      const [showPassword, setShowPassword] = useState(false);

      const [isAuthLoading, setIsAuthLoading] = useState(false);
      const [isBookingLoading, setIsBookingLoading] = useState(false);

      const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

      // --- Admin Home Settings States ---
      const [isBannerSettingsOpen, setIsBannerSettingsOpen] = useState(false);
      const [isUploadingBanner, setIsUploadingBanner] = useState(false);
      const [bannerPositions, setBannerPositions] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tgBannerPos')) || {}; } catch(e) { return {}; }
      });

      const [isAnnouncementSettingsOpen, setIsAnnouncementSettingsOpen] = useState(false);
      const [tempAnnouncement, setTempAnnouncement] = useState('');
      const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);

      const [isPRSettingsOpen, setIsPRSettingsOpen] = useState(false);
      const [isUploadingPR, setIsUploadingPR] = useState(false);
      const [newPRTitle, setNewPRTitle] = useState('');
      const [newPRFile, setNewPRFile] = useState(null);
      const [editingPRIndex, setEditingPRIndex] = useState(null);
      const [editingPRTitle, setEditingPRTitle] = useState('');
      const [prPositions, setPrPositions] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tgPrPos')) || {}; } catch(e) { return {}; }
      });

      const [dragInfo, setDragInfo] = useState({ isDragging: false, type: null, index: null, startX: 0, startY: 0, initialX: 50, initialY: 50 });

      // --- Refs for Image Positions Sync ---
      const bannerPositionsRef = useRef(bannerPositions);
      const prPositionsRef = useRef(prPositions);

      useEffect(() => {
        bannerPositionsRef.current = bannerPositions;
      }, [bannerPositions]);

      useEffect(() => {
        prPositionsRef.current = prPositions;
      }, [prPositions]);

      // --- Profile Modal States ---
      const [profilePreview, setProfilePreview] = useState(null);
      const [profileFile, setProfileFile] = useState(null);
      const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
      const [showProfilePassword, setShowProfilePassword] = useState(false);
      const [isProfileUpdating, setIsProfileUpdating] = useState(false);

      const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
      const [editingNoteId, setEditingNoteId] = useState(null);
      const [noteInputValue, setNoteInputValue] = useState("");
      const [isSavingNote, setIsSavingNote] = useState(false);

      const [isPurposeModalOpen, setIsPurposeModalOpen] = useState(false);
      const [selectedPurpose, setSelectedPurpose] = useState("");

      const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
      const [selectedAttachmentUrl, setSelectedAttachmentUrl] = useState(null);

      const [isNotificationOpen, setIsNotificationOpen] = useState(false);

      const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
      const [approveActionData, setApproveActionData] = useState({ id: null, action: null });
      const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
      const [blockingUserEmail, setBlockingUserEmail] = useState(null);

      // --- Lock Date Modal States ---
      const [isLockDateModalOpen, setIsLockDateModalOpen] = useState(false);
      const [isLockingDate, setIsLockingDate] = useState(false);

      // --- User Info Modal States ---
      const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
      const [selectedUserInfo, setSelectedUserInfo] = useState(null);
      const [showUserInfoPassword, setShowUserInfoPassword] = useState(false);

      // --- New: Delete User States ---
      const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
      const [userToDelete, setUserToDelete] = useState(null);
      const [isDeletingUser, setIsDeletingUser] = useState(false);

      // --- Refs for Click Outside Dropdowns ---
      const notificationRef = useRef(null);
      const chartDropdownRef = useRef(null);
      const sortDropdownRef = useRef(null);
      const signupPositionRef = useRef(null);
      const bookingPriorityRef = useRef(null);

      // Refs for custom booking form dropdowns
      const bookingPeriodStartRef = useRef(null);
      const bookingPeriodEndRef = useRef(null);
      const bookingLabRoomRef = useRef(null);

      // --- Custom Dropdown States for Forms ---
      const PERIOD_RANGES = {
        'คาบ 1': '08.00-08.40',
        'คาบ 2': '08.40-09.20',
        'คาบ 3': '09.20-10.10',
        'คาบ 4': '10.10-11.00',
        'คาบ 5': '11.00-11.50',
        'คาบ 6': '11.50-12.40',
        'คาบ 7': '13.15-13.55',
        'คาบ 8': '13.55-14.35',
        'คาบ 9': '14.35-15.25',
        'คาบ 10': '15.25-16.15'
      };

      const [signupPosition, setSignupPosition] = useState('');
      const [isSignupPositionOpen, setIsSignupPositionOpen] = useState(false);

      const [startPeriod, setStartPeriod] = useState('คาบ 1');
      const [endPeriod, setEndPeriod] = useState('');
      const [bookingLab, setBookingLab] = useState('ห้องชีววิทยา อาคาร 13');

      // States for opening/closing custom booking form dropdowns
      const [isBookingPeriodStartOpen, setIsBookingPeriodStartOpen] = useState(false);
      const [isBookingPeriodEndOpen, setIsBookingPeriodEndOpen] = useState(false);
      const [isBookingLabRoomOpen, setIsBookingLabRoomOpen] = useState(false);

      const [bookingStartTime, setBookingStartTime] = useState('08.00-08.40');
      const [bookingEndTime, setBookingEndTime] = useState('');

      useEffect(() => {
        const startRange = PERIOD_RANGES[startPeriod];
        if (!startRange) return;

        const startParts = startRange.split('-');
        if (!endPeriod || endPeriod === startPeriod) {
          setBookingStartTime(startParts[0]);
          setBookingEndTime(startParts[1]);
        } else {
          const endRange = PERIOD_RANGES[endPeriod];
          if (endRange) {
            const endParts = endRange.split('-');
            setBookingStartTime(startParts[0]);
            setBookingEndTime(endParts[1]);
          }
        }
      }, [startPeriod, endPeriod]);

      // --- Filter & Sort States for Queue Table ---
      const [searchBookingCode, setSearchBookingCode] = useState('');
      const [isBookingSearchOpen, setIsBookingSearchOpen] = useState(false);
      const [filterBookingDate, setFilterBookingDate] = useState('');
      const [sortBookingOrder, setSortBookingOrder] = useState('newest');
      const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
      const [currentPage, setCurrentPage] = useState(1);
      const itemsPerPage = 10;

      // --- Filter States for Users Table ---
      const [searchUser, setSearchUser] = useState('');
      const [isUserSearchOpen, setIsUserSearchOpen] = useState(false);
      const [userCurrentPage, setUserCurrentPage] = useState(1);
      const [userEdits, setUserEdits] = useState({}); // สถานะการแก้ไขข้อมูล User แบบ Inline

      // --- Filter States for Admin Table ---
      const [adminUsersList, setAdminUsersList] = useState([]);
      const [searchAdmin, setSearchAdmin] = useState('');
      const [adminCurrentPage, setAdminCurrentPage] = useState(1);
      const [adminEdits, setAdminEdits] = useState({});
      const [blockingAdminEmail, setBlockingAdminEmail] = useState(null);
      const [approvingAdminEmail, setApprovingAdminEmail] = useState(null);
      const [approvingUserEmail, setApprovingUserEmail] = useState(null);

      const [activeDetailDay, setActiveDetailDay] = useState(null);
      const [activeUpcomingBooking, setActiveUpcomingBooking] = useState(null);
      const [isUpcomingPersistent, setIsUpcomingPersistent] = useState(false);
      const [upcomingCoords, setUpcomingCoords] = useState(null);
      const longPressTimer = useRef(null);
      const mainScrollContainerRef = useRef(null);
      const lockedScrollTopRef = useRef(0);
      const [isLongPressTriggered, setIsLongPressTriggered] = useState(false);

      // --- New: Filter State for Booking Status ---
      const [filterBookingStatus, setFilterBookingStatus] = useState('all');
      const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
      const statusDropdownRef = useRef(null);

      // --- New: Filter State for Print Report ---
      const [reportFilter, setReportFilter] = useState('all');
      const [isReportDropdownOpen, setIsReportDropdownOpen] = useState(false);
      const reportDropdownRef = useRef(null);

      // --- New: PWA & Mobile Shortcut States ---
      const [deferredPrompt, setDeferredPrompt] = useState(null);
      const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
      const [shortcutModalTab, setShortcutModalTab] = useState(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        return isIOS ? 'ios' : 'android';
      });

      // --- New: My Bookings Sort State ---
      const [myBookingsSortOrder, setMyBookingsSortOrder] = useState('newest');
      const [isMyBookingsSortOpen, setIsMyBookingsSortOpen] = useState(false);
      const myBookingsSortRef = useRef(null);

      // --- New: Conflict & Approval Success Modal States ---
      const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
      const [conflictBookings, setConflictBookings] = useState([]);

      const [isApproveSuccessModalOpen, setIsApproveSuccessModalOpen] = useState(false);
      const [justApprovedBooking, setJustApprovedBooking] = useState(null);

      // --- New: User Conflict & Same Day Notice Modal States ---
      const [isUserConflictModalOpen, setIsUserConflictModalOpen] = useState(false);
      const [userConflictBookings, setUserConflictBookings] = useState([]);
      const [isUserSameDayModalOpen, setIsUserSameDayModalOpen] = useState(false);
      const [userSameDayBookings, setUserSameDayBookings] = useState([]);
      const [pendingBookingData, setPendingBookingData] = useState(null);

      // --- Custom Alert State ---
      const [appAlert, setAppAlert] = useState({ isOpen: false, message: '', title: 'แจ้งเตือน', type: 'error' });

      const showAlert = (message, type = 'error', title = null) => {
        setAppAlert({
          isOpen: true,
          message,
          title: title || (type === 'error' ? 'แจ้งเตือนระบบ' : 'สำเร็จ'),
          type
        });
      };

      const formatImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('data:image') || url.includes('lh3.googleusercontent.com')) {
          return url;
        }
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (match && match[1]) {
          return `https://lh3.googleusercontent.com/d/${match[1]}`;
        }
        const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (matchId && matchId[1]) {
          return `https://lh3.googleusercontent.com/d/${matchId[1]}`;
        }
        if (!url.includes('http')) {
          return `https://lh3.googleusercontent.com/d/${url}`;
        }
        return url;
      };

      const formatDisplayDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' });
      };

      const getThaiWeekdaysAbbr = (startDateStr, endDateStr) => {
        if (!startDateStr) return '';
        try {
          const start = new Date(startDateStr);
          if (isNaN(start.getTime())) return '';
          let end = (endDateStr && endDateStr !== '-') ? new Date(endDateStr) : start;
          if (isNaN(end.getTime())) end = start;
          
          const dayNamesAbbr = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
          if (start.getTime() === end.getTime()) {
            return dayNamesAbbr[start.getDay()];
          }
          
          const days = [];
          const current = new Date(start.getTime());
          let count = 0;
          while (current <= end && count < 31) {
            const abbr = dayNamesAbbr[current.getDay()];
            if (days.indexOf(abbr) === -1) {
              days.push(abbr);
            }
            current.setDate(current.getDate() + 1);
            count++;
          }
          return days.join(' ');
        } catch (e) {
          return '';
        }
      };

      const downloadBookingPaperImage = (details) => {
        if (!details) return;
        
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.src = 'data:image/png;base64,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';
        
        const renderReceipt = (logoImage) => {
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1350;
          const ctx = canvas.getContext('2d');
          
          // 1. Fill White background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1080, 1350);
          
          // 2. Draw centered logo if loaded
          let startY = 80;
          if (logoImage) {
            ctx.drawImage(logoImage, 540 - 80, 80, 160, 160);
            startY = 280;
          }
          
          // 3. Header Text (centered, Noto Sans Thai)
          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          ctx.font = 'bold 42px "Noto Sans Thai", sans-serif';
          ctx.fillText('ใบจองห้องปฏิบัติการวิทยาศาสตร์', 540, startY);
          
          ctx.font = 'bold 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText('SCIENCE LAB BOOKING RECEIPT', 540, startY + 45);
          
          // 4. Booking Code Block
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          const bx = 140;
          const by = startY + 90;
          const bw = 800;
          const bh = 170;
          const radius = 24;
          if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, radius);
          } else {
            ctx.rect(bx, by, bw, bh);
          }
          ctx.fill();
          
          ctx.fillStyle = '#64748B';
          ctx.font = '600 24px "Noto Sans Thai", sans-serif';
          ctx.fillText('รหัสการจองห้องปฏิบัติการ (Booking Code)', 540, by + 50);
          
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 68px "Noto Sans Thai", sans-serif';
          ctx.fillText(details.bookingCode || '-', 540, by + 130);
          
          // 5. Grid Details
          let dateFormatted = details.date;
          try {
            if (typeof formatDisplayDate === 'function') {
              dateFormatted = formatDisplayDate(details.date);
            }
          } catch(e) {}

          let endDateFormatted = details.endDate;
          try {
            if (typeof formatDisplayDate === 'function' && details.endDate && details.endDate !== '-') {
              endDateFormatted = formatDisplayDate(details.endDate);
            }
          } catch(e) {}

          const items = [
            { label: 'รหัสจอง', value: details.bookingCode || '-' },
            { label: 'คาบ', value: details.priority || '-' },
            { label: 'ห้องปฏิบัติการ', value: details.labRoom || '-' },
            { label: 'ผู้จอง', value: details.username || '-' },
            { label: 'วันใช้งาน', value: details.weekday || '-' },
            { label: 'จองวันที่', value: dateFormatted || '-' },
            { label: 'ถึงวันที่', value: endDateFormatted || '-' },
            { label: 'เริ่มเวลา', value: details.startTime || '-' },
            { label: 'สิ้นสุดเวลา', value: details.endTime || '-' },
            { label: 'วัตถุประสงค์', value: details.purpose || '-' }
          ];
          
          const gridStartY = by + 230;
          const rowHeight = 56;
          
          items.forEach((item, index) => {
            const y = gridStartY + index * rowHeight;
            
            ctx.textAlign = 'left';
            ctx.font = 'normal 24px "Noto Sans Thai", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(item.label, 150, y);
            
            ctx.fillText(':', 420, y);
            
            ctx.font = 'bold 26px "Noto Sans Thai", sans-serif';
            ctx.fillStyle = '#0F172A';
            
            if (item.label === 'วัตถุประสงค์') {
              const valStr = item.value.toString();
              const maxLen = 32;
              if (valStr.length > maxLen) {
                const line1 = valStr.substring(0, maxLen);
                const line2 = valStr.substring(maxLen, maxLen * 2);
                ctx.fillText(line1, 450, y);
                ctx.fillText(line2, 450, y + 30);
                return;
              }
            }
            ctx.fillText(item.value || '-', 450, y);
          });
          
          // 6. Seal / Stamps
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(840, 1155, 65, 0, 2 * Math.PI);
          ctx.stroke();
          
          ctx.textAlign = 'center';
          ctx.fillStyle = '#EF4444';
          ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
          ctx.fillText('PENDING', 840, 1145);
          ctx.font = 'bold 13px "Noto Sans Thai", sans-serif';
          ctx.fillText('รอรับการแจ้งเตือน', 840, 1170);
          
          // 7. Footer
          ctx.textAlign = 'center';
          ctx.font = 'medium 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText('ระบบจองห้องปฏิบัติการวิทยาศาสตร์ (Science Lab Booking System)', 540, 1250);
          ctx.font = 'bold 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#475569';
          ctx.fillText('กรุณานำภาพนี้บันทึกไว้เพื่อเป็นหลักฐาน', 540, 1290);
          
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `booking-${details.bookingCode || 'receipt'}.png`;
          link.href = dataUrl;
          link.click();
        };

        logoImg.onload = () => {
          renderReceipt(logoImg);
        };
        logoImg.onerror = () => {
          renderReceipt(null);
        };
      };

      const generateBookingPaperBase64 = (details, callback) => {
        if (!details) {
          callback(null);
          return;
        }
        
        let called = false;
        const safeCallback = (data) => {
          if (!called) {
            called = true;
            callback(data);
          }
        };

        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        const timeoutId = setTimeout(() => {
          console.log('Logo image load timed out, rendering receipt without logo...');
          logoImg.onload = null;
          logoImg.onerror = null;
          renderReceipt(null);
        }, 3000);

        const renderReceipt = (logoImage) => {
          clearTimeout(timeoutId);
          const canvas = document.createElement('canvas');
          canvas.width = 1080;
          canvas.height = 1350;
          const ctx = canvas.getContext('2d');
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 1080, 1350);
          
          let startY = 80;
          if (logoImage) {
            ctx.drawImage(logoImage, 540 - 80, 80, 160, 160);
            startY = 280;
          }
          
          ctx.fillStyle = '#0F172A';
          ctx.textAlign = 'center';
          ctx.font = 'bold 42px "Noto Sans Thai", sans-serif';
          ctx.fillText('ใบจองห้องปฏิบัติการวิทยาศาสตร์', 540, startY);
          
          ctx.font = 'bold 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText('SCIENCE LAB BOOKING RECEIPT', 540, startY + 45);
          
          ctx.fillStyle = '#F8FAFC';
          ctx.beginPath();
          const bx = 140;
          const by = startY + 90;
          const bw = 800;
          const bh = 170;
          const radius = 24;
          if (ctx.roundRect) {
            ctx.roundRect(bx, by, bw, bh, radius);
          } else {
            ctx.rect(bx, by, bw, bh);
          }
          ctx.fill();
          
          ctx.fillStyle = '#64748B';
          ctx.font = '600 24px "Noto Sans Thai", sans-serif';
          ctx.fillText('รหัสการจองห้องปฏิบัติการ (Booking Code)', 540, by + 50);
          
          ctx.fillStyle = '#DC2626';
          ctx.font = 'bold 68px "Noto Sans Thai", sans-serif';
          ctx.fillText(details.bookingCode || '-', 540, by + 130);
          
          let dateFormatted = details.date;
          try {
            if (typeof formatDisplayDate === 'function') {
              dateFormatted = formatDisplayDate(details.date);
            }
          } catch(e) {}

          let endDateFormatted = details.endDate;
          try {
            if (typeof formatDisplayDate === 'function' && details.endDate && details.endDate !== '-') {
              endDateFormatted = formatDisplayDate(details.endDate);
            }
          } catch(e) {}

          const items = [
            { label: 'รหัสจอง', value: details.bookingCode || '-' },
            { label: 'คาบ', value: details.priority || '-' },
            { label: 'ห้องปฏิบัติการ', value: details.labRoom || '-' },
            { label: 'ผู้จอง', value: details.username || '-' },
            { label: 'วันใช้งาน', value: details.weekday || '-' },
            { label: 'จองวันที่', value: dateFormatted || '-' },
            { label: 'ถึงวันที่', value: endDateFormatted || '-' },
            { label: 'เริ่มเวลา', value: details.startTime || '-' },
            { label: 'สิ้นสุดเวลา', value: details.endTime || '-' },
            { label: 'วัตถุประสงค์', value: details.purpose || '-' }
          ];
          
          const gridStartY = by + 230;
          const rowHeight = 56;
          
          items.forEach((item, index) => {
            const y = gridStartY + index * rowHeight;
            
            ctx.textAlign = 'left';
            ctx.font = 'normal 24px "Noto Sans Thai", sans-serif';
            ctx.fillStyle = '#64748B';
            ctx.fillText(item.label, 150, y);
            
            ctx.fillText(':', 420, y);
            
            ctx.font = 'bold 26px "Noto Sans Thai", sans-serif';
            ctx.fillStyle = '#0F172A';
            
            if (item.label === 'วัตถุประสงค์') {
              const valStr = item.value.toString();
              const maxLen = 32;
              if (valStr.length > maxLen) {
                const line1 = valStr.substring(0, maxLen);
                const line2 = valStr.substring(maxLen, maxLen * 2);
                ctx.fillText(line1, 450, y);
                ctx.fillText(line2, 450, y + 30);
                return;
              }
            }
            ctx.fillText(item.value || '-', 450, y);
          });
          const isApprovedStatus = details.statusText === 'อนุมัติ';
          const isRejectedStatus = details.statusText === 'ไม่อนุมัติ';
          
          let stampColor = '#EF4444'; // Red for pending or rejected
          let stampText1 = 'PENDING';
          let stampText2 = 'รอรับการแจ้งเตือน';
          
          if (isApprovedStatus) {
            stampColor = '#10B981'; // Emerald Green
            stampText1 = 'APPROVE';
            stampText2 = 'ได้รับอนุมัติ';
          } else if (isRejectedStatus) {
            stampColor = '#EF4444'; // Rose Red
            stampText1 = 'NOT APPROVED';
            stampText2 = 'ไม่ได้รับอนุมัติ';
          }
          
          ctx.strokeStyle = stampColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(840, 1155, 65, 0, 2 * Math.PI);
          ctx.stroke();
          
          ctx.textAlign = 'center';
          ctx.fillStyle = stampColor;
          ctx.font = 'bold 18px "Noto Sans Thai", sans-serif';
          ctx.fillText(stampText1, 840, 1145);
          ctx.font = 'bold 13px "Noto Sans Thai", sans-serif';
          ctx.fillText(stampText2, 840, 1170);
          
          ctx.textAlign = 'center';
          ctx.font = 'medium 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#94A3B8';
          ctx.fillText('ระบบจองห้องปฏิบัติการวิทยาศาสตร์ (Science Lab Booking System)', 540, 1250);
          ctx.font = 'bold 22px "Noto Sans Thai", sans-serif';
          ctx.fillStyle = '#475569';
          ctx.fillText('กรุณานำภาพนี้บันทึกไว้เพื่อเป็นหลักฐาน', 540, 1290);
          
          try {
            const base64Data = canvas.toDataURL('image/png').split(',')[1];
            safeCallback(base64Data);
          } catch (err) {
            console.error('Failed to get base64 data URL', err);
            if (logoImage) {
              console.log('Retrying rendering receipt without logo to prevent CORS issue...');
              renderReceipt(null);
            } else {
              safeCallback(null);
            }
          }
        };

        logoImg.onload = () => {
          renderReceipt(logoImg);
        };
        logoImg.onerror = () => {
          renderReceipt(null);
        };
        logoImg.src = 'data:image/png;base64,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';
      };

      // --- Custom Drag to Pan Logic ---
      const onDragStart = (e, type, index) => {
        if (e.type === 'mousedown' && e.button !== 0) return;
        e.preventDefault();
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);
        const posList = type === 'banner' ? bannerPositions : prPositions;
        const initPos = posList[index] || { x: 50, y: 50 };

        setDragInfo({
          isDragging: true,
          type,
          index,
          startX: clientX,
          startY: clientY,
          initialX: initPos.x,
          initialY: initPos.y
        });
      };

      // --- App Shell Loader Effect Removed ---
      // We now use native App Shell in index.html to handle loading progress.

      useEffect(() => {
        const onDragMove = (e) => {
          if (!dragInfo.isDragging) return;
          if (e.cancelable && e.type === 'touchmove') e.preventDefault();

          const clientX = e.clientX || (e.touches && e.touches[0].clientX);
          const clientY = e.clientY || (e.touches && e.touches[0].clientY);

          const dx = clientX - dragInfo.startX;
          const dy = clientY - dragInfo.startY;

          const sensitivityX = 0.2;
          const sensitivityY = 0.2;

          let newX = dragInfo.initialX - (dx * sensitivityX);
          let newY = dragInfo.initialY - (dy * sensitivityY);

          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));

          if (dragInfo.type === 'banner') {
            setBannerPositions(prev => {
              const updated = { ...prev, [dragInfo.index]: { x: newX, y: newY } };
              localStorage.setItem('tgBannerPos', JSON.stringify(updated));
              return updated;
            });
          } else if (dragInfo.type === 'pr') {
            setPrPositions(prev => {
              const updated = { ...prev, [dragInfo.index]: { x: newX, y: newY } };
              localStorage.setItem('tgPrPos', JSON.stringify(updated));
              return updated;
            });
          }
        };

        const onDragEnd = () => {
          if (dragInfo.isDragging) {
            setDragInfo(prev => ({ ...prev, isDragging: false }));
            // บันทึกตำแหน่งขึ้น Google Sheet หลังจากลากเสร็จ
            if (typeof google !== 'undefined' && google.script) {
              const payload = JSON.stringify({
                bannerPositions: bannerPositionsRef.current,
                prPositions: prPositionsRef.current
              });
              google.script.run.updateImagePositions(payload);
            }
          }
        };

        if (dragInfo.isDragging) {
          window.addEventListener('mousemove', onDragMove);
          window.addEventListener('mouseup', onDragEnd);
          window.addEventListener('touchmove', onDragMove, { passive: false });
          window.addEventListener('touchend', onDragEnd);
        }
        return () => {
          window.removeEventListener('mousemove', onDragMove);
          window.removeEventListener('mouseup', onDragEnd);
          window.removeEventListener('touchmove', onDragMove);
          window.removeEventListener('touchend', onDragEnd);
        };
      }, [dragInfo]);

      // --- 1. ตรวจสอบ Session ตอนโหลดหน้าเว็บ (Refresh) ---
      useEffect(() => {
        const SESSION_LIMIT_MS = 15 * 60 * 1000; // 15 นาที
        const savedSession = localStorage.getItem('tgBookingSession');
        const savedTimestamp = localStorage.getItem('tgBookingSessionTime');

        if (savedSession && savedTimestamp) {
          const now = Date.now();
          const timePassed = now - parseInt(savedTimestamp, 10);

          if (timePassed < SESSION_LIMIT_MS) {
            // ถ้ารีเฟรชภายใน 15 นาที ให้ล็อกอินอัตโนมัติ และต่อเวลาไปอีก 15 นาที
            setIsLoggedIn(true);
            setCurrentUser(JSON.parse(savedSession));
            localStorage.setItem('tgBookingSessionTime', now.toString());
          } else {
            // ถ้าเกิน 15 นาที ให้ล้างข้อมูลทิ้ง
            localStorage.removeItem('tgBookingSession');
            localStorage.removeItem('tgBookingSessionTime');
          }
        }
        setIsInitialCheckDone(true);
      }, []);

      // --- 2. ตัวจัดการ Session อัตโนมัติ (ต่อเวลาเมื่อขยับเมาส์ และเตะออกเมื่อนิ่งเกิน 15 นาที) ---
      useEffect(() => {
        const SESSION_LIMIT_MS = 15 * 60 * 1000; // 15 นาที
        let activityTimeout;

        const updateSessionTime = () => {
          if (isLoggedIn) {
             const lastUpdate = parseInt(localStorage.getItem('tgBookingSessionTime') || '0', 10);
             const now = Date.now();
             // อัปเดตเวลาทุกๆ 5 วินาทีที่มีการใช้งาน เพื่อลดภาระของเว็บบราวเซอร์
             if (now - lastUpdate > 5000) {
                localStorage.setItem('tgBookingSessionTime', now.toString());
             }
          }
        };

        const onUserActivity = () => {
           clearTimeout(activityTimeout);
           activityTimeout = setTimeout(updateSessionTime, 500);
        };

        // ตรวจสอบทุก 30 วินาที ว่าผู้ใช้นิ่งเกิน 15 นาทีหรือไม่
        const checkSessionInterval = setInterval(() => {
          if (isLoggedIn) {
            const savedTimestamp = localStorage.getItem('tgBookingSessionTime');
            if (savedTimestamp) {
              const now = Date.now();
              if (now - parseInt(savedTimestamp, 10) > SESSION_LIMIT_MS) {
                 handleLogoutAction(true); // นิ่งเกิน 15 นาที -> ออกจากระบบอัตโนมัติ
              }
            }
          }
        }, 30000);

        // ดักจับการเคลื่อนไหวเพื่อต่อเวลา
        window.addEventListener('mousemove', onUserActivity);
        window.addEventListener('keydown', onUserActivity);
        window.addEventListener('click', onUserActivity);
        window.addEventListener('scroll', onUserActivity);

        return () => {
          clearTimeout(activityTimeout);
          clearInterval(checkSessionInterval);
          window.removeEventListener('mousemove', onUserActivity);
          window.removeEventListener('keydown', onUserActivity);
          window.removeEventListener('click', onUserActivity);
          window.removeEventListener('scroll', onUserActivity);
        };
      }, [isLoggedIn]);

      useEffect(() => {
        const handleClickOutside = (event) => {
          if (notificationRef.current && !notificationRef.current.contains(event.target)) setIsNotificationOpen(false);
          if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) setIsChartDropdownOpen(false);
          if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) setIsSortDropdownOpen(false);
          if (signupPositionRef.current && !signupPositionRef.current.contains(event.target)) setIsSignupPositionOpen(false);
          // bookingPriorityRef check removed
          if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) setIsStatusDropdownOpen(false);
          if (myBookingsSortRef.current && !myBookingsSortRef.current.contains(event.target)) setIsMyBookingsSortOpen(false);
          if (reportDropdownRef.current && !reportDropdownRef.current.contains(event.target)) setIsReportDropdownOpen(false);

          // Close custom booking form dropdowns when clicking outside
          if (bookingPeriodStartRef.current && !bookingPeriodStartRef.current.contains(event.target)) setIsBookingPeriodStartOpen(false);
          if (bookingPeriodEndRef.current && !bookingPeriodEndRef.current.contains(event.target)) setIsBookingPeriodEndOpen(false);
          if (bookingLabRoomRef.current && !bookingLabRoomRef.current.contains(event.target)) setIsBookingLabRoomOpen(false);

          const isCalendarCellClick = event.target.closest && event.target.closest('.calendar-cell-btn');
          const isCalendarPopoverClick = event.target.closest && event.target.closest('.calendar-popover');
          if (!isCalendarCellClick && !isCalendarPopoverClick) {
            setActiveDetailDay(null);
          }

          const isUpcomingCardClick = event.target.closest && event.target.closest('.upcoming-card-btn');
          const isUpcomingPopoverClick = event.target.closest && event.target.closest('.upcoming-popover');
          if (!isUpcomingCardClick && !isUpcomingPopoverClick) {
            setActiveUpcomingBooking(null);
            setIsUpcomingPersistent(false);
          }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }, []);

      // --- PWA beforeinstallprompt listener ---
      useEffect(() => {
        const handler = (e) => {
          e.preventDefault();
          window.__pwaPrompt = e;
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
      }, []);

      const prScrollRef = useRef(null);

      const scrollPRRight = () => { if (prScrollRef.current) prScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' }); };
      const scrollPRLeft = () => { if (prScrollRef.current) prScrollRef.current.scrollBy({ left: -320, behavior: 'smooth' }); };

      useEffect(() => {
        const autoScroll = setInterval(() => {
          if (prScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = prScrollRef.current;
            if (scrollLeft + clientWidth >= scrollWidth - 10) {
              prScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
              prScrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
            }
          }
        }, 4000);
        return () => clearInterval(autoScroll);
      }, []);

      const refreshAllData = () => {
        setIsLoading(true);

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((response) => {
              if (response.success && response.data) {
                const formattedBanners = response.data.banners.map(item => formatImageUrl(item));
                const formattedPRItems = response.data.prItems.map(item => ({ ...item, image: formatImageUrl(item.image) }));

                if (response.data.imagePositions) {
                  const bPos = response.data.imagePositions.bannerPositions || {};
                  const pPos = response.data.imagePositions.prPositions || {};
                  setBannerPositions(bPos);
                  setPrPositions(pPos);
                  localStorage.setItem('tgBannerPos', JSON.stringify(bPos));
                  localStorage.setItem('tgPrPos', JSON.stringify(pPos));
                }

                setHomeData({
                  announcement: response.data.announcement || 'ยินดีต้อนรับระบบจองห้องปฏิบัติการวิทยาศาสตร์',
                  banners: formattedBanners.length > 0 ? formattedBanners : BANNER_IMAGES,
                  prItems: formattedPRItems.length > 0 ? formattedPRItems : PR_ITEMS
                });
              }
            })
            .withFailureHandler((error) => console.error("Failed to fetch home data:", error))
            .getHomeData();

          google.script.run
            .withSuccessHandler((res) => {
              if (res.success && res.data) {
                setRawBookings(res.data);

                let expandedBookings = [];
                res.data.forEach(b => {
                  const sDate = new Date(b.startDate);
                  const eDate = b.endDate && b.endDate !== '-' ? new Date(b.endDate) : sDate;
                  let curDate = new Date(sDate);

                  while(curDate <= eDate) {
                    const y = curDate.getFullYear();
                    const m = String(curDate.getMonth() + 1).padStart(2, '0');
                    const d = String(curDate.getDate()).padStart(2, '0');

                    expandedBookings.push({
                      id: b.id + '_' + curDate.getTime(),
                      original_id: b.id,
                      createdDate: b.createdDate,
                      date: `${y}-${m}-${d}`,
                      endDate: b.endDate,
                      start_time: b.startTime,
                      end_time: b.endTime,
                      time_col_d: b.timeColD || b.startTime,
                      purpose: b.purpose,
                      priority: b.priority,
                      status: b.status,
                      attachment: b.attachment,
                      note: b.note,
                      reqName: b.reqName,
                      reqPosition: b.reqPosition,
                      reqPhone: b.reqPhone,
                      bookerEmail: b.bookerEmail,
                      isUserBlocked: b.isUserBlocked || false,
                      reqProfileImage: b.reqProfileImage,
                      bookingCode: b.bookingCode,
                      lab: b.lab,
                      room_id: 'r1'
                    });
                    curDate.setDate(curDate.getDate() + 1);
                  }
                });

                expandedBookings.sort((a, b) => {
                  const dateA = new Date(a.date).getTime();
                  const dateB = new Date(b.date).getTime();
                  if (dateA !== dateB) return dateA - dateB;

                  const parseTime = (t) => {
                    if (!t) return 0;
                    const cleaned = t.replace('.', ':');
                    const parts = cleaned.split(':');
                    return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
                  };
                  return parseTime(a.start_time) - parseTime(b.start_time);
                });

                setBookings(expandedBookings);
                if (res.lockedDates) {
                  setLockedDates(res.lockedDates);
                }
              }
            })
            .withFailureHandler((err) => console.error("Failed to fetch bookings:", err))
            .getBookings();

          if (google.script.run.getUsersList) {
             google.script.run
              .withSuccessHandler((res) => {
                if (res && res.success && res.data) {
                  setUsersList(res.data);
                } else {
                  setUsersList(MOCK_USERS);
                }
              })
              .withFailureHandler(() => setUsersList(MOCK_USERS))
              .getUsersList();

             google.script.run
              .withSuccessHandler((res) => {
                if (res && res.success && res.data) {
                  setAdminUsersList(res.data);
                } else {
                  setAdminUsersList(MOCK_USERS);
                }
              })
              .withFailureHandler(() => setAdminUsersList(MOCK_USERS))
              .getAdminUsersList();
          } else {
             setUsersList(MOCK_USERS);
             setAdminUsersList(MOCK_USERS);
          }

        } else {
          setHomeData({
            announcement: 'ยินดีต้อนรับระบบจองห้องปฏิบัติการวิทยาศาสตร์',
            banners: BANNER_IMAGES,
            prItems: PR_ITEMS.map(item => ({ ...item, title: 'ห้องปฏิบัติการวิทยาศาสตร์' }))
          });
          setBookings(INITIAL_BOOKINGS);
          setRawBookings(INITIAL_BOOKINGS.map(b => ({...b, startDate: b.date, endDate: b.date})));
          setUsersList(MOCK_USERS);
          setAdminUsersList(MOCK_USERS);
          setLockedDates([{start: '2026-05-15', end: '2026-05-16'}]);
        }

        setTimeout(() => {
          setRooms(MOCK_ROOMS);
          setIsLoading(false);
        }, 1200);
      };

      useEffect(() => {
        refreshAllData();
      }, []);

      useEffect(() => {
        if(homeData.banners.length === 0) return;
        const slideTimer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % homeData.banners.length);
        }, 5000);
        return () => clearInterval(slideTimer);
      }, [homeData.banners.length]);

      const isAnyOverlayOpen = isModalOpen || isSuccessModalOpen || isAuthModalOpen || isLogoutModalOpen || isAboutModalOpen || isNoteModalOpen || isProfileModalOpen || isSidebarOpen || appAlert.isOpen || isBannerSettingsOpen || isAnnouncementSettingsOpen || isPRSettingsOpen || isUserInfoModalOpen || isLockDateModalOpen || isUserConflictModalOpen || isUserSameDayModalOpen || isShortcutModalOpen;

      useEffect(() => {
        if (isAnyOverlayOpen) {
          document.body.style.overflow = 'hidden';
          document.documentElement.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }

        return () => {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        };
      }, [isAnyOverlayOpen]);

      const isPopupOpen = activeDetailDay !== null || activeUpcomingBooking !== null;

      useEffect(() => {
        const container = mainScrollContainerRef.current;
        if (!container) return;

        const preventDefault = (e) => {
          const isInsidePopover = e.target.closest && (e.target.closest('.calendar-popover') || e.target.closest('.upcoming-popover'));
          if (isInsidePopover) return;
          e.preventDefault();
        };

        const preventDefaultForKeys = (e) => {
          const keys = { 37: 1, 38: 1, 39: 1, 40: 1, 32: 1, 33: 1, 34: 1, 35: 1, 36: 1 };
          if (keys[e.keyCode]) {
            const isInsidePopover = document.activeElement && (document.activeElement.closest('.calendar-popover') || document.activeElement.closest('.upcoming-popover'));
            if (isInsidePopover) return;
            e.preventDefault();
            return false;
          }
        };

        const handleScrollLock = () => {
          if (container.scrollTop !== lockedScrollTopRef.current) {
            container.scrollTop = lockedScrollTopRef.current;
          }
        };

        if (isPopupOpen) {
          lockedScrollTopRef.current = container.scrollTop;

          // Event preventions for smooth scrolling block
          window.addEventListener('wheel', preventDefault, { passive: false });
          window.addEventListener('touchmove', preventDefault, { passive: false });
          window.addEventListener('keydown', preventDefaultForKeys, { passive: false });

          // Scroll event fallback to lock scrollbar dragging
          container.addEventListener('scroll', handleScrollLock, { passive: false });
        }

        return () => {
          window.removeEventListener('wheel', preventDefault, { passive: false });
          window.removeEventListener('touchmove', preventDefault, { passive: false });
          window.removeEventListener('keydown', preventDefaultForKeys, { passive: false });
          if (container) {
            container.removeEventListener('scroll', handleScrollLock);
          }
        };
      }, [isPopupOpen]);

      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
      const monthName = currentDate.toLocaleString('th-TH', { month: 'long' });
      const year = currentDate.getFullYear();
      const displayYear = year + 543;

      const prevMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1));
      const nextMonth = () => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1));

      const handleUpcomingMouseEnter = (e, booking) => {
        if (isUpcomingPersistent) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setUpcomingCoords({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
        setActiveUpcomingBooking(booking);
      };

      const handleUpcomingMouseLeave = () => {
        if (isUpcomingPersistent) return;
        setActiveUpcomingBooking(null);
        setUpcomingCoords(null);
      };

      const handleUpcomingClick = (e, booking) => {
        e.stopPropagation();
        if (activeUpcomingBooking && activeUpcomingBooking.id === booking.id && isUpcomingPersistent) {
          setActiveUpcomingBooking(null);
          setIsUpcomingPersistent(false);
          setUpcomingCoords(null);
        } else {
          const rect = e.currentTarget.getBoundingClientRect();
          setUpcomingCoords({
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
          });
          setActiveUpcomingBooking(booking);
          setIsUpcomingPersistent(true);
        }
      };

      const handleDayClick = (day) => {
        const y = year;
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        setSelectedDateForBooking(`${y}-${m}-${d}`);
        setIsModalOpen(true);
      };

      // --- Admin Edit Functions ---
      const handleSaveAnnouncement = () => {
        setIsSavingAnnouncement(true);
        if (typeof google !== 'undefined' && google.script) {
           google.script.run
             .withSuccessHandler((res) => {
                setIsSavingAnnouncement(false);
                if(res.success) {
                   setHomeData(prev => ({...prev, announcement: tempAnnouncement}));
                   setIsAnnouncementSettingsOpen(false);
                   showAlert('บันทึกประกาศสำเร็จ', 'success');
                } else {
                   showAlert(res.message, 'error');
                }
             })
             .updateHomeAnnouncement(tempAnnouncement);
        } else {
           setTimeout(() => {
              setHomeData(prev => ({...prev, announcement: tempAnnouncement}));
              setIsSavingAnnouncement(false);
              setIsAnnouncementSettingsOpen(false);
           }, 1000);
        }
      };

      const handleAddBanner = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingBanner(true);
        const reader = new FileReader();
        reader.onload = (event) => {
           const base64Data = event.target.result.split(',')[1];
           if (typeof google !== 'undefined' && google.script) {
              google.script.run
                .withSuccessHandler((res) => {
                   setIsUploadingBanner(false);
                   if(res.success) {
                      setHomeData(prev => ({...prev, banners: [...prev.banners, formatImageUrl(res.url)]}));
                      showAlert('เพิ่มแบนเนอร์สำเร็จ', 'success');
                   } else {
                      showAlert(res.message, 'error');
                   }
                   document.getElementById('bannerUpload').value = '';
                })
                .withFailureHandler(() => {
                   setIsUploadingBanner(false);
                   showAlert('อัปโหลดแบนเนอร์ล้มเหลว', 'error');
                   document.getElementById('bannerUpload').value = '';
                })
                .uploadHomeBanner(base64Data, file.type, homeData.banners.length);
           } else {
              setTimeout(() => {
                 setHomeData(prev => ({...prev, banners: [...prev.banners, event.target.result]}));
                 setIsUploadingBanner(false);
                 document.getElementById('bannerUpload').value = '';
              }, 1000);
           }
        };
        reader.readAsDataURL(file);
      };

      const handleDeleteBanner = (index) => {
        const newBanners = [...homeData.banners];
        newBanners.splice(index, 1);
        setHomeData(prev => ({...prev, banners: newBanners}));

        if (typeof google !== 'undefined' && google.script) {
           google.script.run.saveBannersList(newBanners);
        }
      };

      const handleAddPR = () => {
        if (!newPRFile || !newPRTitle) return;
        setIsUploadingPR(true);
        const reader = new FileReader();
        reader.onload = (event) => {
           const base64Data = event.target.result.split(',')[1];
           if (typeof google !== 'undefined' && google.script) {
              google.script.run
                .withSuccessHandler((res) => {
                   setIsUploadingPR(false);
                   if(res.success) {
                      const newItem = { id: 'pr_new_' + Date.now(), title: res.title, image: formatImageUrl(res.url) };
                      setHomeData(prev => ({...prev, prItems: [...prev.prItems, newItem]}));
                      showAlert('เพิ่มบอร์ดประชาสัมพันธ์สำเร็จ', 'success');
                      setNewPRTitle('');
                      setNewPRFile(null);
                      document.getElementById('prUpload').value = '';
                   } else {
                      showAlert(res.message, 'error');
                   }
                })
                .uploadHomePR(base64Data, newPRFile.type, newPRTitle, homeData.prItems.length);
           } else {
              setTimeout(() => {
                 const newItem = { id: 'pr_new_' + Date.now(), title: newPRTitle, image: event.target.result };
                 setHomeData(prev => ({...prev, prItems: [...prev.prItems, newItem]}));
                 setIsUploadingPR(false);
                 setNewPRTitle('');
                 setNewPRFile(null);
              }, 1000);
           }
        };
        reader.readAsDataURL(newPRFile);
      };

      const handleDeletePR = (index) => {
        const newPRs = [...homeData.prItems];
        newPRs.splice(index, 1);
        setHomeData(prev => ({...prev, prItems: newPRs}));

        if (typeof google !== 'undefined' && google.script) {
           google.script.run.savePRList(newPRs);
        }
      };


      const handleEditPRTitle = (index) => {
        if (!editingPRTitle.trim()) return;
        const newPRs = [...homeData.prItems];
        newPRs[index] = { ...newPRs[index], title: editingPRTitle.trim() };
        setHomeData(prev => ({...prev, prItems: newPRs}));
        setEditingPRIndex(null);
        setEditingPRTitle('');
        showAlert('แก้ไขข้อความสำเร็จ', 'success');

        if (typeof google !== 'undefined' && google.script) {
           google.script.run.savePRList(newPRs);
        }
      };

      const handleProfileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setProfilePreview(event.target.result);
            setProfileFile({
              base64: event.target.result.split(',')[1],
              mimeType: file.type
            });
          };
          reader.readAsDataURL(file);
        }
      };

      const handleUpdateProfileImage = (e) => {
        const file = e.target.files[0];
        if (file && currentUser) {
          setIsProfileUpdating(true);
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target.result.split(',')[1];
            const mimeType = file.type;
            const preview = event.target.result;

            setCurrentUser(prev => ({ ...prev, profileImage: preview }));

            if (typeof google !== 'undefined' && google.script) {
              google.script.run
                .withSuccessHandler((res) => {
                  setIsProfileUpdating(false);
                  if(res.success) {
                    setCurrentUser(prev => ({ ...prev, profileImage: formatImageUrl(res.profileUrl) }));
                    showAlert('อัปเดตรูปโปรไฟล์สำเร็จ', 'success', 'สำเร็จ');
                  } else {
                    showAlert(res.message, 'error', 'เกิดข้อผิดพลาด');
                  }
                })
                .withFailureHandler((err) => {
                  setIsProfileUpdating(false);
                  showAlert('การเชื่อมต่อล้มเหลว', 'error');
                })
                .updateUserProfileImage(currentUser.username, base64Data, mimeType);
            } else {
              setTimeout(() => {
                setIsProfileUpdating(false);
                setCurrentUser(prev => ({ ...prev, profileImage: preview }));
                showAlert('จำลองอัปเดตรูปสำเร็จ', 'success', 'สำเร็จ');
              }, 1000);
            }
          };
          reader.readAsDataURL(file);
        }
      };

      const handleAuthSubmit = (e) => {
        e.preventDefault();
        setIsAuthLoading(true);
        const formData = new FormData(e.target);

        if (authMode === 'signup') {
          let inputPhone = formData.get('phone').trim();
          if (inputPhone && !inputPhone.startsWith('0')) {
            inputPhone = '0' + inputPhone;
          }

          const positionValue = formData.get('position');
          if (!positionValue) {
            showAlert('กรุณาเลือกตำแหน่ง', 'error', 'ข้อมูลไม่ครบถ้วน');
            setIsAuthLoading(false);
            return;
          }

          const payload = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            position: positionValue,
            phone: inputPhone,
            email: formData.get('email'),
            username: formData.get('username'),
            password: formData.get('password'),
            profileBase64: profileFile ? profileFile.base64 : null,
            profileMimeType: profileFile ? profileFile.mimeType : null
          };

          if (typeof google !== 'undefined' && google.script) {
            google.script.run
              .withSuccessHandler((response) => {
                setIsAuthLoading(false);
                if (response.success) {
                  showAlert('สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ', 'success');
                  switchAuthMode('login');
                  setProfilePreview(null);
                  setProfileFile(null);
                  setSignupPosition('');
                  e.target.reset();
                } else {
                  showAlert(response.message, 'error', 'ไม่สามารถสมัครได้');
                }
              })
              .withFailureHandler((error) => {
                setIsAuthLoading(false);
                showAlert('การเชื่อมต่อล้มเหลว: ' + (error.message || error), 'error', 'เกิดข้อผิดพลาด');
              })
              .saveUserRegistration(payload);
          } else {
            setTimeout(() => {
              setIsAuthLoading(false);
              showAlert('จำลองการสมัครสมาชิกสำเร็จ กรุณารอการอนุมัติ', 'success');
              setAuthMode('login');
              setProfilePreview(null);
              setProfileFile(null);
              setSignupPosition('');
              e.target.reset();
            }, 1000);
          }
        } else {
          // Login mode
          const usernameOrEmail = formData.get('username');
          const password = formData.get('password');

          if (typeof google !== 'undefined' && google.script) {
            google.script.run
              .withSuccessHandler((res) => {
                setIsAuthLoading(false);
                if (res.success) {
                  const userData = {
                    role: res.role || 'admin', // รับค่าสิทธิ์จากหลังบ้าน
                    full_name: res.fullName || usernameOrEmail,
                    firstName: res.firstName,
                    lastName: res.lastName,
                    username: res.username || usernameOrEmail,
                    position: res.position || 'ผู้ใช้งาน',
                    phone: res.phone,
                    email: res.email,
                    password: res.password,
                    profileImage: formatImageUrl(res.profileImage)
                  };

                  setIsLoggedIn(true);
                  setCurrentUser(userData);

                  localStorage.setItem('tgBookingSession', JSON.stringify(userData));
                  localStorage.setItem('tgBookingSessionTime', Date.now().toString());

                  setIsAuthModalOpen(false);
                  setShowPassword(false);
                  e.target.reset();
                } else {
                  showAlert(res.message || "ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง", 'error', 'เข้าสู่ระบบไม่สำเร็จ');
                }
              })
              .withFailureHandler((err) => {
                setIsAuthLoading(false);
                showAlert("การเชื่อมต่อล้มเหลว: " + err.message, 'error', 'เกิดข้อผิดพลาด');
              })
              .verifyLogin(usernameOrEmail, password);
          } else {
            setTimeout(() => {
              setIsAuthLoading(false);
              const foundUser = usersList.find(u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
              if (foundUser) {
                if (foundUser.isUserBlocked) {
                  showAlert("บัญชีนี้ถูกระงับการใช้งาน หากมีข้อสงสัยกรุณาติดต่อผู้ดูแลระบบ", 'error', 'เข้าสู่ระบบไม่สำเร็จ');
                  return;
                }
                if (!foundUser.isApproved) {
                  showAlert("บัญชีของคุณยังไม่ได้รับการอนุมัติ กรุณารอผู้ดูแลระบบอนุมัติการใช้งาน", 'error', 'เข้าสู่ระบบไม่สำเร็จ');
                  return;
                }

                setIsLoggedIn(true);
                setCurrentUser(foundUser);

                localStorage.setItem('tgBookingSession', JSON.stringify(foundUser));
                localStorage.setItem('tgBookingSessionTime', Date.now().toString());

                setIsAuthModalOpen(false);
                setShowPassword(false);
                e.target.reset();
              } else {
                showAlert("ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง", 'error', 'เข้าสู่ระบบไม่สำเร็จ');
              }
            }, 1000);
          }
        }
      };

      // ฟังก์ชันจัดการออกจากระบบ (รองรับทั้งแบบกดเองและตัดอัตโนมัติ)
      const handleLogoutAction = (isAuto = false) => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setIsLogoutModalOpen(false);
        localStorage.removeItem('tgBookingSession');
        localStorage.removeItem('tgBookingSessionTime');

        if (isAuto === true) {
          showAlert("ไม่มีการใช้งานเกิน 15 นาที\nระบบได้ทำการออกจากระบบอัตโนมัติ", 'error', 'เซสชันหมดอายุ');
        }
      };

      const handleLogoutConfirm = () => {
        handleLogoutAction(false);
      };

      const handleBookingSubmit = (e) => {
        e.preventDefault();
        setIsBookingLoading(true);
        const form = e.target;
        const formData = new FormData(form);

        const startDateStr = formData.get('date');
        const endDateStr = formData.get('end_date');
        const priority = formData.get('priority');
        const lab = formData.get('lab');
        const purpose = formData.get('purpose');
        const file = formData.get('attachment');
        const guestName = formData.get('guestName');
        const guestPhone = formData.get('guestPhone');

        const payloadStartTime = PERIOD_RANGES[startPeriod] || '08.00-08.40';
        const payloadEndTime = endPeriod && endPeriod !== startPeriod ? (PERIOD_RANGES[endPeriod] || '') : '';

        const startParts = payloadStartTime.split('-');
        const localStartTime = startParts[0];
        const localEndTime = payloadEndTime ? payloadEndTime.split('-')[1] : startParts[1];
        const localDisplayTime = `${localStartTime}-${localEndTime}`;

        const startDate = new Date(startDateStr);
        let datesToBook = [];

        if (endDateStr) {
          const endDate = new Date(endDateStr);
          if (endDate < startDate) {
            setIsBookingLoading(false);
            showAlert("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น", 'error', 'ข้อมูลไม่ถูกต้อง');
            return;
          }
          let currentDateObj = new Date(startDate);
          while (currentDateObj <= endDate) {
            const y = currentDateObj.getFullYear();
            const m = String(currentDateObj.getMonth() + 1).padStart(2, '0');
            const d = String(currentDateObj.getDate()).padStart(2, '0');
            datesToBook.push(`${y}-${m}-${d}`);
            currentDateObj.setDate(currentDateObj.getDate() + 1);
          }
        } else {
          datesToBook.push(startDateStr);
        }

        for (let i = 0; i < datesToBook.length; i++) {
          if (isDateLocked(datesToBook[i])) {
            setIsBookingLoading(false);
            showAlert(`ไม่สามารถจองได้ เนื่องจากวันที่ ${new Date(datesToBook[i]).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric'})} ถูกล็อกการใช้งาน`, 'error');
            return;
          }
        }

        // --- New: ตรวจสอบการจองซ้ำซ้อน (User Side) ---
        const parseTimeLoc = (t) => {
          if (!t) return 0;
          const cleaned = t.replace('.', ':');
          const parts = cleaned.split(':');
          return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        };

        const parseDate = (dStr) => {
          if (!dStr || dStr === '-') return 0;
          if (dStr.includes('/')) {
             const [dd, mm, yyyy] = dStr.split('/');
             return new Date(`${yyyy}-${mm}-${dd}`).getTime();
          }
          return new Date(dStr).getTime();
        };

        const tDateStart = parseDate(startDateStr);
        const tDateEnd = endDateStr ? parseDate(endDateStr) : tDateStart;
        const tStart = parseTimeLoc(localStartTime);
        const tEnd = parseTimeLoc(localEndTime || '23:59');

        let conflictErrors = [];
        let sameDayNotices = [];

        rawBookings.forEach(b => {
          if (b.status === 'confirmed' && b.lab === lab) {
            const bDateStart = parseDate(b.startDate);
            const bDateEnd = b.endDate && b.endDate !== '-' ? parseDate(b.endDate) : bDateStart;

            // ตรวจสอบว่าวันที่ทับซ้อนกันหรือไม่
            if (tDateStart <= bDateEnd && tDateEnd >= bDateStart) {
              const bStart = parseTimeLoc(b.startTime);
              const bEnd = parseTimeLoc(b.endTime || '23:59');

              // ตรวจสอบว่าเวลาทับซ้อนกันหรือไม่
              if (tStart < bEnd && tEnd > bStart) {
                conflictErrors.push(b);
              } else {
                sameDayNotices.push(b);
              }
            }
          }
        });

        const submitToBackend = (fileData) => {
          const payload = {
            priority: priority,
            lab: lab,
            startDate: startDateStr,
            endDate: endDateStr || '-',
            startTime: payloadStartTime,
            endTime: payloadEndTime,
            purpose: purpose,
            // ส่งข้อมูลจาก Session ปัจจุบันไปให้หลังบ้านบันทึกอัตโนมัติ
            loginUsername: currentUser?.username,
            reqName: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser?.username || ''),
            position: currentUser?.position || '',
            reqPhone: currentUser?.phone || '',
            email: currentUser?.email || '',
            profileImage: currentUser?.profileImage || '',
            ...fileData
          };

          if (typeof google !== 'undefined' && google.script) {
            google.script.run
              .withSuccessHandler((res) => {
                setIsBookingLoading(false);
                if (res.success) {
                  setLatestBookingCode(res.bookingCode || '-');
                  
                  const bookingDetails = {
                    bookingCode: res.bookingCode || '-',
                    priority: priority,
                    labRoom: lab,
                    username: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser?.username || 'Guest'),
                    weekday: getThaiWeekdaysAbbr(startDateStr, endDateStr),
                    date: startDateStr,
                    endDate: endDateStr || '-',
                    startTime: localStartTime,
                    endTime: localEndTime || '-',
                    purpose: purpose
                  };
                  setCreatedBookingDetails(bookingDetails);

                  const baseBooking = {
                    user_id: 'guest',
                    reqName: payload.reqName,
                    reqPhone: payload.reqPhone,
                    start_time: localStartTime,
                    end_time: localEndTime,
                    time_col_d: localDisplayTime,
                    purpose: purpose,
                    priority: priority,
                    lab: lab,
                    attachment: file && file.size > 0 ? file.name : null,
                    status: 'pending',
                    statusText: 'รออนุมัติ',
                    bookingCode: res.bookingCode || '-'
                  };
                  const newBookings = datesToBook.map((dateStr, index) => ({
                    ...baseBooking,
                    id: `b${Date.now()}_${index}`,
                    date: dateStr
                  }));
                  setBookings(prev => [...prev, ...newBookings]);

                  setRawBookings(prev => [...prev, {
                     id: `b${Date.now()}`,
                     startDate: startDateStr,
                     endDate: endDateStr || '-',
                     startTime: localStartTime,
                     endTime: localEndTime,
                     purpose: purpose,
                     priority: priority,
                     lab: lab,
                     status: 'pending',
                     statusText: 'รออนุมัติ',
                     reqName: payload.reqName,
                     reqPhone: payload.reqPhone,
                     bookerEmail: currentUser?.email,
                     bookingCode: res.bookingCode || '-'
                  }]);

                  setIsModalOpen(false);
                  setIsSuccessModalOpen(true);
                  setStartPeriod('คาบ 1');
                  setEndPeriod('');
                  setBookingLab('ห้องชีววิทยา อาคาร 13');
                  form.reset();

                  // ส่งรูปภาพและรายละเอียดการจองไปยัง Google Chat แบบอัตโนมัติ
                  generateBookingPaperBase64(bookingDetails, (receiptBase64) => {
                    google.script.run
                      .withSuccessHandler((notifyRes) => console.log('Google Chat notification status:', notifyRes))
                      .withFailureHandler((err) => console.error('Failed to send Google Chat notification:', err))
                      .uploadReceiptAndSendGoogleChat(res.bookingCode, receiptBase64 || null, bookingDetails);
                  });
                } else {
                  showAlert(res.message, 'error', 'บันทึกไม่สำเร็จ');
                }
              })
              .withFailureHandler((err) => {
                setIsBookingLoading(false);
                showAlert("การเชื่อมต่อล้มเหลว: " + (err.message || err), 'error', 'เกิดข้อผิดพลาด');
              })
              .saveBooking(payload);
          } else {
            setTimeout(() => {
              setIsBookingLoading(false);
              const mockCode = `SCL${new Date().getMonth() + 1}${new Date().getFullYear()}01`;
              setLatestBookingCode(mockCode);

              const mockBookingDetails = {
                bookingCode: mockCode,
                priority: priority,
                labRoom: lab,
                username: currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : (currentUser?.username || 'Guest'),
                weekday: getThaiWeekdaysAbbr(startDateStr, endDateStr),
                date: startDateStr,
                endDate: endDateStr || '-',
                startTime: localStartTime,
                endTime: localEndTime || '-',
                purpose: purpose
              };
              setCreatedBookingDetails(mockBookingDetails);

              const baseBooking = {
                user_id: 'guest',
                reqName: payload.reqName,
                reqPhone: payload.reqPhone,
                start_time: localStartTime,
                end_time: localEndTime,
                time_col_d: localDisplayTime,
                purpose: purpose,
                priority: priority,
                lab: lab,
                attachment: file && file.size > 0 ? file.name : null,
                status: 'pending',
                statusText: 'รออนุมัติ',
                bookingCode: mockCode
              };
              const newBookings = datesToBook.map((dateStr, index) => ({
                ...baseBooking,
                id: `b${Date.now()}_${index}`,
                date: dateStr
              }));
              setBookings(prev => [...prev, ...newBookings]);

              setRawBookings(prev => [...prev, {
                 id: `b${Date.now()}`,
                 startDate: startDateStr,
                 endDate: endDateStr || '-',
                 startTime: localStartTime,
                 endTime: localEndTime,
                 purpose: purpose,
                 priority: priority,
                 lab: lab,
                 status: 'pending',
                 statusText: 'รออนุมัติ',
                 reqName: payload.reqName,
                 reqPhone: payload.reqPhone,
                 bookerEmail: currentUser?.email,
                 bookingCode: mockCode
              }]);

              setIsModalOpen(false);
              setIsSuccessModalOpen(true);
              setStartPeriod('คาบ 1');
              setEndPeriod('');
              setBookingLab('ห้องชีววิทยา อาคาร 13');
              form.reset();
            }, 1000);
          }
        };

        const doSubmit = () => {
          setIsBookingLoading(true);
          if (file && file.size > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const base64Data = event.target.result.split(',')[1];
              submitToBackend({
                fileBase64: base64Data,
                mimeType: file.type,
                fileName: file.name
              });
            };
            reader.readAsDataURL(file);
          } else {
            submitToBackend({});
          }
        };

        if (conflictErrors.length > 0) {
          setIsBookingLoading(false);
          setUserConflictBookings(conflictErrors);
          setIsUserConflictModalOpen(true);
          return;
        }

        if (sameDayNotices.length > 0) {
          setIsBookingLoading(false);
          setUserSameDayBookings(sameDayNotices);
          setPendingBookingData(() => doSubmit);
          setIsUserSameDayModalOpen(true);
          return;
        }

        doSubmit();
      };

      const getPriorityColor = (priority) => {
        if (priority && priority.includes('คาบ')) {
          return 'bg-blue-100 text-blue-700 border border-blue-200 font-bold';
        }
        switch(priority) {
          case 'สำคัญ': return 'bg-rose-100 text-rose-700';
          case 'ปานกลาง': return 'bg-orange-100 text-orange-700';
          case 'ปกติ': default: return 'bg-blue-100 text-blue-700 border border-blue-200';
        }
      };

      const getPriorityDotColor = (priority) => {
        if (priority && priority.includes('คาบ')) {
          return 'bg-blue-500';
        }
        switch(priority) {
          case 'สำคัญ': return 'bg-rose-500';
          case 'ปานกลาง': return 'bg-orange-500';
          case 'ปกติ': default: return 'bg-blue-500';
        }
      };

      const getLabDotColor = (labName) => {
        if (!labName) return 'bg-slate-400';
        const room = labName.toString().trim();
        if (room.includes('ห้องชีววิทยา') || room.includes('ชีววิทยา')) return 'bg-green-500';
        if (room.includes('ห้องเคมี') || room.includes('เคมี')) return 'bg-purple-600';
        if (room.includes('ห้องวิทย์') || room.includes('ห้องห้องวิทย์') || room.includes('อาคาร 17')) return 'bg-red-500';
        if (room.includes('VisualLab') || room.includes('อาคาร 19') || room.includes('Visual Lab') || room.includes('VisualLab')) return 'bg-blue-600';
        return 'bg-slate-400';
      };

      const formatLabRoom = (labRoom) => {
        if (!labRoom) return '-';
        return labRoom.toString().replace(/\s*อาคาร\s*\d+/g, '').trim();
      };

      const getBookingsForDay = (day) => {
        const y = year;
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;
        // กรองแสดงเฉพาะรายการที่ได้รับการอนุมัติ (status === 'confirmed')
        return bookings.filter(b => b.date === dateStr && b.status === 'confirmed');
      };

      // ฟังก์ชันตรวจสอบการทับซ้อนของเวลาจอง
      const checkBookingConflict = (targetBooking) => {
        const conflicts = [];
        const parseTime = (t) => {
          if (!t) return 0;
          const cleaned = t.replace('.', ':');
          const parts = cleaned.split(':');
          return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
        };

        const tStart = parseTime(targetBooking.startTime);
        const tEnd = parseTime(targetBooking.endTime || '23:59');

        const parseDate = (dStr) => {
          if (!dStr || dStr === '-') return 0;
          // แปลงวันที่ให้อยู่ในรูปแบบ Date Object (อ้างอิงจาก YYYY-MM-DD หรือ DD/MM/YYYY)
          if (dStr.includes('/')) {
             const [dd, mm, yyyy] = dStr.split('/');
             return new Date(`${yyyy}-${mm}-${dd}`).getTime();
          }
          return new Date(dStr).getTime();
        };

        const tDateStart = parseDate(targetBooking.startDate);
        const tDateEnd = targetBooking.endDate && targetBooking.endDate !== '-' ? parseDate(targetBooking.endDate) : tDateStart;

        rawBookings.forEach(b => {
          // ตรวจสอบเฉพาะรายการที่ "อนุมัติแล้ว" และไม่ใช่ตัวมันเอง และอยู่ในห้องปฏิบัติการเดียวกัน
          if (b.status === 'confirmed' && b.original_id !== targetBooking.original_id && b.lab === targetBooking.lab) {
            const bDateStart = parseDate(b.startDate);
            const bDateEnd = b.endDate && b.endDate !== '-' ? parseDate(b.endDate) : bDateStart;

            // ตรวจสอบว่าวันที่ทับซ้อนกันหรือไม่ (StartA <= EndB AND EndA >= StartB)
            if (tDateStart <= bDateEnd && tDateEnd >= bDateStart) {
              // ตรวจสอบเวลาว่าทับซ้อนกันหรือไม่
              const bStart = parseTime(b.startTime);
              const bEnd = parseTime(b.endTime || '23:59');

              // เงื่อนไขเวลาทับซ้อน: เวลาเริ่มเรา < เวลาจบเขา AND เวลาจบเรา > เวลาเริ่มเขา
              if (tStart < bEnd && tEnd > bStart) {
                conflicts.push(b);
              }
            }
          }
        });
        return conflicts;
      };

      const confirmApproveAction = (force = false) => {
        // หากเป็นการกดอนุมัติ (และไม่ได้กดแบบบังคับอนุมัติข้ามการเตือน) ให้เช็คการทับซ้อนก่อน
        if (approveActionData.action === 'approve' && !force) {
          const targetBooking = rawBookings.find(b => b.original_id === approveActionData.id);
          if (targetBooking) {
            const conflicts = checkBookingConflict(targetBooking);
            if (conflicts.length > 0) {
              setConflictBookings(conflicts);
              setIsApproveModalOpen(false); // ปิดหน้าต่างยืนยันปกติ
              setIsConflictModalOpen(true); // เปิดหน้าต่างแจ้งเตือนซ้ำซ้อน
              return; // หยุดการทำงาน ไม่ส่งไปหลังบ้าน
            }
          }
        }

        setIsUpdatingStatus(true);
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setIsUpdatingStatus(false);
              if (res.success) {
                const newStatusText = approveActionData.action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ';
                const updateLocal = (list) => list.map(b =>
                  b.original_id === approveActionData.id ? { ...b, status: res.newStatus, statusText: newStatusText } : b
                );
                setRawBookings(updateLocal(rawBookings));
                setBookings(updateLocal(bookings));

                setIsApproveModalOpen(false);
                setIsConflictModalOpen(false);

                if (approveActionData.action === 'approve') {
                  const approvedItem = rawBookings.find(b => b.original_id === approveActionData.id);
                  setJustApprovedBooking(approvedItem);
                  setIsApproveSuccessModalOpen(true);
                } else {
                  showAlert(`เปลี่ยนสถานะเป็น ไม่อนุมัติ สำเร็จ`, 'success');
                }
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setIsUpdatingStatus(false);
              showAlert(err.message, 'error');
            })
            .updateBookingStatus(approveActionData.id, approveActionData.action);
        } else {
          setTimeout(() => {
            const newStatus = approveActionData.action === 'approve' ? 'confirmed' : 'rejected';
            const newStatusText = approveActionData.action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ';
            const updateLocal = (list) => list.map(b =>
              b.original_id === approveActionData.id ? { ...b, status: newStatus, statusText: newStatusText } : b
            );
            setRawBookings(updateLocal(rawBookings));
            setBookings(updateLocal(bookings));
            setIsUpdatingStatus(false);

            setIsApproveModalOpen(false);
            setIsConflictModalOpen(false);

            if (approveActionData.action === 'approve') {
              const approvedItem = rawBookings.find(b => b.original_id === approveActionData.id);
              setJustApprovedBooking(approvedItem);
              setIsApproveSuccessModalOpen(true);
            } else {
              showAlert(`จำลองเปลี่ยนสถานะเป็น ไม่อนุมัติ สำเร็จ`, 'success');
            }
          }, 1000);
        }
      };

      const handleToggleBlockStatus = (email, currentBlockedStatus) => {
        if (!email || email === '-') {
          showAlert("ไม่มีข้อมูลอีเมลสำหรับผู้ใช้งานนี้", 'error');
          return;
        }
        setBlockingUserEmail(email);
        const newBlockStatus = !currentBlockedStatus;
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setBlockingUserEmail(null);
              if (res.success) {
                const updateLocal = (list) => list.map(b =>
                  b.bookerEmail === email ? { ...b, isUserBlocked: newBlockStatus } : b
                );
                const updateLocalUsers = (list) => list.map(u =>
                  u.email === email ? { ...u, isUserBlocked: newBlockStatus } : u
                );
                setRawBookings(updateLocal(rawBookings));
                setBookings(updateLocal(bookings));
                setUsersList(updateLocalUsers(usersList));
                showAlert(res.message, 'success');
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setBlockingUserEmail(null);
              showAlert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            })
            .toggleUserBlockStatus(email, newBlockStatus);
        } else {
          setTimeout(() => {
            setBlockingUserEmail(null);
            const updateLocal = (list) => list.map(b =>
              b.bookerEmail === email ? { ...b, isUserBlocked: newBlockStatus } : b
            );
            const updateLocalUsers = (list) => list.map(u =>
              u.email === email ? { ...u, isUserBlocked: newBlockStatus } : u
            );
            setRawBookings(updateLocal(rawBookings));
            setBookings(updateLocal(bookings));
            setUsersList(updateLocalUsers(usersList));
            showAlert(`จำลองเปลี่ยนสถานะบล็อกเป็น ${newBlockStatus} สำเร็จ`, 'success');
          }, 1000);
        }
      };

      const handleToggleUserApproval = (email, currentApprovedStatus) => {
        if (!email || email === '-') {
          showAlert("ไม่มีข้อมูลอีเมลสำหรับผู้ใช้งานนี้", 'error');
          return;
        }
        setApprovingUserEmail(email);
        const newApprovedStatus = !currentApprovedStatus;
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setApprovingUserEmail(null);
              if (res.success) {
                setUsersList(prev => prev.map(u =>
                  u.email === email ? { ...u, isApproved: newApprovedStatus } : u
                ));
                showAlert(res.message, 'success');
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setApprovingUserEmail(null);
              showAlert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            })
            .toggleUserApprovalStatus(email, newApprovedStatus);
        } else {
          setTimeout(() => {
            setApprovingUserEmail(null);
            setUsersList(prev => prev.map(u =>
              u.email === email ? { ...u, isApproved: newApprovedStatus } : u
            ));
            showAlert(`จำลองการตั้งสถานะ ${newApprovedStatus ? 'อนุมัติแล้ว' : 'รออนุมัติ'} สำเร็จ`, 'success');
          }, 1000);
        }
      };

      const handleSaveNote = () => {
        if (!editingNoteId) return;
        setIsSavingNote(true);

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setIsSavingNote(false);
              if (res.success) {
                const updateLocal = (list) => list.map(b =>
                  b.original_id === editingNoteId ? { ...b, note: noteInputValue } : b
                );
                setRawBookings(updateLocal(rawBookings));
                setBookings(updateLocal(bookings));
                setIsNoteModalOpen(false);
                showAlert("บันทึกข้อความแจ้งเตือนสำเร็จ", "success");
              } else {
                showAlert(res.message, "error");
              }
            })
            .withFailureHandler((err) => {
              setIsSavingNote(false);
              showAlert(err.message, "error");
            })
            .updateBookingNote(editingNoteId, noteInputValue);
        } else {
          setTimeout(() => {
            const updateLocal = (list) => list.map(b =>
              b.original_id === editingNoteId ? { ...b, note: noteInputValue } : b
            );
            setRawBookings(updateLocal(rawBookings));
            setBookings(updateLocal(bookings));
            setIsSavingNote(false);
            setIsNoteModalOpen(false);
            showAlert("จำลองการบันทึกข้อความแจ้งเตือนสำเร็จ", "success");
          }, 1000);
        }
      };

      const handleLockDateSubmit = (e) => {
        e.preventDefault();
        setIsLockingDate(true);
        const formData = new FormData(e.target);
        const start = formData.get('lockStartDate');
        const end = formData.get('lockEndDate') || start;

        if (new Date(end) < new Date(start)) {
          setIsLockingDate(false);
          showAlert("วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น", "error");
          return;
        }

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setIsLockingDate(false);
              if (res.success) {
                setLockedDates(prev => [...prev, { start, end }]);
                showAlert("ปิดใช้งานวันจองสำเร็จ", "success");
                e.target.reset();
              } else {
                showAlert(res.message, "error");
              }
            })
            .withFailureHandler((err) => {
              setIsLockingDate(false);
              showAlert(err.message, "error");
            })
            .saveLockedDates({ start, end });
        } else {
          setTimeout(() => {
            setLockedDates(prev => [...prev, { start, end }]);
            setIsLockingDate(false);
            showAlert("จำลองการปิดใช้งานวันจองสำเร็จ", "success");
            e.target.reset();
          }, 1000);
        }
      };

      const handleUnlockDate = (indexToRemove, startDate, endDate) => {
        setIsLockingDate(true);
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setIsLockingDate(false);
              if (res.success) {
                setLockedDates(prev => prev.filter((_, i) => i !== indexToRemove));
                showAlert("ปลดล็อกวันจองสำเร็จ", "success");
              } else {
                showAlert(res.message, "error");
              }
            })
            .withFailureHandler((err) => {
              setIsLockingDate(false);
              showAlert(err.message, "error");
            })
            .removeLockedDate(startDate, endDate);
        } else {
          setTimeout(() => {
            setLockedDates(prev => prev.filter((_, i) => i !== indexToRemove));
            setIsLockingDate(false);
            showAlert("จำลองการปลดล็อกวันจองสำเร็จ", "success");
          }, 1000);
        }
      };

      const handleUserEdit = (userId, field, value) => {
        setUserEdits(prev => {
          const currentUserEdit = prev[userId] || {};
          const originalUser = usersList.find(u => u.id === userId);
          if (!originalUser) return prev;

          let newEdit = { ...currentUserEdit, [field]: value };

          const isUNameDirty = newEdit.username !== undefined && newEdit.username !== originalUser.username;
          const isPassDirty = newEdit.password !== undefined && newEdit.password !== originalUser.password;
          newEdit.isDirty = isUNameDirty || isPassDirty;

          return { ...prev, [userId]: newEdit };
        });
      };

      const saveUserEdit = (userId) => {
        const editData = userEdits[userId];
        const originalUser = usersList.find(u => u.id === userId);
        if (!editData || !originalUser) return;

        const newUsername = editData.username !== undefined ? editData.username : originalUser.username;
        const newPassword = editData.password !== undefined ? editData.password : originalUser.password;

        setUserEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: true } }));

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              if (res.success) {
                setUsersList(prevList => prevList.map(u =>
                  u.id === userId ? { ...u, username: newUsername, password: newPassword } : u
                ));
                setUserEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false, isDirty: false } }));
                showAlert('อัปเดตข้อมูลสำเร็จ', 'success');
              } else {
                setUserEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false } }));
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setUserEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false } }));
              showAlert(err.message, 'error');
            })
            .updateUserCredentials(userId, newUsername, newPassword);
        } else {
           setTimeout(() => {
              setUsersList(prevList => prevList.map(u =>
                u.id === userId ? { ...u, username: newUsername, password: newPassword } : u
              ));
              setUserEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false, isDirty: false } }));
              showAlert('จำลองการอัปเดตข้อมูลสำเร็จ', 'success');
           }, 1000);
        }
      };

      useEffect(() => {
        if (currentView === 'queue') setCurrentPage(1);
        if (currentView === 'users') {
           setUserCurrentPage(1);
           setAdminCurrentPage(1);
        }
      }, [currentView, searchBookingCode, filterBookingDate, sortBookingOrder, searchUser, searchAdmin]);

      const upcomingBookings = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const localTodayStr = `${y}-${m}-${d}`;

        return bookings
          .filter(b => {
            if (b.status !== 'confirmed') return false;
            return b.date >= localTodayStr;
          })
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateA - dateB;
            const parseTime = (timeStr) => {
              if (!timeStr) return 0;
              const cleaned = timeStr.replace('.', ':');
              const parts = cleaned.split(':');
              return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
            };
            return parseTime(a.start_time) - parseTime(b.start_time);
          });
      }, [bookings]);

      const todayNotifications = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        const localTodayStr = `${y}-${m}-${d}`;

        return bookings.filter(b => b.status === 'confirmed' && b.date === localTodayStr);
      }, [bookings]);
      const hasNotifications = todayNotifications.length > 0;

      const dynamicChartData = useMemo(() => {
        const confirmed = bookings.filter(b => b.status === 'confirmed');
        const now = new Date();
        const currYear = now.getFullYear();
        const currMonth = now.getMonth();

        const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        const weekCounts = [0, 0, 0, 0, 0, 0, 0];
        const sunday = new Date(now);
        sunday.setDate(now.getDate() - now.getDay());
        sunday.setHours(0,0,0,0);

        const monthLabels = ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4', 'สัปดาห์ 5'];
        const monthCounts = [0, 0, 0, 0, 0];

        const yearLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
        const yearCounts = Array(12).fill(0);

        confirmed.forEach(b => {
          const bDate = new Date(b.date);
          if (isNaN(bDate)) return;

          const diffTime = bDate - sunday;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < 7) weekCounts[diffDays]++;

          if (bDate.getFullYear() === currYear && bDate.getMonth() === currMonth) {
            const weekNum = Math.floor((bDate.getDate() - 1) / 7);
            if (weekNum >= 0 && weekNum < 5) monthCounts[weekNum]++;
          }

          if (bDate.getFullYear() === currYear) yearCounts[bDate.getMonth()]++;
        });

        let finalMonthData = monthLabels.map((label, i) => ({ label, value: monthCounts[i] }));
        if (finalMonthData[4].value === 0) finalMonthData.pop();

        return {
          week: weekDays.map((label, i) => ({ label, value: weekCounts[i] })),
          month: finalMonthData,
          year: yearLabels.map((label, i) => ({ label, value: yearCounts[i] }))
        };
      }, [bookings]);

      const labsChartData = useMemo(() => {
        const confirmed = bookings.filter(b => b.status === 'confirmed');
        const now = new Date();
        const currYear = now.getFullYear();
        const currMonth = now.getMonth();

        const labs = ['ห้องชีววิทยา อาคาร 13', 'ห้องเคมี อาคาร 13', 'ห้องวิทย์ อาคาร 17', 'Visual Lab อาคาร 19'];

        const sunday = new Date(now);
        sunday.setDate(now.getDate() - now.getDay());
        sunday.setHours(0,0,0,0);

        const countsMap = {};
        labs.forEach(lab => {
          countsMap[lab] = {
            week: Array(7).fill(0),
            month: Array(5).fill(0),
            year: Array(12).fill(0)
          };
        });

        confirmed.forEach(b => {
          const bDate = new Date(b.date);
          if (isNaN(bDate.getTime())) return;

          const labName = b.lab || '';
          let matchedLab = labs.find(l => labName.includes(l) || l.includes(labName));
          if (!matchedLab) {
            if (labName.includes('ชีววิทยา')) matchedLab = 'ห้องชีววิทยา อาคาร 13';
            else if (labName.includes('เคมี')) matchedLab = 'ห้องเคมี อาคาร 13';
            else if (labName.includes('วิทย์') || labName.includes('อาคาร 17')) matchedLab = 'ห้องวิทย์ อาคาร 17';
            else if (labName.includes('Visual') || labName.includes('อาคาร 19')) matchedLab = 'Visual Lab อาคาร 19';
          }

          if (matchedLab && countsMap[matchedLab]) {
            const diffTime = bDate - sunday;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays >= 0 && diffDays < 7) {
              countsMap[matchedLab].week[diffDays]++;
            }

            if (bDate.getFullYear() === currYear && bDate.getMonth() === currMonth) {
              const weekNum = Math.floor((bDate.getDate() - 1) / 7);
              if (weekNum >= 0 && weekNum < 5) {
                countsMap[matchedLab].month[weekNum]++;
              }
            }

            if (bDate.getFullYear() === currYear) {
              countsMap[matchedLab].year[bDate.getMonth()]++;
            }
          }
        });

        const weekLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
        const monthLabels = ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4', 'สัปดาห์ 5'];
        const yearLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

        return {
          week: {
            labels: weekLabels,
            datasets: labs.map(lab => ({
              lab: lab,
              data: countsMap[lab].week
            }))
          },
          month: {
            labels: monthLabels,
            datasets: labs.map(lab => ({
              lab: lab,
              data: countsMap[lab].month
            }))
          },
          year: {
            labels: yearLabels,
            datasets: labs.map(lab => ({
              lab: lab,
              data: countsMap[lab].year
            }))
          }
        };
      }, [bookings]);

      const labsTotalChartData = useMemo(() => {
        const getTotals = (filterKey) => {
          const data = labsChartData[filterKey];
          return data.datasets.map(dataset => {
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            return {
              lab: dataset.lab,
              value: total
            };
          });
        };
        return {
          week: getTotals('week'),
          month: getTotals('month'),
          year: getTotals('year')
        };
      }, [labsChartData]);

      const counts = useMemo(() => {
        let approved = 0;
        let pending = 0;
        let rejected = 0;
        rawBookings.forEach(b => {
          if (b.status === 'confirmed') approved++;
          else if (b.status === 'rejected') rejected++;
          else pending++;
        });
        return { approved, pending, rejected };
      }, [rawBookings]);

      const myBookingsList = useMemo(() => {
        let list = [...rawBookings];

        // 1. Filter by Status Clicked on Top Widget
        if (bookingsStatusFilter !== 'all') {
          list = list.filter(b => {
            if (bookingsStatusFilter === 'confirmed') return b.status === 'confirmed';
            if (bookingsStatusFilter === 'rejected') return b.status === 'rejected';
            if (bookingsStatusFilter === 'pending') return b.status === 'pending' || !b.status || b.status === '';
            return true;
          });
        }

        // 2. Filter by Search Text
        if (searchBookingText) {
          const query = searchBookingText.toLowerCase();
          list = list.filter(b => {
            const safeLower = (val) => val ? String(val).toLowerCase() : '';
            const startDateStr = formatDisplayDate(b.startDate || b.date) || '';
            const endDateStr = formatDisplayDate(b.endDate && b.endDate !== '-' ? b.endDate : (b.startDate || b.date)) || '';
            const dateObj = new Date(b.startDate || b.date);
            const weekdayStr = b.dayOfUse || dateObj.toLocaleDateString('th-TH', { weekday: 'long' }).replace('วัน', '') || '';

            return (
              safeLower(b.bookingCode).includes(query) ||
              safeLower(b.reqName).includes(query) ||
              safeLower(b.priority).includes(query) ||
              safeLower(b.lab).includes(query) ||
              safeLower(b.purpose).includes(query) ||
              safeLower(b.note).includes(query) ||
              safeLower(startDateStr).includes(query) ||
              safeLower(endDateStr).includes(query) ||
              safeLower(weekdayStr).includes(query)
            );
          });
        }

        list.sort((a, b) => {
          const parseDateStr = (dateStr) => {
            if (!dateStr) return 0;
            // Check if it's DD/MM/YYYY
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime();
            }
            // Check if it's YYYY-MM-DD
            const partsDash = dateStr.split('-');
            if (partsDash.length === 3) {
               return new Date(dateStr).getTime();
            }
            const t = new Date(dateStr).getTime();
            return isNaN(t) ? 0 : t;
          };

          const getFallbackId = (id) => {
            if (!id) return 0;
            const match = String(id).match(/\d+/);
            return match ? parseInt(match[0], 10) : 0;
          };

          const timeA = parseDateStr(a.createdDate) || parseDateStr(a.date) || getFallbackId(a.original_id);
          const timeB = parseDateStr(b.createdDate) || parseDateStr(b.date) || getFallbackId(b.original_id);

          if (myBookingsSortOrder === 'newest') {
            return timeB - timeA;
          } else {
            return timeA - timeB;
          }
        });

        return list;
      }, [rawBookings, bookingsStatusFilter, searchBookingText, myBookingsSortOrder]);

      const filteredAndSortedBookings = useMemo(() => {
        let result = [...rawBookings];

        if (filterBookingStatus !== 'all') {
          result = result.filter(b => b.status === filterBookingStatus);
        }

        if (searchBookingCode) {
          const query = searchBookingCode.toLowerCase();
          result = result.filter(b => {
            const safeLower = (val) => val ? String(val).toLowerCase() : '';
            return (
              safeLower(b.bookingCode).includes(query) ||
              safeLower(b.reqName).includes(query) ||
              safeLower(b.reqPosition).includes(query) ||
              safeLower(b.reqPhone).includes(query) ||
              safeLower(b.bookerEmail).includes(query) ||
              safeLower(b.purpose).includes(query) ||
              safeLower(b.createdDate).includes(query) ||
              safeLower(b.date).includes(query) ||
              safeLower(b.startDate).includes(query) ||
              safeLower(b.priority).includes(query) ||
              safeLower(b.statusText || '').includes(query)
            );
          });
        }

        if (filterBookingDate) {
          const filterDateObj = new Date(filterBookingDate);
          filterDateObj.setHours(0,0,0,0);

          result = result.filter(b => {
            if(!b.startDate) return false;
            const sDate = new Date(b.startDate); sDate.setHours(0,0,0,0);
            const eDate = (b.endDate && b.endDate !== '-') ? new Date(b.endDate) : new Date(b.startDate); eDate.setHours(0,0,0,0);
            return filterDateObj >= sDate && filterDateObj <= eDate;
          });
        }

        result.sort((a, b) => {
          const codeA = a.bookingCode && a.bookingCode !== '-' ? a.bookingCode : '';
          const codeB = b.bookingCode && b.bookingCode !== '-' ? b.bookingCode : '';

          if (!codeA && codeB) return 1;
          if (codeA && !codeB) return -1;
          if (!codeA && !codeB) return 0;

          if (sortBookingOrder === 'newest') {
            return codeB.localeCompare(codeA, undefined, { numeric: true, sensitivity: 'base' });
          } else {
            return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
          }
        });

        return result;
      }, [rawBookings, searchBookingCode, filterBookingDate, sortBookingOrder, filterBookingStatus]);

      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      const currentBookings = filteredAndSortedBookings.slice(indexOfFirstItem, indexOfLastItem);
      const totalPages = Math.ceil(filteredAndSortedBookings.length / itemsPerPage);

      const filteredUsers = useMemo(() => {
        let result = [...usersList];
        if (searchUser) {
          const query = searchUser.toLowerCase();
          result = result.filter(u =>
            (u.firstName && u.firstName.toLowerCase().includes(query)) ||
            (u.lastName && u.lastName.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.username && u.username.toLowerCase().includes(query))
          );
        }
        return result;
      }, [usersList, searchUser]);

      const userIndexOfLastItem = userCurrentPage * itemsPerPage;
      const userIndexOfFirstItem = userIndexOfLastItem - itemsPerPage;
      const currentUsersPage = filteredUsers.slice(userIndexOfFirstItem, userIndexOfLastItem);
      const userTotalPages = Math.ceil(filteredUsers.length / itemsPerPage);

      // --- Admin List Logic ---
      const filteredAdmins = useMemo(() => {
        let result = [...adminUsersList];
        if (searchAdmin) {
          const query = searchAdmin.toLowerCase();
          result = result.filter(a =>
            (a.firstName && a.firstName.toLowerCase().includes(query)) ||
            (a.lastName && a.lastName.toLowerCase().includes(query)) ||
            (a.email && a.email.toLowerCase().includes(query)) ||
            (a.username && a.username.toLowerCase().includes(query))
          );
        }
        return result;
      }, [adminUsersList, searchAdmin]);

      const adminIndexOfLastItem = adminCurrentPage * itemsPerPage;
      const adminIndexOfFirstItem = adminIndexOfLastItem - itemsPerPage;
      const currentAdminsPage = filteredAdmins.slice(adminIndexOfFirstItem, adminIndexOfLastItem);
      const adminTotalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

      const handleAdminEdit = (userId, field, value) => {
        setAdminEdits(prev => {
          const currentEdit = prev[userId] || {};
          const originalAdmin = adminUsersList.find(u => u.id === userId);
          if (!originalAdmin) return prev;

          let newEdit = { ...currentEdit, [field]: value };
          const isUNameDirty = newEdit.username !== undefined && newEdit.username !== originalAdmin.username;
          const isPassDirty = newEdit.password !== undefined && newEdit.password !== originalAdmin.password;
          newEdit.isDirty = isUNameDirty || isPassDirty;

          return { ...prev, [userId]: newEdit };
        });
      };

      const saveAdminEdit = (userId) => {
        const editData = adminEdits[userId];
        const originalAdmin = adminUsersList.find(u => u.id === userId);
        if (!editData || !originalAdmin) return;

        const newUsername = editData.username !== undefined ? editData.username : originalAdmin.username;
        const newPassword = editData.password !== undefined ? editData.password : originalAdmin.password;

        setAdminEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: true } }));

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              if (res.success) {
                setAdminUsersList(prevList => prevList.map(u =>
                  u.id === userId ? { ...u, username: newUsername, password: newPassword } : u
                ));
                setAdminEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false, isDirty: false } }));
                showAlert('อัปเดตข้อมูลสำเร็จ', 'success');
              } else {
                setAdminEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false } }));
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setAdminEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false } }));
              showAlert(err.message, 'error');
            })
            .updateAdminCredentials(userId, newUsername, newPassword);
        } else {
           setTimeout(() => {
              setAdminUsersList(prevList => prevList.map(u =>
                u.id === userId ? { ...u, username: newUsername, password: newPassword } : u
              ));
              setAdminEdits(prev => ({ ...prev, [userId]: { ...prev[userId], isSaving: false, isDirty: false } }));
              showAlert('จำลองการอัปเดตข้อมูลแอดมินสำเร็จ', 'success');
           }, 1000);
        }
      };

      // --- Print Bookings Report Function ---
      const handlePrintBookings = () => {
        const parseDateHelper = (dateStr) => {
          if (!dateStr) return null;
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          }
          const partsDash = dateStr.split('-');
          if (partsDash.length === 3) {
            return new Date(dateStr);
          }
          const t = new Date(dateStr);
          return isNaN(t.getTime()) ? null : t;
        };

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0,0,0,0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        let filteredPrintBookings = [...rawBookings];
        let filterText = '';

        if (reportFilter === 'daily') {
          filterText = ' (รายวัน)';
          filteredPrintBookings = rawBookings.filter(b => {
            const bDate = parseDateHelper(b.startDate || b.date);
            if (!bDate) return false;
            bDate.setHours(0,0,0,0);
            return bDate.getTime() === startOfToday.getTime();
          });
        } else if (reportFilter === 'weekly') {
          filterText = ' (รายสัปดาห์)';
          filteredPrintBookings = rawBookings.filter(b => {
            const bDate = parseDateHelper(b.startDate || b.date);
            if (!bDate) return false;
            bDate.setHours(0,0,0,0);
            return bDate >= startOfWeek && bDate <= endOfWeek;
          });
        } else if (reportFilter === 'monthly') {
          filterText = ' (รายเดือน)';
          filteredPrintBookings = rawBookings.filter(b => {
            const bDate = parseDateHelper(b.startDate || b.date);
            if (!bDate) return false;
            return bDate.getFullYear() === now.getFullYear() && bDate.getMonth() === now.getMonth();
          });
        } else if (reportFilter === 'yearly') {
          filterText = ' (รายปี)';
          filteredPrintBookings = rawBookings.filter(b => {
            const bDate = parseDateHelper(b.startDate || b.date);
            if (!bDate) return false;
            return bDate.getFullYear() === now.getFullYear();
          });
        }

        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>รายงานข้อมูลผู้ใช้งานจองห้องปฏิบัติการ${filterText}</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: A4 landscape; margin: 15mm; }
              body { font-family: 'Sarabun', sans-serif; font-size: 10pt; color: #333; margin: 0; padding: 0; }
              h2 { text-align: center; margin-bottom: 20px; font-size: 18pt; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; table-layout: fixed; word-wrap: break-word; }
              th, td { border: 1px solid #999; padding: 4px 6px; text-align: left; font-size: 9pt; line-height: 1.3; }
              th { background-color: #f3f4f6; font-weight: 600; text-align: center; }
              .text-center { text-align: center; }
              .print-date { text-align: right; font-size: 10pt; margin-bottom: 10px; color: #666; }
            </style>
          </head>
          <body>
            <h2>รายงานข้อมูลผู้ใช้งานจองห้องปฏิบัติการ${filterText}</h2>
            <div class="print-date">ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })} น.</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 4%">ลำดับ</th>
                  <th style="width: 8%">รหัสจอง</th>
                  <th style="width: 8%">สถานะ</th>
                  <th style="width: 8%">แจ้งเตือน</th>
                  <th style="width: 7%">คาบ</th>
                  <th style="width: 9%">ห้องปฏิบัติการ</th>
                  <th style="width: 10%">ผู้จอง</th>
                  <th style="width: 6%">วันใช้งาน</th>
                  <th style="width: 8%">จองวันที่</th>
                  <th style="width: 8%">ถึงวันที่</th>
                  <th style="width: 5%">เริ่มเวลา</th>
                  <th style="width: 5%">สิ้นสุดเวลา</th>
                  <th style="width: 10%">วัตถุประสงค์</th>
                  <th style="width: 4%">รูปภาพ</th>
                </tr>
              </thead>
              <tbody>
                ${filteredPrintBookings.length === 0 ? `
                  <tr>
                    <td colspan="14" class="text-center" style="padding: 20px; color: #666; font-size: 10pt; font-weight: 600;">ไม่มีข้อมูลการจองห้องปฏิบัติการในช่วงเวลานี้</td>
                  </tr>
                ` : filteredPrintBookings.map((b, index) => {
                  const dateObj = new Date(b.startDate || b.date);
                  const weekdayStr = b.dayOfUse || (!isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('th-TH', { weekday: 'long' }).replace('วัน', '') : '-');
                  const startDateStr = formatDisplayDate(b.startDate || b.date);
                  const endDateStr = formatDisplayDate(b.endDate && b.endDate !== '-' ? b.endDate : (b.startDate || b.date));
                  return `
                    <tr>
                      <td class="text-center">${index + 1}</td>
                      <td class="text-center">${b.bookingCode || '-'}</td>
                      <td class="text-center">${b.statusText || '-'}</td>
                      <td>${b.note || '-'}</td>
                      <td class="text-center">${b.priority || '-'}</td>
                      <td>${b.lab || '-'}</td>
                      <td>${b.reqName || '-'}</td>
                      <td class="text-center">${weekdayStr}</td>
                      <td class="text-center">${startDateStr}</td>
                      <td class="text-center">${endDateStr}</td>
                      <td class="text-center">${b.startTime || '-'}</td>
                      <td class="text-center">${b.endTime || '-'}</td>
                      <td>${b.purpose || '-'}</td>
                      <td class="text-center">${b.attachment ? 'มีรูปภาพ' : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.focus();

          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          showAlert("เบราว์เซอร์ของคุณบล็อกการเปิดหน้าต่างใหม่ กรุณาอนุญาต Pop-ups สำหรับเว็บไซต์นี้", "error");
        }
      };

      const handleToggleAdminApproval = (email, currentApprovedStatus) => {
        if (!email || email === '-') {
          showAlert("ไม่มีข้อมูลอีเมลสำหรับผู้ใช้งานนี้", 'error');
          return;
        }
        setApprovingAdminEmail(email);
        const newApprovedStatus = !currentApprovedStatus;
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setApprovingAdminEmail(null);
              if (res.success) {
                setAdminUsersList(prev => prev.map(u =>
                  u.email === email ? { ...u, isApproved: newApprovedStatus } : u
                ));
                showAlert(res.message, 'success');
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setApprovingAdminEmail(null);
              showAlert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            })
            .toggleAdminApprovalStatus(email, newApprovedStatus);
        } else {
          setTimeout(() => {
            setApprovingAdminEmail(null);
            setAdminUsersList(prev => prev.map(u =>
              u.email === email ? { ...u, isApproved: newApprovedStatus } : u
            ));
            showAlert(`จำลองการตั้งสถานะ ${newApprovedStatus ? 'อนุมัติแล้ว' : 'รออนุมัติ'} สำเร็จ`, 'success');
          }, 1000);
        }
      };

      const handleToggleAdminBlock = (email, currentBlockedStatus) => {
        if (!email || email === '-') {
          showAlert("ไม่มีข้อมูลอีเมลสำหรับผู้ใช้งานนี้", 'error');
          return;
        }
        setBlockingAdminEmail(email);
        const newBlockedStatus = !currentBlockedStatus;
        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setBlockingAdminEmail(null);
              if (res.success) {
                setAdminUsersList(prev => prev.map(u =>
                  u.email === email ? { ...u, isUserBlocked: newBlockedStatus } : u
                ));
                showAlert(res.message, 'success');
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setBlockingAdminEmail(null);
              showAlert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            })
            .toggleAdminBlockStatus(email, newBlockedStatus);
        } else {
          setTimeout(() => {
            setBlockingAdminEmail(null);
            setAdminUsersList(prev => prev.map(u =>
              u.email === email ? { ...u, isUserBlocked: newBlockedStatus } : u
            ));
            showAlert(`จำลองการตั้งสถานะ ${newBlockedStatus ? 'บล็อก' : 'ปลดบล็อก'} สำเร็จ`, 'success');
          }, 1000);
        }
      };

      // --- Print Admin Report Function ---
      const handlePrintAdmins = () => {
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>รายงานข้อมูลผู้ดูแลระบบ</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: 'Sarabun', sans-serif; font-size: 12pt; color: #333; margin: 0; padding: 0; }
              h2 { text-align: center; margin-bottom: 20px; font-size: 18pt; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 11pt; line-height: 1.4; }
              th { background-color: #f3f4f6; font-weight: 600; text-align: center; }
              .text-center { text-align: center; }
              .print-date { text-align: right; font-size: 10pt; margin-bottom: 10px; color: #666; }
            </style>
          </head>
          <body>
            <h2>รายงานข้อมูลผู้ดูแลระบบ (Admin)</h2>
            <div class="print-date">ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })} น.</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%">ลำดับ</th>
                  <th style="width: 12%">สมัครวันที่</th>
                  <th style="width: 20%">ชื่อ-นามสกุล</th>
                  <th style="width: 15%">ตำแหน่ง</th>
                  <th style="width: 13%">เบอร์โทรศัพท์</th>
                  <th style="width: 15%">อีเมล</th>
                  <th style="width: 12%">ชื่อผู้ใช้งาน</th>
                  <th style="width: 8%">รหัสผ่าน</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAdmins.map((admin, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${admin.regDate || '-'}</td>
                    <td>${admin.firstName || '-'} ${admin.lastName || ''}</td>
                    <td>${admin.position || '-'}</td>
                    <td class="text-center">${admin.phone ? (String(admin.phone).startsWith('0') ? String(admin.phone) : '0' + String(admin.phone)) : '-'}</td>
                    <td>${admin.email || '-'}</td>
                    <td>${admin.username || '-'}</td>
                    <td class="text-center">********</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.focus();

          // รอให้ฟอนต์และสไตล์โหลดเสร็จก่อนสั่ง print
          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          showAlert("เบราว์เซอร์ของคุณบล็อกการเปิดหน้าต่างใหม่ กรุณาอนุญาต Pop-ups สำหรับเว็บไซต์นี้", "error");
        }
      };

      // --- Print Users Report Function ---
      const handlePrintUsers = () => {
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>รายงานข้อมูลผู้ใช้งานทั่วไป</title>
            <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
            <style>
              @page { size: A4 portrait; margin: 15mm; }
              body { font-family: 'Sarabun', sans-serif; font-size: 12pt; color: #333; margin: 0; padding: 0; }
              h2 { text-align: center; margin-bottom: 20px; font-size: 18pt; font-weight: 700; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 11pt; line-height: 1.4; }
              th { background-color: #f3f4f6; font-weight: 600; text-align: center; }
              .text-center { text-align: center; }
              .print-date { text-align: right; font-size: 10pt; margin-bottom: 10px; color: #666; }
            </style>
          </head>
          <body>
            <h2>รายงานข้อมูลผู้ใช้งานทั่วไป (Users)</h2>
            <div class="print-date">ข้อมูล ณ วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })} น.</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%">ลำดับ</th>
                  <th style="width: 12%">สมัครวันที่</th>
                  <th style="width: 20%">ชื่อ-นามสกุล</th>
                  <th style="width: 15%">ตำแหน่ง</th>
                  <th style="width: 13%">เบอร์โทรศัพท์</th>
                  <th style="width: 15%">อีเมล</th>
                  <th style="width: 12%">ชื่อผู้ใช้งาน</th>
                  <th style="width: 8%">รหัสผ่าน</th>
                </tr>
              </thead>
              <tbody>
                ${filteredUsers.map((user, index) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-center">${user.regDate || '-'}</td>
                    <td>${user.firstName || '-'} ${user.lastName || ''}</td>
                    <td>${user.position || '-'}</td>
                    <td class="text-center">${user.phone ? (String(user.phone).startsWith('0') ? String(user.phone) : '0' + String(user.phone)) : '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td>${user.username || '-'}</td>
                    <td class="text-center">********</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
          </html>
        `;

        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();
          printWindow.focus();

          setTimeout(() => {
            printWindow.print();
          }, 500);
        } else {
          showAlert("เบราว์เซอร์ของคุณบล็อกการเปิดหน้าต่างใหม่ กรุณาอนุญาต Pop-ups สำหรับเว็บไซต์นี้", "error");
        }
      };


      // --- Delete User Function ---
      const handleDeleteUserClick = (user, type) => {
        setUserToDelete({ id: user.id, email: user.email, name: `${user.firstName || ''} ${user.lastName || ''}`.trim(), type: type, username: user.username });
        setIsDeleteUserModalOpen(true);
      };

      const confirmDeleteUser = () => {
        if (!userToDelete) return;
        setIsDeletingUser(true);

        if (typeof google !== 'undefined' && google.script) {
          google.script.run
            .withSuccessHandler((res) => {
              setIsDeletingUser(false);
              if (res.success) {
                if (userToDelete.type === 'admin') {
                  setAdminUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
                } else {
                  setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
                }
                setIsDeleteUserModalOpen(false);
                showAlert(res.message, 'success');
                setUserToDelete(null);
              } else {
                showAlert(res.message, 'error');
              }
            })
            .withFailureHandler((err) => {
              setIsDeletingUser(false);
              showAlert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ', 'error');
            })
            .deleteUserAccount(userToDelete.id, userToDelete.type);
        } else {
          setTimeout(() => {
            setIsDeletingUser(false);
            if (userToDelete.type === 'admin') {
              setAdminUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
            } else {
              setUsersList(prev => prev.filter(u => u.id !== userToDelete.id));
            }
            setIsDeleteUserModalOpen(false);
            showAlert('จำลองการลบข้อมูลสำเร็จ', 'success');
            setUserToDelete(null);
          }, 1000);
        }
      };

      const isDateLocked = (dateStr) => {
        const targetDate = new Date(dateStr);
        targetDate.setHours(0,0,0,0);

        for (let i = 0; i < lockedDates.length; i++) {
          const range = lockedDates[i];
          if (!range.start) continue;

          const start = new Date(range.start);
          start.setHours(0,0,0,0);
          const end = new Date(range.end || range.start);
          end.setHours(0,0,0,0);

          if (targetDate >= start && targetDate <= end) return true;
        }
        return false;
      };

      // --- 1. App Shell (Pre-loader) & ตรวจสอบสถานะเริ่มต้น ---
      // Redundant UI removed, now handled by native App Shell in index.html
      useEffect(() => {
        if (isInitialCheckDone) {
          if (typeof window.onReactReady === 'function') {
            window.onReactReady();
          }
        }
      }, [isInitialCheckDone]);

      if (!isInitialCheckDone) {
        return null;
      }

      // --- 2. บังคับลงชื่อเข้าใช้ (Forced Login with Split Card Design) ---
      if (!isLoggedIn) {
        return (
          <>
            <div className="min-h-screen w-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans">

              {/* Interactive Butterflies */}
              <InteractiveButterflies />

              {/* Animated Blobs Background */}
              <div className="absolute top-0 -left-4 w-72 h-72 sm:w-96 sm:h-96 bg-[#026670] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className={`flex w-full max-w-4xl bg-white/95 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden z-10 border border-white/50 animate-bounce-pop relative flex-col lg:flex-row max-h-[95vh] sm:max-h-[90vh] card-soft-transition transform ${cardScaleClass}`}>

              {/* Left Side - Branding (Hidden on mobile) */}
              <div className="hidden lg:flex w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden p-8 xl:p-12 shrink-0">
                 <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" alt="Science Laboratory Background" />
                 <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a]/95 to-[#026670]/85"></div>

                 <div className="relative z-10 flex flex-col items-start justify-center h-full text-white w-full max-w-md">
                   <img src="https://lh3.googleusercontent.com/d/15J4cmPR70AqZfOZpPErQ9avHQCv1WzIo" alt="Logo" className="h-16 xl:h-20 mb-6 drop-shadow-2xl" />
                    <h1 className="text-3xl xl:text-4xl font-extrabold select-none whitespace-nowrap">ระบบจองห้องปฏิบัติการ</h1>
                    <h2 className="text-3xl xl:text-4xl font-extrabold mb-3 mt-1 select-none text-white/90">วิทยาศาสตร์</h2>
                   <p className="text-white/80 text-sm xl:text-base leading-relaxed mt-1">จองคิวการใช้งานห้องปฏิบัติการอย่างเป็นระบบ รวดเร็ว<br/>และโปร่งใส เพื่อยกระดับการทํางานส่วนรวม</p>

                   <div className="mt-8 flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                     <button
                       type="button"
                       className="shrink-0 bg-[#ba9c5a] hover:bg-[#9d7634] btn-lively-zoom text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5"
                     >
                       <Lock size={12} strokeWidth={2.5} />
                       Administrator
                     </button>
                     <p className="text-xs font-medium text-white/90">จัดการคิวจองห้องปฏิบัติการ</p>
                   </div>
                 </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 flex flex-col relative bg-white overflow-y-auto custom-scroll">
                <div className="w-full max-w-sm mx-auto my-auto py-2 sm:py-4">
                  <div className="text-center lg:text-left mb-6">
                     <img src="https://lh3.googleusercontent.com/d/15J4cmPR70AqZfOZpPErQ9avHQCv1WzIo" alt="Logo" className="h-14 mx-auto lg:hidden mb-4 drop-shadow-sm" />
                     {authMode === 'login' ? (
                       <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight leading-tight mb-1.5">ScienceLab Booking</h1>
                     ) : (
                       <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] mb-1.5 tracking-tight leading-tight">สร้างบัญชีใหม่</h1>
                     )}
                     <p className="text-slate-500 font-medium text-xs sm:text-sm">
                       {authMode === 'login' ? 'Darussalam school' : 'กรอกข้อมูลเพื่อลงทะเบียนเข้าใช้งานระบบ'}
                     </p>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <div className="animate-fade-in space-y-4 relative z-50">
                        <div className="flex flex-col items-center mb-4">
                          <div
                            className="relative w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group shadow-sm"
                            onClick={() => document.getElementById('signupProfileInput').click()}
                          >
                            {profilePreview ? (
                              <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="flex flex-col items-center text-slate-400 group-hover:text-[#ba9c5a] transition-colors mt-1">
                                <Camera size={24} className="mb-1" />
                                <span className="text-[9px] font-semibold text-center leading-tight">รูปโปรไฟล์จำเป็น</span>
                              </div>
                            )}
                          </div>
                          <input type="file" id="signupProfileInput" className="hidden" accept="image/*" onChange={handleProfileChange} />
                        </div>

                        {/* First Name & Last Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 relative">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 ml-1">ชื่อจริง <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              name="firstName"
                              required
                              placeholder="ชื่อ"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 ml-1">นามสกุล <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              name="lastName"
                              required
                              placeholder="นามสกุล"
                              className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium"
                            />
                          </div>
                        </div>

                        {/* Position Selection */}
                        <div className="space-y-1.5 relative z-20" ref={signupPositionRef}>
                          <label className="text-xs font-semibold text-slate-700 ml-1">ตำแหน่ง <span className="text-rose-500">*</span></label>
                          <input type="hidden" name="position" value={signupPosition} />
                          <button
                            type="button"
                            onClick={() => setIsSignupPositionOpen(!isSignupPositionOpen)}
                            className={`w-full flex items-center justify-between bg-slate-50 border ${isSignupPositionOpen ? 'bg-white border-[#ba9c5a] ring-4 ring-[#ba9c5a]/10' : 'border-slate-200 hover:border-slate-300'} rounded-xl px-3.5 py-2.5 transition-all text-sm text-left relative`}
                          >
                            <span className={signupPosition ? 'text-slate-900 font-medium' : 'text-slate-400 font-medium'}>{signupPosition || 'เลือกตำแหน่ง'}</span>
                            <ChevronRight size={16} className={`transition-transform duration-200 ${isSignupPositionOpen ? 'rotate-90 text-[#ba9c5a]' : 'text-slate-400'}`} />
                          </button>
                          {isSignupPositionOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-slate-100 z-[100] py-1.5 animate-fade-in overflow-hidden">
                              {['ผู้บริหาร', 'บุคลากรสามัญ', 'บุคลากรศาสนา'].map(pos => (
                                <button
                                  key={pos}
                                  type="button"
                                  onClick={() => { setSignupPosition(pos); setIsSignupPositionOpen(false); }}
                                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${signupPosition === pos ? 'text-[#ba9c5a] font-bold bg-slate-50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}
                                >
                                  <span>{pos}</span>
                                  {signupPosition === pos && <Check size={14} className="text-[#ba9c5a]" strokeWidth={3} />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 z-10 relative">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 ml-1">เบอร์โทรศัพท์</label>
                            <input type="tel" name="phone" placeholder="08X-XXX-XXXX" className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 ml-1">อีเมล <span className="text-rose-500">*</span></label>
                            <input type="email" name="email" required placeholder="example@email.com" className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3.5 py-2.5 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 relative z-10">
                      <label className="text-xs font-semibold text-slate-700 ml-1">
                        {authMode === 'login' ? 'ชื่อผู้ใช้ หรือ อีเมล' : 'ตั้งชื่อผู้ใช้งานระบบ'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="text"
                          name="username"
                          required
                          placeholder={authMode === 'login' ? "Username or Email" : "Username"}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 relative z-10">
                      <label className="text-xs font-semibold text-slate-700 ml-1">
                        {authMode === 'login' ? 'รหัสผ่าน' : 'ตั้งรหัสผ่าน'} <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          required
                          placeholder={authMode === 'login' ? "Password" : "Password"}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl pl-10 pr-10 py-3 outline-none focus:bg-white focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#ba9c5a] transition-colors focus:outline-none p-1.5 rounded-lg hover:bg-slate-100"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 mt-4 relative z-10 select-none">
                        <input
                          type="checkbox"
                          id="captchaCheckbox"
                          required
                          className="w-5 h-5 border border-slate-300 rounded text-[#026670] focus:ring-[#026670] cursor-pointer"
                        />
                        <label htmlFor="captchaCheckbox" className="flex flex-col cursor-pointer select-none">
                          <span className="text-xs font-semibold text-slate-700">ฉันไม่ใช่โปรแกรมอัตโนมัติ</span>
                          <span className="text-[10px] text-slate-400 font-medium">(i'm not a robot)</span>
                        </label>
                        <div className="ml-auto flex flex-col items-center justify-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/RecaptchaLogo.svg" alt="reCAPTCHA" className="w-6 h-6 opacity-85" />
                          <span className="text-[7px] text-slate-400 mt-0.5 font-bold">reCAPTCHA</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthLoading}
                      className="w-full bg-[#0f172a] hover:bg-slate-800 btn-lively-zoom text-white rounded-lg py-3.5 font-bold shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-wait mt-6 text-sm relative z-10"
                    >
                      {isAuthLoading ? (
                        <>
                          <LoadingSpinner size={18} />
                          <span>เข้าสู่ระบบ</span>
                        </>
                      ) : (
                        <>
                          <span>{authMode === 'login' ? 'ลงชื่อเข้าใช้' : 'ยืนยันการสมัครสมาชิก'}</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center text-sm font-medium text-slate-500 relative z-10">
                    {authMode === 'login' ? (
                      <p>ยังไม่มีบัญชีใช่หรือไม่? <button type="button" onClick={() => switchAuthMode('signup')} className="text-[#ba9c5a] hover:text-[#9d7634] btn-lively-zoom ml-1 inline-block font-semibold underline decoration-2 underline-offset-2">สมัครสมาชิก</button></p>
                    ) : (
                      <p>มีบัญชีอยู่แล้ว? <button type="button" onClick={() => switchAuthMode('login')} className="text-[#ba9c5a] hover:text-[#9d7634] btn-lively-zoom ml-1 inline-block font-semibold underline decoration-2 underline-offset-2">เข้าสู่ระบบ</button></p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Custom Alert Modal สำหรับหน้า Login */}
          <Modal isOpen={appAlert.isOpen} onClose={() => setAppAlert({ ...appAlert, isOpen: false })}>
            <div className="flex flex-col items-center justify-center text-center pb-2 px-2 pt-4 sm:pt-6">

              <div className={`mb-4 drop-shadow-sm flex justify-center ${appAlert.type === 'error' ? 'text-rose-600' : 'text-emerald-500'}`}>
                {appAlert.type === 'error' ? <div className="icon-pulse-red mt-1"><XCircle size={64} strokeWidth={2.5} /></div> : <div className="icon-pulse-green mt-1"><CheckCircle2 size={64} strokeWidth={2.5} /></div>}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 text-center w-full">
                {appAlert.title || 'แจ้งเตือนระบบ'}
              </h1>

              <div className="flex flex-col items-center justify-center min-h-[50px] mb-8 w-full text-center space-y-1.5">
                {appAlert.message
                  .replace('ไม่สามารถจองได้ เนื่องจากมีการล็อกการใช้งานในวันนี้', 'ไม่สามารถจองได้\nเนื่องจากมีการล็อกการใช้งานในวันนี้')
                  .split('\n')
                  .map((line, idx) => (
                  <p key={idx} className={`${idx === 0 && appAlert.type === 'error' ? 'text-base sm:text-lg font-semibold text-rose-600' : 'text-sm sm:text-base text-slate-600'} text-center w-full`}>
                    {line}
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAppAlert({ ...appAlert, isOpen: false })}
                className={`w-full text-white rounded-full px-4 py-3 sm:py-4 font-semibold shadow-md transition-all duration-200 active:scale-95 ${appAlert.type === 'error' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#0f172a] hover:bg-slate-800'}`}
              >
                ตกลง
              </button>
            </div>
          </Modal>
        </>
      );
    }

    return (
      <div ref={mainScrollContainerRef} className="h-screen w-screen overflow-y-auto overflow-x-hidden animated-bg text-slate-900 font-sans flex flex-col selection:bg-gold-100 selection:text-gold-900 relative">

        {/* Top Icons */}
          <div className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-1 w-full bg-[#024950]/10 backdrop-blur-sm shrink-0">
            <div className="h-12 sm:h-16 w-full max-w-7xl mx-auto relative flex items-center">

              <div className="absolute left-0 top-0 h-full flex items-center">
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 sm:p-3 text-white hover:bg-white/10 rounded-full transition-all flex flex-col items-center justify-center active:scale-95">
                  <Menu size={26} strokeWidth={2.5} />
                </button>
              </div>

              <div className="absolute left-1/2 top-1/2 -translate-y-1/2 flex items-center justify-center gap-0.5 sm:gap-10 lg:gap-16 w-auto" style={{ transform: 'translate(calc(-50% - 16px), -50%)' }}>
                <button
                  onClick={() => setCurrentView('home')}
                  className={`p-1.5 sm:p-3 rounded-full transition-all flex flex-col items-center justify-center active:scale-95 relative group ${currentView === 'home' ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  title="หน้าหลัก"
                >
                  <Home size={20} strokeWidth={2.5} className="sm:!w-[26px] sm:!h-[26px]" />
                  {currentView === 'home' && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full animate-fade-in"></div>}
                </button>
                <button
                  onClick={() => setCurrentView('queue')}
                  className={`p-1.5 sm:p-3 rounded-full transition-all flex flex-col items-center justify-center active:scale-95 relative group ${currentView === 'queue' ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  title="คิวจองห้องปฏิบัติการ"
                >
                  <ListTodo size={20} strokeWidth={2.5} className="sm:!w-[26px] sm:!h-[26px]" />
                  {currentView === 'queue' && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full animate-fade-in"></div>}
                </button>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className={`p-1.5 sm:p-3 rounded-full transition-all flex flex-col items-center justify-center active:scale-95 relative group ${currentView === 'bookings' ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  title="รายการจอง"
                >
                  <CalendarIcon size={20} strokeWidth={2.5} className="sm:!w-[26px] sm:!h-[26px]" />
                  {currentView === 'bookings' && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full animate-fade-in"></div>}
                </button>
                <button
                  onClick={() => setCurrentView('users')}
                  className={`p-1.5 sm:p-3 rounded-full transition-all flex flex-col items-center justify-center active:scale-95 relative group ${currentView === 'users' ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  title="บัญชีผู้ใช้งาน"
                >
                  <Users size={20} strokeWidth={2.5} className="sm:!w-[26px] sm:!h-[26px]" />
                  {currentView === 'users' && <div className="absolute bottom-0 w-1.5 h-1.5 bg-white rounded-full animate-fade-in"></div>}
                </button>

                {hasNotifications && (
                  <div className="relative">
                    <button
                      onClick={() => setIsNotificationOpen(true)}
                      className={`p-1.5 sm:p-3 rounded-full transition-all flex flex-col items-center justify-center relative active:scale-95 group ${isNotificationOpen ? 'text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                    >
                      <Bell size={20} strokeWidth={2.5} className="sm:!w-[26px] sm:!h-[26px]" />
                      <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                  </div>
                )}
              </div>

              <div className="absolute right-0 top-0 h-full flex items-center gap-2">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => {
                        refreshAllData();
                      }}
                      disabled={isLoading}
                      className={`bg-[#0f172a] text-white p-2 sm:px-5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all shadow-sm whitespace-nowrap flex items-center justify-center gap-1.5 ${isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-slate-800 hover:shadow-md active:scale-95'}`}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="hidden sm:inline">Data loading</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:hidden shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                          <span className="hidden sm:inline">Refresh</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsLogoutModalOpen(true)}
                      className="bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all flex items-center gap-1 sm:gap-2 active:scale-95"
                    >
                      <LogOut size={16} strokeWidth={2.5} className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      <span className="hidden sm:inline">ออกจากระบบ</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                    className="bg-[#0f172a] hover:bg-slate-800 text-white px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full text-[11px] sm:text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap hidden sm:block"
                  >
                    Admin
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1 p-4 md:p-8 w-full max-w-7xl mx-auto pb-8">

            {currentView === 'home' && (
              <div className="animate-fade-in">

                {/* Banner Section */}
                <div
                  className="relative w-full mx-auto overflow-hidden rounded-2xl shadow-lg mb-8 group cursor-pointer bg-slate-900 aspect-[16/9]"
                  onClick={() => setIsBannerSettingsOpen(true)}
                  title="คลิกเพื่อตั้งค่าป้ายแบนเนอร์"
                >
                  <div className="absolute top-3 right-3 bg-white/90 p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-md hover:scale-110">
                    <Edit2 size={18} className="text-[#0f172a]"/>
                  </div>

                  <div
                    className="flex transition-transform duration-700 ease-in-out h-full w-full"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {homeData.banners.length > 0 ? homeData.banners.map((src, index) => (
                      <div key={index} className="min-w-full flex items-center justify-center text-white h-full">
                        <img src={src} className="w-full h-full object-cover" alt={`Banner ${index + 1}`} style={{ objectPosition: `${(bannerPositions[index] || {x:50}).x}% ${(bannerPositions[index] || {y:50}).y}%` }} />
                      </div>
                    )) : (
                      <div className="min-w-full flex items-center justify-center text-slate-400 h-full">
                        <ImageIcon size={48} className="opacity-50"/>
                      </div>
                    )}
                  </div>
                  {homeData.banners.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {homeData.banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentSlide(index); }}
                          className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <header className="flex flex-row justify-between items-start mb-8 w-full gap-2">
                  <div className="text-white flex flex-col">
                    <div className="hidden md:block">
                      <h1 className="text-3xl font-bold tracking-tight mb-1">ScienceLab Booking</h1>
                      <p className="font-medium text-base">ระบบจองห้องปฏิบัติการวิทยาศาสตร์</p>
                    </div>
                    <div className="md:hidden flex flex-col">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-none mb-1">ScienceLab</h1>
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight leading-snug">Booking</h2>
                      <h3 className="font-semibold text-xs sm:text-sm mt-1.5">ระบบจองห้องปฏิบัติการวิทยาศาสตร์</h3>
                    </div>
                  </div>

                  <ClockDisplay />
                </header>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">

                  {/* Calendar Widget */}
                  <BentoBox overflowVisible={true} className="md:col-span-8 md:row-span-2 flex flex-col h-auto md:h-[644px]">
                    <div className="flex flex-col gap-4 mb-6 shrink-0 relative w-full">
                      {/* แถวบน: หัวข้อ (อยู่ตรงกลางเสมอ) */}
                      <div className="w-full text-center">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 text-center w-full">
                          ตารางปฏิทินจองห้องปฏิบัติการ
                        </h2>
                      </div>

                      {/* แถวสอง: อธิบาย Dot ห้องปฏิบัติการ (2 แถวบนมือถือ Centered, 1 แถวบน Desktop Centered) */}
                      <div className="flex flex-col md:flex-row md:flex-wrap items-center justify-center gap-x-6 gap-y-2 py-1 text-[11px] sm:text-xs font-semibold text-slate-500 w-full">
                        <div className="flex flex-row justify-center gap-4 sm:gap-6 w-full md:w-auto">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="whitespace-nowrap">ห้องชีววิทยา อาคาร 13</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="whitespace-nowrap">ห้องเคมี อาคาร 13</span>
                          </div>
                        </div>
                        <div className="flex flex-row justify-center gap-4 sm:gap-6 w-full md:w-auto mt-0.5 md:mt-0">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="whitespace-nowrap">ห้องวิทย์ อาคาร 17</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="whitespace-nowrap">VisualLab อาคาร 19</span>
                          </div>
                        </div>
                      </div>

                      {/* แถวสาม: ตัวเลือกเดือน (Pill เต็มความกว้าง) และปุ่มล็อกวันที่ (ข้างขวา) */}
                      <div className="flex flex-row items-center gap-2.5 w-full mt-1">
                        <div className="flex-1 flex items-center justify-between bg-slate-50 h-11 sm:h-12 px-3 sm:px-4 rounded-full border border-slate-100 min-w-0">
                          <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-600 active:scale-90 shrink-0">
                            <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
                          </button>
                          <span className="font-semibold text-sm sm:text-base text-slate-900 select-none whitespace-nowrap truncate px-2">
                            {monthName} {displayYear}
                          </span>
                          <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-all duration-200 text-slate-600 active:scale-90 shrink-0">
                            <ChevronRight size={20} className="sm:w-6 sm:h-6" />
                          </button>
                        </div>

                        <button
                          onClick={() => setIsLockDateModalOpen(true)}
                          className="bg-rose-500 hover:bg-rose-600 w-11 h-11 sm:w-12 sm:h-12 rounded-full shadow-sm transition-all active:scale-95 flex items-center justify-center text-white shrink-0 hover:rotate-12 duration-200"
                          title="ปิดใช้งานวันจอง"
                        >
                          <Lock size={18} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="flex-1 grid grid-cols-7 gap-2">
                        {Array.from({length: 35}).map((_, i) => <div key={i} className="bg-slate-100 animate-pulse rounded-2xl h-24" />)}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <div className="grid grid-cols-7 gap-2 mb-2">
                          {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">{day}</div>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                            <div key={`empty-${i}`} className="p-2 rounded-2xl bg-transparent" />
                          ))}

                          {activeDetailDay && (
                            <div className="fixed inset-0 z-[90] sm:hidden" onClick={() => setActiveDetailDay(null)} />
                          )}

                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const day = i + 1;
                            const colIndex = (firstDayOfMonth + i) % 7;

                            let popUpPosClass = "left-1/2 -translate-x-1/2 origin-bottom";
                            let arrowPosClass = "left-1/2 -translate-x-1/2";

                            if (colIndex === 0 || colIndex === 1) {
                              popUpPosClass = "left-0 origin-bottom-left";
                              arrowPosClass = "left-4";
                            } else if (colIndex === 5 || colIndex === 6) {
                              popUpPosClass = "right-0 translate-x-0 origin-bottom-right";
                              arrowPosClass = "right-4";
                            }

                            const dayDateObj = new Date(year, currentDate.getMonth(), day);
                            const dateStr = getSafeDateStr(dayDateObj);
                            const isToday = dateStr === getSafeDateStr(new Date());
                            const dayBookings = getBookingsForDay(day);
                            const isLocked = isDateLocked(dateStr);

                            const onTouchStartDay = () => {
                              longPressTimer.current = setTimeout(() => {
                                setIsLongPressTriggered(true);
                                if (dayBookings.length > 0) setActiveDetailDay(day);
                              }, 500);
                            };

                            const onTouchEndDay = () => {
                              if (longPressTimer.current) clearTimeout(longPressTimer.current);
                            };
                            const onClickDay = (e, isLocked) => {
                              if (isLongPressTriggered) {
                                setIsLongPressTriggered(false);
                                return;
                              }
                              if (activeDetailDay === day) {
                                setActiveDetailDay(null);
                                e.stopPropagation();
                                return;
                              }
                              if (isLocked) {
                                showAlert("ไม่สามารถจองได้ เนื่องจากมีการล็อกการใช้งานในวันนี้", "error");
                              } else {
                                handleDayClick(day);
                              }
                            };

                            return (
                              <div
                                key={day}
                                onTouchStart={onTouchStartDay}
                                onTouchEnd={onTouchEndDay}
                                onTouchMove={onTouchEndDay}
                                onMouseDown={onTouchStartDay}
                                onMouseUp={onTouchEndDay}
                                onMouseLeave={onTouchEndDay}
                                onContextMenu={(e) => { e.preventDefault(); if(dayBookings.length > 0) setActiveDetailDay(day); }}
                                onClick={(e) => onClickDay(e, isLocked)}
                                className={`calendar-cell-btn group relative z-10 p-1.5 lg:p-3 rounded-2xl border transition-all duration-200 min-h-[60px] md:min-h-0 flex flex-col active:scale-[0.95] active:shadow-inner
                                  ${isLocked ? 'bg-rose-800 text-white border-rose-900 shadow-inner overflow-hidden cursor-not-allowed' :
                                    (isToday ? 'bg-slate-50 border-[#0f172a]/40 shadow-sm hover:bg-slate-200 hover:z-[100] cursor-pointer' : 'bg-slate-50 border-slate-100 hover:border-slate-300 hover:bg-slate-300 hover:shadow-sm hover:z-[100] cursor-pointer')
                                  }
                                  ${activeDetailDay === day ? 'z-[100]' : ''}
                                `}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <span className={`text-sm font-semibold flex items-center justify-center rounded-full w-6 h-6 ${isLocked ? 'text-white' : (isToday ? 'bg-[#0f172a] text-white' : 'text-slate-700')}`}>
                                    {day}
                                  </span>
                                </div>

                                {isLocked && (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                                    <Lock size={32} />
                                  </div>
                                )}

                                {!isLocked && (
                                  <div className="flex flex-wrap gap-0.5 sm:gap-1 mt-auto items-center justify-center sm:justify-start pb-1">
                                    {dayBookings.slice(0, 4).map((booking, idx) => (
                                      <div key={idx} className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${getLabDotColor(booking.lab)}`} />
                                    ))}
                                    {dayBookings.length > 4 && (
                                      <div className="text-[8px] sm:text-[9px] text-slate-500 font-bold leading-none ml-0.5">+{dayBookings.length - 4}</div>
                                    )}
                                  </div>
                                )}

                                {!isLocked && dayBookings.length === 0 && (
                                  <div className="absolute inset-0 bg-slate-900/5 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Plus className="text-slate-600 opacity-50" size={24} />
                                  </div>
                                )}

                                {!isLocked && dayBookings.length > 0 && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className={`calendar-popover absolute transition-all duration-200 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-max min-w-[240px] sm:min-w-[280px] max-w-[85vw] sm:max-w-[320px] max-h-[300px] bottom-[105%] mb-2 pointer-events-auto ${popUpPosClass}
                                      ${activeDetailDay === day ? 'visible opacity-100 scale-100 z-[100]' : 'invisible opacity-0 scale-95 md:group-hover:visible md:group-hover:opacity-100 md:group-hover:scale-100 z-50'}
                                      ${dayBookings.length > 1 ? 'overflow-y-auto custom-scroll pr-1' : 'overflow-hidden'}
                                    `}>
                                    <div className="flex flex-col gap-3">
                                      {dayBookings.map((b, idx) => (
                                        <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b border-slate-100 last:border-0 last:pb-0 text-left">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-500 w-16">ชื่อผู้จอง:</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{b.reqName || '-'}</span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-500 w-16">ตำแหน่ง:</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{b.reqPosition || '-'}</span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-500 w-16">รหัสจอง:</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{b.bookingCode || '-'}</span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-slate-500 w-16">สถานะ:</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                              b.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                              'bg-amber-100 text-amber-700'
                                             }`}>
                                               {b.status === 'confirmed' ? 'อนุมัติแล้ว' : b.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                             </span>
                                           </div>
                                           <div className="flex flex-wrap items-center gap-2">
                                             <span className="text-xs text-slate-500 w-16">ผู้จอง:</span>
                                             <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{b.reqName || `-`}</span>
                                           </div>
                                           <div className="flex items-center gap-2">
                                             <span className="text-xs text-slate-500 w-16">ประเภท:</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${getPriorityColor(b.priority || 'ปกติ')}`}>
                                              {b.priority || 'ปกติ'}
                                            </span>
                                          </div>
                                          <div className="flex items-start gap-2 text-xs">
                                            <span className="text-slate-500 w-16 shrink-0">วัน:</span>
                                            <span className="font-medium text-slate-900">{dayDateObj.toLocaleDateString('th-TH', { weekday: 'long' })}</span>
                                          </div>
                                          <div className="flex items-start gap-2 text-xs">
                                            <span className="text-slate-500 w-16 shrink-0">วันที่:</span>
                                            <span className="font-medium text-slate-900">{dayDateObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                          </div>
                                          <div className="flex items-start gap-2 text-xs">
                                            <span className="text-slate-500 w-16 shrink-0">เวลา:</span>
                                            <span className="font-medium text-slate-900">{b.time_col_d}</span>
                                          </div>
                                          <div className="flex items-start gap-2 text-xs">
                                            <span className="text-slate-500 w-16 shrink-0">วัตถุประสงค์:</span>
                                            <span className="font-medium text-slate-900">{b.purpose}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                    <div className={`absolute w-3 h-3 bg-white border-b border-r border-slate-200 transform rotate-45 -bottom-1.5 ${arrowPosClass}`}></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </BentoBox>

                  <div className="md:col-span-4 md:row-span-2 flex flex-col gap-6">
                    {/* Announcement Section */}
                    <BentoBox
                      className="h-[260px] shrink-0 bg-white relative overflow-hidden flex flex-col group cursor-pointer"
                      onClick={() => { setTempAnnouncement(homeData.announcement); setIsAnnouncementSettingsOpen(true); }}
                      title="คลิกเพื่อกำหนดข้อความประกาศ"
                    >
                      <div className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-slate-200 hover:scale-110">
                        <Edit2 size={16} className="text-[#0f172a]"/>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ba9c5a]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                      <div className="relative z-10 flex items-center gap-3 mb-4 shrink-0">
                        <Megaphone className="text-[#ba9c5a]" size={32} />
                        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f172a]">ประกาศ</h3>
                      </div>
                      <div className="relative z-10 flex-1 overflow-y-auto custom-scroll pr-2">
                        <p className="text-slate-700 text-base sm:text-lg leading-relaxed font-medium whitespace-pre-wrap">
                          {homeData.announcement}
                        </p>
                      </div>
                    </BentoBox>

                    <BentoBox className="h-[360px] flex flex-col shrink-0">
                      <div className="flex justify-between items-center mb-6 shrink-0 gap-2 min-w-0 w-full">
                        <h2 className="text-xl font-bold tracking-tight text-[#0f172a] whitespace-nowrap truncate">คิวจองที่กำลังจะมาถึง</h2>
                        <div className="text-[#ba9c5a] shrink-0"><History size={24} /></div>
                      </div>

                      <div className="flex flex-col gap-3 overflow-y-auto custom-scroll pr-2 flex-1 h-full">
                        {isLoading ? (
                          Array.from({length: 4}).map((_, i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl shrink-0" />)
                        ) : upcomingBookings.length > 0 ? (
                          upcomingBookings.map((booking, index) => {
                            const bookingDateObj = new Date(booking.date);
                            const isToday = booking.date === getSafeDateStr(new Date());
                            const isHighlighted = index === 0 || isToday;

                            return (
                              <div
                                key={`upc-home-${booking.id}`}
                                onMouseEnter={(e) => handleUpcomingMouseEnter(e, booking)}
                                onMouseLeave={handleUpcomingMouseLeave}
                                onClick={(e) => handleUpcomingClick(e, booking)}
                                className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all shrink-0 group upcoming-card-btn cursor-pointer relative"
                              >
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${isHighlighted ? 'bg-[#0f172a] text-white border-transparent shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                  <span className="text-xs sm:text-sm font-bold leading-none">{booking.date.split('-')[2]}</span>
                                  <span className={`text-[9px] sm:text-[10px] font-medium uppercase mt-0.5 sm:mt-1 ${isHighlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {bookingDateObj.toLocaleString('th-TH', { month: 'short' })}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1.5 gap-1 sm:gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#ba9c5a] transition-colors truncate">{formatLabRoom(booking.lab)}</h4>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedPurpose(booking.purpose); setIsPurposeModalOpen(true); }}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm shrink-0"
                                        title={booking.purpose}
                                      >
                                        <FileText size={10} />
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
                                      {booking.priority && (
                                        <span className="px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold whitespace-nowrap bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                                          {booking.priority.toString().includes('คาบ') ? booking.priority : `คาบ ${booking.priority}`}
                                        </span>
                                      )}
                                      <span className={`px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold whitespace-nowrap shrink-0 ${
                                        booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                        booking.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                        'bg-amber-50 text-amber-700 border border-amber-100'
                                      }`}>
                                        {booking.status === 'confirmed' ? 'อนุมัติแล้ว' : booking.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center text-[9px] sm:text-xs text-slate-500 gap-1.5 sm:gap-3 w-full">
                                    <span className="flex items-center gap-1 font-medium shrink-0"><Clock size={10} className={isToday ? "text-rose-500 animate-pulse" : ""}/> {booking.time_col_d}</span>
                                    <span className="text-slate-300 hidden sm:inline">|</span>
                                    <span className="flex items-center gap-1 font-medium truncate min-w-0 max-w-[150px]"><User size={10}/> <span className="truncate">{booking.reqName || 'ผู้ใช้งาน'}</span></span>
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center gap-3 m-auto bg-slate-50 w-full rounded-2xl border border-dashed border-slate-200">
                            <CheckCircle2 className="text-green-500/40" size={36} />
                            <p>ไม่มีคิวจองที่กำลังจะมาถึง</p>
                          </div>
                        )}
                      </div>
                    </BentoBox>
                  </div>

                  {/* PR Board Section */}
                  <BentoBox
                    className="md:col-span-12 md:row-span-1 relative group cursor-pointer"
                    noPadding
                    onClick={(e) => {
                      if (e.target.closest('button')) return; // ป้องกันการเปิด Modal หากคลิกที่ปุ่มเลื่อนซ้าย/ขวา
                      setIsPRSettingsOpen(true);
                    }}
                    title="คลิกเพื่อตั้งค่าบอร์ดประชาสัมพันธ์"
                  >
                    <div className="p-6 border-b border-slate-100 flex justify-center md:justify-between items-center w-full relative">
                       <h2 className="text-xl font-bold tracking-tight text-center w-full">บอร์ดประชาสัมพันธ์</h2>
                       <div className="absolute right-6 bg-slate-100 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 hover:bg-slate-200 hover:scale-110 hidden md:block">
                          <Edit2 size={16} className="text-[#0f172a]"/>
                       </div>
                    </div>

                    <div className="relative">
                      <div ref={prScrollRef} className="flex overflow-x-auto py-10 pl-[20%] pr-6 md:pr-[10%] gap-6 md:gap-8 snap-x hide-scrollbar scroll-smooth">
                        {homeData.prItems.map((item, index) => (
                            <div key={item.id} className="min-w-[280px] md:min-w-[320px] rounded-3xl border border-slate-100 overflow-hidden snap-start bg-white shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer flex flex-col">
                              <div className="relative overflow-hidden shrink-0 bg-slate-50 w-full" style={{ aspectRatio: '1.5 / 1' }}>
                                <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800&h=500"; }} style={{ objectPosition: `${(prPositions[index] || {x:50}).x}% ${(prPositions[index] || {y:50}).y}%` }} />
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-center">
                                <h3 className="font-semibold text-slate-900 truncate" title={item.title}>{item.title}</h3>
                              </div>
                            </div>
                        ))}
                      </div>
                      <button
                        onClick={scrollPRLeft}
                        className="absolute left-4 md:left-[4%] top-1/2 transform -translate-y-1/2 bg-white/90 shadow-[0_4px_20px_rgb(0,0,0,0.15)] rounded-full p-3 text-slate-700 hover:bg-[#ba9c5a] hover:text-white transition-all duration-200 z-10 hidden md:flex opacity-0 group-hover:opacity-100 items-center justify-center active:scale-90"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={scrollPRRight}
                        className="absolute right-4 md:right-[4%] top-1/2 transform -translate-y-1/2 bg-white/90 shadow-[0_4px_20px_rgb(0,0,0,0.15)] rounded-full p-3 text-slate-700 hover:bg-[#ba9c5a] hover:text-white transition-all duration-200 z-10 hidden md:flex opacity-0 group-hover:opacity-100 items-center justify-center active:scale-90"
                        aria-label="Scroll right"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </BentoBox>

                </div>
              </div>
            )}

            {currentView === 'queue' && (
              <div className="animate-fade-in space-y-6">

                {/* Header with Title and Unified Filter */}
                <div className="mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                      <ListTodo className="text-[#ba9c5a]" size={32} /> คิวจองห้องปฏิบัติการ
                    </h1>
                    <p className="text-white/80 mt-2 font-medium text-sm sm:text-base">
                      ภาพรวมสถิติการใช้งานและรายการคิวจองห้องปฏิบัติการ
                    </p>
                  </div>
                  
                  {/* Segmented Filter Control */}
                  <div className="bg-slate-900/60 backdrop-blur-md p-1 rounded-full border border-slate-700/50 flex self-start sm:self-center shrink-0">
                    {['week', 'month', 'year'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setChartFilter(f)}
                        className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                          chartFilter === f
                            ? 'bg-[#ba9c5a] text-white shadow'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {f === 'week' ? 'สัปดาห์' : f === 'month' ? 'เดือน' : 'ปี'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* New Charts Row (Wave Graph + Bar Chart) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Wave Graph (Large Card: lg:col-span-2) */}
                  <BentoBox className="lg:col-span-2 h-[420px] flex flex-col relative overflow-visible">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="text-[#ba9c5a]" size={24} />
                        <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">แนวโน้มการใช้งานคิวจอง</h2>
                      </div>
                      
                      {/* Legend */}
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {[
                          { lab: 'ห้องชีววิทยา อาคาร 13', color: '#22C55E', label: 'ชีววิทยา' },
                          { lab: 'ห้องเคมี อาคาร 13', color: '#A855F7', label: 'เคมี' },
                          { lab: 'ห้องวิทย์ อาคาร 17', color: '#EF4444', label: 'วิทย์' },
                          { lab: 'Visual Lab อาคาร 19', color: '#3B82F6', label: 'Visual' }
                        ].map(legend => (
                          <div key={legend.lab} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: legend.color }}></div>
                            <span>{legend.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="flex-1 min-h-0 relative z-10 flex items-center justify-center pt-2">
                      {(() => {
                        const data = labsChartData[chartFilter];
                        const labels = data.labels;
                        const datasets = data.datasets;
                        
                        const allValues = datasets.flatMap(d => d.data);
                        const maxVal = Math.max(...allValues, 1);
                        
                        const left = 40;
                        const right = 20;
                        const top = 20;
                        const bottom = 30;
                        const widthVal = 600;
                        const heightVal = 240;
                        const plotWidth = widthVal - left - right;
                        const plotHeight = heightVal - top - bottom;
                        const stepX = plotWidth / (labels.length - 1);
                        
                        const getLabColor = (labName) => {
                          if (labName.includes('ชีววิทยา')) return '#22C55E';
                          if (labName.includes('เคมี')) return '#A855F7';
                          if (labName.includes('วิทย์') || labName.includes('อาคาร 17')) return '#EF4444';
                          if (labName.includes('Visual') || labName.includes('อาคาร 19')) return '#3B82F6';
                          return '#64748B';
                        };

                        const getLabGradId = (labName) => {
                          if (labName.includes('ชีววิทยา')) return 'grad-bio';
                          if (labName.includes('เคมี')) return 'grad-chem';
                          if (labName.includes('วิทย์') || labName.includes('อาคาร 17')) return 'grad-sci';
                          if (labName.includes('Visual') || labName.includes('อาคาร 19')) return 'grad-vis';
                          return 'grad-default';
                        };

                        return (
                          <div className="w-full h-full relative">
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${widthVal} ${heightVal}`} preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="grad-bio" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="grad-chem" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="grad-sci" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="grad-vis" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="grad-default" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#64748B" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#64748B" stopOpacity="0.0" />
                                </linearGradient>
                              </defs>

                              {/* Y Axis grid lines & labels */}
                              {Array.from({ length: 5 }).map((_, i) => {
                                const yVal = top + (i * plotHeight) / 4;
                                const labelVal = Math.round(maxVal - (i * maxVal) / 4);
                                return (
                                  <g key={i}>
                                    <line
                                      x1={left}
                                      y1={yVal}
                                      x2={widthVal - right}
                                      y2={yVal}
                                      stroke="#f1f5f9"
                                      strokeDasharray="4 4"
                                    />
                                    <text
                                      x={left - 8}
                                      y={yVal + 4}
                                      textAnchor="end"
                                      className="text-[10px] font-bold fill-slate-400 font-sans"
                                    >
                                      {labelVal}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Hover vertical indicator line */}
                              {hoveredWaveIndex !== null && (
                                <line
                                  x1={left + hoveredWaveIndex * stepX}
                                  y1={top}
                                  x2={left + hoveredWaveIndex * stepX}
                                  y2={heightVal - bottom}
                                  stroke="#cbd5e1"
                                  strokeWidth="1.5"
                                  strokeDasharray="2 2"
                                />
                              )}

                              {/* Wave Lines & Areas */}
                              {datasets.map((dataset) => {
                                const points = dataset.data.map((val, idx) => {
                                  const x = left + idx * stepX;
                                  const y = top + (1 - val / maxVal) * plotHeight;
                                  return [x, y];
                                });
                                const d = getBezierPath(points);
                                const fillD = `${d} L ${points[points.length - 1][0]} ${heightVal - bottom} L ${points[0][0]} ${heightVal - bottom} Z`;
                                const color = getLabColor(dataset.lab);
                                const gradId = getLabGradId(dataset.lab);

                                return (
                                  <g key={dataset.lab}>
                                    <path d={fillD} fill={`url(#${gradId})`} />
                                    <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
                                    {hoveredWaveIndex !== null && (
                                      <circle
                                        cx={points[hoveredWaveIndex][0]}
                                        cy={points[hoveredWaveIndex][1]}
                                        r="5.5"
                                        fill={color}
                                        stroke="white"
                                        strokeWidth="2"
                                        className="transition-all duration-150"
                                      />
                                    )}
                                  </g>
                                );
                              })}

                              {/* X Axis labels */}
                              {labels.map((label, idx) => {
                                const x = left + idx * stepX;
                                return (
                                  <text
                                    key={idx}
                                    x={x}
                                    y={heightVal - bottom + 18}
                                    textAnchor="middle"
                                    className="text-[10px] font-bold fill-slate-400 font-sans"
                                  >
                                    {label}
                                  </text>
                                );
                              })}

                              {/* Invisible interactive zones */}
                              {labels.map((_, idx) => {
                                const x = left + idx * stepX;
                                const widthZone = idx === 0 ? stepX / 2 : idx === labels.length - 1 ? stepX / 2 : stepX;
                                const startX = idx === 0 ? left : x - stepX / 2;

                                return (
                                  <rect
                                    key={idx}
                                    x={startX}
                                    y={0}
                                    width={widthZone}
                                    height={heightVal}
                                    fill="transparent"
                                    className="cursor-pointer"
                                    onMouseEnter={() => setHoveredWaveIndex(idx)}
                                    onMouseLeave={() => setHoveredWaveIndex(null)}
                                  />
                                );
                              })}
                            </svg>

                            {/* Hover Tooltip */}
                            {hoveredWaveIndex !== null && (
                              <div
                                className="absolute bg-slate-900/95 backdrop-blur text-white p-3 rounded-2xl shadow-xl border border-slate-700/50 pointer-events-none z-50 text-[11px] flex flex-col gap-1.5 animate-fade-in font-sans"
                                style={{
                                  left: `${Math.min(
                                    Math.max(6, (left + hoveredWaveIndex * stepX) / widthVal * 100 - 15),
                                    74
                                  )}%`,
                                  top: '20px'
                                }}
                              >
                                <div className="font-bold text-slate-300 border-b border-slate-700 pb-1 mb-1 text-center">
                                  {labels[hoveredWaveIndex]}
                                </div>
                                {datasets.map(d => {
                                  const color = getLabColor(d.lab);
                                  const shortLab = d.lab.split(' ')[0].replace('ห้อง', '');
                                  return (
                                    <div key={d.lab} className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                        <span>{shortLab}</span>
                                      </div>
                                      <span className="font-bold text-white">{d.data[hoveredWaveIndex]} ครั้ง</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </BentoBox>

                  {/* Bar Chart (Small Card: lg:col-span-1) */}
                  <BentoBox className="lg:col-span-1 h-[420px] flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="text-[#ba9c5a]" size={24} />
                        <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">ปริมาณการจองแยกห้อง</h2>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end justify-around gap-2 mt-auto pt-6 border-b border-slate-100 pb-2 relative z-0">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-40 mt-6">
                        <div className="border-b border-dashed border-slate-200 w-full"></div>
                        <div className="border-b border-dashed border-slate-200 w-full"></div>
                        <div className="border-b border-dashed border-slate-200 w-full"></div>
                      </div>

                      {(() => {
                        const totals = labsTotalChartData[chartFilter];
                        const maxTotal = Math.max(...totals.map(t => t.value), 1);
                        
                        const getLabColor = (labName) => {
                          if (labName.includes('ชีววิทยา')) return '#22C55E';
                          if (labName.includes('เคมี')) return '#A855F7';
                          if (labName.includes('วิทย์') || labName.includes('อาคาร 17')) return '#EF4444';
                          if (labName.includes('Visual') || labName.includes('อาคาร 19')) return '#3B82F6';
                          return '#64748B';
                        };

                        return totals.map((t, idx) => {
                          const heightPercent = (t.value / maxTotal) * 100;
                          const color = getLabColor(t.lab);
                          const shortLabName = t.lab.split(' ')[0].replace('ห้อง', '');

                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 group z-10 min-w-0 max-w-[50px]">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md font-semibold shadow-sm pointer-events-none z-20 whitespace-nowrap">
                                {t.value} ครั้ง
                              </div>
                              <div className="w-full max-w-[28px] sm:max-w-[34px] bg-slate-100 rounded-t-md relative overflow-hidden group-hover:shadow-md transition-all h-[160px] sm:h-[190px]">
                                <div
                                  className="absolute bottom-0 w-full rounded-t-md transition-all duration-1000 ease-out"
                                  style={{
                                    height: `${heightPercent}%`,
                                    backgroundColor: color
                                  }}
                                ></div>
                              </div>
                              <span className="text-[9px] sm:text-xs font-bold text-slate-500 mt-2.5 whitespace-nowrap truncate w-full text-center">
                                {shortLabName}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </BentoBox>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  <BentoBox className="h-[400px] flex flex-col relative">
                    <div className="flex justify-between items-center mb-6 relative z-50">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="text-[#ba9c5a]" size={24} />
                        <h2 className="text-xl font-bold tracking-tight text-[#0f172a]">สถิติการจอง</h2>
                      </div>
                    </div>

                    <div className="flex-1 flex items-end justify-evenly gap-1.5 sm:gap-3 mt-auto pt-8 border-b border-slate-100 pb-2 relative z-0">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-40 mt-6">
                        <div className="border-b border-dashed border-slate-300 w-full"></div>
                        <div className="border-b border-dashed border-slate-300 w-full"></div>
                        <div className="border-b border-dashed border-slate-300 w-full"></div>
                      </div>

                      {dynamicChartData[chartFilter].map((data, index) => {
                        const maxHeight = Math.max(...dynamicChartData[chartFilter].map(d => d.value));
                        const heightPercent = maxHeight === 0 ? 0 : (data.value / maxHeight) * 100;
                        return (
                          <div key={index} className="flex flex-col items-center flex-1 group z-10 min-w-0 max-w-[50px]">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-8 bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md font-semibold shadow-sm pointer-events-none z-20 whitespace-nowrap">
                              {data.value} ครั้ง
                            </div>
                            <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-100 rounded-t-md relative overflow-hidden group-hover:shadow-md transition-all h-[150px] sm:h-[180px]">
                              <div
                                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-1000 ease-out"
                                style={{ height: `${heightPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] sm:text-xs font-semibold text-slate-500 mt-2 whitespace-nowrap truncate w-full text-center">{data.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </BentoBox>

                  <BentoBox className="h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-6 shrink-0 gap-2 min-w-0 w-full">
                        <h2 className="text-xl font-bold tracking-tight text-[#0f172a] whitespace-nowrap truncate">คิวจองที่กำลังจะมาถึง</h2>
                        <div className="text-[#ba9c5a] shrink-0"><History size={24} /></div>
                      </div>

                    <div className="flex flex-col gap-3 overflow-y-auto custom-scroll pr-2 flex-1">
                      {isLoading ? (
                        Array.from({length: 4}).map((_, i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl shrink-0" />)
                      ) : upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking, index) => {
                          const bookingDateObj = new Date(booking.date);
                          const isToday = booking.date === getSafeDateStr(new Date());
                          const isHighlighted = index === 0 || isToday;

                          return (
                            <div
                              key={`upc-queue-${booking.id}`}
                              onMouseEnter={(e) => handleUpcomingMouseEnter(e, booking)}
                              onMouseLeave={handleUpcomingMouseLeave}
                              onClick={(e) => handleUpcomingClick(e, booking)}
                              className="flex items-center gap-3 sm:gap-4 p-2.5 sm:p-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all shrink-0 group upcoming-card-btn cursor-pointer relative"
                            >
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 border ${isHighlighted ? 'bg-[#0f172a] text-white border-transparent shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                <span className="text-xs sm:text-sm font-bold leading-none">{booking.date.split('-')[2]}</span>
                                <span className={`text-[9px] sm:text-[10px] font-medium uppercase mt-0.5 sm:mt-1 ${isHighlighted ? 'text-slate-300' : 'text-slate-500'}`}>
                                  {bookingDateObj.toLocaleString('th-TH', { month: 'short' })}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1.5 gap-1 sm:gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#ba9c5a] transition-colors truncate">{formatLabRoom(booking.lab)}</h4>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setSelectedPurpose(booking.purpose); setIsPurposeModalOpen(true); }}
                                      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-200 shadow-sm shrink-0"
                                      title={booking.purpose}
                                    >
                                      <FileText size={10} />
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-wrap">
                                    {booking.priority && (
                                      <span className="px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold whitespace-nowrap bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
                                        {booking.priority.toString().includes('คาบ') ? booking.priority : `คาบ ${booking.priority}`}
                                      </span>
                                    )}
                                    <span className={`px-1 py-0.5 rounded text-[8px] sm:text-[10px] font-semibold whitespace-nowrap shrink-0 ${
                                      booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      booking.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                      'bg-amber-50 text-amber-700 border border-amber-100'
                                    }`}>
                                      {booking.status === 'confirmed' ? 'อนุมัติแล้ว' : booking.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center text-[9px] sm:text-xs text-slate-500 gap-1.5 sm:gap-3 w-full">
                                  <span className="flex items-center gap-1 font-medium shrink-0"><Clock size={10} className={isToday ? "text-rose-500 animate-pulse" : ""}/> {booking.time_col_d}</span>
                                  <span className="text-slate-300 hidden sm:inline">|</span>
                                  <span className="flex items-center gap-1 font-medium truncate min-w-0 max-w-[150px]"><User size={10}/> <span className="truncate">{booking.reqName || 'ผู้ใช้งาน'}</span></span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-slate-500 text-sm py-8 flex flex-col items-center gap-3 m-auto bg-slate-50 w-full rounded-2xl border border-dashed border-slate-200">
                          <CheckCircle2 className="text-green-500/40" size={36} />
                          <p>ไม่มีคิวจองที่กำลังจะมาถึง</p>
                        </div>
                      )}
                    </div>
                  </BentoBox>
                </div>

                <BentoBox className="w-full" noPadding>
                  <div className="p-5 md:p-6 border-b border-slate-100 bg-white flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="shrink-0 flex flex-col w-full lg:w-auto">
                      <h1 className="text-xl font-bold tracking-tight text-[#0f172a]">ข้อมูลผู้ใช้งานจองห้องปฏิบัติการ</h1>
                      <h2 className="text-sm text-slate-500 mt-1">รายการจองห้องปฏิบัติการวิทยาศาสตร์</h2>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-start sm:items-center w-full lg:w-auto justify-start lg:justify-end gap-3 lg:ml-auto">

                      {/* Custom Dropdown Filter for Print Report */}
                      <div className="relative w-full sm:w-auto order-1 sm:order-none" ref={reportDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsReportDropdownOpen(!isReportDropdownOpen)}
                          className={`w-full sm:w-auto flex items-center justify-between gap-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl sm:rounded-full px-4 py-2.5 transition-all text-[13px] sm:text-sm font-semibold shadow-sm hover:border-slate-300 hover:bg-slate-50 focus:ring-4 focus:ring-[#ba9c5a]/10 ${
                            isReportDropdownOpen ? 'border-[#ba9c5a] ring-2 ring-[#ba9c5a]/10' : ''
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <FileText size={16} className="text-[#ba9c5a]" />
                            {reportFilter === 'all' ? 'รายงานทั้งหมด' :
                             reportFilter === 'daily' ? 'รายงานประจำวัน' :
                             reportFilter === 'weekly' ? 'รายงานประจำสัปดาห์' :
                             reportFilter === 'monthly' ? 'รายงานประจำเดือน' :
                             'รายงานประจำปี'}
                          </span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isReportDropdownOpen ? 'rotate-180 text-[#ba9c5a]' : 'text-slate-400'}`}><path d="m6 9 6 6 6-6"/></svg>
                        </button>

                        {isReportDropdownOpen && (
                          <div className="absolute right-0 top-full mt-2 w-full sm:w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-30 py-2 animate-fade-in origin-top-right overflow-hidden">
                            <div className="px-4 pb-2 pt-1 mb-1 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              ช่วงเวลารายงาน
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => { setReportFilter('all'); setIsReportDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${reportFilter === 'all' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              <span>รายงานทั้งหมด</span>
                              {reportFilter === 'all' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setReportFilter('daily'); setIsReportDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${reportFilter === 'daily' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              <span>รายงานประจำวัน</span>
                              {reportFilter === 'daily' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setReportFilter('weekly'); setIsReportDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${reportFilter === 'weekly' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              <span>รายงานประจำสัปดาห์</span>
                              {reportFilter === 'weekly' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setReportFilter('monthly'); setIsReportDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${reportFilter === 'monthly' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              <span>รายงานประจำเดือน</span>
                              {reportFilter === 'monthly' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>

                            <button
                              type="button"
                              onClick={() => { setReportFilter('yearly'); setIsReportDropdownOpen(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${reportFilter === 'yearly' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                            >
                              <span>รายงานประจำปี</span>
                              {reportFilter === 'yearly' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Print Button for Bookings */}
                      <button
                        onClick={handlePrintBookings}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm font-semibold w-full sm:w-auto order-1 sm:order-none"
                        title="พิมพ์รายงานข้อมูลผู้ใช้งานจองห้องปฏิบัติการ (A4 แนวนอน)"
                      >
                         <Printer size={18} /> <span className="inline">พิมพ์รายงาน</span>
                      </button>

                      <div className="flex flex-row flex-nowrap items-center gap-1 sm:gap-2 w-full sm:w-max justify-between lg:justify-end bg-slate-50/80 p-1.5 rounded-[1.25rem] sm:rounded-full border border-slate-100/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] order-last sm:order-none mt-2 sm:mt-0">

                        {/* Search Input Box */}
                        <div className="relative group flex-1 sm:flex-none sm:w-[240px] min-w-[110px] shrink block">
                          <div className="absolute inset-y-0 left-0 pl-3 sm:pl-3.5 flex items-center pointer-events-none">
                            <Search className="text-slate-400 group-focus-within:text-[#ba9c5a] transition-colors" size={16} strokeWidth={2.5} />
                          </div>
                          <input
                            type="text"
                            placeholder="ค้นหารหัสจอง, ชื่อ"
                            value={searchBookingCode}
                            onChange={(e) => setSearchBookingCode(e.target.value)}
                            className="w-full bg-white border border-slate-200 text-slate-700 rounded-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 sm:py-2.5 outline-none focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-[13px] sm:text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-300"
                          />
                          {searchBookingCode && (
                            <button
                              onClick={() => setSearchBookingCode('')}
                              className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                            >
                              <X size={16} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>

                      <div className="relative shrink-0" ref={statusDropdownRef}>
                        <button
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 shadow-sm ${
                            isStatusDropdownOpen || filterBookingStatus !== 'all'
                            ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md shadow-slate-800/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-[#ba9c5a]/10'
                          }`}
                          title="ตัวกรองสถานะ"
                        >
                          {filterBookingStatus === 'all' ? <ListTodo size={16} strokeWidth={2.5} /> :
                           filterBookingStatus === 'pending' ? <Clock size={16} strokeWidth={2.5} className={isStatusDropdownOpen || filterBookingStatus !== 'all' ? "text-blue-400" : "text-blue-500"}/> :
                           filterBookingStatus === 'confirmed' ? <CheckCircle2 size={16} strokeWidth={2.5} className={isStatusDropdownOpen || filterBookingStatus !== 'all' ? "text-emerald-400" : "text-emerald-500"}/> :
                           <XCircle size={16} strokeWidth={2.5} className={isStatusDropdownOpen || filterBookingStatus !== 'all' ? "text-rose-400" : "text-rose-500"}/>}
                        </button>

                        {isStatusDropdownOpen && (
                          <div className="absolute right-0 top-full mt-3 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-10 py-2 animate-fade-in origin-top-right overflow-hidden">
                            <div className="px-4 pb-2 pt-1 mb-1 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              สถานะอนุมัติ
                            </div>
                            <button onClick={() => { setFilterBookingStatus('all'); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${filterBookingStatus === 'all' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}>
                              <span className="flex items-center gap-2"><ListTodo size={14}/> ทั้งหมด</span>
                              {filterBookingStatus === 'all' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>
                            <button onClick={() => { setFilterBookingStatus('pending'); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${filterBookingStatus === 'pending' ? 'text-blue-700 font-bold bg-blue-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}>
                              <span className="flex items-center gap-2"><Clock size={14} className="text-blue-500"/> รออนุมัติ</span>
                              {filterBookingStatus === 'pending' && <Check size={16} className="text-blue-600" strokeWidth={3} />}
                            </button>
                            <button onClick={() => { setFilterBookingStatus('confirmed'); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${filterBookingStatus === 'confirmed' ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}>
                              <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> อนุมัติแล้ว</span>
                              {filterBookingStatus === 'confirmed' && <Check size={16} className="text-emerald-600" strokeWidth={3} />}
                            </button>
                            <button onClick={() => { setFilterBookingStatus('rejected'); setIsStatusDropdownOpen(false); }} className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${filterBookingStatus === 'rejected' ? 'text-rose-700 font-bold bg-rose-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}>
                              <span className="flex items-center gap-2"><XCircle size={14} className="text-rose-500"/> ไม่อนุมัติ</span>
                              {filterBookingStatus === 'rejected' && <Check size={16} className="text-rose-600" strokeWidth={3} />}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative shrink-0 w-10 h-10 group">
                        <input
                          type="date"
                          value={filterBookingDate}
                          onChange={(e) => setFilterBookingDate(e.target.value)}
                          onClick={(e) => {
                            if (typeof e.target.showPicker === 'function') {
                              try { e.target.showPicker(); } catch(err) {}
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          title={filterBookingDate ? `กรองวันที่: ${formatDisplayDate(filterBookingDate)}` : "กรองตามวันที่"}
                        />
                        <div className={`absolute inset-0 flex items-center justify-center rounded-full border transition-all duration-200 shadow-sm pointer-events-none ${
                          filterBookingDate
                          ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md shadow-slate-800/20'
                          : 'bg-white border-slate-200 text-slate-600 group-hover:bg-slate-50 group-hover:border-slate-300 group-hover:text-slate-900 group-focus-within:ring-4 group-focus-within:ring-[#ba9c5a]/10'
                        }`}>
                          <CalendarIcon size={16} strokeWidth={2.5} />
                        </div>
                        {filterBookingDate && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilterBookingDate(''); }}
                            className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors z-20 w-4 h-4 flex items-center justify-center cursor-pointer shadow-sm active:scale-90"
                            title="ล้างวันที่"
                          >
                            <X size={10} strokeWidth={3} className="shrink-0" />
                          </button>
                        )}
                      </div>

                      <div className="relative shrink-0" ref={sortDropdownRef}>
                        <button
                          onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-200 shadow-sm ${
                            isSortDropdownOpen || sortBookingOrder !== 'newest'
                            ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md shadow-slate-800/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 focus:ring-4 focus:ring-[#ba9c5a]/10'
                          }`}
                          title="เรียงลำดับ"
                        >
                          <Filter size={16} strokeWidth={2.5} />
                        </button>

                        {isSortDropdownOpen && (
                          <div className="absolute right-0 top-full mt-3 w-44 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-10 py-2 animate-fade-in origin-top-right overflow-hidden">
                            <div className="px-4 pb-2 pt-1 mb-1 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              เรียงลำดับ
                            </div>
                              <button
                                onClick={() => { setSortBookingOrder('newest'); setIsSortDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${sortBookingOrder === 'newest' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                              >
                                <span>ใหม่สุด</span>
                                {sortBookingOrder === 'newest' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                              </button>
                              <button
                                onClick={() => { setSortBookingOrder('oldest'); setIsSortDropdownOpen(false); }}
                                className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${sortBookingOrder === 'oldest' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900'}`}
                              >
                                <span>เก่าสุด</span>
                              {sortBookingOrder === 'oldest' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                            </button>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scroll w-full bg-slate-50/30 pb-4">
                    <table className="w-full text-sm text-left whitespace-nowrap min-w-[1500px]">
                      <thead className="text-xs text-slate-500 bg-slate-100/80 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-16 text-center">ลำดับ</th>
                          <th className="px-4 py-4 font-semibold text-center">การอนุญาต</th>
                          <th className="px-4 py-4 font-semibold text-center">รหัสจอง</th>
                          <th className="px-4 py-4 font-semibold text-center">สถานะ</th>
                          <th className="px-4 py-4 font-semibold text-center">แจ้งเตือน</th>
                          <th className="px-4 py-4 font-semibold text-center">คาบ</th>
                          <th className="px-4 py-4 font-semibold">ห้องปฏิบัติการ</th>
                          <th className="px-4 py-4 font-semibold">ผู้จอง</th>
                          <th className="px-4 py-4 font-semibold">วันใช้งาน</th>
                          <th className="px-4 py-4 font-semibold">จองวันที่</th>
                          <th className="px-4 py-4 font-semibold">ถึงวันที่</th>
                          <th className="px-4 py-4 font-semibold">เริ่มเวลา</th>
                          <th className="px-4 py-4 font-semibold">สิ้นสุดเวลา</th>
                          <th className="px-4 py-4 font-semibold text-center">วัตถุประสงค์</th>
                          <th className="px-4 py-4 font-semibold text-center">รูปภาพ</th>
                          <th className="px-4 py-4 font-semibold text-center">บล็อกผู้ใช้งาน</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {currentBookings.length > 0 ? currentBookings.map((booking, index) => {
                          const dateObj = new Date(booking.startDate);
                          const sequentialIndex = indexOfFirstItem + index + 1;
                          const startDateStr = formatDisplayDate(booking.startDate);
                          const endDateStr = formatDisplayDate(booking.endDate);
                          const weekdayStr = booking.dayOfUse || dateObj.toLocaleDateString('th-TH', { weekday: 'long' }).replace('วัน', '');

                          return (
                            <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4 text-center font-medium text-slate-500">
                                {sequentialIndex}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => { setApproveActionData({ id: booking.original_id, action: 'approve' }); setIsApproveModalOpen(true); }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-500/25 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-200 active:scale-90 hover:scale-110"
                                    title="อนุมัติ"
                                  >
                                    <Check size={14} strokeWidth={3.5} />
                                  </button>
                                  <button
                                    onClick={() => { setApproveActionData({ id: booking.original_id, action: 'reject' }); setIsApproveModalOpen(true); }}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/30 transition-all duration-200 active:scale-90 hover:scale-110"
                                    title="ไม่อนุมัติ"
                                  >
                                    <X size={14} strokeWidth={3.5} />
                                  </button>
                                </div>
                              </td>

                              <td className="px-4 py-4 font-semibold text-slate-700 text-center">
                                {booking.bookingCode || '-'}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                                  booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  booking.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                  'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {booking.status === 'confirmed' ? <CheckCircle2 size={12} /> : booking.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                  {booking.statusText || 'รออนุมัติ'}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-center">
                                <div className="relative inline-block">
                                  <button
                                    onClick={() => {
                                      setEditingNoteId(booking.original_id);
                                      setNoteInputValue(booking.note || '');
                                      setIsNoteModalOpen(true);
                                    }}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 shadow-sm ${booking.note ? 'bg-slate-100 text-[#ba9c5a] hover:bg-[#ba9c5a] hover:text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                    title={booking.note ? "แก้ไขแจ้งเตือน" : "เพิ่มแจ้งเตือน"}
                                  >
                                    <FileEdit size={16} />
                                  </button>
                                  {booking.note && (
                                    <span className="absolute top-0 right-0 transform translate-x-[20%] -translate-y-[20%] w-2.5 h-2.5 bg-rose-500 rounded-full border border-white z-10"></span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4 text-center">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(booking.priority || 'ปกติ')}`}>
                                  {booking.priority || '-'}
                                </span>
                              </td>

                              <td className="px-4 py-4 text-slate-700 font-medium">
                                {booking.lab || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-900 font-medium">
                                {booking.reqName || '-'}
                              </td>

                              <td className="px-4 py-4 font-medium text-slate-700">
                                {weekdayStr}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {startDateStr}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {endDateStr}
                              </td>

                              <td className="px-4 py-4 text-slate-600 font-medium">
                                {booking.startTime}
                              </td>

                              <td className="px-4 py-4 text-slate-600 font-medium">
                                {booking.endTime || '-'}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedPurpose(booking.purpose);
                                    setIsPurposeModalOpen(true);
                                  }}
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-[#ba9c5a] hover:text-white transition-all duration-200 shadow-sm"
                                  title="ดูวัตถุประสงค์"
                                >
                                  <Users size={16} />
                                </button>
                              </td>

                              <td className="px-4 py-4 text-center">
                                {booking.attachment ? (
                                  <div className="relative group cursor-pointer inline-block overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-all hover:border-[#ba9c5a] shadow-sm hover:scale-105 active:scale-95 mx-auto"
                                       style={{ width: '48px', height: '36px' }}
                                       onClick={() => {
                                         setSelectedAttachmentUrl(formatImageUrl(booking.attachment));
                                         setIsAttachmentModalOpen(true);
                                       }}
                                       title="คลิกเพื่อขยายรูปภาพ"
                                  >
                                    <img
                                      src={formatImageUrl(booking.attachment)}
                                      alt="Attachment"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleToggleBlockStatus(booking.bookerEmail, booking.isUserBlocked)}
                                  disabled={!booking.bookerEmail || booking.bookerEmail === '-' || blockingUserEmail === booking.bookerEmail}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 mx-auto flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    booking.isUserBlocked
                                      ? 'bg-blue-100 text-[#026670] hover:bg-blue-200 border border-blue-200'
                                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                                  }`}
                                >
                                  {blockingUserEmail === booking.bookerEmail && <LoadingSpinner size={12} />}
                                  {booking.isUserBlocked ? 'ปลดบล็อก' : 'บล็อก'}
                                </button>
                              </td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="16" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <CalendarIcon className="text-slate-300" size={32} />
                                <p>ไม่พบข้อมูลการจองห้องปฏิบัติการ</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-5 md:p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="text-sm text-slate-500">
                      แสดง <span className="text-slate-900">{filteredAndSortedBookings.length > 0 ? indexOfFirstItem + 1 : 0}</span> ถึง <span className="text-slate-900">{Math.min(indexOfLastItem, filteredAndSortedBookings.length)}</span> จาก <span className="text-slate-900">{filteredAndSortedBookings.length}</span> รายการ
                    </div>

                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                        >
                          <ChevronLeft size={18} />
                        </button>

                        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth max-w-[55vw] sm:max-w-[400px] px-1 py-1">
                          {Array.from({length: totalPages}, (_, i) => i + 1).map(number => (
                            <button
                              key={number}
                              onClick={() => setCurrentPage(number)}
                              className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all shrink-0 ${
                                currentPage === number
                                  ? 'bg-[#0f172a] text-white shadow-md scale-105'
                                  : 'text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {number}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    </div>
                </BentoBox>

              </div>
            )}

            {currentView === 'bookings' && (
              <div className="animate-fade-in space-y-6">

                <div className="mb-2 flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                      <CalendarIcon className="text-[#ba9c5a]" size={32} /> รายการจอง
                    </h1>
                    <p className="text-white/80 mt-2 font-medium truncate sm:whitespace-normal text-sm sm:text-base">
                      จัดการและตรวจสอบสถานะรายการจองห้องปฏิบัติการวิทยาศาสตร์ทั้งหมด
                    </p>
                  </div>
                </div>

                {/* Dashboard Stats Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {/* Total Card */}
                  <div
                    onClick={() => setBookingsStatusFilter('all')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 shadow-sm ${
                      bookingsStatusFilter === 'all'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${bookingsStatusFilter === 'all' ? 'text-white' : 'text-slate-500'}`}>รายการทั้งหมด</span>
                      <CalendarIcon size={20} className={bookingsStatusFilter === 'all' ? 'text-white' : 'text-slate-400'} />
                    </div>
                    <div className="text-3xl font-extrabold mt-2">{counts.approved + counts.pending + counts.rejected}</div>
                  </div>

                  {/* Pending Card */}
                  <div
                    onClick={() => setBookingsStatusFilter('pending')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 shadow-sm ${
                      bookingsStatusFilter === 'pending'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${bookingsStatusFilter === 'pending' ? 'text-white' : 'text-slate-500'}`}>รออนุมัติ</span>
                      <Clock size={20} className={bookingsStatusFilter === 'pending' ? 'text-white' : 'text-amber-500'} />
                    </div>
                    <div className={`text-3xl font-extrabold mt-2 ${bookingsStatusFilter === 'pending' ? 'text-white' : 'text-amber-600'}`}>{counts.pending}</div>
                  </div>

                  {/* Approved Card */}
                  <div
                    onClick={() => setBookingsStatusFilter('confirmed')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 shadow-sm ${
                      bookingsStatusFilter === 'confirmed'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${bookingsStatusFilter === 'confirmed' ? 'text-white' : 'text-slate-500'}`}>อนุมัติ</span>
                      <CheckCircle2 size={20} className={bookingsStatusFilter === 'confirmed' ? 'text-white' : 'text-emerald-500'} />
                    </div>
                    <div className={`text-3xl font-extrabold mt-2 ${bookingsStatusFilter === 'confirmed' ? 'text-white' : 'text-emerald-600'}`}>{counts.approved}</div>
                  </div>

                  {/* Rejected Card */}
                  <div
                    onClick={() => setBookingsStatusFilter('rejected')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer select-none active:scale-95 shadow-sm ${
                      bookingsStatusFilter === 'rejected'
                      ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                      : 'bg-white border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`text-sm font-semibold ${bookingsStatusFilter === 'rejected' ? 'text-white' : 'text-slate-500'}`}>ไม่อนุมัติ</span>
                      <XCircle size={20} className={bookingsStatusFilter === 'rejected' ? 'text-white' : 'text-rose-500'} />
                    </div>
                    <div className={`text-3xl font-extrabold mt-2 ${bookingsStatusFilter === 'rejected' ? 'text-white' : 'text-rose-600'}`}>{counts.rejected}</div>
                  </div>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  {/* Search input */}
                  <div className="relative w-full sm:max-w-xs">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Search size={16} className="text-slate-400" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหารหัสจอง"
                      value={searchBookingText}
                      onChange={(e) => setSearchBookingText(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-full outline-none shadow-[0_0_0_6px_#f1f5f9] placeholder:text-slate-400/80 focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm"
                    />
                  </div>

                  {/* Sort order dropdown */}
                  <div className="relative shrink-0 ml-auto" ref={myBookingsSortRef}>
                    <button
                      onClick={() => setIsMyBookingsSortOpen(!isMyBookingsSortOpen)}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 shadow-sm text-sm font-semibold ${
                        isMyBookingsSortOpen || myBookingsSortOrder !== 'newest'
                        ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Filter size={16} strokeWidth={2.5} />
                      <span>{myBookingsSortOrder === 'newest' ? 'ใหม่สุด' : 'เก่าสุด'}</span>
                    </button>

                    {isMyBookingsSortOpen && (
                      <div className="absolute right-0 top-full mt-2 w-40 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 z-50 py-2 animate-fade-in origin-top-right overflow-hidden">
                        <div className="px-4 pb-2 pt-1 mb-1 border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          เรียงตามวันที่จอง
                        </div>
                        <button
                          onClick={() => { setMyBookingsSortOrder('newest'); setIsMyBookingsSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${myBookingsSortOrder === 'newest' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}
                        >
                          <span>ล่าสุด</span>
                          {myBookingsSortOrder === 'newest' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                        </button>
                        <button
                          onClick={() => { setMyBookingsSortOrder('oldest'); setIsMyBookingsSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors relative ${myBookingsSortOrder === 'oldest' ? 'text-[#0f172a] font-bold bg-slate-50/50' : 'text-slate-600 font-medium hover:bg-slate-50'}`}
                        >
                          <span>เก่าสุด</span>
                          {myBookingsSortOrder === 'oldest' && <Check size={16} className="text-[#ba9c5a]" strokeWidth={3} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Grid Cards Container */}
                {myBookingsList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBookingsList.map((b, index) => {
                      const startDateStr = formatDisplayDate(b.startDate || b.date);
                      const endDateStr = formatDisplayDate(b.endDate && b.endDate !== '-' ? b.endDate : (b.startDate || b.date));
                      const dateObj = new Date(b.startDate || b.date);
                      const weekdayStr = b.dayOfUse || dateObj.toLocaleDateString('th-TH', { weekday: 'long' }).replace('วัน', '');

                      return (
                        <div key={`booking-card-${b.id}`} className={`bg-white rounded-[2rem] border-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col hover:-translate-y-1 relative ${
                          b.status === 'confirmed' ? 'border-emerald-500' :
                          b.status === 'rejected' ? 'border-rose-500' :
                          'border-amber-400'
                        }`}>
                          {/* Card Header: Thick status bar covering index and bookingCode */}
                          <div className={`px-6 py-3.5 flex justify-between items-center text-white shrink-0 font-bold ${
                            b.status === 'confirmed' ? 'bg-emerald-500' :
                            b.status === 'rejected' ? 'bg-rose-500' :
                            'bg-[#f6b92a]'
                          }`}>
                            <span className="text-sm tracking-wider">ลำดับ {indexOfFirstItem + index + 1}</span>
                            <span className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded-xl font-['Poppins'] border border-red-50 shadow-sm">
                              {b.bookingCode || '-'}
                            </span>
                          </div>

                          {/* Card Content Container */}
                          <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                            {/* Top details section */}
                            <div className="space-y-4">
                              {/* Status Badge */}
                              <div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                                  b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                  b.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                                  'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                  {b.status === 'confirmed' ? <CheckCircle2 size={13} /> : b.status === 'rejected' ? <XCircle size={13} /> : <Clock size={13} />}
                                  {b.status === 'confirmed' ? 'อนุมัติ' : b.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                                </span>
                              </div>

                              {/* Purpose & Lab Room */}
                              <div>
                                <h3 className="font-bold text-slate-800 text-base mb-1.5 line-clamp-2" title={b.purpose}>
                                  {b.purpose}
                                </h3>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                  <MapPin size={12} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{b.lab || '-'}</span>
                                </p>
                              </div>

                              {/* Divider */}
                              <div className="border-t border-slate-100 my-2"></div>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                                <div className="min-w-0">
                                  <span className="text-slate-400 block mb-0.5">ผู้จอง</span>
                                  <span className="font-semibold text-slate-700 truncate block" title={b.reqName}>{b.reqName || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">คาบ</span>
                                  <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold text-[10px] ${getPriorityColor(b.priority || 'ปกติ')}`}>
                                    {b.priority && b.priority.toString().includes('คาบ') ? b.priority : `คาบ ${b.priority || '-'}`}
                                  </span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400 block mb-0.5">วันใช้งาน</span>
                                  <span className="font-semibold text-slate-700 block">{weekdayStr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">จองวันที่</span>
                                  <span className="font-semibold text-slate-700 block">{startDateStr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">ถึงวันที่</span>
                                  <span className="font-semibold text-slate-700 block">{endDateStr}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">เริ่มเวลา</span>
                                  <span className="font-semibold text-slate-700 block">{b.startTime || '-'} น.</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block mb-0.5">สิ้นสุดเวลา</span>
                                  <span className="font-semibold text-slate-700 block">{b.endTime || '-'} น.</span>
                                </div>
                              </div>

                              {/* Alert / Notification Note */}
                              {b.note && (
                                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs flex gap-2">
                                  <Bell size={16} className="shrink-0 text-amber-600" />
                                  <div className="min-w-0">
                                    <span className="font-bold">แจ้งเตือน: </span>
                                    <span className="break-words text-slate-700">{b.note}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Bottom image and actions section */}
                            <div className="shrink-0 mt-auto space-y-4">
                              <div>
                                <span className="text-slate-400 block text-xs mb-1.5 font-medium">รูปภาพแนบ</span>
                                {b.attachment ? (
                                  <div className="relative group/img-container w-full h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                                    <img
                                      src={formatImageUrl(b.attachment)}
                                      alt="Attachment"
                                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                                      onClick={() => { setSelectedAttachmentUrl(formatImageUrl(b.attachment)); setIsAttachmentModalOpen(true); }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=100';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic text-xs">ไม่มีรูปภาพแนบ</span>
                                )}
                              </div>

                              {/* Note/Notification Action */}
                              <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                                <span className="text-slate-400 font-medium">การแจ้งเตือน</span>
                                <button
                                  onClick={() => {
                                    setEditingNoteId(b.original_id || b.id);
                                    setNoteInputValue(b.note || '');
                                    setIsNoteModalOpen(true);
                                  }}
                                  className={`inline-flex items-center justify-center px-3 py-1.5 rounded-full transition-all duration-200 shadow-sm border text-xs gap-1.5 font-medium ${
                                    b.note
                                    ? 'bg-slate-100 border-slate-200 text-[#ba9c5a] hover:bg-[#ba9c5a] hover:text-white'
                                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                  }`}
                                  title={b.note ? "แก้ไขแจ้งเตือน" : "เพิ่มแจ้งเตือน"}
                                >
                                  <FileEdit size={12} />
                                  <span>{b.note ? 'แก้ไขโน้ต' : 'เพิ่มโน้ต'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Card Actions (Only for pending bookings) */}
                          {b.status === 'pending' && (
                            <div className="bg-slate-50/80 p-3.5 border-t border-slate-100 flex gap-3">
                              <button
                                onClick={() => { setApproveActionData({ id: b.original_id || b.id, action: 'approve' }); setIsApproveModalOpen(true); }}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                              >
                                <span className="w-5 h-5 rounded-full bg-white/25 inline-flex items-center justify-center shrink-0"><Check size={12} strokeWidth={3.5} /></span>
                                <span>อนุมัติ</span>
                              </button>
                              <button
                                onClick={() => { setApproveActionData({ id: b.original_id || b.id, action: 'reject' }); setIsApproveModalOpen(true); }}
                                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-all duration-200 active:scale-95 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:-translate-y-0.5"
                              >
                                <span className="w-5 h-5 rounded-full bg-white/25 inline-flex items-center justify-center shrink-0"><X size={12} strokeWidth={3.5} /></span>
                                <span>ไม่อนุมัติ</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-12 text-center text-white">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <CalendarIcon className="text-white/40" size={48} />
                      <p className="text-lg font-bold mt-2">ไม่พบรายการจอง</p>
                      <p className="text-white/60 text-sm">ลองเปลี่ยนการกรองหรือค้นหาโดยใช้คำอื่น</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'users' && (
              <div className="animate-fade-in space-y-6">

                <div className="mb-2 flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                      <Users className="text-[#ba9c5a]" size={32} /> บัญชีผู้ใช้งาน
                    </h1>
                    <p className="text-white/80 mt-2 font-medium truncate sm:whitespace-normal text-sm sm:text-base">จัดการรายชื่อ ข้อมูล และกำหนดสิทธิ์การใช้งานระบบ</p>
                  </div>
                </div>

                {/* --- 1. Admin Users Table --- */}
                <BentoBox className="w-full mb-6" noPadding>
                  <div className="p-5 md:p-6 border-b border-slate-100 bg-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-3xl">
                    <div className="shrink-0 w-full sm:w-auto">
                      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Lock size={20} className="text-[#ba9c5a]" /> ผู้ดูแลระบบ  Admin
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">ทั้งหมด {filteredAdmins.length} รายการ — จำนวนบุคลากรเป็นผู้ดูแลระบบ</p>
                    </div>

                    <div className="flex flex-row flex-wrap sm:flex-nowrap items-center w-full sm:w-auto justify-start sm:justify-end gap-3">

                      {/* Print Button */}
                      <button
                        onClick={handlePrintAdmins}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm font-semibold order-1 sm:order-none w-full sm:w-auto"
                        title="พิมพ์รายงานผู้ดูแลระบบ (A4)"
                      >
                         <Printer size={18} /> <span className="inline">พิมพ์รายงาน</span>
                      </button>

                      <div className="relative group w-full sm:w-[260px] order-last sm:order-none mt-2 sm:mt-0 block bg-slate-800 p-1.5 rounded-2xl sm:rounded-full border border-slate-700/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Search className="text-slate-400 group-focus-within:text-[#ba9c5a] transition-colors" size={16} strokeWidth={2.5} />
                        </div>
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อ หรือ อีเมล"
                          value={searchAdmin}
                          onChange={(e) => setSearchAdmin(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-700 rounded-full pl-10 pr-10 sm:pr-4 py-2 outline-none focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-300"
                        />
                        {searchAdmin && (
                          <button
                            onClick={() => setSearchAdmin('')}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scroll w-full bg-slate-50/30 pb-4">
                    <table className="w-full text-sm text-left whitespace-nowrap min-w-[1400px]">
                      <thead className="text-xs text-slate-500 bg-slate-100/80 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-16 text-center">ลำดับ</th>
                          <th className="px-4 py-4 font-semibold text-center">รูปโปรไฟล์</th>
                          <th className="px-4 py-4 font-semibold">ชื่อผู้ใช้งาน</th>
                          <th className="px-4 py-4 font-semibold">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-4 font-semibold">ตำแหน่ง</th>
                          <th className="px-4 py-4 font-semibold">เบอร์โทรศัพท์</th>
                          <th className="px-4 py-4 font-semibold">อีเมล</th>
                          <th className="px-4 py-4 font-semibold">วันที่สมัคร</th>
                          <th className="px-4 py-4 font-semibold">เวลาสมัคร</th>
                          <th className="px-4 py-4 font-semibold">ชื่อผู้ใช้งานระบบ (แก้ไขได้)</th>
                          <th className="px-4 py-4 font-semibold">รหัสผ่าน (แก้ไขได้)</th>
                          {currentUser?.role === 'director' && (
                            <>
                              <th className="px-4 py-4 font-semibold text-center">การอนุมัติแอดมิน</th>
                              <th className="px-4 py-4 font-semibold text-center">บล็อกผู้ใช้งาน</th>
                              <th className="px-4 py-4 font-semibold text-center">ลบข้อมูล</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {currentAdminsPage.length > 0 ? currentAdminsPage.map((admin, index) => {
                          const sequentialIndex = adminIndexOfFirstItem + index + 1;
                          const currentEdit = adminEdits[admin.id] || { isSaving: false, isDirty: false, showPass: false };

                          return (
                            <tr key={admin.id || `a-${index}`} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4 text-center font-medium text-slate-500">
                                {sequentialIndex}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <div
                                  className="cursor-pointer hover:opacity-80 transition-opacity inline-block group/profile relative"
                                  onClick={() => {
                                    setSelectedUserInfo(admin);
                                    setShowUserInfoPassword(false);
                                    setIsUserInfoModalOpen(true);
                                  }}
                                  title="ดูข้อมูลผู้ใช้งาน"
                                >
                                  {admin.profileImage ? (
                                    <img src={formatImageUrl(admin.profileImage)} alt="Profile" loading="lazy" className="w-9 h-9 rounded-full object-cover mx-auto shadow-sm border border-slate-200 group-hover/profile:ring-2 group-hover/profile:ring-[#ba9c5a] transition-all" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}/>
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover/profile:ring-2 group-hover/profile:ring-[#ba9c5a] transition-all"><User size={16}/></div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100 opacity-0 group-hover/profile:opacity-100 transition-opacity">
                                    <Info size={12} className="text-[#ba9c5a]" />
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 font-semibold text-[#0f172a]">
                                {admin.username || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-700 font-medium">
                                {admin.firstName || '-'} {admin.lastName || ''}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {admin.position || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {admin.phone ? (String(admin.phone).startsWith('0') ? String(admin.phone) : '0' + String(admin.phone)) : '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {admin.email || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {admin.regDate || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {admin.regTime || '-'}
                              </td>

                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={currentEdit.username !== undefined ? currentEdit.username : (admin.username || '')}
                                  onChange={(e) => handleAdminEdit(admin.id, 'username', e.target.value)}
                                  placeholder="ชื่อผู้ใช้งานระบบ"
                                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 w-40 transition-all font-medium"
                                />
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <input
                                      type={currentEdit.showPass ? "text" : "password"}
                                      value={currentEdit.password !== undefined ? currentEdit.password : (admin.password || '')}
                                      onChange={(e) => handleAdminEdit(admin.id, 'password', e.target.value)}
                                      placeholder="รหัสผ่าน"
                                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 w-36 transition-all font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleAdminEdit(admin.id, 'showPass', !currentEdit.showPass)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                      {currentEdit.showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>

                                  {currentEdit.isDirty && (
                                    <button
                                      onClick={() => saveAdminEdit(admin.id)}
                                      disabled={currentEdit.isSaving || (!currentEdit.username && !admin.username)}
                                      className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                                      title="บันทึกการแก้ไข"
                                    >
                                      {currentEdit.isSaving ? <LoadingSpinner size={14} /> : <Check size={16} strokeWidth={3} />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              {currentUser?.role === 'director' && (
                                <>
                                  <td className="px-4 py-4 text-center">
                                    {admin.isApproved ? (
                                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all mx-auto inline-flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default select-none">
                                        <CheckCircle2 size={12} />
                                        อนุมัติแล้ว
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleToggleAdminApproval(admin.email, admin.isApproved)}
                                        disabled={!admin.email || admin.email === '-' || approvingAdminEmail === admin.email}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 mx-auto flex items-center justify-center gap-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 disabled:opacity-50 disabled:cursor-wait"
                                      >
                                        {approvingAdminEmail === admin.email && <LoadingSpinner size={12} />}
                                        รออนุมัติ
                                      </button>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <button
                                      onClick={() => handleToggleAdminBlock(admin.email, admin.isUserBlocked)}
                                      disabled={!admin.email || admin.email === '-' || blockingAdminEmail === admin.email}
                                      className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 mx-auto flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-wait ${
                                        admin.isUserBlocked
                                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                          : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                                      }`}
                                    >
                                      {blockingAdminEmail === admin.email && <LoadingSpinner size={12} />}
                                      {admin.isUserBlocked ? 'ปลดบล็อก' : 'บล็อก'}
                                    </button>
                                  </td>
                                  <td className="px-4 py-4 text-center">
                                    <button
                                      onClick={() => handleDeleteUserClick(admin, 'admin')}
                                      className="p-2 bg-white text-[#0f172a] border border-[#0f172a] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-600 rounded-xl transition-all shadow-sm active:scale-90 mx-auto flex items-center justify-center"
                                      title="ลบข้อมูลแอดมิน"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="12" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <Lock className="text-slate-300" size={32} />
                                <p>ไม่พบรายชื่อผู้ดูแลระบบ</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-5 md:p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="text-sm text-slate-500">
                      แสดง <span className="text-slate-900">{filteredAdmins.length > 0 ? adminIndexOfFirstItem + 1 : 0}</span> ถึง <span className="text-slate-900">{Math.min(adminIndexOfLastItem, filteredAdmins.length)}</span> จาก <span className="text-slate-900">{filteredAdmins.length}</span> รายการ
                    </div>

                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => setAdminCurrentPage(p => Math.max(1, p - 1))}
                        disabled={adminCurrentPage === 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth max-w-[55vw] sm:max-w-[400px] px-1 py-1">
                        {Array.from({length: adminTotalPages}, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => setAdminCurrentPage(number)}
                            className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all shrink-0 ${
                              adminCurrentPage === number
                                ? 'bg-[#0f172a] text-white shadow-md scale-105'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setAdminCurrentPage(p => Math.min(adminTotalPages, p + 1))}
                        disabled={adminCurrentPage === adminTotalPages || adminTotalPages === 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </BentoBox>

                {/* --- 2. General Users Table --- */}
                <BentoBox className="w-full mb-6" noPadding>
                  <div className="p-5 md:p-6 border-b border-slate-100 bg-[#0f172a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-t-3xl">
                    <div className="shrink-0 w-full sm:w-auto">
                      <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                        <Users size={20} className="text-[#ba9c5a]" /> ผู้ใช้งานทั่วไป  Users
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">ทั้งหมด {filteredUsers.length} รายการ — จำนวนบุคลากรที่ใช้งานระบบ</p>
                    </div>

                    <div className="flex flex-row flex-wrap sm:flex-nowrap items-center w-full sm:w-auto justify-start sm:justify-end gap-3">

                      {/* Print Button for Users */}
                      <button
                        onClick={handlePrintUsers}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 sm:px-4 sm:py-2.5 rounded-2xl sm:rounded-full flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 text-sm font-semibold order-1 sm:order-none w-full sm:w-auto"
                        title="พิมพ์รายงานผู้ใช้งานทั่วไป (A4)"
                      >
                         <Printer size={18} /> <span className="inline">พิมพ์รายงาน</span>
                      </button>

                      <div className="relative group w-full sm:w-[260px] order-last sm:order-none mt-2 sm:mt-0 block bg-slate-800 p-1.5 rounded-2xl sm:rounded-full border border-slate-700/60 shadow-[inset_0_1px_4px_rgba(0,0,0,0.2)]">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Search className="text-slate-400 group-focus-within:text-[#ba9c5a] transition-colors" size={16} strokeWidth={2.5} />
                        </div>
                        <input
                          type="text"
                          placeholder="ค้นหาชื่อ หรือ อีเมล"
                          value={searchUser}
                          onChange={(e) => setSearchUser(e.target.value)}
                          className="w-full bg-white border border-slate-200 text-slate-700 rounded-full pl-10 pr-10 sm:pr-4 py-2 outline-none focus:border-[#ba9c5a] focus:ring-4 focus:ring-[#ba9c5a]/10 transition-all text-sm shadow-sm placeholder:text-slate-400 hover:border-slate-300"
                        />
                        {searchUser && (
                          <button
                            onClick={() => setSearchUser('')}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <X size={16} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto custom-scroll w-full bg-slate-50/30 pb-4">
                    <table className="w-full text-sm text-left whitespace-nowrap min-w-[1400px]">
                      <thead className="text-xs text-slate-500 bg-slate-100/80 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold w-16 text-center">ลำดับ</th>
                          <th className="px-4 py-4 font-semibold text-center">รูปโปรไฟล์</th>
                          <th className="px-4 py-4 font-semibold">ชื่อผู้ใช้งาน</th>
                          <th className="px-4 py-4 font-semibold">ชื่อ-นามสกุล</th>
                          <th className="px-4 py-4 font-semibold">ตำแหน่ง</th>
                          <th className="px-4 py-4 font-semibold">เบอร์โทรศัพท์</th>
                          <th className="px-4 py-4 font-semibold">อีเมล</th>
                          <th className="px-4 py-4 font-semibold">วันที่สมัคร</th>
                          <th className="px-4 py-4 font-semibold">เวลาสมัคร</th>
                          <th className="px-4 py-4 font-semibold">ชื่อผู้ใช้งานระบบ (แก้ไขได้)</th>
                          <th className="px-4 py-4 font-semibold">รหัสผ่าน (แก้ไขได้)</th>
                          <th className="px-4 py-4 font-semibold text-center">อนุมัติผู้ใช้งาน</th>
                          <th className="px-4 py-4 font-semibold text-center">บล็อกผู้ใช้งาน</th>
                          {(currentUser?.role === 'director' || currentUser?.role === 'admin') && (
                            <th className="px-4 py-4 font-semibold text-center">ลบข้อมูล</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {currentUsersPage.length > 0 ? currentUsersPage.map((user, index) => {
                          const sequentialIndex = userIndexOfFirstItem + index + 1;
                          const currentEdit = userEdits[user.id] || { isSaving: false, isDirty: false, showPass: false };

                          return (
                            <tr key={user.id || `u-${index}`} className="hover:bg-slate-50/80 transition-colors group">
                              <td className="px-6 py-4 text-center font-medium text-slate-500">
                                {sequentialIndex}
                              </td>

                              <td className="px-4 py-4 text-center">
                                <div
                                  className="cursor-pointer hover:opacity-80 transition-opacity inline-block group/profile relative"
                                  onClick={() => {
                                    setSelectedUserInfo(user);
                                    setShowUserInfoPassword(false);
                                    setIsUserInfoModalOpen(true);
                                  }}
                                  title="ดูข้อมูลผู้ใช้งาน"
                                >
                                  {user.profileImage ? (
                                    <img src={formatImageUrl(user.profileImage)} alt="Profile" loading="lazy" className="w-9 h-9 rounded-full object-cover mx-auto shadow-sm border border-slate-200 group-hover/profile:ring-2 group-hover/profile:ring-[#ba9c5a] transition-all" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}/>
                                  ) : (
                                    <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 group-hover/profile:ring-2 group-hover/profile:ring-[#ba9c5a] transition-all"><User size={16}/></div>
                                  )}
                                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-slate-100 opacity-0 group-hover/profile:opacity-100 transition-opacity">
                                    <Info size={12} className="text-[#ba9c5a]" />
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 font-semibold text-[#0f172a]">
                                {user.username || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-700 font-medium">
                                {user.firstName || '-'} {user.lastName || ''}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {user.position || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {user.phone ? (String(user.phone).startsWith('0') ? String(user.phone) : '0' + String(user.phone)) : '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {user.email || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {user.regDate || '-'}
                              </td>

                              <td className="px-4 py-4 text-slate-600">
                                {user.regTime || '-'}
                              </td>

                              <td className="px-4 py-4">
                                <input
                                  type="text"
                                  value={currentEdit.username !== undefined ? currentEdit.username : (user.username || '')}
                                  onChange={(e) => handleUserEdit(user.id, 'username', e.target.value)}
                                  placeholder="ชื่อผู้ใช้งานระบบ"
                                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 w-40 transition-all font-medium"
                                />
                              </td>

                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="relative">
                                    <input
                                      type={currentEdit.showPass ? "text" : "password"}
                                      value={currentEdit.password !== undefined ? currentEdit.password : (user.password || '')}
                                      onChange={(e) => handleUserEdit(user.id, 'password', e.target.value)}
                                      placeholder="รหัสผ่าน"
                                      className="bg-slate-50 border border-slate-200 text-slate-700 rounded-lg pl-3 pr-8 py-1.5 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 w-36 transition-all font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUserEdit(user.id, 'showPass', !currentEdit.showPass)}
                                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                                    >
                                      {currentEdit.showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                  </div>

                                  {currentEdit.isDirty && (
                                    <button
                                      onClick={() => saveUserEdit(user.id)}
                                      disabled={currentEdit.isSaving || (!currentEdit.username && !user.username)}
                                      className="flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                                      title="บันทึกการแก้ไข"
                                    >
                                      {currentEdit.isSaving ? <LoadingSpinner size={14} /> : <Check size={16} strokeWidth={3} />}
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-4 text-center">
                                {user.isApproved ? (
                                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all mx-auto inline-flex items-center justify-center gap-1.5 bg-emerald-500 text-white border border-emerald-600 cursor-default select-none">
                                    <CheckCircle2 size={12} />
                                    อนุมัติแล้ว
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleToggleUserApproval(user.email, user.isApproved)}
                                    disabled={!user.email || user.email === '-' || approvingUserEmail === user.email}
                                    className="px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 mx-auto flex items-center justify-center gap-1.5 bg-orange-500 text-white hover:bg-orange-600 border border-orange-600 disabled:opacity-50 disabled:cursor-wait"
                                  >
                                    {approvingUserEmail === user.email && <LoadingSpinner size={12} />}
                                    รออนุมัติ
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button
                                  onClick={() => handleToggleBlockStatus(user.email, user.isUserBlocked)}
                                  disabled={!user.email || user.email === '-' || blockingUserEmail === user.email}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-95 mx-auto flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    user.isUserBlocked
                                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                                      : 'bg-rose-100 text-rose-700 hover:bg-rose-200 border border-rose-200'
                                  }`}
                                >
                                  {blockingUserEmail === user.email && <LoadingSpinner size={12} />}
                                  {user.isUserBlocked ? 'ปลดบล็อก' : 'บล็อก'}
                                </button>
                              </td>
                              {(currentUser?.role === 'director' || currentUser?.role === 'admin') && (
                                <td className="px-4 py-4 text-center">
                                  <button
                                    onClick={() => handleDeleteUserClick(user, 'user')}
                                    className="p-2 bg-white text-[#0f172a] border border-[#0f172a] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-600 rounded-xl transition-all shadow-sm active:scale-90 mx-auto flex items-center justify-center"
                                    title="ลบข้อมูลผู้ใช้งาน"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="12" className="px-6 py-12 text-center text-slate-500">
                              <div className="flex flex-col items-center gap-2">
                                <Users className="text-slate-300" size={32} />
                                <p>ไม่พบรายชื่อผู้ใช้งานในระบบ</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-5 md:p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                    <div className="text-sm text-slate-500">
                      แสดง <span className="text-slate-900">{filteredUsers.length > 0 ? userIndexOfFirstItem + 1 : 0}</span> ถึง <span className="text-slate-900">{Math.min(userIndexOfLastItem, filteredUsers.length)}</span> จาก <span className="text-slate-900">{filteredUsers.length}</span> รายการ
                    </div>

                    <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto">
                      <button
                        onClick={() => setUserCurrentPage(p => Math.max(1, p - 1))}
                        disabled={userCurrentPage === 1}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                      >
                        <ChevronLeft size={18} />
                      </button>

                      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar scroll-smooth max-w-[55vw] sm:max-w-[400px] px-1 py-1">
                        {Array.from({length: userTotalPages}, (_, i) => i + 1).map(number => (
                          <button
                            key={number}
                            onClick={() => setUserCurrentPage(number)}
                            className={`min-w-[32px] h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all shrink-0 ${
                              userCurrentPage === number
                                ? 'bg-[#0f172a] text-white shadow-md scale-105'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {number}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setUserCurrentPage(p => Math.min(userTotalPages, p + 1))}
                        disabled={userCurrentPage === userTotalPages || userTotalPages === 0}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0 active:scale-95"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </BentoBox>
              </div>
            )}

            <footer className="mt-12 text-center text-slate-700 text-xs font-light pb-8">
              Copyright © 2026 Powered by abusanan.com
            </footer>

          </main>

          <button
            onClick={() => { setSelectedDateForBooking(getSafeDateStr(new Date())); setIsModalOpen(true); }}
            className="booking-fab"
            title="จองห้องปฏิบัติการ"
          >
            <div className="svgIcon">
              <Plus size={32} strokeWidth={2.5} />
            </div>
          </button>

          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/50 z-[9998]"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          <div className={`fixed inset-y-0 left-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div
                className={`flex items-center gap-3 w-full ${isLoggedIn ? 'cursor-pointer hover:bg-slate-50 p-2 -m-2 rounded-xl transition-colors' : ''}`}
                onClick={() => { if(isLoggedIn) { setIsProfileModalOpen(true); setIsSidebarOpen(false); } }}
              >
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                  {isLoggedIn && currentUser?.profileImage ? (
                    <img src={formatImageUrl(currentUser.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm font-bold text-slate-900 truncate">{isLoggedIn ? currentUser?.username : 'ผู้ใช้งานทั่วไป'}</p>
                  <p className="text-xs text-slate-500 truncate">{isLoggedIn ? currentUser?.position : 'ยังไม่ได้เข้าสู่ระบบ'}</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0 ml-2">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto">
              <button
                onClick={() => { setCurrentView('home'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 p-4 w-full text-left rounded-full hover:bg-slate-50 font-medium transition-all group ${currentView === 'home' ? 'text-[#0f172a] bg-slate-50' : 'text-slate-700'}`}
              >
                <div className="text-[#ba9c5a] group-hover:scale-110 transition-transform"><Home size={24} /></div>
                <span>หน้าหลัก</span>
              </button>

              <button
                onClick={() => { setCurrentView('bookings'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 p-4 w-full text-left rounded-full hover:bg-slate-50 font-medium transition-all group ${currentView === 'bookings' ? 'text-[#0f172a] bg-slate-50' : 'text-slate-700'}`}
              >
                <div className="text-[#ba9c5a] group-hover:scale-110 transition-transform"><CalendarIcon size={24} /></div>
                <span>รายการจอง</span>
              </button>

              <button
                onClick={() => { setCurrentView('queue'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 p-4 w-full text-left rounded-full hover:bg-slate-50 font-medium transition-all group ${currentView === 'queue' ? 'text-[#0f172a] bg-slate-50' : 'text-slate-700'}`}
              >
                <div className="text-[#ba9c5a] group-hover:scale-110 transition-transform"><ListTodo size={24} /></div>
                <span>คิวจองห้องปฏิบัติการ</span>
              </button>

              <button
                onClick={() => { setCurrentView('users'); setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 p-4 w-full text-left rounded-full hover:bg-slate-50 font-medium transition-all group ${currentView === 'users' ? 'text-[#0f172a] bg-slate-50' : 'text-slate-700'}`}
              >
                <div className="text-[#ba9c5a] group-hover:scale-110 transition-transform"><Users size={24} /></div>
                <span>บัญชีผู้ใช้งาน</span>
              </button>

              <button onClick={() => { setIsAboutModalOpen(true); setIsSidebarOpen(false); }} className="flex items-center gap-4 p-4 w-full text-left rounded-full hover:bg-slate-50 text-slate-700 font-medium transition-all group">
                <div className="text-[#ba9c5a] group-hover:scale-110 transition-transform"><Info size={24} /></div>
                <span>เกี่ยวกับ</span>
              </button>
            </div>

            <div className="px-4 pb-2 shrink-0 flex flex-col items-center">
              <button
                onClick={() => {
                  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
                  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
                  if (isStandalone) {
                    showAlert('แอปนี้ถูกเพิ่มไว้ในหน้าจอหลักแล้ว', 'success');
                    return;
                  }
                  if (isIOS) {
                    setShortcutModalTab('ios');
                    setIsShortcutModalOpen(true);
                    setIsSidebarOpen(false);
                  } else {
                    if (window.__pwaPrompt) {
                      window.__pwaPrompt.prompt();
                      window.__pwaPrompt.userChoice.then(choice => {
                        if (choice.outcome === 'accepted') { showAlert('เพิ่มลงหน้าจอหลักเรียบร้อยแล้ว!', 'success'); }
                        window.__pwaPrompt = null;
                      });
                    } else {
                      setShortcutModalTab('android');
                      setIsShortcutModalOpen(true);
                      setIsSidebarOpen(false);
                    }
                  }
                }}
                className="shortcut-modern-btn flex items-center justify-center gap-2 w-[88%] py-2.5 rounded-xl text-white font-semibold text-[11px] uppercase tracking-wider shadow-md hover:shadow-lg active:scale-[0.96] hover:scale-[1.03] duration-300 cursor-pointer"
              >
                <Smartphone size={14} className="text-[#ba9c5a] shortcut-icon-anim" />
                <span>เพิ่มลงหน้าจอหลัก</span>
              </button>
            </div>

            <div className="px-6 pb-6 pt-2 border-t border-slate-100 shrink-0 text-center flex flex-col items-center justify-center">
              <p className="font-regular text-slate-400 mb-2">ผู้ดูแลระบบ</p>
              <img
                src="https://lh3.googleusercontent.com/d/1nE2H7pmGWzmYGw_Arex83NUWhSBuAGrz"
                alt="Darussalam Logo"
                className="h-8 w-auto object-contain mb-2 drop-shadow-sm"
              />
              <h2 className="text-[11px] text-slate-500 font-light uppercase tracking-widest mt-0.5">Darussalam school</h2>
            </div>
          </div>

          {/* Mobile Shortcut Instructions Modal */}
          {isShortcutModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsShortcutModalOpen(false)} />
              <div className="relative w-[90vw] max-w-sm bg-white rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 animate-modal-pop-fast">
                <button onClick={() => setIsShortcutModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all">
                  <X size={18} />
                </button>
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-gradient-to-tr from-[#024950] to-[#036873]">
                    <Smartphone size={28} className="text-white shortcut-icon-anim" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">เพิ่มลงหน้าจอหลัก</h3>
                  <p className="text-xs text-slate-500 mb-4">สร้าง Shortcut เพื่อเข้าใช้งานระบบได้อย่างรวดเร็วเหมือนแอปทั่วไป</p>
                  
                  {/* Tabs Selector */}
                  <div className="flex bg-slate-100 p-1 rounded-xl w-full mb-4">
                    <button 
                      onClick={() => setShortcutModalTab('ios')} 
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${shortcutModalTab === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      iPhone / iPad
                    </button>
                    <button 
                      onClick={() => setShortcutModalTab('android')} 
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${shortcutModalTab === 'android' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Android
                    </button>
                  </div>

                  {shortcutModalTab === 'ios' ? (
                    <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-3.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ขั้นตอนการติดตั้ง (Safari เท่านั้น)</p>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>1</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">
                          กดปุ่ม <strong>แชร์</strong> 
                          <svg className="w-4 h-4 inline-block mx-1 align-middle text-[#0275ff]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="5" y="9" width="14" height="11" rx="2" ry="2" />
                            <path d="M12 15V3" />
                            <path d="M8 7l4-4 4 4" />
                          </svg>
                          ที่แถบเมนูด้านล่างหรือด้านบน
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>2</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">
                          เลื่อนลงด้านล่างแล้วเลือก <strong>"เพิ่มไปยังหน้าจอโฮม"</strong>
                          <svg className="w-4 h-4 inline-block mx-1 align-middle text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>3</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">กด <strong>"เพิ่ม"</strong> (Add) ที่มุมขวาบนเพื่อติดตั้ง</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-slate-50 rounded-2xl p-4 text-left space-y-3.5 border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ขั้นตอนการติดตั้ง (Chrome / Edge)</p>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>1</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">
                          กดปุ่ม <strong>เมนูตัวเลือก</strong> 
                          <svg className="w-4 h-4 inline-block mx-1 align-middle text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="12" cy="19" r="2"/>
                          </svg>
                          ที่มุมขวาบนสุดของเบราว์เซอร์
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>2</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">กดเลือก <strong>"เพิ่มไปยังหน้าจอหลัก"</strong> หรือ <strong>"ติดตั้งแอป"</strong></p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{ backgroundColor: '#024950' }}>3</div>
                        <p className="text-xs text-slate-700 pt-0.5 leading-relaxed">กด <strong>"เพิ่ม"</strong> หรือ <strong>"ติดตั้ง"</strong> อีกครั้งเพื่อยืนยัน</p>
                      </div>
                    </div>
                  )}
                  
                  <button onClick={() => setIsShortcutModalOpen(false)} className="mt-5 w-full py-2.5 rounded-full text-white font-semibold text-xs transition-all active:scale-95 cursor-pointer shadow-md hover:brightness-110" style={{ backgroundColor: '#024950' }}>
                    เข้าใจแล้ว
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admin Modals */}

          {/* 1. Modal ตั้งค่าป้ายแบนเนอร์ */}
          <Modal isOpen={isBannerSettingsOpen} onClose={() => setIsBannerSettingsOpen(false)} title="ตั้งค่าป้ายแบนเนอร์">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-sm font-bold text-slate-800 flex justify-center items-center">
                  <span>ขนาดภาพแนะนำ 1920x1080 px</span>
                </label>
                <p className="text-[10px] text-slate-500 text-center mt-1">ใช้เมาส์ลากหรือใช้นิ้วเลื่อนบนรูปภาพเพื่อเลือกส่วนที่ต้องการแสดง</p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">รายการรูปภาพแบนเนอร์</h4>
                {homeData.banners.map((url, idx) => (
                  <div key={idx} className="relative rounded-2xl overflow-hidden border border-slate-200 group shadow-sm hover:shadow-md transition-all bg-slate-900 w-full cursor-move aspect-[16/9]" onMouseDown={(e) => onDragStart(e, 'banner', idx)} onTouchStart={(e) => onDragStart(e, 'banner', idx)}>
                    <img src={url} className="w-full h-full object-cover pointer-events-none" alt={`Banner ${idx}`} style={{ objectPosition: `${(bannerPositions[idx] || {x:50}).x}% ${(bannerPositions[idx] || {y:50}).y}%` }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteBanner(idx); }}
                      className="absolute top-3 right-3 bg-rose-500 text-white p-2.5 rounded-full shadow-md hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 active:scale-95 z-10"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 size={16}/>
                    </button>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm pointer-events-none">ลำดับที่ {idx + 1}</div>
                  </div>
                ))}

                <div
                  className="w-full border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-400 transition-colors aspect-[16/9] min-h-[120px]"
                  onClick={() => document.getElementById('bannerUpload').click()}
                >
                  {isUploadingBanner ? (
                    <div className="flex flex-col items-center gap-2">
                      <LoadingSpinner size={28} className="text-[#ba9c5a]" />
                      <span className="text-xs font-medium text-slate-600">กำลังอัปโหลด</span>
                    </div>
                  ) : (
                    <>
                      <div className="bg-slate-100 p-3 rounded-full mb-2"><Plus size={24} className="text-slate-600" /></div>
                      <span className="text-sm font-semibold">เพิ่มรูปภาพแบนเนอร์</span>
                    </>
                  )}
                </div>
                <input type="file" id="bannerUpload" accept="image/*" className="hidden" onChange={handleAddBanner} disabled={isUploadingBanner} />
              </div>
            </div>
          </Modal>

          {/* 2. Modal กำหนดข้อความประกาศ */}
          <Modal isOpen={isAnnouncementSettingsOpen} onClose={() => setIsAnnouncementSettingsOpen(false)} title="กำหนดข้อความประกาศ">
            <div className="flex flex-col gap-4">
              <p className="text-xs text-slate-500">พิมพ์ข้อความเพื่อแจ้งข่าวสารให้ผู้ใช้งานทราบ</p>

              <textarea
                value={tempAnnouncement}
                onChange={(e) => setTempAnnouncement(e.target.value)}
                className="w-full h-48 p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#ba9c5a]/10 focus:border-[#ba9c5a] outline-none resize-none transition-all text-sm leading-relaxed"
                placeholder="พิมพ์ข้อความประกาศที่นี่"
              />

              <div className="flex justify-center mt-4">
                <button
                  onClick={handleSaveAnnouncement}
                  disabled={isSavingAnnouncement}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSavingAnnouncement && <LoadingSpinner size={18} />}
                  {isSavingAnnouncement ? 'ยืนยัน' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </Modal>

          {/* 3. Modal ตั้งค่าบอร์ดประชาสัมพันธ์ */}
          <Modal isOpen={isPRSettingsOpen} onClose={() => setIsPRSettingsOpen(false)} title="ตั้งค่าบอร์ดประชาสัมพันธ์">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="text-sm font-bold text-slate-800 flex justify-center items-center">
                  <span>ขนาดภาพแนะนำ 1080x1080 px</span>
                </label>
                <p className="text-[10px] text-slate-500 text-center mt-1">ใช้เมาส์ลากหรือใช้นิ้วเลื่อนบนรูปภาพเพื่อเลือกส่วนที่ต้องการแสดง</p>
              </div>

              <div className="flex flex-col gap-4 mt-2">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest px-1">รายการบอร์ดประชาสัมพันธ์</h4>
                {homeData.prItems.map((item, idx) => (
                  <div key={item.id || idx} className="flex flex-col gap-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-shadow w-full sm:w-[80%] mx-auto">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeletePR(idx); }}
                      className="absolute top-3 right-3 bg-rose-500 text-white p-2.5 rounded-full shadow-md hover:bg-rose-600 z-20 opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                    >
                      <Trash2 size={16}/>
                    </button>
                    <div className="relative bg-slate-100 w-full overflow-hidden cursor-move" style={{ aspectRatio: '1.5 / 1' }} onMouseDown={(e) => onDragStart(e, 'pr', idx)} onTouchStart={(e) => onDragStart(e, 'pr', idx)}>
                      <img src={item.image} className="w-full h-full object-cover pointer-events-none" alt={item.title} style={{ objectPosition: `${(prPositions[idx] || {x:50}).x}% ${(prPositions[idx] || {y:50}).y}%` }} />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm pointer-events-none">ลำดับที่ {idx + 1}</div>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                      {editingPRIndex === idx ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editingPRTitle}
                            onChange={(e) => setEditingPRTitle(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-4 focus:ring-[#ba9c5a]/10 focus:border-[#ba9c5a] outline-none text-sm transition-all"
                            placeholder="แก้ไขข้อความ"
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditPRTitle(idx); if (e.key === 'Escape') { setEditingPRIndex(null); setEditingPRTitle(''); } }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPRTitle(idx)}
                              disabled={!editingPRTitle.trim()}
                              className="flex-1 bg-[#0f172a] hover:bg-slate-800 text-white py-2 rounded-full text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <Check size={14} /> บันทึก
                            </button>
                            <button
                              onClick={() => { setEditingPRIndex(null); setEditingPRTitle(''); }}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2 flex-1">{item.title}</p>
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingPRIndex(idx); setEditingPRTitle(item.title); }}
                            className="shrink-0 bg-slate-200 hover:bg-[#ba9c5a] hover:text-white text-slate-600 p-2 rounded-full transition-all active:scale-95"
                            title="แก้ไขข้อความ"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* ฟอร์มเพิ่ม PR ใหม่ */}
                <div className="flex flex-col gap-3 p-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl w-full sm:w-[80%] mx-auto mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Plus size={18} className="text-slate-700" />
                    <h4 className="font-bold text-slate-800 text-sm">เพิ่มรายการใหม่</h4>
                  </div>

                  <div
                    className="w-full bg-white border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative"
                    style={{ aspectRatio: '1.5 / 1', minHeight: '100px' }}
                    onClick={() => document.getElementById('prUpload').click()}
                  >
                    {newPRFile ? (
                      <img src={URL.createObjectURL(newPRFile)} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <>
                        <div className="bg-slate-100 p-3 rounded-full mb-2"><Camera size={20} className="text-slate-500" /></div>
                        <span className="text-xs font-semibold text-slate-600">คลิกเพื่อเลือกรูปภาพ</span>
                      </>
                    )}
                  </div>
                  <input type="file" id="prUpload" accept="image/*" className="hidden" onChange={(e) => setNewPRFile(e.target.files[0])} />

                  <input
                    type="text"
                    placeholder="หัวข้อประชาสัมพันธ์"
                    value={newPRTitle}
                    onChange={(e) => setNewPRTitle(e.target.value)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 focus:bg-white focus:ring-4 focus:ring-[#ba9c5a]/10 focus:border-[#ba9c5a] outline-none text-sm transition-all mt-2"
                  />

                  <div className="flex justify-center mt-2">
                    <button
                      onClick={handleAddPR}
                      disabled={isUploadingPR || !newPRFile || !newPRTitle}
                      className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isUploadingPR ? <LoadingSpinner size={16} /> : <Plus size={16} />}
                      {isUploadingPR ? 'กำลังอัปโหลด' : 'ยืนยันเพิ่มรายการ'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </Modal>



        {/* LOGOUT MODAL */}
          {isLogoutModalOpen && (
            <div className="auth-overlay animate-overlay-fade" onClick={() => setIsLogoutModalOpen(false)}>
              <div className="bg-white w-full max-w-sm rounded-3xl p-6 sm:p-8 relative shadow-2xl flex flex-col items-center text-center animate-bounce-pop modal-hover-effect" onClick={e => e.stopPropagation()}>
                <div className="text-rose-600 mb-5 drop-shadow-sm">
                  <LogOut size={64} strokeWidth={2.5} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">ยืนยันการออกจากระบบ</h4>
                <p className="text-slate-500 text-sm mb-8">คุณต้องการออกจากระบบและกลับไปหน้าหลักใช่หรือไม่?</p>

                <div className="flex gap-3 w-full justify-center">
                  <button onClick={handleLogoutConfirm} className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-full transition-all shadow-md active:scale-95">
                    ยืนยัน
                  </button>
                  <button onClick={() => setIsLogoutModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95">
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="จองห้องปฏิบัติการ">
            <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5">

              {/* ห้องปฏิบัติการ Selector (Custom Dropdown) */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ห้องปฏิบัติการ</label>
                <div className={`relative ${isBookingLabRoomOpen ? 'z-30' : 'z-0'}`} ref={bookingLabRoomRef}>
                  <input type="hidden" name="lab" value={bookingLab} />
                  <button
                    type="button"
                    onClick={() => setIsBookingLabRoomOpen(!isBookingLabRoomOpen)}
                    className={"w-full flex items-center justify-between bg-white border " + (isBookingLabRoomOpen ? "border-[#ba9c5a] ring-4 ring-[#ba9c5a]/10" : "border-slate-200 hover:border-slate-300") + " rounded-2xl px-4 py-3 transition-all text-sm shadow-sm font-semibold text-left relative z-0 truncate"}
                  >
                    <span className="text-slate-700 truncate pr-2">
                      {bookingLab}
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={"shrink-0 transition-transform duration-200 " + (isBookingLabRoomOpen ? "rotate-180 text-[#ba9c5a]" : "text-slate-400")}><path d="m6 9 6 6 6-6"/></svg>
                  </button>

                  {isBookingLabRoomOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-10 py-2 animate-fade-in origin-top">
                      {['ห้องชีววิทยา อาคาร 13', 'ห้องเคมี อาคาร 13', 'ห้องวิทย์ อาคาร 17', 'Visual Lab อาคาร 19'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onMouseDown={() => { setBookingLab(opt); setIsBookingLabRoomOpen(false); }}
                            onTouchStart={() => { setBookingLab(opt); setIsBookingLabRoomOpen(false); }}
                            className={"w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors " + (bookingLab === opt ? "bg-slate-100 text-[#0f172a]" : "hover:bg-slate-50 text-slate-600")}
                          >
                            <span className="font-semibold truncate pr-2">{opt}</span>
                            {bookingLab === opt && <Check size={16} className="text-[#0f172a] shrink-0" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* คาบเรียน Start/End Selectors (Custom Dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">คาบเรียน</label>
                  <div className="flex gap-2">
                    <div className={`relative flex-1 ${isBookingPeriodStartOpen ? 'z-20' : 'z-0'}`} ref={bookingPeriodStartRef}>
                      <input type="hidden" name="periodStart" value={startPeriod} />
                      <button
                        type="button"
                        onClick={() => setIsBookingPeriodStartOpen(!isBookingPeriodStartOpen)}
                        className={"w-full flex items-center justify-between bg-white border " + (isBookingPeriodStartOpen ? "border-[#ba9c5a] ring-2 ring-[#ba9c5a]/10" : "border-slate-200 hover:border-slate-300") + " rounded-2xl px-3 py-3 transition-all text-sm shadow-sm font-semibold text-left relative z-0"}
                      >
                        <span className="text-slate-700">{startPeriod.replace('คาบ ', '')}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={"transition-transform duration-200 " + (isBookingPeriodStartOpen ? "rotate-180 text-[#ba9c5a]" : "text-slate-400")}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      {isBookingPeriodStartOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-10 py-2 animate-fade-in origin-top max-h-48 overflow-y-auto custom-scroll">
                          {Array.from({length: 10}, (_, i) => "คาบ " + (i + 1)).map(opt => (
                              <button
                                key={"start-" + opt} type="button"
                                onMouseDown={() => { setStartPeriod(opt); setIsBookingPeriodStartOpen(false); }}
                                onTouchStart={() => { setStartPeriod(opt); setIsBookingPeriodStartOpen(false); }}
                                className={"w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors " + (startPeriod === opt ? "bg-slate-100 text-[#0f172a]" : "hover:bg-slate-50 text-slate-600")}
                              >
                                <span className="font-semibold">{opt.replace('คาบ ', '')}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center text-slate-400 font-medium">-</div>

                    <div className={`relative flex-1 ${isBookingPeriodEndOpen ? 'z-20' : 'z-0'}`} ref={bookingPeriodEndRef}>
                      <input type="hidden" name="periodEnd" value={endPeriod} />
                      <button
                        type="button"
                        onClick={() => setIsBookingPeriodEndOpen(!isBookingPeriodEndOpen)}
                        className={"w-full flex items-center justify-between bg-white border " + (isBookingPeriodEndOpen ? "border-[#ba9c5a] ring-2 ring-[#ba9c5a]/10" : "border-slate-200 hover:border-slate-300") + " rounded-2xl px-3 py-3 transition-all text-sm shadow-sm font-semibold text-left relative z-0"}
                      >
                        <span className="text-slate-700">{endPeriod ? endPeriod.replace('คาบ ', '') : '-'}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={"transition-transform duration-200 " + (isBookingPeriodEndOpen ? "rotate-180 text-[#ba9c5a]" : "text-slate-400")}><path d="m6 9 6 6 6-6"/></svg>
                      </button>
                      {isBookingPeriodEndOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-10 py-2 animate-fade-in origin-top max-h-48 overflow-y-auto custom-scroll">
                          {["", ...Array.from({length: 10}, (_, i) => "คาบ " + (i + 1))].map(opt => (
                              <button
                                key={"end-" + (opt || 'single')} type="button"
                                onMouseDown={() => { setEndPeriod(opt); setIsBookingPeriodEndOpen(false); }}
                                onTouchStart={() => { setEndPeriod(opt); setIsBookingPeriodEndOpen(false); }}
                                className={"w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors " + (endPeriod === opt ? "bg-slate-100 text-[#0f172a]" : "hover:bg-slate-50 text-slate-600")}
                              >
                                <span className="font-semibold">{opt ? opt.replace('คาบ ', '') : '-'}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 flex justify-between items-center">
                    <span>เวลา <span className="text-xs text-emerald-600 ml-1 font-medium bg-emerald-50 px-1.5 rounded">อัตโนมัติ</span></span>
                  </label>
                  <div className="flex gap-2 relative">
                    <div className="absolute inset-0 bg-transparent z-10 cursor-not-allowed"></div>
                    <input type="text" name="start_time" value={bookingStartTime} readOnly className="w-full md:w-1/2 bg-white border border-slate-300 text-slate-900 rounded-2xl px-3 py-3 font-semibold text-sm text-center shadow-sm" />
                    <span className="flex items-center text-slate-400">-</span>
                    <input type="text" name="end_time" value={bookingEndTime} readOnly className="w-full md:w-1/2 bg-white border border-slate-300 text-slate-900 rounded-2xl px-3 py-3 font-semibold text-sm text-center shadow-sm" />
                  </div>
                </div>
              </div>

              {/* บันทึกค่า priority อัตโนมัติเป็นคาบ */}
              <input type="hidden" name="priority" value={endPeriod && endPeriod !== startPeriod ? (startPeriod + " - " + endPeriod) : startPeriod} />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">จองวันที่</label>
                  <input type="date" name="date" required defaultValue={selectedDateForBooking || getSafeDateStr(new Date())} className="w-full bg-white border border-slate-300 text-slate-900 rounded-2xl px-4 py-3 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 transition-all font-normal text-sm shadow-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">ถึงวันที่ <span className="text-rose-500">ถ้ามี</span></label>
                  <input type="date" name="end_date" min={selectedDateForBooking || getSafeDateStr(new Date())} className="w-full bg-white border border-slate-300 text-slate-900 rounded-2xl px-4 py-3 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 transition-all font-normal text-sm shadow-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">วัตถุประสงค์</label>
                <input type="text" name="purpose" required placeholder="เช่น สอนวิชาวิทย์ ชีววิทยา เคมี" className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl px-4 py-3 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 transition-all font-normal placeholder:text-slate-400 placeholder:font-normal" />
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-5 mt-2">
                <label className="text-sm font-semibold text-slate-700">แนบรูปภาพ <span className="text-rose-500">ถ้ามี</span></label>
                <input type="file" name="attachment" accept="image/*" className="w-full bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl px-4 py-3 outline-none focus:border-[#ba9c5a] focus:ring-2 focus:ring-[#ba9c5a]/20 transition-all font-normal text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" />
              </div>

              <button
                type="submit"
                disabled={isBookingLoading}
                className="mt-4 w-full bg-[#ba9c5a] hover:bg-[#a88846] text-white rounded-full px-4 py-4 font-semibold shadow-xl shadow-[#ba9c5a]/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isBookingLoading && <LoadingSpinner size={20} />}
                {isBookingLoading ? 'ส่งข้อมูล' : 'ยืนยันการจอง'}
              </button>
            </form>
          </Modal>

          {/* Success Pop-up Modal */}
          <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="text-emerald-500 mb-6 drop-shadow-sm icon-pulse-green mt-2">
                <CheckCircle2 size={72} strokeWidth={2.5} />
              </div>
              <h1 className="text-lg text-slate-700 font-normal mb-1">รอรับการแจ้งเตือน</h1>
              <h2 className="text-xl md:text-2xl text-slate-900 font-bold mb-6">พิจารณาอนุมัติการจองนะค่ะ</h2>

              <div className="flex flex-col items-center justify-center mb-6 w-full">
                <h1 className="text-sm text-slate-600 font-medium mb-1">รหัสจอง</h1>
                <h2 className="text-3xl text-rose-600 font-black tracking-wider mb-1 drop-shadow-sm">{latestBookingCode}</h2>
                <h3 className="text-xs text-slate-500 font-medium">กรุณาเก็บรหัสจองห้องปฏิบัติการ</h3>
              </div>

              <div className="w-full bg-slate-50 border border-slate-100 rounded-xl px-2 py-3 flex items-center justify-center overflow-hidden">
                <span
                  className="text-rose-500 font-medium text-center whitespace-nowrap tracking-tight"
                  style={{ fontSize: 'clamp(10.5px, 3.2vw, 14px)' }}
                >
                  ช่องทางติดตามสถานะได้ที่ตารางการจอง หรือ รายการจองของฉัน
                </span>
              </div>

              <div className="w-full mt-6 flex flex-col items-center justify-center">
                <button 
                  type="button"
                  onClick={() => downloadBookingPaperImage(createdBookingDetails)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2.5 font-bold shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] text-sm"
                >
                  <Download size={16} strokeWidth={2.5} />
                  <span>ดาวน์โหลดภาพการจอง</span>
                </button>
                <p className="text-xs text-slate-500 font-medium mt-2">
                  กรุณาบันทึกการจองของคุณ
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="mt-6 w-full bg-[#ba9c5a] hover:bg-[#a88846] text-white rounded-full px-4 py-4 font-semibold shadow-xl shadow-[#ba9c5a]/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                ตกลง
              </button>
            </div>
          </Modal>

          {/* About Modal */}
          <Modal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} title="เกี่ยวกับระบบ">
            <div className="flex flex-col text-center p-2 sm:p-4">
              <div className="flex justify-center mb-6">
                <img
                  src="https://lh3.googleusercontent.com/d/15J4cmPR70AqZfOZpPErQ9avHQCv1WzIo"
                  alt="ScienceLab Logo"
                  className="h-32 sm:h-48 w-auto max-w-full object-contain drop-shadow-md transition-transform hover:scale-105"
                />
              </div>
              <h1 className="text-2xl font-bold text-[#0f172a] mb-2">ScienceLab Booking</h1>
              <h2 className="text-lg font-semibold text-[#ba9c5a] mb-6">ระบบจองห้องปฏิบัติการวิทยาศาสตร์</h2>

              <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-center">
                <p className="text-slate-600 text-sm leading-relaxed">
                  ScienceLab Booking พัฒนาขึ้นภายใต้แนวคิดการเปลี่ยนผ่านสู่ระบบดิจิทัล Digital Transformation เพื่อยกระดับมาตรฐานการบริหารจัดการจองห้องปฏิบัติการวิทยาศาสตร์ให้มีความเป็นสากล โดยมุ่งเน้นการจัดการจองห้องปฏิบัติการวิทยาศาสตร์เป็นระเบียบ เพื่อนำส่วนรวมให้เกิดประโยชน์สูงสุดและมีความโปร่งใสในทุกขั้นตอน มุ่งเน้นการลดขั้นตอนการประสานงานที่ซับซ้อนสู่การจองผ่านระบบออนไลน์ที่รวดเร็วและแม่นยำ ได้นำการออกแบบระบบให้รองรับการใช้งานที่หลากหลาย เพื่อให้บุคลากรเข้าถึงข้อมูลการจองห้องปฏิบัติการวิทยาศาสตร์ได้แบบ Real-time ทุกที่ทุกเวลา
                </p>
              </div>

              <div className="text-xs text-slate-400 font-medium space-y-1 mb-2">
                <p>Date 21-5-2026</p>
                <p>Version 1.2.01.001</p>
              </div>

              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="mt-6 w-full bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </Modal>

          {/* Profile Modal */}
          <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="ข้อมูลส่วนตัว">
            <div className="flex flex-col items-center p-2">
              <div className="relative mb-6 mt-2">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg cursor-pointer group"
                  onClick={() => document.getElementById('updateProfileInput').click()}
                  title="คลิกเพื่อเปลี่ยนรูปโปรไฟล์"
                >
                  {currentUser?.profileImage ? (
                     <img src={formatImageUrl(currentUser.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <User size={48} className="text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                    <Camera className="text-white" size={28} />
                  </div>
                  {isProfileUpdating && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <LoadingSpinner size={24} className="text-[#0f172a]" />
                    </div>
                  )}
                </div>
                <input type="file" id="updateProfileInput" className="hidden" accept="image/*" onChange={handleUpdateProfileImage} />
              </div>

              <div className="w-full space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left">
                <div className="flex flex-col border-b border-slate-200/60 pb-3">
                  <span className="text-xs text-slate-500 font-semibold mb-1">ชื่อนามสกุล</span>
                  <span className="text-slate-900 font-medium">{currentUser?.firstName} {currentUser?.lastName}</span>
                </div>
                <div className="flex flex-col border-b border-slate-200/60 pb-3">
                  <span className="text-xs text-slate-500 font-semibold mb-1">ตำแหน่ง</span>
                  <span className="text-slate-900 font-medium">{currentUser?.position}</span>
                </div>
                <div className="flex flex-col border-b border-slate-200/60 pb-3">
                  <span className="text-xs text-slate-500 font-semibold mb-1">เบอร์โทรศัพท์</span>
                  <span className="text-slate-900 font-medium">
                    {currentUser?.phone ? (currentUser.phone.toString().startsWith('0') ? currentUser.phone : '0' + currentUser.phone) : '-'}
                  </span>
                </div>
                <div className="flex flex-col border-b border-slate-200/60 pb-3">
                  <span className="text-xs text-slate-500 font-semibold mb-1">อีเมล Email</span>
                  <span className="text-slate-900 font-medium">{currentUser?.email}</span>
                </div>
                <div className="flex flex-col border-b border-slate-200/60 pb-3">
                  <span className="text-xs text-slate-500 font-semibold mb-1">ชื่อผู้ใช้</span>
                  <span className="text-slate-900 font-medium">{currentUser?.username}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 font-semibold mb-1">รหัสผ่าน</span>
                  <div className="flex items-center justify-between">
                     <span className="text-slate-900 font-medium tracking-wide">
                       {showProfilePassword ? currentUser?.password : '••••••••'}
                     </span>
                     <button
                       onClick={() => setShowProfilePassword(!showProfilePassword)}
                       className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-500 transition-colors"
                     >
                       {showProfilePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>

          {/* User Info Modal (สำหรับ Admin ดูจากตาราง) */}
          <Modal isOpen={isUserInfoModalOpen} onClose={() => setIsUserInfoModalOpen(false)} title="ข้อมูลผู้ใช้งาน">
            {selectedUserInfo && (
              <div className="flex flex-col items-center p-2">
                <div className="relative mb-6 mt-2">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                    {selectedUserInfo.profileImage ? (
                       <img src={formatImageUrl(selectedUserInfo.profileImage)} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                       <User size={48} className="text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="w-full space-y-4 bg-slate-50 rounded-2xl p-5 border border-slate-100 text-left relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ba9c5a]/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

                  <div className="flex flex-col border-b border-slate-200/60 pb-3 relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">ชื่อ-นามสกุล</span>
                    <span className="text-slate-900 font-medium">{selectedUserInfo.firstName || '-'} {selectedUserInfo.lastName || ''}</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-200/60 pb-3 relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">ตำแหน่ง</span>
                    <span className="text-slate-900 font-medium">{selectedUserInfo.position || '-'}</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-200/60 pb-3 relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">เบอร์โทรศัพท์</span>
                    <span className="text-slate-900 font-medium">
                      {selectedUserInfo.phone ? (String(selectedUserInfo.phone).startsWith('0') ? String(selectedUserInfo.phone) : '0' + String(selectedUserInfo.phone)) : '-'}
                    </span>
                  </div>
                  <div className="flex flex-col border-b border-slate-200/60 pb-3 relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">อีเมล Email</span>
                    <span className="text-slate-900 font-medium">{selectedUserInfo.email || '-'}</span>
                  </div>
                  <div className="flex flex-col border-b border-slate-200/60 pb-3 relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">ชื่อผู้ใช้</span>
                    <span className="text-slate-900 font-medium">@{selectedUserInfo.username || '-'}</span>
                  </div>
                  <div className="flex flex-col relative z-10">
                    <span className="text-xs text-slate-500 font-semibold mb-1">รหัสผ่าน</span>
                    <div className="flex items-center justify-between">
                       <span className="text-slate-900 font-medium tracking-wide bg-white px-2 py-1 rounded border border-slate-200 w-full mr-2">
                         {showUserInfoPassword ? selectedUserInfo.password || '-' : '••••••••'}
                       </span>
                       <button
                         onClick={() => setShowUserInfoPassword(!showUserInfoPassword)}
                         className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-500 transition-colors shrink-0"
                       >
                         {showUserInfoPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                       </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsUserInfoModalOpen(false)}
                  className="mt-6 w-full bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            )}
          </Modal>

          {/* Note Modal */}
          <Modal isOpen={isNoteModalOpen} onClose={() => !isSavingNote && setIsNoteModalOpen(false)} title="ข้อความแจ้งเตือน">
            <div className="flex flex-col gap-4">
              <textarea
                value={noteInputValue}
                onChange={(e) => setNoteInputValue(e.target.value)}
                placeholder="พิมพ์ข้อความแจ้งเตือนที่นี่"
                className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#ba9c5a]/10 focus:border-[#ba9c5a] outline-none resize-none transition-all text-sm leading-relaxed text-slate-700"
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="flex-1 bg-[#ba9c5a] hover:bg-[#a88846] text-white py-3 rounded-full font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSavingNote && <LoadingSpinner size={16} />}
                  {isSavingNote ? 'บันทึก' : 'บันทึก'}
                </button>
                <button
                  onClick={() => setIsNoteModalOpen(false)}
                  disabled={isSavingNote}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-full font-semibold transition-all active:scale-95 disabled:opacity-70"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </Modal>

          {/* Lock Date Modal */}
          <Modal isOpen={isLockDateModalOpen} onClose={() => setIsLockDateModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="mb-5 flex justify-center mt-4">
                <div className="icon-pulse-red w-20 h-20 flex items-center justify-center">
                  <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center border border-rose-100 shadow-sm relative z-10">
                    <Lock size={28} strokeWidth={2.5} className="text-rose-500" />
                  </div>
                </div>
              </div>
              <h2 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">ปิดใช้งานวันจอง</h2>
              <p className="text-sm text-slate-500 mb-6">ระบุช่วงเวลาที่ต้องการปิดระบบไม่ให้ผู้ใช้ทำการจอง</p>

              <form onSubmit={handleLockDateSubmit} className="flex flex-col gap-4 w-full text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">ปิดวันที่ <span className="text-rose-500">*</span></label>
                    <input type="date" name="lockStartDate" required defaultValue={getSafeDateStr(new Date())} className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm font-medium shadow-sm hover:border-slate-300" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">สิ้นสุดวันที่ <span className="text-slate-400 font-normal">(ถ้ามี)</span></label>
                    <input type="date" name="lockEndDate" min={getSafeDateStr(new Date())} className="w-full bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all text-sm font-medium shadow-sm hover:border-slate-300" />
                  </div>
                </div>

                <div className="flex gap-3 w-full justify-center mt-4">
                  <button
                    type="submit"
                    disabled={isLockingDate}
                    className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full py-3.5 font-semibold shadow-md transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLockingDate && <LoadingSpinner size={18} />}
                    {isLockingDate ? 'ยืนยัน' : 'ยืนยัน'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLockDateModalOpen(false)}
                    disabled={isLockingDate}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-70"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>

              {/* ตารางรายการที่ปิดใช้งาน */}
              <div className="mt-8 pt-6 border-t border-slate-100 w-full flex flex-col gap-3">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center border border-rose-100 shadow-sm text-rose-500 shrink-0">
                      <Lock size={14} strokeWidth={2.5} />
                    </div>
                    รายการวันที่ถูกปิดใช้งาน
                  </h3>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{lockedDates.length} รายการ</span>
                </div>

                <div className="overflow-auto max-h-[300px] custom-scroll w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {lockedDates.length > 0 ? (
                    <table className="w-full text-sm text-left min-w-[500px] whitespace-nowrap">
                      <thead className="text-xs text-slate-500 bg-slate-50/80 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-center w-16">ลำดับ</th>
                          <th className="px-4 py-3 font-semibold">รายการวันที่ได้ปิดใช้งานวันจอง</th>
                          <th className="px-4 py-3 font-semibold text-center w-24">ปลดล็อก</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lockedDates.map((ld, idx) => {
                          const startDisplay = formatDisplayDate(ld.start);
                          const endDisplay = ld.end && ld.start !== ld.end ? formatDisplayDate(ld.end) : null;
                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-4 py-3.5 text-center text-slate-400 font-medium text-xs">{idx + 1}</td>
                              <td className="px-4 py-3.5 text-slate-700 font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                                  <span className="truncate">
                                    {startDisplay} {endDisplay ? <span className="text-slate-400 font-normal mx-1">ถึง</span> : ''} {endDisplay}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleUnlockDate(idx, ld.start, ld.end)}
                                  disabled={isLockingDate}
                                  className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl transition-all shadow-sm disabled:opacity-50 active:scale-90 group-hover:border-emerald-200 mx-auto flex items-center justify-center"
                                  title="ปลดล็อกวันจอง"
                                >
                                  <Unlock size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 bg-slate-50/50">
                      <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100">
                        <CalendarIcon size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">ไม่มีรายการปิดใช้งานวันจอง</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>

          {/* Purpose Modal */}
          <Modal isOpen={isPurposeModalOpen} onClose={() => setIsPurposeModalOpen(false)} title="วัตถุประสงค์การจอง">
            <div className="flex flex-col gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800 text-sm leading-relaxed whitespace-pre-wrap break-words max-w-full overflow-hidden font-medium flex items-start gap-3">
                <Users className="text-[#ba9c5a] shrink-0 mt-0.5" size={20} />
                <span>{selectedPurpose || '-'}</span>
              </div>
              <button
                onClick={() => setIsPurposeModalOpen(false)}
                className="mt-2 w-full bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </Modal>

          {/* Attachment Modal */}
          <Modal isOpen={isAttachmentModalOpen} onClose={() => setIsAttachmentModalOpen(false)} title="รูปภาพแนบการจอง">
            <div className="flex flex-col items-center justify-center p-2 sm:p-4">
              {selectedAttachmentUrl ? (
                <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-2 sm:p-4 flex items-center justify-center min-h-[200px]">
                  <img
                    src={selectedAttachmentUrl}
                    alt="Attachment"
                    className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-sm"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden flex-col items-center gap-2 text-slate-400 py-8">
                    <ImageIcon size={48} className="opacity-50" />
                    <p className="text-sm font-medium">ไม่สามารถโหลดรูปภาพได้ หรือ รูปภาพไม่มีอยู่จริง</p>
                  </div>
                </div>
              ) : (
                <div className="text-slate-500 py-12 flex flex-col items-center gap-3 bg-slate-50 w-full rounded-2xl border border-dashed border-slate-200">
                  <ImageIcon size={48} className="opacity-50" />
                  <p className="font-medium text-sm">ไม่มีรูปภาพแนบ</p>
                </div>
              )}
              <button
                onClick={() => setIsAttachmentModalOpen(false)}
                className="mt-6 w-full bg-[#0f172a] hover:bg-slate-800 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </Modal>

          {/* Approve Action Modal */}
          <Modal isOpen={isApproveModalOpen} onClose={() => !isUpdatingStatus && setIsApproveModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className={`mb-5 drop-shadow-sm flex justify-center mt-4 ${approveActionData.action === 'reject' ? 'text-rose-600' : 'text-emerald-500'}`}>
                {approveActionData.action === 'reject' ? <div className="icon-pulse-red"><XCircle size={64} strokeWidth={2.5} /></div> : <div className="icon-pulse-green"><CheckCircle2 size={64} strokeWidth={2.5} /></div>}
              </div>
              <h2 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
                {approveActionData.action === 'approve' ? 'ยืนยันการอนุมัติ' : 'ยืนยันการไม่อนุมัติ'}
              </h2>
              <p className="text-sm text-slate-500 mb-8">
                คุณแน่ใจหรือไม่ว่าต้องการ {approveActionData.action === 'approve' ? 'อนุมัติ' : 'ไม่อนุมัติ'} รายการจองห้องปฏิบัติการนี้?
              </p>
              <div className="flex gap-3 w-full justify-center">
                <button
                  onClick={() => confirmApproveAction(false)}
                  disabled={isUpdatingStatus}
                  className={`flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-70 ${
                    approveActionData.action === 'approve' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  {isUpdatingStatus && <LoadingSpinner size={16} />} ยืนยัน
                </button>
                <button
                  onClick={() => setIsApproveModalOpen(false)}
                  disabled={isUpdatingStatus}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-70"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal แจ้งเตือนการจองซ้ำซ้อน (Conflict Notification) */}
          <Modal isOpen={isConflictModalOpen} onClose={() => !isUpdatingStatus && setIsConflictModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="mb-4 drop-shadow-sm flex justify-center mt-2 text-rose-500 icon-pulse-red">
                <XCircle size={64} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl text-rose-600 font-bold mb-2">
                พบการจองซ้ำซ้อน!
              </h2>
              <p className="text-sm text-slate-600 mb-4 px-2">
                ไม่สามารถอนุมัติได้ เนื่องจากมีรายการที่ได้รับการอนุมัติไปแล้วในช่วงเวลาที่ทับซ้อนกัน
              </p>

              <div className="w-full bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-6 max-h-[220px] overflow-y-auto custom-scroll text-left">
                <h3 className="text-xs font-bold text-rose-700 mb-2 border-b border-rose-200/50 pb-1">รายการที่ทับซ้อน:</h3>
                <div className="flex flex-col gap-2">
                  {conflictBookings.map((cb, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-sm flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800 text-sm">{cb.reqName || '-'}</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">{cb.bookingCode || '-'}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><CalendarIcon size={10} className="text-slate-400"/> {formatDisplayDate(cb.startDate)} {cb.endDate && cb.endDate !== '-' && cb.endDate !== cb.startDate ? ` - ${formatDisplayDate(cb.endDate)}` : ''}</span>
                        <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400"/> {cb.startTime} - {cb.endTime || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full justify-center">
                <button
                  onClick={() => setIsConflictModalOpen(false)}
                  disabled={isUpdatingStatus}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-70"
                >
                  ปิดหน้าต่างและยกเลิกการอนุมัติ
                </button>
                <button
                  onClick={() => confirmApproveAction(true)}
                  disabled={isUpdatingStatus}
                  className="w-full text-slate-400 hover:text-rose-500 text-xs font-medium py-2 underline transition-colors disabled:opacity-50"
                >
                  ยืนยันอนุมัติซ้อนทับ (ไม่แนะนำ)
                </button>
              </div>
            </div>
          </Modal>

          {/* Pop-up แจ้งเตือนเมื่ออนุมัติสำเร็จ */}
          <Modal isOpen={isApproveSuccessModalOpen} onClose={() => setIsApproveSuccessModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="text-emerald-500 mb-4 drop-shadow-sm icon-pulse-green mt-2">
                <CheckCircle2 size={64} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
                อนุมัติรายการจองสำเร็จ
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                ระบบได้บันทึกการอนุมัติห้องปฏิบัติการวิทยาศาสตร์เรียบร้อยแล้ว
              </p>

              {justApprovedBooking && (
                <div className="w-full bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 sm:p-5 mb-8 text-left shadow-sm">
                  <div className="flex items-center justify-between border-b border-emerald-200/50 pb-2 mb-3">
                    <h3 className="text-sm font-bold text-emerald-800">รายละเอียดการอนุมัติ</h3>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">{justApprovedBooking.bookingCode || '-'}</span>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">ชื่อ-นามสกุล:</span>
                      <span className="font-bold text-slate-800">{justApprovedBooking.reqName || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs">ตำแหน่ง:</span>
                      <span className="font-semibold text-slate-700 bg-white border border-emerald-100 px-2 py-0.5 rounded-md text-xs">{justApprovedBooking.reqPosition || '-'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-slate-500 text-xs flex items-center gap-1"><CalendarIcon size={12}/> วันที่จอง:</span>
                      <span className="font-semibold text-slate-800 text-xs">
                        {formatDisplayDate(justApprovedBooking.startDate)}
                        {justApprovedBooking.endDate && justApprovedBooking.endDate !== '-' && justApprovedBooking.endDate !== justApprovedBooking.startDate ? ` ถึง ${formatDisplayDate(justApprovedBooking.endDate)}` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 text-xs flex items-center gap-1"><Clock size={12}/> เวลา:</span>
                      <span className="font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {justApprovedBooking.startTime} - {justApprovedBooking.endTime || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex w-full justify-center">
                <button
                  onClick={() => setIsApproveSuccessModalOpen(false)}
                  className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-semibold py-3.5 rounded-full shadow-md transition-all duration-200 active:scale-95"
                >
                  รับทราบ
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal แจ้งเตือนการจองซ้ำซ้อนสำหรับผู้ใช้งาน (User Conflict) */}
          <Modal isOpen={isUserConflictModalOpen} onClose={() => setIsUserConflictModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="mb-4 drop-shadow-sm flex justify-center mt-2 text-rose-500 icon-pulse-red">
                <XCircle size={64} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl text-rose-600 font-bold mb-2">
                ไม่สามารถจองได้!
              </h2>
              <p className="text-sm text-slate-600 mb-4 px-2">
                ช่วงเวลาที่คุณต้องการจอง มีรายการอื่นที่ได้รับการอนุมัติไปแล้ว กรุณาเลือกเวลาอื่น
              </p>

              <div className="w-full bg-rose-50/50 border border-rose-100 rounded-xl p-3 mb-6 max-h-[220px] overflow-y-auto custom-scroll text-left">
                <h3 className="text-xs font-bold text-rose-700 mb-2 border-b border-rose-200/50 pb-1">รายละเอียดรายการที่ซ้ำซ้อน:</h3>
                <div className="flex flex-col gap-2">
                  {userConflictBookings.map((cb, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-rose-100 shadow-sm flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800 text-sm">รายการอนุมัติแล้ว</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">รหัสจอง: {cb.bookingCode || '-'}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><CalendarIcon size={10} className="text-slate-400"/> จองวันที่: {formatDisplayDate(cb.startDate)} {cb.endDate && cb.endDate !== '-' && cb.endDate !== cb.startDate ? ` ถึงวันที่: ${formatDisplayDate(cb.endDate)}` : ''}</span>
                        <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400"/> เริ่มเวลา: {cb.startTime} - สิ้นสุดเวลา: {cb.endTime || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-full justify-center">
                <button
                  onClick={() => setIsUserConflictModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95"
                >
                  กลับไปแก้ไขเวลา
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal แจ้งเตือนการจองวันเดียวกันแต่ไม่ซ้ำซ้อนเวลา (User Same Day Notice) */}
          <Modal isOpen={isUserSameDayModalOpen} onClose={() => setIsUserSameDayModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="mb-4 drop-shadow-sm flex justify-center mt-2 text-blue-500">
                <div className="icon-pulse-blue rounded-full bg-white flex items-center justify-center p-1"><Info size={56} strokeWidth={2.5} /></div>
              </div>
              <h2 className="text-xl md:text-2xl text-blue-600 font-bold mb-2">
                แจ้งเตือนการจองในวันเดียวกัน
              </h2>
              <p className="text-sm text-slate-600 mb-4 px-2">
                วันที่คุณเลือกมีการจองที่อนุมัติแล้ว <span className="font-bold text-emerald-600">แต่เวลาไม่ทับซ้อนกัน</span> คุณสามารถยืนยันการจองต่อได้
              </p>

              <div className="w-full bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-6 max-h-[220px] overflow-y-auto custom-scroll text-left">
                <h3 className="text-xs font-bold text-blue-700 mb-2 border-b border-blue-200/50 pb-1">รายการที่มีในวันเดียวกัน:</h3>
                <div className="flex flex-col gap-2">
                  {userSameDayBookings.map((cb, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-sm flex flex-col gap-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-800 text-sm">รายการอนุมัติแล้ว</span>
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">รหัสจอง: {cb.bookingCode || '-'}</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1"><CalendarIcon size={10} className="text-slate-400"/> จองวันที่: {formatDisplayDate(cb.startDate)} {cb.endDate && cb.endDate !== '-' && cb.endDate !== cb.startDate ? ` ถึงวันที่: ${formatDisplayDate(cb.endDate)}` : ''}</span>
                        <span className="flex items-center gap-1"><Clock size={10} className="text-slate-400"/> เริ่มเวลา: {cb.startTime} - สิ้นสุดเวลา: {cb.endTime || '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 w-full justify-center">
                <button
                  onClick={() => {
                    setIsUserSameDayModalOpen(false);
                    if(pendingBookingData) pendingBookingData();
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3.5 rounded-full transition-all shadow-md active:scale-95"
                >
                  ยืนยันการจอง
                </button>
                <button
                  onClick={() => setIsUserSameDayModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </Modal>

          {/* Custom Alert Modal */}
          <Modal isOpen={appAlert.isOpen} onClose={() => setAppAlert({ ...appAlert, isOpen: false })}>
            <div className="flex flex-col items-center justify-center text-center pb-2 px-2 pt-4 sm:pt-6">

              <div className={`mb-4 drop-shadow-sm flex justify-center ${appAlert.type === 'error' ? 'text-rose-600' : 'text-emerald-500'}`}>
                {appAlert.type === 'error' ? <div className="icon-pulse-red mt-1"><XCircle size={64} strokeWidth={2.5} /></div> : <div className="icon-pulse-green mt-1"><CheckCircle2 size={64} strokeWidth={2.5} /></div>}
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 text-center w-full">
                {appAlert.title || 'แจ้งเตือนระบบ'}
              </h1>

              <div className="flex flex-col items-center justify-center min-h-[50px] mb-8 w-full text-center space-y-1.5">
                {appAlert.message
                  .replace('ไม่สามารถจองได้ เนื่องจากมีการล็อกการใช้งานในวันนี้', 'ไม่สามารถจองได้\nเนื่องจากมีการล็อกการใช้งานในวันนี้')
                  .split('\n')
                  .map((line, idx) => (
                  <p key={idx} className={`${idx === 0 && appAlert.type === 'error' ? 'text-base sm:text-lg font-semibold text-rose-600' : 'text-sm sm:text-base text-slate-600'} text-center w-full`}>
                    {line}
                  </p>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAppAlert({ ...appAlert, isOpen: false })}
                className={`w-full text-white rounded-full px-4 py-3 sm:py-4 font-semibold shadow-md transition-all duration-200 active:scale-95 ${appAlert.type === 'error' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#0f172a] hover:bg-slate-800'}`}
              >
                ตกลง
              </button>
            </div>
          </Modal>

          {/* Delete User Confirmation Modal */}
          <Modal isOpen={isDeleteUserModalOpen} onClose={() => !isDeletingUser && setIsDeleteUserModalOpen(false)}>
            <div className="flex flex-col items-center text-center pb-2">
              <div className="mb-5 drop-shadow-sm flex justify-center mt-4 text-rose-600 icon-pulse-red">
                <Trash2 size={64} strokeWidth={2.5} />
              </div>
              <h2 className="text-xl md:text-2xl text-slate-900 font-bold mb-2">
                ยืนยันการลบข้อมูล
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลบัญชีของ {userToDelete?.name || userToDelete?.username || 'ผู้ใช้งานนี้'} ?<br/>
                <span className="text-rose-500 font-medium mt-1 inline-block">ข้อมูลนี้จะถูกลบออกจากระบบอย่างถาวร!</span>
              </p>
              <div className="flex gap-3 w-full justify-center">
                <button
                  onClick={confirmDeleteUser}
                  disabled={isDeletingUser}
                  className="flex-1 flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3.5 rounded-full transition-all shadow-md active:scale-95 disabled:opacity-70"
                >
                  {isDeletingUser && <LoadingSpinner size={16} />}
                  {isDeletingUser ? 'กำลังลบข้อมูล' : 'ยืนยันลบ'}
                </button>
                <button
                  onClick={() => setIsDeleteUserModalOpen(false)}
                  disabled={isDeletingUser}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-70"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </Modal>

          {/* Floating Upcoming Booking Popover */}
          {activeUpcomingBooking && upcomingCoords && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="upcoming-popover fixed transition-all duration-200 bg-white border border-slate-200 shadow-2xl rounded-xl p-4 w-max min-w-[240px] sm:min-w-[280px] max-w-[85vw] sm:max-w-[320px] max-h-[420px] pointer-events-auto z-[9999] animate-fade-in text-left"
              style={{
                top: `${upcomingCoords.top < 280 ? upcomingCoords.bottom : upcomingCoords.top}px`,
                left: `${upcomingCoords.left + upcomingCoords.width / 2}px`,
                transform: upcomingCoords.top < 280 ? 'translate(-50%, 8px)' : 'translate(-50%, -100%) translateY(-8px)',
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">ชื่อผู้จอง:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{activeUpcomingBooking.reqName || '-'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">ตำแหน่ง:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{activeUpcomingBooking.reqPosition || '-'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">รหัสจอง:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{activeUpcomingBooking.bookingCode || '-'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">สถานะ:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
                      activeUpcomingBooking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      activeUpcomingBooking.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {activeUpcomingBooking.status === 'confirmed' ? 'อนุมัติแล้ว' : activeUpcomingBooking.status === 'rejected' ? 'ไม่อนุมัติ' : 'รออนุมัติ'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">ผู้จอง:</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-[#0f172a] bg-slate-100 border border-slate-200">{activeUpcomingBooking.reqName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-16">ประเภท:</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${getPriorityColor(activeUpcomingBooking.priority || 'ปกติ')}`}>
                      {activeUpcomingBooking.priority || 'ปกติ'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 w-16 shrink-0">วัน:</span>
                    <span className="font-medium text-slate-900">{new Date(activeUpcomingBooking.date).toLocaleDateString('th-TH', { weekday: 'long' })}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 w-16 shrink-0">วันที่:</span>
                    <span className="font-medium text-slate-900">{new Date(activeUpcomingBooking.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 w-16 shrink-0">เวลา:</span>
                    <span className="font-medium text-slate-900">{activeUpcomingBooking.time_col_d}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 w-16 shrink-0">วัตถุประสงค์:</span>
                    <span className="font-medium text-slate-900">{activeUpcomingBooking.purpose}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-slate-500 w-16 shrink-0">ห้องปฏิบัติการ:</span>
                    <span className="font-medium text-slate-900">{activeUpcomingBooking.lab || '-'}</span>
                  </div>
                </div>
              </div>
              <div className={`absolute w-3 h-3 bg-white transform rotate-45 left-1/2 -translate-x-1/2 ${
                upcomingCoords.top < 280
                  ? '-top-1.5 border-t border-l border-slate-200'
                  : '-bottom-1.5 border-b border-r border-slate-200'
              }`}></div>
            </div>
          )}

          {/* Notification Modal */}
          <Modal isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} title="รายการจองวันนี้">
            <div className="flex flex-col gap-4">
              {todayNotifications.length > 0 ? (
                todayNotifications.map(notif => {
                  const dObj = new Date(notif.date);
                  return (
                    <div key={`notif-${notif.id}`} className="p-4 bg-white rounded-2xl border border-slate-100 flex flex-col gap-3 text-left shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-base font-bold text-[#0f172a] leading-tight">
                            {dObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span className="text-xs font-semibold text-rose-500 flex items-center gap-1.5 mt-1">
                            <Clock size={12} /> {notif.time_col_d}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm font-bold text-slate-800">{notif.purpose}</p>

                      <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-600">
                          <User size={14} className="text-slate-400" />
                          <span>ผู้จอง: {notif.reqName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                          <MapPin size={14} className="text-slate-400 shrink-0" />
                          <span className="truncate">ห้อง: {notif.lab || '-'}</span>
                        </div>
                        <div>
                          <span className="inline-block bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded text-[10px] border border-blue-200">
                            {notif.priority && notif.priority.toString().includes('คาบ') ? notif.priority : `คาบ ${notif.priority || '-'}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-1">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span>อนุมัติแล้ว</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-slate-500 py-8 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 size={32} className="text-emerald-500/50" />
                  <p>ไม่มีรายการจองในวันนี้</p>
                </div>
              )}
            </div>
          </Modal>

        </div>
      );
    }

    const rootElement = document.getElementById('root');
    const root = createRoot(rootElement);
    root.render(<App />);
