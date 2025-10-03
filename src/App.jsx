import React, { useState, useRef, useEffect } from 'react';
import FruitLogForm from './FruitLogForm';
import FruitLogList from './FruitLogList';
import { db } from './firebase';
import ZipCodeDialog from './ZipCodeDialog';
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore';


// Helper function to convert file to base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

const BoldRenderer = ({ text }) => {
    const html = text ? text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') : '';
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const DoctorCharacter = () => (
    <div className="mx-auto bg-slate-200 rounded-full w-32 h-32 flex items-center justify-center shadow-inner mb-4">
        <svg viewBox="0 0 100 120" className="w-28 h-28">
            <path d="M50 30 C 10 30, 10 90, 50 90 C 90 90, 90 30, 50 30" fill="#f87171" />
            <path d="M50 60 L 20 110 L 80 110 L 50 60" fill="white" stroke="#94a3b8" strokeWidth="2"/>
            <path d="M50 60 L 35 60 L 20 110 L 35 110 Z" fill="#e2e8f0"/>
            <path d="M50 60 L 65 60 L 80 110 L 65 110 Z" fill="white"/>
            <circle cx="38" cy="55" r="5" fill="white" /><circle cx="62" cy="55" r="5" fill="white" />
            <circle cx="39" cy="56" r="2" fill="black" /><circle cx="61" cy="56" r="2" fill="black" />
            <path d="M40 70 Q 50 80, 60 70" stroke="black" strokeWidth="1.5" fill="none" />
            <path d="M50 30 Q 60 15, 70 20" fill="#4ade80"/><line x1="50" y1="30" x2="60" y2="23" stroke="#22c55e" strokeWidth="1"/>
        </svg>
    </div>
);

const LoadingState = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="relative w-24 h-24">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-10 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="magnifying-glass absolute top-0 w-12 h-12 border-4 border-slate-500 rounded-full bg-slate-200/50"></div>
            <div className="magnifying-glass-handle absolute top-10 right-0 w-8 h-2 bg-slate-500 rotate-45"></div>
        </div>
        <p className="mt-4 text-slate-500 text-lg font-medium">Dr. Peel is analyzing your fruit...</p>
    </div>
);

const VitalityMeter = ({ score = 0 }) => {
    const scorePercentage = Math.max(0, Math.min(100, score));
    const animationDuration = (2.0 - (scorePercentage / 100) * 1.6).toFixed(2);
    const isEnergetic = scorePercentage >= 50;
    return (
        <div className="flex flex-col items-center">
            <h4 className="text-md font-semibold text-slate-600 mb-2">Vitality Boost</h4>
            <svg viewBox="0 0 100 100" className="w-32 h-32">
                <line x1="0" y1="95" x2="100" y2="95" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4" className="ground-line" style={{ animationDuration: `${animationDuration * 4}s` }} />
                <g className="runner" style={{ animationDuration: `${animationDuration * 2}s` }}>
                    <line x1="50" y1="55" x2="65" y2="70" className="runner-limb runner-arm-back" style={{ animationDuration: `${animationDuration}s` }} />
                    <line x1="50" y1="75" x2="65" y2="90" className="runner-limb runner-leg-back" style={{ animationDuration: `${animationDuration}s` }} />
                    <line x1="50" y1="40" x2="50" y2="75" className="runner-body" />
                    <g>
                        <circle cx="50" cy="30" r="10" className="runner-head" />
                        <circle cx="47" cy="29" r="1" fill="black" /><circle cx="53" cy="29" r="1" fill="black" />
                        {isEnergetic ? ( <path d="M 47 33 Q 50 36 53 33" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" /> ) : ( <path d="M 47 34 Q 50 31 53 34" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" /> )}
                    </g>
                    <line x1="50" y1="55" x2="35" y2="70" className="runner-limb runner-arm-front" style={{ animationDuration: `${animationDuration}s` }}/>
                    <line x1="50" y1="75" x2="35" y2="90" className="runner-limb runner-leg-front" style={{ animationDuration: `${animationDuration}s` }}/>
                </g>
            </svg>
            <p className="text-xl font-bold text-slate-800">{scorePercentage}%</p>
        </div>
    );
};

