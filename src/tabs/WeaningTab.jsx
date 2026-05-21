import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';

const PALETTES = [
    { id: 'green', name: 'Zöld', headerColor: 'bg-[#CDEAC0]', borderColor: 'border-[#b5dcb0]', textColor: 'text-[#4A7c59]' },
    { id: 'pink', name: 'Rózsaszín', headerColor: 'bg-[#FFC8DD]', borderColor: 'border-[#ffb7d2]', textColor: 'text-[#d65c85]' },
    { id: 'brown', name: 'Barna', headerColor: 'bg-[#E6CCB2]', borderColor: 'border-[#DDB892]', textColor: 'text-[#7F5539]' },
    { id: 'lightgreen', name: 'Világoszöld', headerColor: 'bg-[#D8F3DC]', borderColor: 'border-[#B7E4C7]', textColor: 'text-[#40916C]' },
    { id: 'red', name: 'Piros', headerColor: 'bg-[#FFD6D6]', borderColor: 'border-[#FFABAB]', textColor: 'text-[#C9184A]' },
    { id: 'blue', name: 'Kék', headerColor: 'bg-[#BDE0FE]', borderColor: 'border-[#a2d2ff]', textColor: 'text-[#487eb0]' },
    { id: 'cream', name: 'Krémszínű', headerColor: 'bg-[#FAE1DD]', borderColor: 'border-[#ebd4d0]', textColor: 'text-[#8d6e63]' },
    { id: 'orange', name: 'Narancs', headerColor: 'bg-[#FFD7BA]', borderColor: 'border-[#fec8a2]', textColor: 'text-[#e58e26]' }
];

const ICONS_LIST = ['Carrot', 'Apple', 'Nut', 'Bean', 'Meat', 'Milk', 'Wheat', 'Droplet', 'Utensils'];

const DEFAULT_FOOD_CATEGORIES = [
    { 
        id: 'vegetables', title: 'Zöldségek', headerColor: 'bg-[#CDEAC0]', borderColor: 'border-[#b5dcb0]', textColor: 'text-[#4A7c59]', icon: 'Carrot', 
        items: ['Uborka', 'Paprika', 'Spenót', 'Fokhagyma', 'Kelkáposzta', 'Fehérkáposzta', 'Brokkoli', 'Karfiol', 'Hagyma', 'Vöröskáposzta', 'Saláta', 'Kínai kel', 'Kelbimbó', 'Sárgarépa', 'Karalábé', 'Főzőtök', 'Vöröshagyma', 'Lilahagyma', 'Újhagyma', 'Cékla', 'Cukkini', 'Padlizsán', 'Sárga és zöldhüvelyű zöldbab', 'Édesburgonya', 'Kukorica', 'Zeller', 'Burgonya', 'Gomba'] 
    },
    { 
        id: 'fruits', title: 'Gyümölcsök', headerColor: 'bg-[#FFC8DD]', borderColor: 'border-[#ffb7d2]', textColor: 'text-[#d65c85]', icon: 'Apple', 
        items: ['Szilva', 'Áfonya', 'Sárgabarack', 'Kókusz', 'Alma', 'Körte', 'Eper', 'Narancs', 'Pomelo', 'Citrom', 'Mandarin', 'Málna', 'Ribizli', 'Grapefruit', 'Rozé szőlő', 'Fehér szőlő', 'Vörös szőlő', 'Avokádó', 'Kiwi', 'Őszibarack', 'Cseresznye', 'Ananász', 'Mangó', 'Sárgadinnye', 'Görögdinnye', 'Meggy', 'Banán', 'Khaki szilva', 'Datolya', 'Füge', 'Szeder', 'Egres', 'Paradicsom'] 
    },
    { 
        id: 'nuts', title: 'Diófélék, olajos magvak', headerColor: 'bg-[#E6CCB2]', borderColor: 'border-[#DDB892]', textColor: 'text-[#7F5539]', icon: 'Nut', 
        items: ['Mandula', 'Tökmag', 'Kendermag', 'Chia mag', 'Dió', 'Kesudió', 'Lenmag', 'Szezámmag', 'Napraforgómag', 'Brazildió', 'Földimogyoró', 'Török mogyoró', 'Mák', 'Pekándió', 'Makadámdió', 'Pisztácia'] 
    },
    { 
        id: 'legumes', title: 'Hüvelyesek', headerColor: 'bg-[#D8F3DC]', borderColor: 'border-[#B7E4C7]', textColor: 'text-[#40916C]', icon: 'Bean', 
        items: ['Gesztenye', 'Csicseriborsó', 'Vörös lencse', 'Fehérbab', 'Vörösbab', 'Fekete bab', 'Vajbab', 'Zöld lencse', 'Beluga lencse', 'Tofu (szójabab)', 'Edamame', 'Zöldborsó', 'Sárgaborsó', 'Cannellini bab', 'Borlotti bab'] 
    },
    { 
        id: 'meats', title: 'Húsok, belsőségek', headerColor: 'bg-[#FFD6D6]', borderColor: 'border-[#FFABAB]', textColor: 'text-[#C9184A]', icon: 'Meat', 
        items: ['Lazac', 'Csirkehús', 'Marhahús', 'Pulykahús', 'Kacsahús', 'Libahús', 'Tőkehal', 'Máj', 'Fácán', 'Polip', 'Zúza', 'Gyöngytyúk', 'Bármilyen vad', 'Garnéla', 'Tintahal', 'Galamb', 'Strucc'] 
    },
    { 
        id: 'dairy', title: 'Tejtermékek', headerColor: 'bg-[#BDE0FE]', borderColor: 'border-[#a2d2ff]', textColor: 'text-[#487eb0]', icon: 'Milk', 
        items: ['Tejföl', 'Mozzarella', 'Joghurt', 'Kefir', 'Vaj', 'Túró', 'Ricotta', 'Emmentali', 'Edami', 'Maasdamer', 'Tejszín', 'Cottage cheese'] 
    },
    { 
        id: 'grains', title: 'Gabonák, álgabonák', headerColor: 'bg-[#FAE1DD]', borderColor: 'border-[#ebd4d0]', textColor: 'text-[#8d6e63]', icon: 'Wheat', 
        items: ['Bulgur', 'Fehér kenyér', 'Magvas kenyér', 'Extrudált kenyér', 'Rizsköret', 'Köles', 'Hajdina', 'Árpagyöngy', 'Spagetti tészta', 'Penne tészta', 'Fusilli tészta', 'Tarhonya', 'Zabkása', 'Amaránt', 'Kuszkusz', 'Tortilla', 'Zsömle', 'Kifli', 'Galuska', 'Rozskenyér', 'Puffasztott rizs', 'Kukoricakása', 'Színes tészta'] 
    },
    { 
        id: 'oils', title: 'Olaj, fűszerek', headerColor: 'bg-[#FFD7BA]', borderColor: 'border-[#fec8a2]', textColor: 'text-[#e58e26]', icon: 'Droplet', 
        items: ['Olívaolaj', 'Majoranna', 'Repceolaj', 'Kakukkfű', 'Dió olaj', 'Lestyán', 'Lenmag olaj', 'Babérlevél', 'Tökmag olaj', 'Köménymag', 'Oregánó', 'Fahéj', 'Fűszerpaprika', 'Rozmaring', 'Bazsalikom', 'Curry', 'Tárkony', 'Vanilia rúd', 'Bors', 'Petrezselyem', 'Kapor', 'Csípős paprika/chili'] 
    }
];

