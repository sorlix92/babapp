import React, { useState, useEffect } from 'react';
import HomeTab from './tabs/HomeTab';
import WeaningTab from './tabs/WeaningTab';
import SleepTab from './tabs/SleepTab';
import Icons from './components/Icons';

export function App() {
    // Kezdeti állapot betöltése az URL hash-ből, vagy alapértelmezett 'home'
    const [activeTab, setActiveTab] = useState(() => {
        const hash = window.location.hash.replace('#/', '');
        return ['home', 'weaning', 'sleep'].includes(hash) ? hash : 'home';
    });

    // Figyeljük a böngésző történetében a visszalépéseket (vissza gomb, swipe)
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (['home', 'weaning', 'sleep'].includes(hash)) {
                setActiveTab(hash);
            } else {
                setActiveTab('home');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        
        // Beállítjuk a kezdő hasht, ha üres
        if (!window.location.hash) {
            window.location.hash = '#/home';
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // Fülváltáskor módosítjuk a hasht, ami bekerül a böngészési előzményekbe
    const handleTabChange = (tab) => {
        window.location.hash = `#/${tab}`;
        setActiveTab(tab);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'home':
                return <HomeTab onNavigate={handleTabChange} />;
            case 'weaning':
                return <WeaningTab />;
            case 'sleep':
                return <SleepTab />;
            default:
                return <HomeTab onNavigate={handleTabChange} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative font-sans max-w-md mx-auto bg-slate-50 shadow-2xl overflow-x-hidden">
            
            {/* Dinamikus tab tartalom betöltése */}
            <div className="flex-grow flex flex-col justify-between">
                {renderActiveTab()}
            </div>

            {/* PRÉMIUM ALSÓ NAVIGÁCIÓS BÁR */}
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white bg-opacity-95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] px-6 py-2 flex justify-around items-center z-50 rounded-t-3xl">
                
                {/* 1. Kezdőlap fül */}
                <button 
                    onClick={() => handleTabChange('home')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${activeTab === 'home' ? 'text-pink-500 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Icons.Home className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Kezdőlap</span>
                </button>

                {/* 2. Hozzátáplálás fül */}
                <button 
                    onClick={() => handleTabChange('weaning')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${activeTab === 'weaning' ? 'text-[#4A7c59] scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Icons.Utensils className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Ételek</span>
                </button>

                {/* 3. Altatás fül */}
                <button 
                    onClick={() => handleTabChange('sleep')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${activeTab === 'sleep' ? 'text-[#9a82a8] scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Icons.Moon className="w-6 h-6" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Alvás</span>
                </button>

            </div>
        </div>
    );
}

export default App;