const CameraView = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        let stream = null;
        const startCamera = async () => {
            try {
                if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                    if (videoRef.current) { videoRef.current.srcObject = stream; }
                } else { setError("Your browser does not support camera access."); }
            } catch (err) { setError("Could not access camera. Please check permissions."); }
        };
        startCamera();
        return () => { if (stream) { stream.getTracks().forEach(track => track.stop()); } };
    }, []);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob((blob) => {
                if (blob) { onCapture(new File([blob], "capture.png", { type: "image/png" })); }
            }, 'image/png');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
            <div className="bg-white p-4 rounded-2xl shadow-xl relative w-full max-w-lg">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-black z-10">
                     <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="w-full bg-slate-900 rounded-lg overflow-hidden">
                   {error ? <div className="text-rose-400 h-64 flex items-center justify-center p-4 text-center">{error}</div> : <video ref={videoRef} autoPlay playsInline className="w-full h-auto"></video>}
                </div>
                <div className="flex justify-center items-center mt-4">
                    <button onClick={handleCapture} disabled={!!error} className="p-4 bg-teal-500 text-white font-bold rounded-full hover:bg-teal-600 disabled:bg-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

const CalendarView = ({ fruitLogs, onDateSelect, selectedDate }) => {
    // Simplified calendar for demo
    const today = new Date('2025-09-13T12:00:00'); // Fixed date for consistent demo
    const [date, setDate] = useState(today);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);

    return (
        <div className="p-4 bg-slate-50 rounded-lg">
             <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">{monthNames[date.getMonth()]} {date.getFullYear()}</h2>
             <div className="grid grid-cols-7 gap-1 text-center">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => <div key={`${d}-${index}`} className="font-bold text-slate-500">{d}</div>)}
                 {days.map(day => {
                     const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${day}`;
                     const hasLog = fruitLogs[dateKey];
                     return (
                         <div key={day} onClick={() => onDateSelect(dateKey)} className={`p-2 rounded-full cursor-pointer ${hasLog ? 'bg-emerald-300' : ''} ${selectedDate === dateKey ? 'ring-2 ring-teal-500' : ''}`}>
                             {day}
                         </div>
                     );
                 })}
             </div>
             {selectedDate && fruitLogs[selectedDate] && (
                 <div className="mt-4">
                     <h3 className="font-bold">Fruits logged on {selectedDate}:</h3>
                     <ul className="list-disc pl-5">
                         {fruitLogs[selectedDate].fruits.map((f, i) => <li key={i}>{f.name} ({f.score}% vitality)</li>)}
                     </ul>
                 </div>
             )}
        </div>
    )
};

const SuggestionCard = ({ suggestion, onRemind }) => (
    <div className="bg-white rounded-2xl shadow-lg w-full p-6 my-6 text-center">
        <h3 className="text-xl font-bold text-teal-600">Suggestion for Today</h3>
        <p className="text-slate-600 mt-2">{suggestion.text}</p>
        <button onClick={onRemind} className="mt-4 bg-teal-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-600">Remind Me</button>
    </div>
);


    // App State
    const [view, setView] = useState('home'); // home, analysis, calendar
    const [image, setImage] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [suggestion, setSuggestion] = useState({ text: "Loading today's suggestion..." });
    const [fruitLogs, setFruitLogs] = useState({});
    const [selectedDate, setSelectedDate] = useState(null);
    const [zipCode, setZipCode] = useState(() => localStorage.getItem('zipCode') || '');
    const [showZipDialog, setShowZipDialog] = useState(!localStorage.getItem('zipCode'));
    // For demo, skip auth. In production, add Firebase Auth and set user state.
    const [currentUser] = useState({ uid: 'demoUser123' });
    const fileInputRef = useRef(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;


    // Listen to fruit logs in Firestore for the current user
    useEffect(() => {
        const q = query(collection(db, 'fruitLogs'), orderBy('date', 'desc'));
        const unsub = onSnapshot(q, (snapshot) => {
            // Group logs by date for calendar view
            const grouped = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!data.date) return;
                if (!grouped[data.date]) grouped[data.date] = { fruits: [] };
                grouped[data.date].fruits.push({
                    name: data.fruitName || data.name,
                    score: data.nutritionScore || data.score,
                });
            });
            setFruitLogs(grouped);
        });
        return () => unsub();
    }, []);

    // Log fruit to Firestore
    const logFruit = async (fruit) => {
        if (!currentUser) return;
        const today = new Date();
        const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const log = {
            date: dateKey,
            fruitName: fruit.fruitName,
            nutritionScore: fruit.nutritionScore,
            nutrition: fruit.nutrition,
            ripeness: fruit.ripeness,
            shelfPeriod: fruit.shelfPeriod,
            waitTime: fruit.waitTime,
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
        };
        try {
            await addDoc(collection(db, 'fruitLogs'), log);
            alert(`${fruit.fruitName} has been logged to your calendar!`);
        } catch (err) {
            alert('Error logging fruit: ' + err.message);
        }
    };


    // --- AI Logic ---
    const getSuggestion = () => {
        // This is a mock for the demo. In a real app, this would use weather and zipCode.
        setTimeout(() => {
            setSuggestion({ text: zipCode ? `Fruit suggestion for ${zipCode}: Try a ripe banana today!` : "Try a ripe banana today! It's great for potassium and provides a natural energy boost." });
        }, 1000);
    };

    useEffect(() => { getSuggestion(); }, [zipCode]);
    
    const analyzeFruit = async (file) => {
        if (!file) return;

        // Immediately update UI to show image and loading state
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result);
            setView('analysis');
            setIsLoading(true);
            setAnalysisResult(null);
            setError(null);
        };
        reader.readAsDataURL(file);

        try {
            const base64ImageData = await toBase64(file);
            const prompt = `Analyze the fruit in this image. 
0.  **Fruit Name**: Identify the fruit in the image.
1.  **Main Analysis**: Provide a one-paragraph analysis. Determine its ripeness (Unripe, Perfectly Ripe, Overripe). If unripe, estimate when it will be best to eat.
2.  **Metadata**: After the main analysis, provide these exact sub-headings and their values:
    - **Wait Time**: Estimated time until ripe. State "Ready to eat" if ripe.
    - **Shelf Period**: Estimated time it will last in its current state.
    - **Ripeness Percentage**: A numerical percentage of ripeness (e.g., 85%).
3.  **Details**: After the metadata, provide the following details using these exact sub-headings:
    - **Nutrition**: Key nutritional benefits.
    - **Daily Intake**: A general recommendation for daily consumption.
    - **Seasonal Info**: When is this fruit typically in season?
    - **Recipe Idea**: A simple recipe idea, like a smoothie or salad, with brief instructions.
    - **Good to Know**: If the fruit is overripe or spoiling, what are the potential health risks? Describe its energy potential.
    - **Nutrition Score**: A number from 0-100.`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }, { inlineData: { mimeType: file.type, data: base64ImageData } }] }] };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) { throw new Error(`API request failed: ${response.status}`); }
            const result = await response.json();
            const candidate = result.candidates?.[0];
            if (candidate?.content?.parts?.[0]?.text) {
                setAnalysisResult(parseAnalysisText(candidate.content.parts[0].text));
            } else { throw new Error('Invalid AI response.'); }
        } catch (err) { setError(`Analysis failed: ${err.message}`); } finally { setIsLoading(false); }
    };

    const parseAnalysisText = (text) => {
        const sections = {
            analysis: "No analysis provided.", nutrition: "No nutrition details provided.",
            dailyIntake: "No intake recommendation provided.", seasonalInfo: "No seasonal information provided.",
            recipeIdea: "No recipe idea provided.", goodToKnow: "No information provided.",
            ripeness: "Unknown", fruitName: "Fruit", nutritionScore: 0,
            waitTime: "N/A", shelfPeriod: "N/A", ripenessPercentage: "N/A"
        };
    
        const cleanText = (str) => str ? str.trim().replace(/\s*\d+\.?\s*$/, '') : "";
    
        const createRegex = (section, nextSection) => new RegExp(`-?\\s*\\*\\*\\s*${section}\\s*\\*\\*:\\s*([\\s\\S]*?)(?=-?\\s*\\*\\*\\s*${nextSection}|$)`, 'i');
    
        const fruitNameMatch = text.match(/\*\*Fruit Name\*\*:\s*([\w\s]+)/i);
        if (fruitNameMatch) sections.fruitName = cleanText(fruitNameMatch[1]);
    
        const analysisMatch = text.match(createRegex('Main Analysis', 'Metadata'));
        if (analysisMatch) {
            sections.analysis = cleanText(analysisMatch[1]);
            // FIX: Run ripeness match only on the main analysis text
            const ripenessInAnalysis = sections.analysis.match(/(perfectly ripe|unripe|overripe)/i);
            if (ripenessInAnalysis) {
                sections.ripeness = ripenessInAnalysis[0].charAt(0).toUpperCase() + ripenessInAnalysis[0].slice(1).toLowerCase();
            }
        }
    
        const fields = {
            waitTime: 'Shelf Period', shelfPeriod: 'Ripeness Percentage', ripenessPercentage: 'Details|Nutrition',
            nutrition: 'Daily Intake', dailyIntake: 'Seasonal Info', seasonalInfo: 'Recipe Idea',
            recipeIdea: 'Good to Know', goodToKnow: 'Nutrition Score'
        };
    
        Object.entries(fields).forEach(([key, next]) => {
            const fieldName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const match = text.match(createRegex(fieldName, next));
            if (match) sections[key] = cleanText(match[1]);
        });
    
        const scoreMatch = text.match(/-?\s*\*\*\s*Nutrition Score\s*\*\*:\s*(\d+)/i);
        if (scoreMatch) sections.nutritionScore = parseInt(scoreMatch[1], 10);
        
        return sections;
    };
    
    // --- UI Handlers & Renderers ---
    const getRipenessColor = (ripeness) => {
        if (!ripeness) return 'bg-slate-100 text-slate-800 border-slate-300';
        switch (ripeness.toLowerCase()) {
            case 'perfectly ripe': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
            case 'unripe': return 'bg-amber-100 text-amber-800 border-amber-300';
            case 'overripe': return 'bg-rose-100 text-rose-800 border-rose-300';
            default: return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };
    
    const handleImageChange = (file) => { if (file) analyzeFruit(file); };
    const requestNotification = async () => {
        if (!('Notification' in window)) { alert("This browser does not support desktop notification"); return; }
        if (Notification.permission === 'granted') {
             new Notification("Fruit Fresh Reminder!", { body: `Time for a healthy snack! How about that ${suggestion.text.split('!')[0]}?` });
        } else if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') { new Notification("Great! Reminders are set."); }
        }
    };

    // --- Main Render Logic ---
    return (
        <div className="bg-slate-100 min-h-screen font-sans text-slate-900 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8">
            {showZipDialog && (
                <ZipCodeDialog
                    onSubmit={zip => {
                        setZipCode(zip);
                        localStorage.setItem('zipCode', zip);
                        setShowZipDialog(false);
                    }}
                    initialZip={zipCode}
                />
            )}
            {isCameraOpen && <CameraView onCapture={file => { handleImageChange(file); setIsCameraOpen(false); }} onClose={() => setIsCameraOpen(false)} />}
            <main className="w-full max-w-2xl mx-auto">
                <header className="text-center my-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-600 tracking-tight cursor-pointer" onClick={() => { setView('home'); setAnalysisResult(null); setImage(null); }}>Fruit Beast</h1>
                    <p className="text-slate-500 mt-2 text-lg">Your AI guide to perfect ripeness</p>
                </header>
                <div className="w-full flex justify-center border-b border-slate-300 mb-6">
                    <button onClick={() => setView('home')} className={`px-4 py-2 ${view === 'home' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>Home</button>
                    <button onClick={() => setView('calendar')} className={`px-4 py-2 ${view === 'calendar' ? 'border-b-2 border-teal-500 text-teal-600' : 'text-slate-500'}`}>Logbook</button>
                    <button onClick={() => setView('firebase-logbook')} className={`px-4 py-2 ${view === 'firebase-logbook' ? 'border-b-2 border-green-500 text-green-600' : 'text-slate-500'}`}>Logbook (Firebase)</button>
                </div>
                {view === 'home' && (
                    <>
                        <SuggestionCard suggestion={suggestion} onRemind={requestNotification} />
                        <div className="bg-white rounded-2xl shadow-xl w-full p-6 sm:p-8">
                            <div className="text-center">
                                <DoctorCharacter />
                                <h2 className="text-2xl font-bold text-slate-700">Ready to Analyze?</h2>
                                <p className="text-slate-500 mt-1">Upload a photo to get started.</p>
                            </div>
                             <div onDrop={(e) => {e.preventDefault(); handleImageChange(e.dataTransfer.files[0])}} onDragOver={(e) => e.preventDefault()} className="mt-6 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                                <p className="text-slate-500 mb-2">Drag & Drop an image here</p>
                                <input type="file" accept="image/*" onChange={(e) => handleImageChange(e.target.files[0])} className="hidden" ref={fileInputRef} />
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
                                   <button onClick={() => fileInputRef.current.click()} className="w-full sm:w-auto bg-teal-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-600">Choose a File</button>
                                   <p className="text-slate-400 text-sm">or</p>
                                   <button onClick={() => setIsCameraOpen(true)} className="w-full sm:w-auto bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-slate-700">Use Camera</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {view === 'firebase-logbook' && (
                    <div className="w-full max-w-xl mx-auto">
                        <div className="mb-4 p-4 bg-blue-50 rounded text-blue-900 text-sm">
                            <strong>How to log a fruit:</strong> Scan a fruit using the Home tab, then click <span className="font-semibold">Log this Fruit</span> on the analysis screen. All details will be auto-filled and saved to Firebase.
                        </div>
                        <FruitLogList />
                    </div>
                )}
                {view === 'calendar' && (
                    <CalendarView fruitLogs={fruitLogs} selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                )}
                {view === 'analysis' && (
                    <div className="bg-white rounded-2xl shadow-xl w-full p-6 sm:p-8">
                        <div className="w-full h-64 mb-6 rounded-lg overflow-hidden shadow-inner"><img src={image} alt="Selected fruit" className="w-full h-full object-cover" /></div>
                        {isLoading && <LoadingState />}
                        {error && <div className="text-rose-700">{error}</div>}
                        {analysisResult && !isLoading && (
                            <div className="animate-fade-in">
                               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                    <h2 className="text-4xl font-bold text-slate-800">{analysisResult.fruitName || 'Fruit'}</h2>
                                    <span className={`px-4 py-1.5 text-md font-semibold rounded-full border-2 ${getRipenessColor(analysisResult.ripeness)}`}>{analysisResult.ripeness}</span>
                               </div>
                                <AnalysisTabs analysisResult={analysisResult} apiKey={apiKey} onLogFruit={() => logFruit(analysisResult)} />
                                <button onClick={() => { setView('home'); setAnalysisResult(null); setImage(null); }} className="mt-6 w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700">Analyze Another</button>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );


const AnalysisTabs = ({ analysisResult, onLogFruit, apiKey }) => {
    const [activeTab, setActiveTab] = useState('analysis');
    const [recipeImageUrl, setRecipeImageUrl] = useState(null);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageError, setImageError] = useState(null);
    const tabs = ['analysis', 'nutrition', 'more', 'goodToKnow'];
    
    const generateRecipeImage = async () => {
        if (!analysisResult.recipeIdea || recipeImageUrl) return;

        setIsImageLoading(true);
        setImageError(null);

        try {
            const prompt = `A vibrant, high-quality, appealing photograph of: ${analysisResult.recipeIdea}. Food photography style, bright lighting, clean background.`;
            const payload = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ['IMAGE'] },
            };
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) { throw new Error(`Image generation failed: ${response.status}`); }

            const result = await response.json();
            const base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
            
            if (!base64Data) { throw new Error("No image data returned from API."); }
            
            setRecipeImageUrl(`data:image/png;base64,${base64Data}`);

        } catch (err) {
            console.error(err);
            setImageError("Sorry, couldn't create an image for this recipe.");
        } finally {
            setIsImageLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'more') {
            generateRecipeImage();
        }
    }, [activeTab]);

    return (
        <>
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-700'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize`}>{tab === 'goodToKnow' ? 'Good to Know' : tab}</button>
                    ))}
                </nav>
            </div>
            <div className="mt-4 p-5 bg-slate-50 rounded-lg min-h-[150px]">
                {activeTab === 'analysis' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Ripeness Analysis</h3>
                        <p className="text-slate-600 mb-6"><BoldRenderer text={analysisResult.analysis} /></p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                            <div className="bg-slate-100 p-3 rounded-lg"><h4 className="text-sm font-semibold text-slate-500">Wait Time</h4><p className="text-lg font-bold text-teal-600">{analysisResult.waitTime}</p></div>
                            <div className="bg-slate-100 p-3 rounded-lg"><h4 className="text-sm font-semibold text-slate-500">Shelf Period</h4><p className="text-lg font-bold text-teal-600">{analysisResult.shelfPeriod}</p></div>
                            <div className="bg-slate-100 p-3 rounded-lg"><h4 className="text-sm font-semibold text-slate-500">Ripeness</h4><p className="text-lg font-bold text-teal-600">{analysisResult.ripenessPercentage}</p></div>
                        </div>
                    </div>
                )}
                {activeTab === 'nutrition' && (
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-grow">
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Nutritional Details</h3><p className="text-slate-600"><BoldRenderer text={analysisResult.nutrition} /></p>
                            <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Daily Intake</h3><p className="text-slate-600"><BoldRenderer text={analysisResult.dailyIntake} /></p>
                        </div>
                        <div className="flex-shrink-0 w-full sm:w-32"><VitalityMeter score={analysisResult.nutritionScore} /></div>
                    </div>
                )}
                {activeTab === 'more' && (
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Seasonal Info</h3><p className="text-slate-600"><BoldRenderer text={analysisResult.seasonalInfo} /></p>
                        
                        <h3 className="text-lg font-bold text-slate-800 mt-4 mb-2">Recipe Idea</h3>
                        {isImageLoading && <div className="text-center p-4">Generating recipe image...</div>}
                        {imageError && <div className="text-center p-4 text-rose-500">{imageError}</div>}
                        {recipeImageUrl && <img src={recipeImageUrl} alt="Generated recipe image" className="w-full h-auto rounded-lg mb-4" />}
                        <p className="text-slate-600 whitespace-pre-line"><BoldRenderer text={analysisResult.recipeIdea} /></p>
                    </div>
                )}
                {activeTab === 'goodToKnow' && (
                     <div><h3 className="text-lg font-bold text-slate-800 mb-2">Good to Know</h3><p className="text-slate-600"><BoldRenderer text={analysisResult.goodToKnow} /></p></div>
                )}
            </div>
             <button onClick={onLogFruit} className="mt-6 w-full bg-emerald-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-600">Log this Fruit</button>
        </>
    );
};

