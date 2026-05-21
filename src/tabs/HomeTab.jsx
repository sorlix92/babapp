import React, { useState } from 'react';
import Icons from '../components/Icons';

export const HomeTab = ({ onNavigate }) => {
    const [tipIndex, setTipIndex] = useState(0);

    const tips = [
        {
            title: "Fehér zaj hatása",
            text: "A fehér zaj azért nyugtatja meg a babákat, mert az anyaméhben megszokott ritmikus morajlásokra emlékezteti őket. Emellett hatékonyan elfedi a hirtelen lakáshangokat."
        },
        {
            title: "Hozzátáplálás üteme",
            text: "Az első évben az ételek bevezetése nem a kalóriapótlásról, hanem az ismerkedésről és az allergének óvatos teszteléséről szól. Haladjatok kényelmes, nyugodt tempóban!"
        },
        {
            title: "Ébrenléti ablakok",
            text: "Figyelj a baba fáradtsági jeleire (szem dörzsölése, fül húzgálása). Ha betartod az életkornak megfelelő ébrenléti időket, sokkal könnyebb lesz az elalvás."
        }
    ];

    const nextTip = () => {
        setTipIndex((prev) => (prev + 1) % tips.length);
    };

    return (
        <div className="flex flex-col justify-between flex-grow pb-24">
            
            {/* FELSŐ DEKORATÍV BORÍTÓ */}
            <div className="bg-white rounded-b-[2rem] shadow-sm mb-6 overflow-hidden border-b-4 border-[#FFC8DD] border-dashed">
                
                {/* Felső vékony sáv */}
                <div className="bg-[#FFC8DD] p-2 flex justify-center items-center px-4">
                    <span className="text-white text-xs font-bold tracking-widest uppercase">BabApp - 1 Éves korig</span>
                </div>

                {/* Kedves üdvözlő fejléc */}
                <div className="p-8 text-center relative">
                    {/* Díszítő pasztell körök a háttérben */}
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#CDEAC0] opacity-40"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#BDE0FE] opacity-40"></div>
                    <div className="absolute top-10 right-10 w-4 h-4 rounded-full bg-[#FAE1DD] opacity-40"></div>
                    
                    <div className="mx-auto w-16 h-16 bg-[#FFC8DD] bg-opacity-20 rounded-full flex items-center justify-center text-pink-500 mb-3 shadow-inner">
                        <Icons.Baby className="w-8 h-8 text-[#ffafcc]" />
                    </div>
                    
                    <h1 className="text-4xl font-bold text-gray-700 mb-1 handwritten">Szia, Anyu és Apu! 👋</h1>
                    <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Minden segítség egy helyen a kisbabádhoz</p>
                </div>
            </div>

            {/* FŐMENÜ KÁRTYÁK */}
            <div className="px-4 space-y-6 flex-grow">
                
                <h2 className="text-2xl font-bold text-gray-700 px-2 mb-2 handwritten">Válassz egy modult:</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* 1. HOZZÁTÁPLÁLÁS MENÜPONT (Zöld dekor) */}
                    <button onClick={() => onNavigate('weaning')} className="block text-left w-full focus:outline-none">
                        <div className="paper-card relative border-t-4 border-[#CDEAC0]">
                            {/* Tépett cellux dekoráció */}
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-[#f0f0f0] bg-opacity-75 rotate-1 shadow-xs z-10" style={{clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'}}></div>
                            
                            <div className="p-5 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#CDEAC0] bg-opacity-30 flex items-center justify-center text-gray-600 flex-shrink-0">
                                    <Icons.Utensils className="w-6 h-6 text-[#4A7c59]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-700 handwritten">Első 100 Étel</h3>
                                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                        Kóstolási napló, receptek, allergének és étkezés előtti ellenőrző lista.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 2. ALTATÁS & FEHÉR ZAJ (Levendula lila dekor) */}
                    <button onClick={() => onNavigate('sleep')} className="block text-left w-full focus:outline-none">
                        <div className="paper-card relative border-t-4 border-[#cdb4db]">
                            {/* Tépett cellux dekoráció */}
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-[#f0f0f0] bg-opacity-75 -rotate-1 shadow-xs z-10" style={{clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'}}></div>
                            
                            <div className="p-5 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#cdb4db] bg-opacity-30 flex items-center justify-center text-gray-600 flex-shrink-0">
                                    <Icons.Moon className="w-6 h-6 text-[#9a82a8]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-700 handwritten">Altatás & Fehér Zaj</h3>
                                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                        Valós idejű megnyugtató fehér zajok, altatódalok és okos elhalkulás-időzítő.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </button>

                    {/* 3. FEJLŐDÉSI MÉRFÖLDKÖVEK (Hamarosan) */}
                    <div className="paper-card relative border-t-2 border-dashed border-[#FFC8DD] opacity-60 cursor-default">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FFC8DD] bg-opacity-20 flex items-center justify-center text-gray-400 flex-shrink-0">
                                    <Icons.Stars className="w-6 h-6 text-[#ffafcc]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-gray-400 handwritten">Mérföldkövek</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-[#FFC8DD] bg-opacity-40 text-pink-600 px-2 py-0.5 rounded-md">Hamarosan</span>
                                </div>
                                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                                    Mozgásfejlődés, beszéd és kognitív lépések havi lebontású követése.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* INTERAKTÍV NAPI TIPP KÁRTYA */}
                <div className="paper-card border-l-8 border-[#FFC8DD] mt-8">
                    <div className="p-6 bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-gray-700 text-lg flex items-center gap-1.5 handwritten">
                                <Icons.Idea className="w-5 h-5 text-yellow-500" /> Napi szülői útravaló
                            </h4>
                            <button 
                                onClick={nextTip}
                                className="text-xs bg-pink-50 hover:bg-pink-100 text-[#ffafcc] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                            >
                                Lássuk a következőt <Icons.Next className="w-3 h-3" />
                            </button>
                        </div>
                        <div className="transition-all duration-300">
                            <h5 className="font-bold text-sm text-gray-600 mb-1">{tips[tipIndex].title}</h5>
                            <p className="text-gray-500 text-xs leading-relaxed">
                                {tips[tipIndex].text}
                            </p>
                        </div>
                        <div className="mt-4 text-right">
                            <p className="handwritten text-gray-400 text-lg transform -rotate-1">
                                "Minden nap egy új csoda!"
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HomeTab;
