import React, { useState, useEffect, useRef } from 'react';
import Icons from '../components/Icons';

export const SleepTab = () => {
    // ---- ÁLLAPOTOK ----
    const [subTab, setSubTab] = useState('tracker'); // 'tracker', 'noise', 'advice'
    
    // Alvásnapló állapotok (LocalStorage fallback)
    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('babapp_sleep_history');
        return saved ? JSON.parse(saved) : [];
    });
    const [activeSleep, setActiveSleep] = useState(() => {
        const saved = localStorage.getItem('babapp_sleep_active');
        return saved ? JSON.parse(saved) : null;
    });
    
    const [now, setNow] = useState(Date.now());
    const [dayStartHour, setDayStartHour] = useState(6);
    const [dayEndHour, setDayEndHour] = useState(20);
    const [birthDate, setBirthDate] = useState(() => localStorage.getItem('babapp_birthdate') || "");

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editStartTime, setEditStartTime] = useState("");
    const [editEndTime, setEditEndTime] = useState("");

    // Fehér zaj állapotok
    const [isNightMode, setIsNightMode] = useState(false);
    const [isPlayingNoise, setIsPlayingNoise] = useState(false);
    const [activeSound, setActiveSound] = useState(null);
    const [activeSoundLabel, setActiveSoundLabel] = useState('Válassz egy zajt');
    const [timerPreset, setTimerPreset] = useState(0); // percben (0 = végtelen)
    const [timeRemaining, setTimeRemaining] = useState(0); // másodpercben
    const [isTimerOpen, setIsTimerOpen] = useState(false);

    // AI Guru állapotok
    const [aiInput, setAiInput] = useState("");
    const [aiResponse, setAiResponse] = useState("");
    const [aiLoading, setAiLoading] = useState(false);

    // ---- REFERENCIÁK (AUDIO MOTORHOZ) ----
    const audioCtxRef = useRef(null);
    const gainNodeRef = useRef(null);
    const noiseNodeRef = useRef(null);
    const filterNodeRef = useRef(null);
    
    const heartbeatIntervalRef = useRef(null);
    const lullabyIntervalRef = useRef(null);
    const rainIntervalRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const noteIdxRef = useRef(0);
    const volume = 0.7;
    const fadeOutDuration = 15; // másodperc

    // Brahms kotta
    const lullabyNotes = [
        {note: 329.63, dur: 0.5}, {note: 329.63, dur: 0.5}, {note: 392.00, dur: 1.0},
        {note: 329.63, dur: 0.5}, {note: 329.63, dur: 0.5}, {note: 392.00, dur: 1.0},
        {note: 329.63, dur: 0.5}, {note: 392.00, dur: 0.5}, {note: 523.25, dur: 1.0},
        {note: 493.88, dur: 0.5}, {note: 440.00, dur: 0.5}, {note: 440.00, dur: 0.5}, {note: 392.00, dur: 1.0},
        {note: 293.66, dur: 0.5}, {note: 329.63, dur: 0.5}, {note: 349.23, dur: 1.0},
        {note: 293.66, dur: 0.5}, {note: 329.63, dur: 0.5}, {note: 349.23, dur: 1.0},
        {note: 293.66, dur: 0.5}, {note: 349.23, dur: 0.5}, {note: 493.88, dur: 1.0},
        {note: 440.00, dur: 0.5}, {note: 392.00, dur: 0.5}, {note: 493.88, dur: 0.5}, {note: 523.25, dur: 1.5},
        {note: 0, dur: 1.0}
    ];

    const soundsList = [
        { id: 'white', label: 'Fehér Zaj', color: 'bg-[#FFC8DD]' },
        { id: 'pink', label: 'Rózsaszín Zaj', color: 'bg-[#FAE1DD]' },
        { id: 'brown', label: 'Barna Zaj', color: 'bg-[#E6CCB2]' },
        { id: 'heartbeat', label: 'Szívverés', color: 'bg-[#FFD6D6]' },
        { id: 'rain', label: 'Nyári Eső', color: 'bg-[#BDE0FE]' },
        { id: 'dryer', label: 'Hajszárító', color: 'bg-[#FFD7BA]' },
        { id: 'vacuum', label: 'Porszívó', color: 'bg-[#D8F3DC]' },
        { id: 'lullaby', label: 'Brahms Dal', color: 'bg-[#CDB4DB]' }
    ];

    // ---- EFFECTS ----
    // LocalStorage szinkronizáció
    useEffect(() => {
        localStorage.setItem('babapp_sleep_history', JSON.stringify(history));
    }, [history]);

    useEffect(() => {
        localStorage.setItem('babapp_sleep_active', JSON.stringify(activeSleep));
    }, [activeSleep]);

    useEffect(() => {
        localStorage.setItem('babapp_birthdate', birthDate);
    }, [birthDate]);

    // Óra frissítése másodpercenként
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Éjszakai mód hatása a body-ra
    useEffect(() => {
        if (isNightMode) {
            document.body.classList.add('night-theme');
        } else {
            document.body.classList.remove('night-theme');
        }
        return () => {
            document.body.classList.remove('night-theme');
        };
    }, [isNightMode]);

    // Lejátszási állapot és aktív hang szinkronizálása
    useEffect(() => {
        if (isPlayingNoise && activeSound) {
            playSoundEngine(activeSound);
            if (timeRemaining > 0) {
                startTimerInterval();
            }
        } else {
            stopAllSounds();
        }
        return () => stopAllSounds();
    }, [isPlayingNoise, activeSound]);

    // ---- AUDIO ENGINE METÓDUSOK ----
    const initAudio = () => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtxRef.current = new AudioContext();
            
            gainNodeRef.current = audioCtxRef.current.createGain();
            gainNodeRef.current.connect(audioCtxRef.current.destination);
            gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    };

    const stopAllSounds = () => {
        if (noiseNodeRef.current) {
            try { noiseNodeRef.current.stop(); } catch(e){}
            noiseNodeRef.current = null;
        }
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
            heartbeatIntervalRef.current = null;
        }
        if (lullabyIntervalRef.current) {
            clearTimeout(lullabyIntervalRef.current);
            lullabyIntervalRef.current = null;
        }
        if (rainIntervalRef.current) {
            clearInterval(rainIntervalRef.current);
            rainIntervalRef.current = null;
        }
    };

    const createWhiteNoise = () => {
        const bufferSize = 2 * audioCtxRef.current.sampleRate;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        return source;
    };

    const createPinkNoise = () => {
        const bufferSize = 2 * audioCtxRef.current.sampleRate;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            output[i] *= 0.11;
            b6 = white * 0.115926;
        }
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        return source;
    };

    const createBrownNoise = () => {
        const bufferSize = 2 * audioCtxRef.current.sampleRate;
        const noiseBuffer = audioCtxRef.current.createBuffer(1, bufferSize, audioCtxRef.current.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        return source;
    };

    const startHeartbeat = () => {
        noiseNodeRef.current = createBrownNoise();
        filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'lowpass';
        filterNodeRef.current.frequency.setValueAtTime(120, audioCtxRef.current.currentTime);
        
        noiseNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(gainNodeRef.current);
        noiseNodeRef.current.start(0);

        const tempo = 920; 
        const playThump = (freq, duration, vol) => {
            if (!audioCtxRef.current || !isPlayingNoise) return;
            const osc = audioCtxRef.current.createOscillator();
            const thumpGain = audioCtxRef.current.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
            osc.frequency.exponentialRampToValueAtTime(10, audioCtxRef.current.currentTime + duration);
            
            thumpGain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
            thumpGain.gain.linearRampToValueAtTime(vol, audioCtxRef.current.currentTime + 0.02);
            thumpGain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
            
            osc.connect(thumpGain);
            thumpGain.connect(gainNodeRef.current);
            
            osc.start();
            osc.stop(audioCtxRef.current.currentTime + duration);
        };

        const pulse = () => {
            playThump(75, 0.15, 0.9);
            setTimeout(() => {
                playThump(68, 0.15, 0.7);
            }, 250);
        };

        pulse();
        heartbeatIntervalRef.current = setInterval(pulse, tempo);
    };

    const startRain = () => {
        noiseNodeRef.current = createPinkNoise();
        filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'lowpass';
        filterNodeRef.current.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
        
        noiseNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(gainNodeRef.current);
        noiseNodeRef.current.start(0);

        rainIntervalRef.current = setInterval(() => {
            if (!audioCtxRef.current || !isPlayingNoise) return;
            if (Math.random() > 0.4) {
                const osc = audioCtxRef.current.createOscillator();
                const clickGain = audioCtxRef.current.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1800 + Math.random() * 2000, audioCtxRef.current.currentTime);
                
                clickGain.gain.setValueAtTime(0.001, audioCtxRef.current.currentTime);
                clickGain.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.03, audioCtxRef.current.currentTime + 0.002);
                clickGain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.05 + Math.random() * 0.05);
                
                osc.connect(clickGain);
                clickGain.connect(gainNodeRef.current);
                osc.start();
                osc.stop(audioCtxRef.current.currentTime + 0.12);
            }
        }, 60);
    };

    const startHairdryer = () => {
        noiseNodeRef.current = createPinkNoise();
        filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'bandpass';
        filterNodeRef.current.frequency.setValueAtTime(450, audioCtxRef.current.currentTime);
        filterNodeRef.current.Q.setValueAtTime(1.5, audioCtxRef.current.currentTime);
        
        noiseNodeRef.current.connect(filterNodeRef.current);
        filterNodeRef.current.connect(gainNodeRef.current);
        noiseNodeRef.current.start(0);
    };

    const startVacuum = () => {
        noiseNodeRef.current = createBrownNoise();
        filterNodeRef.current = audioCtxRef.current.createBiquadFilter();
        filterNodeRef.current.type = 'lowpass';
        filterNodeRef.current.frequency.setValueAtTime(320, audioCtxRef.current.currentTime);
        
        const highpass = audioCtxRef.current.createBiquadFilter();
        highpass.type = 'peaking';
        highpass.frequency.setValueAtTime(150, audioCtxRef.current.currentTime);
        highpass.gain.setValueAtTime(10, audioCtxRef.current.currentTime);
        
        noiseNodeRef.current.connect(highpass);
        highpass.connect(filterNodeRef.current);
        filterNodeRef.current.connect(gainNodeRef.current);
        noiseNodeRef.current.start(0);
    };

    const playLullabyMelody = () => {
        if (!isPlayingNoise || !audioCtxRef.current) return;
        
        const note = lullabyNotes[noteIdxRef.current];
        const nextNoteDelay = note.dur * 1000 * 1.4;

        if (note.note > 0) {
            const osc1 = audioCtxRef.current.createOscillator();
            const noteGain = audioCtxRef.current.createGain();
            
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(note.note, audioCtxRef.current.currentTime);
            
            const osc2 = audioCtxRef.current.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(note.note * 2, audioCtxRef.current.currentTime);
            
            noteGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.12, audioCtxRef.current.currentTime + 0.04);
            noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + (note.dur * 1.6));
            
            osc1.connect(noteGain);
            osc2.connect(noteGain);
            noteGain.connect(gainNodeRef.current);
            
            osc1.start();
            osc2.start();
            osc1.stop(audioCtxRef.current.currentTime + (note.dur * 1.6));
            osc2.stop(audioCtxRef.current.currentTime + (note.dur * 1.6));
        }

        noteIdxRef.current = (noteIdxRef.current + 1) % lullabyNotes.length;
        lullabyIntervalRef.current = setTimeout(playLullabyMelody, nextNoteDelay);
    };

    const playSoundEngine = (type) => {
        stopAllSounds();
        if (!isPlayingNoise) return;

        switch(type) {
            case 'white':
                noiseNodeRef.current = createWhiteNoise();
                noiseNodeRef.current.connect(gainNodeRef.current);
                noiseNodeRef.current.start(0);
                break;
            case 'pink':
                noiseNodeRef.current = createPinkNoise();
                noiseNodeRef.current.connect(gainNodeRef.current);
                noiseNodeRef.current.start(0);
                break;
            case 'brown':
                noiseNodeRef.current = createBrownNoise();
                noiseNodeRef.current.connect(gainNodeRef.current);
                noiseNodeRef.current.start(0);
                break;
            case 'heartbeat':
                startHeartbeat();
                break;
            case 'rain':
                startRain();
                break;
            case 'dryer':
                startHairdryer();
                break;
            case 'vacuum':
                startVacuum();
                break;
            case 'lullaby':
                noteIdxRef.current = 0;
                playLullabyMelody();
                break;
            default:
                break;
        }
    };

    const selectSound = (type, label) => {
        initAudio();
        if (activeSound === type && isPlayingNoise) {
            setIsPlayingNoise(false);
            stopAllSounds();
            stopTimerInterval();
            return;
        }
        setActiveSound(type);
        setActiveSoundLabel(label);
        setIsPlayingNoise(true);
    };

    const handleTimerSet = (minutes) => {
        setTimerPreset(minutes);
        if (minutes === 0) {
            stopTimerInterval();
            setTimeRemaining(0);
            return;
        }
        const seconds = minutes * 60;
        setTimeRemaining(seconds);

        if (isPlayingNoise) {
            startTimerInterval();
        }
    };

    const startTimerInterval = () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        
        timerIntervalRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    setIsPlayingNoise(false);
                    stopAllSounds();
                    stopTimerInterval();
                    setActiveSoundLabel('Időzítő lejárt');
                    
                    if (gainNodeRef.current && audioCtxRef.current) {
                        gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
                    }
                    return 0;
                }

                const nextSec = prev - 1;
                if (nextSec <= fadeOutDuration && gainNodeRef.current && audioCtxRef.current) {
                    const ratio = nextSec / fadeOutDuration;
                    gainNodeRef.current.gain.setValueAtTime(volume * ratio, audioCtxRef.current.currentTime);
                }

                return nextSec;
            });
        }, 1000);
    };

    const stopTimerInterval = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    // ---- ALVÁSNAPLÓ FUNKCIÓK ----
    const isDaySleep = (timestamp) => {
        const date = new Date(timestamp);
        const hour = date.getHours();
        return hour >= dayStartHour && hour < dayEndHour; 
    };

    const handleToggleSleep = () => {
        if (activeSleep) {
            // Ébresztés
            const completed = {
                id: activeSleep.id,
                type: 'SLEEP',
                startTime: activeSleep.startTime,
                endTime: now,
                isDaySleep: activeSleep.isDaySleep,
                duration: now - activeSleep.startTime
            };
            setHistory(prev => [...prev, completed]);
            setActiveSleep(null);
        } else {
            // Altatás indítása
            const newSleep = {
                id: `sleep_${Date.now()}`,
                type: 'SLEEP',
                startTime: now,
                endTime: null,
                isDaySleep: isDaySleep(now),
                duration: 0
            };
            setActiveSleep(newSleep);
        }
    };

    const handleDeleteSleep = (id) => {
        if (confirm("Biztosan törlöd ezt az alvást?")) {
            setHistory(prev => prev.filter(h => h.id !== id));
        }
    };

    const startEditingSleep = (item) => {
        setEditingItem(item);
        setEditStartTime(toLocalISOString(item.startTime));
        setEditEndTime(item.endTime ? toLocalISOString(item.endTime) : "");
    };

    const saveEditSleep = () => {
        if (!editingItem) return;
        const newStart = new Date(editStartTime).getTime();
        let newEnd = editEndTime ? new Date(editEndTime).getTime() : null;
        
        if (!newEnd && editingItem.endTime !== null) return alert("Lezárt alvásnál kötelező a végidő!");
        if (newEnd && newEnd <= newStart) return alert("A vége nem lehet a kezdés előtt!");

        if (activeSleep && editingItem.id === activeSleep.id) {
            setActiveSleep({
                ...activeSleep,
                startTime: newStart,
                isDaySleep: isDaySleep(newStart)
            });
        } else {
            setHistory(prev => prev.map(item => {
                if (item.id === editingItem.id) {
                    return {
                        ...item,
                        startTime: newStart,
                        endTime: newEnd,
                        isDaySleep: isDaySleep(newStart),
                        duration: newEnd - newStart
                    };
                }
                return item;
            }));
        }
        setEditingItem(null);
    };

    // AI Guru hívás
    const handleAskGemini = async (e) => {
        e.preventDefault();
        if (!aiInput.trim()) return;
        setAiLoading(true);
        
        const ageMonths = calculateAgeMonths(birthDate);
        const promptText = `Baba alvás kérdés: "${aiInput}". Életkor: ${ageMonths} hónap. Válaszolj magyarul, röviden és kedvesen mint egy védőnő.`;
        
        try {
            // Mivel nincs szerver/API kulcs a lokális környezetben, adunk egy kedves védőnői választ lokálisan,
            // vagy szimuláljuk. Ha a szülő komolyan kérdez, itt a helye az AI Guru válasznak.
            setTimeout(() => {
                let mockReply = "Kedves Anyuka! Ebben a korban teljesen természetes a baba éjszakai ébredése. Figyeljünk az ébrenléti ablakokra (amely most kb. 2-2.5 óra), és próbáljuk a nappali alvásokat sötétített, csendes szobában tartani. Ha az ébredések hirtelen kezdődtek, fogzás vagy fejlődési ugrás is állhat a háttérben. Kitartást kívánok!";
                if (aiInput.toLowerCase().includes("fog") || aiInput.toLowerCase().includes("fáj")) {
                    mockReply = "Fogzás esetén az éjszakai alvás nagyon zaklatottá válhat. Próbálkozhatunk hűthető rágókával vagy homeopátiás géllel az ínyre lefekvés előtt. Ha a fájdalom erős, egyeztess a gyermekorvossal fájdalomcsillapító szirup kapcsán. Ringatás, meleg ölelés mindig megnyugtató ilyenkor.";
                } else if (aiInput.toLowerCase().includes("fehér zaj") || aiInput.toLowerCase().includes("zaj")) {
                    mockReply = "A fehér zaj kiválóan alkalmas az alvási ciklusok közötti mikro-ébredések áthidalására és a hirtelen lakáshangok kiszűrésére. Legyen a hangszóró legalább 2 méterre a babától, és a hangerő ne haladja meg a normál zuhanyzás hangerejét (kb. 50-60 dB).";
                }
                setAiResponse(mockReply);
                setAiLoading(false);
                setAiInput("");
            }, 1000);
        } catch(e) {
            setAiResponse("Sajnos jelenleg nem sikerült elérni az AI tanácsadót. Kérlek próbáld meg később!");
            setAiLoading(false);
        }
    };

    // Segédfüggvények
    const formatDuration = (ms) => {
        if (!ms && ms !== 0) return "--";
        const totalMinutes = Math.floor(ms / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}ó ${minutes}p` : `${minutes}p`;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return "--:--";
        return new Date(timestamp).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    };

    const toLocalISOString = (timestamp) => {
        const date = new Date(timestamp);
        const offset = date.getTimezoneOffset() * 60000;
        return (new Date(date - offset)).toISOString().slice(0, 16);
    };

    const calculateAgeMonths = (bDate) => {
        if (!bDate) return 0;
        const birth = new Date(bDate);
        const nowTime = new Date();
        let months = (nowTime.getFullYear() - birth.getFullYear()) * 12;
        months -= birth.getMonth();
        months += nowTime.getMonth();
        return months <= 0 ? 0 : months;
    };

    // Napi statisztika kiszámítása
    const todayStart = new Date(now).setHours(0, 0, 0, 0);
    const todaysSleeps = history.filter(h => (h.endTime || now) > todayStart);
    
    let totalDaySleep = 0;
    let totalNightSleep = 0;

    [...todaysSleeps, activeSleep].filter(Boolean).forEach(item => {
        const start = Math.max(item.startTime, todayStart);
        const end = item.endTime || now;
        const duration = Math.max(0, end - start);
        if (isDaySleep(item.startTime)) totalDaySleep += duration;
        else totalNightSleep += duration;
    });

    const currentDuration = activeSleep ? (now - activeSleep.startTime) : 0;
    const hDisplay = Math.floor(currentDuration / 3600000);
    const mDisplay = String(Math.floor((currentDuration % 3600000) / 60000)).padStart(2, '0');
    const sDisplay = String(Math.floor((currentDuration % 60000) / 1000)).padStart(2, '0');

    const ActiveSoundIcon = activeSound && Icons[activeSound] ? Icons[activeSound] : Icons.defaultMoon;

    // Timeline ábrázolás
    const Timeline = () => {
        const totalDayMs = 24 * 60 * 60 * 1000;
        const sleepsForTimeline = [...todaysSleeps];
        if (activeSleep) sleepsForTimeline.push({ ...activeSleep, endTime: null });

        return (
            <div className="w-full mt-4 mb-2 select-none">
                <div className="flex justify-between text-[10px] text-gray-400 font-mono-jb mb-1 px-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>24:00</span>
                </div>
                <div className="h-6 bg-slate-200 bg-opacity-50 rounded-lg relative overflow-hidden border border-slate-200 w-full">
                    <div 
                        className="absolute top-0 bottom-0 bg-orange-100/40 border-l border-r border-orange-200/30" 
                        style={{ 
                            left: `${(dayStartHour/24)*100}%`, 
                            width: `${((dayEndHour - dayStartHour)/24)*100}%` 
                        }}
                    />
                    {sleepsForTimeline.map((sleep, idx) => {
                        const startRelative = Math.max(0, sleep.startTime - todayStart);
                        const leftPct = (startRelative / totalDayMs) * 100;
                        const endTime = sleep.endTime || now;
                        const duration = endTime - sleep.startTime;
                        const widthPct = (duration / totalDayMs) * 100;

                        if (sleep.endTime && sleep.endTime < todayStart) return null; 

                        return (
                            <div 
                                key={idx}
                                className={`absolute top-1 bottom-1 rounded-sm shadow-sm ${sleep.isDaySleep ? 'bg-orange-400' : 'bg-indigo-500'}`}
                                style={{ 
                                    left: `${leftPct}%`, 
                                    width: `${Math.max(0.5, widthPct)}%`
                                }}
                                title={`${formatTime(sleep.startTime)} - ${formatTime(sleep.endTime)}`}
                            />
                        );
                    })}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 animate-pulse" style={{ left: `${((now - todayStart) / totalDayMs) * 100}%` }} />
                </div>
            </div>
        );
    };

    return (
        <div className={`min-h-screen flex flex-col justify-between flex-grow pb-24 transition-colors duration-1000 ${isNightMode ? 'bg-slate-950 text-slate-100' : ''}`}>
            
            {/* FEJLÉC */}
            <div className="bg-white rounded-b-[2rem] shadow-sm mb-4 overflow-hidden border-b-4 border-[#CDB4DB] border-dashed">
                <div className="bg-[#CDB4DB] p-2 flex justify-between items-center px-4">
                    <span className="text-white text-xs font-bold tracking-widest uppercase">BabApp Altatás</span>
                    <button 
                        onClick={() => setIsNightMode(!isNightMode)} 
                        className="text-white hover:text-yellow-100 transition-colors" 
                        title="Éjszakai mód"
                    >
                        {isNightMode ? <Icons.Sun className="w-5 h-5 text-yellow-300" /> : <Icons.Moon className="w-5 h-5" />}
                    </button>
                </div>

                <div className="p-4 text-center relative">
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#FFC8DD] opacity-50"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#BDE0FE] opacity-50"></div>
                    <h1 className="text-4xl font-bold text-gray-700 mb-0.5 handwritten">Altatás & Zajok</h1>
                    <p className="text-gray-400 text-xs font-semibold tracking-wide uppercase">Alvásnapló és Természetes hangok</p>
                </div>
                
                {/* ALSZEKCIÓ VÁLASZTÓ */}
                <div className="flex justify-center gap-2 px-4 pb-4">
                    <button 
                        onClick={() => setSubTab('tracker')} 
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${subTab === 'tracker' ? 'bg-[#cdb4db] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    >
                        <Icons.Timer className="w-4 h-4" /> Napló
                    </button>
                    <button 
                        onClick={() => setSubTab('noise')} 
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${subTab === 'noise' ? 'bg-[#cdb4db] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    >
                        <Icons.Moon className="w-4 h-4" /> Hangok
                    </button>
                    <button 
                        onClick={() => setSubTab('advice')} 
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all ${subTab === 'advice' ? 'bg-[#cdb4db] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
                    >
                        <Icons.Sparkles className="w-4 h-4" /> AI Tanács
                    </button>
                </div>
            </div>

            {/* FŐ TARTALOM FÜLEK SZERINT */}
            <div className="px-4 flex-grow">

                {/* 1. ALSZEKCIÓ: NAPLÓ ÉS IDŐZÍTŐ */}
                {subTab === 'tracker' && (
                    <div className="space-y-4">
                        {/* Statisztika kártya */}
                        <div className="paper-card p-4 flex justify-between items-center">
                            <div className="flex gap-6">
                                <div>
                                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                        <Icons.Sun className="w-3 h-3 text-orange-400" /> Nappali
                                    </div>
                                    <div className="font-mono-jb text-lg font-bold text-gray-700">{formatDuration(totalDaySleep)}</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                                        <Icons.Moon className="w-3 h-3 text-indigo-500" /> Éjszakai
                                    </div>
                                    <div className="font-mono-jb text-lg font-bold text-gray-700">{formatDuration(totalNightSleep)}</div>
                                </div>
                            </div>
                            
                            <div className="flex gap-2">
                                <button onClick={() => setShowSettingsModal(true)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition" title="Beállítások">
                                    <Icons.Settings className="w-4 h-4" />
                                </button>
                                <button onClick={() => setShowHistoryModal(true)} className="p-2 bg-gray-800 text-white hover:bg-gray-700 rounded-full transition" title="Múltbéli Alvások">
                                    <Icons.History className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Idővonal */}
                        <Timeline />

                        {/* Stopper & Nagy gomb */}
                        <div className="flex flex-col items-center justify-center py-6 relative">
                            {/* Éppen alvás időtartama */}
                            <div className="text-center mb-6">
                                <div className="text-6xl font-black font-mono-jb tracking-tighter tabular-nums drop-shadow-sm text-gray-700">
                                    {hDisplay}:{mDisplay}
                                    <span className="text-xl opacity-50 ml-0.5 font-normal align-top">.{sDisplay}</span>
                                </div>
                                {activeSleep && (
                                    <button 
                                        onClick={() => startEditingSleep(activeSleep)}
                                        className="mt-2 text-[10px] bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-full text-gray-600 font-bold flex items-center gap-1 mx-auto transition"
                                    >
                                        <Icons.Edit className="w-3 h-3" /> Kezdés javítása
                                    </button>
                                )}
                            </div>

                            {/* Fő Altatás/Ébresztés gomb */}
                            <button 
                                onClick={handleToggleSleep}
                                className={`w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform active:scale-95 duration-300 ${
                                    activeSleep 
                                    ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-8 ring-amber-400/20' 
                                    : 'bg-indigo-600 text-white hover:bg-indigo-500 ring-8 ring-indigo-600/20'
                                }`}
                            >
                                {activeSleep ? <Icons.Sun className="w-12 h-12 mb-1" /> : <Icons.Moon className="w-12 h-12 mb-1" />}
                                <span className="text-lg font-bold uppercase tracking-wider">
                                    {activeSleep ? 'Ébresztés' : 'Altatás'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}

                {/* 2. ALSZEKCIÓ: FEHÉR ZAJ HANGOK */}
                {subTab === 'noise' && (
                    <div className="space-y-4">
                        {/* Lejátszó kártya */}
                        <div className="paper-card relative mb-6">
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#f0f0f0] bg-opacity-80 rotate-1 shadow-sm z-10" style={{clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'}}></div>
                            
                            <div className="p-6 flex flex-col items-center justify-center">
                                <div className="relative flex items-center justify-center mb-4 mt-2">
                                    <div className={`absolute w-28 h-28 rounded-full ${isPlayingNoise ? 'pulsing-glow bg-purple-300' : ''} transition-all duration-1000`}></div>
                                    
                                    <button 
                                        onClick={() => {
                                            if (!activeSound) selectSound('white', 'Fehér Zaj');
                                            else setIsPlayingNoise(!isPlayingNoise);
                                        }} 
                                        className="relative w-22 h-22 bg-gradient-to-tr from-[#cdb4db] to-[#bde0fe] rounded-full flex items-center justify-center text-white shadow-md transform active:scale-95 transition-all duration-200 z-10"
                                    >
                                        <ActiveSoundIcon className="h-8 w-8 text-white" />
                                    </button>
                                </div>

                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest handwritten text-lg">
                                    {isPlayingNoise ? 'Szól a háttérben...' : 'Készenlétben'}
                                </h3>
                                <h2 className="text-xl font-bold text-gray-700 handwritten mt-1">
                                    {activeSoundLabel}
                                </h2>
                            </div>

                            {/* Összecsukható időzítő */}
                            <div className="border-t border-dashed border-gray-200 bg-[#fffdfa]">
                                <button 
                                    onClick={() => setIsTimerOpen(!isTimerOpen)}
                                    className="w-full py-3 px-6 flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
                                >
                                    <span className="flex items-center gap-1">
                                        <Icons.Timer className="w-4 h-4" />
                                        {timeRemaining > 0 ? `Aktív időzítő: ${Math.floor(timeRemaining/60)}p ${timeRemaining%60}mp` : 'Időzítő: Végtelen'}
                                    </span>
                                    <span>{isTimerOpen ? '▲ BEZÁRÁS' : '▼ IDŐZÍTÉS'}</span>
                                </button>

                                {isTimerOpen && (
                                    <div className="px-6 pb-6 pt-1 flex flex-col items-center border-t border-dashed border-gray-100">
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {[15, 30, 45, 60].map((mins) => (
                                                <button 
                                                    key={mins}
                                                    onClick={() => handleTimerSet(mins)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timerPreset === mins ? 'bg-[#cdb4db] text-white' : 'bg-gray-100 text-gray-500'}`}
                                                >
                                                    {mins}p
                                                </button>
                                            ))}
                                            <button 
                                                onClick={() => handleTimerSet(0)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timerPreset === 0 ? 'bg-[#cdb4db] text-white' : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                Végtelen
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hangok listája */}
                        <div className="grid grid-cols-2 gap-3 pb-6">
                            {soundsList.map((snd) => {
                                const SoundIcon = Icons[snd.id];
                                const isActive = activeSound === snd.id && isPlayingNoise;
                                return (
                                    <button
                                        key={snd.id}
                                        onClick={() => selectSound(snd.id, snd.label)}
                                        className={`paper-card p-4 flex flex-col items-center justify-center text-center transition-all duration-200 hover:scale-[1.02] border-2 ${isActive ? 'sound-active-card' : 'border-transparent'}`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${snd.color} flex items-center justify-center text-gray-600 mb-2`}>
                                            <SoundIcon className="h-6 w-6" />
                                        </div>
                                        <span className="font-bold text-gray-700 text-xs">{snd.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 3. ALSZEKCIÓ: AI VÉDŐNŐ & TANÁCSOK */}
                {subTab === 'advice' && (
                    <div className="space-y-4">
                        {/* AI Tanácsadó chat kártya */}
                        <div className="paper-card border-t-4 border-[#cdb4db]">
                            <div className="bg-[#cdb4db] bg-opacity-40 p-4">
                                <h3 className="font-bold text-lg text-indigo-700 flex items-center gap-2 handwritten">
                                    <Icons.Sparkles className="w-5 h-5 text-indigo-500" />
                                    AI Védőnő Tanácsadó
                                </h3>
                                <p className="text-xs text-gray-500 font-bold">Kérdezz bátran a baba alvási szokásairól, ébrenléti ablakairól!</p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 space-y-4">
                                {aiLoading ? (
                                    <div className="text-center py-4">
                                        <Icons.Loader2 className="animate-spin inline w-6 h-6 text-indigo-500"/>
                                        <span className="block text-xs text-gray-400 mt-1">Az AI védőnő gondolkodik...</span>
                                    </div>
                                ) : (
                                    <div className="bg-white p-3 rounded-xl shadow-inner text-sm text-gray-600 leading-relaxed border border-gray-100">
                                        {aiResponse || "Szia! Kérdezz bátran a kisbaba alvásával, napirendjével kapcsolatban. (pl. Miért ébred éjjel a 6 hónapos baba?)"}
                                    </div>
                                )}
                                
                                <form onSubmit={handleAskGemini} className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={aiInput}
                                        onChange={e => setAiInput(e.target.value)}
                                        placeholder="Ide írd a kérdésed..." 
                                        className="flex-1 px-3 py-2 border rounded-xl bg-white text-sm outline-none text-gray-700 focus:border-indigo-400"
                                    />
                                    <button 
                                        type="submit" 
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow hover:bg-indigo-500"
                                    >
                                        Küldés
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Szakértői füzetlap */}
                        <div className="paper-card border-l-8 border-[#ffafcc] mb-6">
                            <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                                <h3 className="text-2xl font-bold text-gray-700 mb-4 handwritten">Szakértői Tippek</h3>
                                <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                                    <p><strong>1. Ciklusos ébredések:</strong> A babák alvási ciklusa 40-50 perces. Ha ilyenkor megmoccan, ne rohanj be azonnal. Adj neki 1-2 percet, hátha visszaalszik egyedül.</p>
                                    <p><strong>2. Alvási asszociáció:</strong> Ha mindig ringatva vagy cicin alszik el, ébredéskor is ezt fogja igényelni. Próbáljuk álmosan, de még ébren letenni a kiságyba.</p>
                                    <p><strong>3. Ébrenléti ablakok:</strong> Újszülötteknél 45-60 perc, 6 hónaposan kb. 2-2.5 óra, 1 évesen pedig már 3-4 óra az optimális ébrenlét két alvás között.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* ---- MODALOK ---- */}
            {/* 1. MÚLTBÉLI ALVÁSOK MODAL */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white w-full sm:max-w-md h-[80%] rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-gray-800">
                        <div className="p-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                            <h3 className="text-lg font-bold flex items-center gap-2"><Icons.History className="w-5 h-5 text-gray-500"/> Alvás Napló</h3>
                            <button onClick={() => setShowHistoryModal(false)} className="p-2"><Icons.Close className="w-5 h-5 text-gray-400"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                            {history.length === 0 && <div className="text-center text-gray-400 py-10 font-bold">Még nincs mentett alvás.</div>}
                            {history.slice().reverse().map((entry) => (
                                <div key={entry.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.isDaySleep ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {entry.isDaySleep ? <Icons.Sun className="w-4 h-4"/> : <Icons.Moon className="w-4 h-4"/>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-xs text-gray-700">{new Date(entry.startTime).toLocaleDateString()}</p>
                                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">{formatDuration(entry.duration)}</span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-mono-jb mt-0.5">{formatTime(entry.startTime)} - {formatTime(entry.endTime)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => startEditingSleep(entry)} className="p-1.5 text-gray-300 hover:text-indigo-600 rounded-full transition"><Icons.Edit className="w-4 h-4"/></button>
                                        <button onClick={() => handleDeleteSleep(entry.id)} className="p-1.5 text-gray-300 hover:text-red-500 rounded-full transition"><Icons.Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. BEÁLLÍTÁSOK MODAL */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl text-gray-800 relative">
                        <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Icons.Close className="w-5 h-5"/></button>
                        <h3 className="text-xl font-bold mb-4">Alvás Beállítások</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Baba születési ideje</label>
                                <input 
                                    type="date" 
                                    value={birthDate} 
                                    onChange={e => setBirthDate(e.target.value)} 
                                    className="w-full p-2 border rounded-xl bg-gray-50 text-gray-700 outline-none text-sm"
                                />
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                                    <span>Nappal kezdete</span>
                                    <span className="text-orange-500 font-bold">{dayStartHour}:00</span>
                                </div>
                                <input type="range" min="4" max="10" step="1" value={dayStartHour} onChange={(e) => setDayStartHour(Number(e.target.value))} className="w-full accent-orange-500"/>
                            </div>
                            
                            <div>
                                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase mb-1">
                                    <span>Nappal vége (Éjszaka kezdete)</span>
                                    <span className="text-indigo-500 font-bold">{dayEndHour}:00</span>
                                </div>
                                <input type="range" min="16" max="23" step="1" value={dayEndHour} onChange={(e) => setDayEndHour(Number(e.target.value))} className="w-full accent-indigo-500"/>
                            </div>
                            
                            <button 
                                onClick={() => setShowSettingsModal(false)} 
                                className="w-full btn-primary py-3 rounded-xl mt-4 text-white font-bold"
                            >
                                Mentés
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. ALVÁS SZERKESZTÉS MODAL */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm text-gray-800">
                    <div className="bg-white w-full max-w-xs p-6 rounded-2xl shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Időpont módosítása</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kezdés</label>
                                <input type="datetime-local" value={editStartTime} onChange={(e) => setEditStartTime(e.target.value)} className="w-full bg-slate-100 border-0 rounded-lg p-2 text-sm text-gray-700 outline-none"/>
                            </div>
                            {editingItem.endTime !== null && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Befejezés</label>
                                    <input type="datetime-local" value={editEndTime} onChange={(e) => setEditEndTime(e.target.value)} className="w-full bg-slate-100 border-0 rounded-lg p-2 text-sm text-gray-700 outline-none"/>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={() => setEditingItem(null)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-slate-100 rounded-lg">Mégse</button>
                            <button onClick={saveEditSleep} className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">Mentés</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SleepTab;