// CSS for animations
const styles = `@keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes bounce { 0%, 100% { transform: translateY(-15%) translateX(-50%); } 50% { transform: translateY(0) translateX(-50%); } } .animate-bounce { animation: bounce 1s infinite; } @keyframes inspect { 0% { transform: translateX(-15px) rotate(-15deg); } 50% { transform: translateX(15px) rotate(15deg); } 100% { transform: translateX(-15px) rotate(-15deg); } } .magnifying-glass { animation: inspect 2s ease-in-out infinite; transform-origin: bottom right; } .magnifying-glass-handle { animation: inspect 2s ease-in-out infinite; transform-origin: top left; } .runner { animation-name: bob; animation-timing-function: ease-in-out; animation-iteration-count: infinite; } .runner-limb { stroke: black; stroke-width: 4; stroke-linecap: round; animation-timing-function: ease-in-out; animation-iteration-count: infinite; } .runner-body { stroke: black; stroke-width: 4; stroke-linecap: round; } .runner-head { fill: #f1f5f9; stroke: black; stroke-width: 2; } .runner-leg-front { animation-name: run-leg-front; transform-origin: 50px 75px; } .runner-leg-back { animation-name: run-leg-back; transform-origin: 50px 75px; } .runner-arm-front { animation-name: run-arm-front; transform-origin: 50px 55px; } .runner-arm-back { animation-name: run-arm-back; transform-origin: 50px 55px; } .ground-line { animation-name: move-ground; animation-timing-function: linear; animation-iteration-count: infinite; } @keyframes bob { 0% { transform: translateY(0px); } 50% { transform: translateY(-5px); } 100% { transform: translateY(0px); } } @keyframes run-leg-front { 0% { transform: rotate(-35deg); } 50% { transform: rotate(35deg); } 100% { transform: rotate(-35deg); } } @keyframes run-leg-back { 0% { transform: rotate(35deg); } 50% { transform: rotate(-35deg); } 100% { transform: rotate(35deg); } } @keyframes run-arm-front { 0% { transform: rotate(30deg); } 50% { transform: rotate(-30deg); } 100% { transform: rotate(30deg); } } @keyframes run-arm-back { 0% { transform: rotate(-30deg); } 50% { transform: rotate(30deg); } 100% { transform: rotate(-30deg); } } @keyframes move-ground { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 40; } }`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