const DEFAULT_ALLERGENS = [
    'Mandula', 'Dió', 'Kesudió', 'Szezámmag', 'Brazildió', 'Földimogyoró', 'Török mogyoró', 'Pekándió', 'Makadámdió', 'Pisztácia',
    'Tofu (szójabab)', 'Edamame',
    'Lazac', 'Tőkehal', 'Garnéla',
    'Tejföl', 'Mozzarella', 'Joghurt', 'Kefir', 'Vaj', 'Túró', 'Ricotta', 'Emmentali', 'Edami', 'Maasdamer', 'Tejszín', 'Cottage cheese',
    'Bulgur', 'Fehér kenyér', 'Magvas kenyér', 'Extrudált kenyér', 'Árpagyöngy', 'Spagetti tészta', 'Penne tészta', 'Fusilli tészta', 'Tarhonya', 'Zabkása', 'Kuszkusz', 'Tortilla', 'Zsömle', 'Kifli', 'Galuska', 'Rozskenyér', 'Színes tészta',
    'Dió olaj'
];


export const WeaningTab = () => {
    // LocalStorage-ból betöltés megbízható try-catch blokkokkal
    const [checkedItems, setCheckedItems] = useState(() => {
        try {
            const saved = localStorage.getItem('babapp_weaning_checked');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Hiba a checkedItems betöltésekor:", e);
        }
        return {};
    });
    const [itemDetails, setItemDetails] = useState(() => {
        try {
            const saved = localStorage.getItem('babapp_weaning_details');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === 'object') {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Hiba a itemDetails betöltésekor:", e);
        }
        
        // Alapértelmezett allergének beállítása
        const initialDetails = {};
        DEFAULT_ALLERGENS.forEach(item => {
            initialDetails[item] = { reaction: 'allergy' };
        });
        return initialDetails;
    });
    const [categories, setCategories] = useState(() => {
        try {
            const saved = localStorage.getItem('babapp_weaning_categories');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Hiba a categories betöltésekor:", e);
        }
        return DEFAULT_FOOD_CATEGORIES;
    });

    const [activeTab, setActiveTab] = useState('foods'); // 'foods' vagy 'checklist'
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState(null); // Szerkesztés alatt álló étel { name, categoryId }
    const [editingCategory, setEditingCategory] = useState(null); // Szerkesztés alatt álló kategória
    const [showNewCategoryModal, setShowNewCategoryModal] = useState(false); // Új kategória modal
    const [showShoppingList, setShowShoppingList] = useState(false);
    const [filterFavorites, setFilterFavorites] = useState(false);
    const [filterProblems, setFilterProblems] = useState(false);

    // Mentés LocalStorage-ba változáskor
    useEffect(() => {
        localStorage.setItem('babapp_weaning_checked', JSON.stringify(checkedItems));
    }, [checkedItems]);

    useEffect(() => {
        localStorage.setItem('babapp_weaning_details', JSON.stringify(itemDetails));
    }, [itemDetails]);

    useEffect(() => {
        localStorage.setItem('babapp_weaning_categories', JSON.stringify(categories));
    }, [categories]);

    // Kategóriák kezelése
    const addCategory = (title, icon, paletteId) => {
        const palette = PALETTES.find(p => p.id === paletteId) || PALETTES[0];
        const newCat = {
            id: 'cat_' + Date.now(),
            title: title.trim(),
            headerColor: palette.headerColor,
            borderColor: palette.borderColor,
            textColor: palette.textColor,
            icon: icon,
            items: []
        };
        setCategories(prev => [...prev, newCat]);
        setShowNewCategoryModal(false);
    };

    const updateCategory = (id, updatedFields) => {
        const palette = PALETTES.find(p => p.id === updatedFields.paletteId) || PALETTES[0];
        setCategories(prev => prev.map(cat => {
            if (cat.id === id) {
                return {
                    ...cat,
                    title: updatedFields.title.trim(),
                    icon: updatedFields.icon,
                    headerColor: palette.headerColor,
                    borderColor: palette.borderColor,
                    textColor: palette.textColor
                };
            }
            return cat;
        }));
        setEditingCategory(null);
    };

    const deleteCategory = (id) => {
        const category = categories.find(c => c.id === id);
        if (!category) return;
        if (!confirm(`Biztosan törölni szeretnéd a "${category.title}" kategóriát és az összes benne lévő ételt?`)) return;
        
        category.items.forEach(itemName => {
            setCheckedItems(prev => {
                const copy = { ...prev };
                delete copy[itemName];
                return copy;
            });
            setItemDetails(prev => {
                const copy = { ...prev };
                delete copy[itemName];
                return copy;
            });
        });
        
        setCategories(prev => prev.filter(c => c.id !== id));
        setEditingCategory(null);
    };

    // Ételek kezelése
    const addFoodItem = (categoryId, itemName) => {
        const trimmedName = itemName.trim();
        if (!trimmedName) return;
        
        let exists = false;
        categories.forEach(cat => {
            if (cat.items.some(i => i.toLowerCase() === trimmedName.toLowerCase())) {
                exists = true;
            }
        });
        if (exists) {
            alert(`A(z) "${trimmedName}" nevű étel már szerepel a listában!`);
            return;
        }
        
        setCategories(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: [...cat.items, trimmedName]
                };
            }
            return cat;
        }));
    };

    const renameFoodItem = (categoryId, oldName, newName) => {
        const trimmedNewName = newName.trim();
        if (!trimmedNewName || oldName === trimmedNewName) return trimmedNewName || oldName;
        
        let exists = false;
        categories.forEach(cat => {
            if (cat.items.some(i => i.toLowerCase() === trimmedNewName.toLowerCase())) {
                exists = true;
            }
        });
        if (exists) {
            alert(`A(z) "${trimmedNewName}" nevű étel már szerepel a listában!`);
            return oldName;
        }
        
        setCategories(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.map(item => item === oldName ? trimmedNewName : item)
                };
            }
            return cat;
        }));
        
        setCheckedItems(prev => {
            const copy = { ...prev };
            if (copy[oldName] !== undefined) {
                copy[trimmedNewName] = copy[oldName];
                delete copy[oldName];
            }
            return copy;
        });
        
        setItemDetails(prev => {
            const copy = { ...prev };
            if (copy[oldName] !== undefined) {
                copy[trimmedNewName] = copy[oldName];
                delete copy[oldName];
            }
            return copy;
        });

        return trimmedNewName;
    };

    const deleteFoodItem = (categoryId, itemName) => {
        if (!confirm(`Biztosan törölni szeretnéd a(z) "${itemName}" ételt a naplóból?`)) return;
        
        setCategories(prev => prev.map(cat => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    items: cat.items.filter(item => item !== itemName)
                };
            }
            return cat;
        }));
        
        setCheckedItems(prev => {
            const copy = { ...prev };
            delete copy[itemName];
            return copy;
        });
        
        setItemDetails(prev => {
            const copy = { ...prev };
            delete copy[itemName];
            return copy;
        });
    };

    const resetWeaningData = () => {
        if (!confirm("Biztosan törölni szeretnéd az ÖSSZES hozzátáplálási adatot (ételek, reakciók, dátumok, egyedi kategóriák)? Ez a művelet nem vonható vissza!")) return;
        
        setCheckedItems({});
        
        const initialDetails = {};
        DEFAULT_ALLERGENS.forEach(item => {
            initialDetails[item] = { reaction: 'allergy' };
        });
        setItemDetails(initialDetails);
        setCategories(DEFAULT_FOOD_CATEGORIES);
        
        localStorage.removeItem('babapp_weaning_checked');
        localStorage.setItem('babapp_weaning_details', JSON.stringify(initialDetails));
        localStorage.removeItem('babapp_weaning_categories');
        
        alert("Minden adat sikeresen alaphelyzetbe állítva!");
    };

    const checklistQuestions = [
        "Tartalmaz jótékony zsiradékot az étel?", 
        "Van a tányéron zöldség?", 
        "Elég puhák a falatok számára?", 
        "Kapott ma már D-vitamint?", 
        "Te elég nyugodt vagy most?", 
        "Nem túl álmos a babád?", 
        "Elzártál, eltettél minden lehetséges zavaró hang/kép-forrást?", 
        "Elpakoltál minden kis zavaró mütyürt az étkezőasztalról?", 
        "Tettél a saját tányérodra is ételt?", 
        "Elérhető távolságra van a repeta lehetősége?", 
        "Kikészítetted a vízzel teli poharaitokat?"
    ];

    const REACTIONS = [
        { id: 'love', icon: '😍', label: 'Imádta' },
        { id: 'neutral', icon: '😐', label: 'Elment' },
        { id: 'dislike', icon: '😖', label: 'Nem kérte' },
        { id: 'allergy', icon: '⚠️', label: 'Allergén' },
    ];

    const toggleCheck = (item) => {
        const isNowChecked = !checkedItems[item];
        setCheckedItems(prev => ({
            ...prev,
            [item]: isNowChecked
        }));

        if (checklistQuestions.includes(item)) return;

        if (isNowChecked) {
            if (!itemDetails[item]?.date) {
                setItemDetails(prev => ({
                    ...prev,
                    [item]: {
                        ...(prev[item] || {}),
                        date: new Date().toISOString().split('T')[0]
                    }
                }));
            }
        } else {
            setItemDetails(prev => {
                const current = prev[item];
                if (!current) return prev;
                const { date, reaction, ...rest } = current;
                return {
                    ...prev,
                    [item]: rest
                };
            });
        }
    };

    const saveItemReaction = (item, reactionId, e) => {
        e.stopPropagation();
        const currentReaction = itemDetails[item]?.reaction;
        const newReaction = currentReaction === reactionId ? null : reactionId;
        
        const existingDetails = itemDetails[item] || {};
        const newDetail = { ...existingDetails, reaction: newReaction };
        
        if (newReaction) {
            setCheckedItems(prev => ({
                ...prev,
                [item]: true
            }));
            
            if (!newDetail.date) {
                newDetail.date = new Date().toISOString().split('T')[0];
            }
        }

        setItemDetails(prev => ({
            ...prev,
            [item]: newDetail
        }));
    };

    const saveItemDetail = (item, detail) => {
        setItemDetails(prev => ({
            ...prev,
            [item]: detail
        }));

        if (detail.date || detail.reaction || detail.note) {
            setCheckedItems(prev => ({
                ...prev,
                [item]: true
            }));
        } else {
            setCheckedItems(prev => ({
                ...prev,
                [item]: false
            }));
        }

        setEditingItem(null);
    };

    const resetDailyChecklist = () => {
        if (!confirm("Biztosan törölni szeretnéd a csekklista pipáit?")) return;
        setCheckedItems(prev => {
            const copy = { ...prev };
            checklistQuestions.forEach(q => {
                copy[q] = false;
            });
            return copy;
        });
    };

    const toggleFavorites = () => {
        if (!filterFavorites) setFilterProblems(false);
        setFilterFavorites(!filterFavorites);
    };

    const toggleProblems = () => {
        if (!filterProblems) setFilterFavorites(false);
        setFilterProblems(!filterProblems);
    };

    // Haladás kalkuláció
    let checkedFoodCount = 0;
    const totalFoodItems = categories.reduce((acc, cat) => acc + (cat?.items?.length || 0), 0);
    categories.forEach(cat => {
        if (cat && cat.items) {
            cat.items.forEach(i => {
                if (checkedItems[i]) checkedFoodCount++;
            });
        }
    });
    const progress = Math.round((checkedFoodCount / totalFoodItems) * 100) || 0;

    // Szűrt lista
    const filteredCategories = categories.map(cat => ({
        ...cat,
        items: (cat?.items || []).filter(item => {
            const matchesSearch = item.toLowerCase().includes(searchTerm.toLowerCase());
            let matchesFilter = true;
            
            if (filterFavorites) {
                matchesFilter = (itemDetails[item]?.reaction === 'love');
            } else if (filterProblems) {
                matchesFilter = ['dislike', 'allergy'].includes(itemDetails[item]?.reaction);
            }
            
            return matchesSearch && matchesFilter;
        })
    })).filter(cat => {
        // Ha nincs aktív keresés és nincsenek szűrők bekapcsolva, akkor jelenítsük meg az üres kategóriát is
        if (!searchTerm && !filterFavorites && !filterProblems) {
            return true;
        }
        // Ha van aktív szűrés/keresés, csak a találatokat tartalmazó kategóriák látszódjanak
        return cat.items && cat.items.length > 0;
    });

    // Csekklista elem komponens
    const CheckItem = ({ label, isChecked, onToggle, details, onEdit, onReaction }) => {
        const isAllergy = details?.reaction === 'allergy';
        return (
            <div className={`flex items-center gap-2 group py-1.5 px-2 rounded-xl transition-all ${isAllergy ? 'bg-red-50/80 border border-red-200/80 shadow-sm' : 'border border-transparent'}`}>
                <div onClick={onToggle} className={`checkbox-container flex-1 flex items-center gap-2 p-1 rounded-lg hover:bg-black hover:bg-opacity-5 transition-colors ${isChecked ? 'is-checked' : ''}`}>
                    <div className="custom-box flex-shrink-0">
                        <span className="tick-mark text-green-500 font-bold text-lg leading-none handwritten">✓</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <span className={`text-base handwritten text-lg block break-words whitespace-normal ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'} ${isAllergy ? 'text-red-700 font-bold' : ''}`}>
                            {label} {isAllergy && '⚠️'}
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                            {details?.date && <span className="text-[10px] text-gray-400 font-sans">{details.date}</span>}
                            {details?.note && (
                                <span className="text-[11px] text-pink-600 font-sans italic truncate max-w-[180px] bg-pink-50 px-1.5 py-0.5 rounded" title={details.note}>
                                    ✍️ {details.note}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Reakciók */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    {REACTIONS.map(r => (
                        <button 
                            key={r.id}
                            onClick={(e) => onReaction(label, r.id, e)}
                            className={`flex flex-col items-center justify-center p-1 rounded hover:bg-gray-100 transition-all active:scale-95 ${details?.reaction === r.id ? 'bg-yellow-100 scale-110 ring-1 ring-yellow-300' : 'opacity-40 hover:opacity-100'}`}
                            title={r.label}
                        >
                            <span className="text-lg leading-none">{r.icon}</span>
                            {r.id === 'allergy' && <span className="text-[7px] text-red-500 font-bold uppercase mt-0.5 tracking-tighter">Allergén</span>}
                        </button>
                    ))}
                </div>

                {/* Módosítás ikon */}
                <button onClick={onEdit} className={`p-2 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-500 flex-shrink-0 ${details?.note ? 'text-pink-400' : ''}`}>
                    <Icons.Edit className="w-4 h-4" />
                </button>
            </div>
        );
    };

    // Bevásárlólista összegző
    const ShoppingListView = () => {
        const uncheckedCategories = categories.map(cat => {
            const unchecked = cat.items.filter(item => !checkedItems[item]);
            return { ...cat, items: unchecked };
        }).filter(cat => cat.items.length > 0);

        return (
            <div className="fixed inset-0 bg-white z-[70] overflow-y-auto">
                <div className="max-w-3xl mx-auto min-h-screen flex flex-col p-4">
                    <div className="border-b pb-4 flex justify-between items-center bg-white sticky top-0 z-10 no-print">
                        <h2 className="text-2xl font-bold text-gray-700 handwritten">Bevásárlólista</h2>
                        <div className="flex gap-2">
                            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-xl font-bold hover:bg-blue-200">
                                <Icons.Print className="w-4 h-4" /> Nyomtatás
                            </button>
                            <button onClick={() => setShowShoppingList(false)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-200">
                                Bezárás
                            </button>
                        </div>
                    </div>
                    
                    <div className="p-4 print-cols">
                        <div className="mb-6 text-center print-only">
                            <h1 className="text-3xl font-bold mb-2">Bevásárlólista</h1>
                            <p className="text-gray-500">Baba Hozzátáplálás - Még megkóstolandó ételek</p>
                        </div>
                        {uncheckedCategories.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <p>Minden ételt kipróbáltatok! 🎉</p>
                            </div>
                        ) : (
                            uncheckedCategories.map(cat => (
                                <div key={cat.id} className="mb-6 break-inside-avoid">
                                    <h3 className={`font-bold text-lg mb-2 ${cat.textColor} border-b pb-1 border-gray-100`}>{cat.title}</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cat.items.map(item => (
                                            <div key={item} className="flex items-center gap-2 text-gray-600 text-sm">
                                                <div className="w-4 h-4 border border-gray-300 rounded-md"></div>
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Részletek / Jegyzet modal étel átnevezéssel és törléssel
    const ItemDetailModal = ({ itemObj, currentDetails, onClose, onSave, onDelete }) => {
        const item = itemObj.name;
        const categoryId = itemObj.categoryId;
        const [name, setName] = useState(item);
        const [date, setDate] = useState(currentDetails?.date || new Date().toISOString().split('T')[0]);
        const [reaction, setReaction] = useState(currentDetails?.reaction || null); 
        const [note, setNote] = useState(currentDetails?.note || '');

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Icons.Close className="w-6 h-6"/></button>
                    
                    <div className="mb-4 pr-6">
                        <label className="block text-sm font-bold text-gray-500 mb-1">Étel neve</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            className="w-full p-2 border rounded-xl bg-gray-50 text-gray-700 font-bold text-lg outline-none focus:ring-2 focus:ring-pink-200" 
                        />
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Dátum</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-xl bg-gray-50 text-gray-700 outline-none" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Reakció</label>
                            <div className="flex justify-between gap-1">
                                {REACTIONS.map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => setReaction(r.id)}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${reaction === r.id ? 'bg-pink-100 scale-105 border border-pink-200' : 'hover:bg-gray-50'}`}
                                    >
                                        <span className="text-2xl">{r.icon}</span>
                                        <span className="text-[9px] uppercase font-bold text-gray-400">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Jegyzet</label>
                            <textarea 
                                value={note} 
                                onChange={e => setNote(e.target.value)}
                                placeholder="Megjegyzés, pl. darabosan vagy pürének kapta..."
                                className="w-full p-3 border rounded-xl bg-gray-50 h-24 resize-none focus:ring-2 focus:ring-pink-200 outline-none text-gray-700"
                            ></textarea>
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => onDelete(item, categoryId)}
                                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1 border border-red-200"
                                title="Törlés"
                            >
                                <Icons.Trash2 className="w-5 h-5" /> Töröl
                            </button>
                            <button 
                                onClick={() => onSave(item, name, { date, reaction, note }, categoryId)}
                                className="flex-1 btn-primary py-3 rounded-xl text-white font-bold"
                            >
                                Mentés
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Kategória Szerkesztő / Létrehozó Modal
    const CategoryEditModal = ({ category, onSave, onDelete, onClose }) => {
        const [title, setTitle] = useState(category ? category.title : '');
        const [icon, setIcon] = useState(category ? category.icon : 'Utensils');
        const [selectedPaletteId, setSelectedPaletteId] = useState(() => {
            if (!category) return 'green';
            const found = PALETTES.find(p => p.headerColor === category.headerColor);
            return found ? found.id : 'green';
        });

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><Icons.Close className="w-6 h-6"/></button>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 handwritten">
                        {category ? 'Kategória Szerkesztése' : 'Új Kategória'}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Kategória neve</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                placeholder="Pl. Gabona, Zöldség..."
                                className="w-full p-2 border rounded-xl bg-gray-50 text-gray-700 font-bold outline-none focus:ring-2 focus:ring-pink-200" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Ikon</label>
                            <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded-xl">
                                {ICONS_LIST.map(icoName => {
                                    const IconComp = Icons[icoName] || Icons.Utensils;
                                    return (
                                        <button 
                                            key={icoName}
                                            onClick={() => setIcon(icoName)}
                                            className={`p-2 rounded-lg flex items-center justify-center hover:bg-gray-200 ${icon === icoName ? 'bg-pink-100 text-pink-600 scale-105 border border-pink-200' : 'text-gray-600'}`}
                                            title={icoName}
                                        >
                                            <IconComp className="w-5 h-5" />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-2">Színpaletta</label>
                            <div className="grid grid-cols-4 gap-2">
                                {PALETTES.map(p => (
                                    <button 
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelectedPaletteId(p.id)}
                                        className={`p-1 rounded-xl text-[10px] font-bold text-center border truncate transition-all ${p.headerColor} ${p.textColor} ${selectedPaletteId === p.id ? 'ring-2 ring-pink-400 scale-105' : 'border-gray-200'}`}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            {category && (
                                <button 
                                    onClick={() => onDelete(category.id)}
                                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-1 border border-red-200"
                                >
                                    <Icons.Trash2 className="w-5 h-5" /> Töröl
                                </button>
                            )}
                            <button 
                                onClick={() => onSave(title, icon, selectedPaletteId)}
                                className="flex-grow btn-primary py-3 rounded-xl text-white font-bold"
                            >
                                Mentés
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-24 max-w-3xl mx-auto no-print">
            <div className="bg-white rounded-b-[2rem] shadow-sm mb-6 overflow-hidden border-b-4 border-[#FFC8DD] border-dashed">
                
                {/* Fejléc sáv */}
                <div className="bg-[#FFC8DD] p-2 flex justify-between items-center px-4">
                    <button onClick={() => setShowShoppingList(true)} className="text-white hover:text-pink-100 transition-colors flex items-center gap-1 font-bold text-xs" title="Bevásárlólista">
                        <Icons.Cart className="w-4 h-4" /> LISTA
                    </button>
                    <span className="text-white text-xs font-bold tracking-widest uppercase">BabApp Hozzátáplálás</span>
                    <button onClick={resetWeaningData} className="text-white hover:text-pink-100 transition-colors flex items-center gap-1 font-bold text-xs" title="Adatok törlése">
                        <Icons.Refresh className="w-4 h-4" /> RESET
                    </button>
                </div>

                <div className="p-6 text-center relative">
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#CDEAC0] opacity-50"></div>
                    <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-[#BDE0FE] opacity-50"></div>
                    <h1 className="text-4xl font-bold text-gray-700 mb-1 handwritten">Első 100 Étel</h1>
                    <p className="text-gray-400 text-sm font-semibold tracking-wide uppercase">Kóstolási Napló & Csekklista</p>
                </div>
                
                <div className="flex justify-center gap-4 px-6 pb-6">
                    <button onClick={() => setActiveTab('foods')} className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${activeTab === 'foods' ? 'bg-[#ffafcc] text-white shadow-md transform -translate-y-1' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><Icons.Utensils className="w-4 h-4" /> Ételek</button>
                    <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2 ${activeTab === 'checklist' ? 'bg-[#cdb4db] text-white shadow-md transform -translate-y-1' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}><Icons.List className="w-4 h-4" /> Ellenőrző</button>
                </div>
            </div>

            {activeTab === 'foods' ? (
                <>
                    {/* Kereső sáv */}
                    <div className="px-6 mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icons.Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:border-pink-300 focus:ring-2 focus:ring-pink-100 text-sm transition duration-150 ease-in-out shadow-sm text-gray-700"
                                placeholder="Keresés az ételek között..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button 
                            onClick={toggleFavorites}
                            className={`px-3 rounded-xl border-2 transition-all flex items-center justify-center ${filterFavorites ? 'bg-pink-100 border-pink-300 text-pink-600 shadow-inner' : 'bg-white border-gray-200 text-gray-400'}`}
                            title="Kedvencek"
                        >
                            <Icons.Heart className="w-6 h-6" filled={filterFavorites} />
                        </button>
                        <button 
                            onClick={toggleProblems}
                            className={`px-3 rounded-xl border-2 transition-all flex items-center justify-center ${filterProblems ? 'bg-orange-100 border-orange-300 text-orange-600 shadow-inner' : 'bg-white border-gray-200 text-gray-400'}`}
                            title="Problémás ételek (Allergia/Nem ízlett)"
                        >
                            <Icons.Warning className="w-6 h-6" filled={filterProblems} />
                        </button>
                    </div>

                    <div className="px-6 mb-6">
                        <div className="flex justify-between items-end mb-2 px-2"><span className="handwritten text-xl text-gray-500">Haladás:</span><span className="font-bold text-[#ffafcc] text-lg">{progress}%</span></div>
                        <div className="h-4 bg-white rounded-full p-1 shadow-inner"><div className="h-full rounded-full bg-gradient-to-r from-[#ffafcc] to-[#ffc8dd] transition-all duration-1000" style={{width: `${progress}%`}}></div></div>
                    </div>

                    <div className="px-4 space-y-6">
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map(cat => {
                                const checkedInCat = cat.items.filter(i => checkedItems[i]).length;
                                const IconComp = Icons[cat.icon] || Icons.Utensils;
                                return (
                                    <div key={cat.id} className="paper-card relative">
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#f0f0f0] bg-opacity-80 rotate-1 shadow-sm z-10" style={{clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'}}></div>
                                        <div className={`${cat.headerColor} p-4 flex items-center justify-between`}>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white bg-opacity-80 p-2 rounded-full text-gray-600">
                                                    <IconComp className="w-5 h-5" />
                                                </div>
                                                <h2 className="font-bold text-xl text-gray-700 handwritten">{cat.title}</h2>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => setEditingCategory(cat)}
                                                    className="p-1.5 rounded-full bg-white bg-opacity-50 hover:bg-opacity-80 text-gray-600 transition-colors"
                                                    title="Kategória szerkesztése"
                                                >
                                                    <Icons.Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <div className="bg-white bg-opacity-50 px-3 py-1 rounded-full text-sm font-bold text-gray-600">{checkedInCat}/{cat.items.length}</div>
                                            </div>
                                        </div>
                                        <div className={`p-4 grid grid-cols-1 gap-y-1 bg-white border-t-2 ${cat.borderColor} border-dashed`}>
                                            {cat.items.map(item => (
                                                <CheckItem 
                                                    key={item} 
                                                    label={item} 
                                                    isChecked={checkedItems[item]} 
                                                    onToggle={() => toggleCheck(item)} 
                                                    details={itemDetails[item]}
                                                    onReaction={saveItemReaction}
                                                    onEdit={() => setEditingItem({ name: item, categoryId: cat.id })}
                                                />
                                            ))}
                                            
                                            {/* Új étel hozzáadása sor */}
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                                                <input 
                                                    type="text" 
                                                    id={`new-food-input-${cat.id}`}
                                                    placeholder="+ Új étel..."
                                                    className="flex-1 text-sm p-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-700 outline-none focus:border-pink-300"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            addFoodItem(cat.id, e.target.value);
                                                            e.target.value = '';
                                                        }
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => {
                                                        const el = document.getElementById(`new-food-input-${cat.id}`);
                                                        if (el) {
                                                            addFoodItem(cat.id, el.value);
                                                            el.value = '';
                                                        }
                                                    }}
                                                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold"
                                                >
                                                    Hozzáad
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <p>Nincs a szűrésnek megfelelő étel.</p>
                            </div>
                        )}

                        <div className="pt-2 pb-6">
                            <button 
                                onClick={() => setShowNewCategoryModal(true)}
                                className="w-full py-4 border-2 border-dashed border-[#ffafcc] rounded-2xl text-[#ffafcc] hover:bg-[#ffafcc]/10 font-bold transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                + Új kategória hozzáadása
                            </button>
                        </div>

                        {/* Veszélyes zóna / Reset szekció */}
                        <div className="pt-8 pb-12 border-t border-gray-100 flex flex-col items-center gap-2">
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest">Veszélyes Zóna</span>
                            <button 
                                onClick={resetWeaningData}
                                className="px-6 py-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Icons.Refresh className="w-4 h-4" /> Minden adat & kategória visszaállítása alapértelmezettre
                            </button>
                            <p className="text-[11px] text-gray-400 max-w-xs text-center">
                                Visszaállítja a gyári kategóriákat és az összes alapértelmezett ételt. Az eddigi reakciók, jegyzetek és pipák törlődnek!
                            </p>
                        </div>
                    </div>
                </>
            ) : (
                /* ÉTKEZÉS ELŐTTI ELLENŐRZŐ LISTA */
                <div className="px-4 space-y-6">
                    <div className="paper-card relative border-t-4 border-[#cdb4db]">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-[#f0f0f0] bg-opacity-80 rotate-1 shadow-sm z-10" style={{clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)'}}></div>
                        <div className="bg-[#cdb4db] p-4 flex items-center justify-between">
                            <h2 className="font-bold text-xl text-gray-700 handwritten flex items-center gap-2">
                                <Icons.List className="w-5 h-5 text-gray-700" />
                                Étkezés Előtti Ellenőrző
                            </h2>
                            <button 
                                onClick={resetDailyChecklist}
                                className="text-xs bg-white bg-opacity-50 text-gray-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-opacity-80 transition-colors"
                            >
                                <Icons.Refresh className="w-3 h-3" /> Reset
                            </button>
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-y-2 bg-white">
                            {checklistQuestions.map((q, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <div 
                                        onClick={() => toggleCheck(q)} 
                                        className={`checkbox-container flex-grow flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors ${checkedItems[q] ? 'is-checked' : ''}`}
                                    >
                                        <div className="custom-box flex-shrink-0">
                                            <span className="tick-mark text-green-500 font-bold text-lg leading-none handwritten">✓</span>
                                        </div>
                                        <span className={`text-base handwritten text-lg ${checkedItems[q] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{q}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Shopping List Modal */}
            {showShoppingList && <ShoppingListView />}

            {/* Item Detail Modal */}
            {editingItem && (
                <ItemDetailModal 
                    itemObj={editingItem}
                    currentDetails={itemDetails[editingItem.name]}
                    onClose={() => setEditingItem(null)}
                    onSave={(oldName, newName, details, categoryId) => {
                        const finalName = renameFoodItem(categoryId, oldName, newName);
                        saveItemDetail(finalName, details);
                    }}
                    onDelete={(itemName, categoryId) => {
                        deleteFoodItem(categoryId, itemName);
                        setEditingItem(null);
                    }}
                />
            )}

            {/* Category Edit Modal */}
            {editingCategory && (
                <CategoryEditModal 
                    category={editingCategory}
                    onSave={(title, icon, paletteId) => updateCategory(editingCategory.id, { title, icon, paletteId })}
                    onDelete={deleteCategory}
                    onClose={() => setEditingCategory(null)}
                />
            )}

            {/* New Category Modal */}
            {showNewCategoryModal && (
                <CategoryEditModal 
                    onSave={addCategory}
                    onClose={() => setShowNewCategoryModal(false)}
                />
            )}
        </div>
    );
};

export default WeaningTab;
