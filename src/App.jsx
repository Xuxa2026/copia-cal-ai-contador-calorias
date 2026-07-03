import { useState, useEffect, useRef } from "react";

// TODO: Integrar API real de análisis de imágenes con IA (Google Vision, OpenAI Vision, etc.)
// TODO: Conectar backend para persistencia de datos del usuario
// TODO: Implementar autenticación real de usuarios
// TODO: Integrar API de base de datos nutricional (Nutritionix, USDA, etc.)

const COLORS = {
  primary: "#4CAF82",       // Verde principal CalDiet
  primaryDark: "#3a9e6e",
  primaryLight: "#e8f5ee",
  secondary: "#FF7043",     // Naranja para calorías
  accent: "#5C6BC0",        // Azul/morado para progreso
  bg: "#F5F7FA",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textLight: "#6B7280",
  textMuted: "#9CA3AF",
  border: "#E5E7EB",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  navBg: "#FFFFFF",
};

// --- DATOS SIMULADOS ---
const MOCK_FOODS = [
  { id: 1, name: "Pollo a la plancha", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, portion: "100g", emoji: "🍗" },
  { id: 2, name: "Ensalada César", calories: 220, protein: 8, carbs: 12, fat: 16, fiber: 3, portion: "1 plato", emoji: "🥗" },
  { id: 3, name: "Arroz integral", calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, portion: "1 taza cocida", emoji: "🍚" },
  { id: 4, name: "Manzana", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, portion: "1 unidad med.", emoji: "🍎" },
  { id: 5, name: "Huevos revueltos", calories: 148, protein: 10, carbs: 1.6, fat: 11, fiber: 0, portion: "2 huevos", emoji: "🍳" },
  { id: 6, name: "Avena con leche", calories: 307, protein: 12, carbs: 55, fat: 5, fiber: 8, portion: "1 tazón", emoji: "🥣" },
  { id: 7, name: "Salmón al horno", calories: 208, protein: 28, carbs: 0, fat: 10, fiber: 0, portion: "100g", emoji: "🐟" },
  { id: 8, name: "Yogur griego", calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0, portion: "150g", emoji: "🥛" },
  { id: 9, name: "Aguacate", calories: 234, protein: 3, carbs: 12, fat: 21, fiber: 10, portion: "1 unidad", emoji: "🥑" },
  { id: 10, name: "Pizza Margherita", calories: 570, protein: 22, carbs: 68, fat: 22, fiber: 4, portion: "2 porciones", emoji: "🍕" },
];

const SCAN_RESULTS = [
  { name: "Ensalada de pollo", calories: 320, protein: 35, carbs: 18, fat: 12, fiber: 5, confidence: 92, emoji: "🥗" },
  { name: "Pasta boloñesa", calories: 485, protein: 28, carbs: 55, fat: 16, fiber: 4, confidence: 88, emoji: "🍝" },
  { name: "Tazón de açaí", calories: 290, protein: 6, carbs: 52, fat: 8, fiber: 9, confidence: 95, emoji: "🫐" },
  { name: "Hamburguesa", calories: 650, protein: 35, carbs: 48, fat: 32, fiber: 3, confidence: 89, emoji: "🍔" },
  { name: "Sushi variado", calories: 380, protein: 22, carbs: 58, fat: 8, fiber: 2, confidence: 91, emoji: "🍱" },
  { name: "Tacos de carne", calories: 420, protein: 25, carbs: 40, fat: 18, fiber: 5, confidence: 87, emoji: "🌮" },
];

const MEAL_TYPES = ["Desayuno", "Almuerzo", "Cena", "Snack"];

const WEEK_DATA = [
  { day: "L", calories: 1820, goal: 2000 },
  { day: "M", calories: 1650, goal: 2000 },
  { day: "X", calories: 2100, goal: 2000 },
  { day: "J", calories: 1900, goal: 2000 },
  { day: "V", calories: 1750, goal: 2000 },
  { day: "S", calories: 2250, goal: 2000 },
  { day: "D", calories: 1580, goal: 2000 },
];

const EXERCISES = [
  { name: "Caminar", duration: 30, calories: 150, icon: "🚶" },
  { name: "Correr", duration: 25, calories: 280, icon: "🏃" },
  { name: "Ciclismo", duration: 45, calories: 320, icon: "🚴" },
  { name: "Natación", duration: 40, calories: 350, icon: "🏊" },
  { name: "Yoga", duration: 60, calories: 180, icon: "🧘" },
  { name: "Pesas", duration: 45, calories: 250, icon: "🏋️" },
];

const FASTING_SCHEDULES = [
  { name: "16:8", description: "16h ayuno / 8h alimentación", popular: true },
  { name: "18:6", description: "18h ayuno / 6h alimentación", popular: false },
  { name: "20:4", description: "20h ayuno / 4h alimentación", popular: false },
  { name: "5:2", description: "5 días normal / 2 días restricción", popular: false },
];

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [meals, setMeals] = useState([
    { id: 1, food: MOCK_FOODS[4], mealType: "Desayuno", time: "08:30" },
    { id: 2, food: MOCK_FOODS[2], mealType: "Almuerzo", time: "13:00" },
    { id: 3, food: MOCK_FOODS[3], mealType: "Snack", time: "16:15" },
  ]);
  const [showScanner, setShowScanner] = useState(false);
  const [scanState, setScanState] = useState("idle"); // idle | scanning | result
  const [scanResult, setScanResult] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("Almuerzo");
  const [userGoal] = useState(2000); // TODO: Hacer configurable por el usuario
  const [waterIntake, setWaterIntake] = useState(4); // vasos de agua
  const [fastingActive, setFastingActive] = useState(false);
  const [fastingSchedule, setFastingSchedule] = useState(FASTING_SCHEDULES[0]);
  const [fastingStart, setFastingStart] = useState(null);
  const [fastingElapsed, setFastingElapsed] = useState(0);
  const [exercises, setExercises] = useState([EXERCISES[0]]);
  const [weight] = useState(72.5); // TODO: Historial de peso real
  const [showAddFood, setShowAddFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [onboarded, setOnboarded] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    goal: "perder",
    activity: "moderado",
    age: "",
    height: "",
    weight: "",
  });

  // Calcular totales del día
  const totalCalories = meals.reduce((sum, m) => sum + m.food.calories, 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.food.protein, 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.food.carbs, 0);
  const totalFat = meals.reduce((sum, m) => sum + m.food.fat, 0);
  const exerciseCalories = exercises.reduce((sum, e) => sum + e.calories, 0);
  const netCalories = totalCalories - exerciseCalories;

  // Temporizador de ayuno
  useEffect(() => {
    let interval;
    if (fastingActive && fastingStart) {
      interval = setInterval(() => {
        setFastingElapsed(Math.floor((Date.now() - fastingStart) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [fastingActive, fastingStart]);

  const formatFastingTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startFasting = () => {
    setFastingActive(true);
    setFastingStart(Date.now());
    setFastingElapsed(0);
  };

  const stopFasting = () => {
    setFastingActive(false);
    setFastingStart(null);
    setFastingElapsed(0);
  };

  // Simular escaneo con IA
  const simulateScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      const result = SCAN_RESULTS[Math.floor(Math.random() * SCAN_RESULTS.length)];
      setScanResult(result);
      setScanState("result");
    }, 2500);
  };

  const addScannedFood = () => {
    if (!scanResult) return;
    const newMeal = {
      id: Date.now(),
      food: { ...scanResult, portion: "1 porción" },
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    setMeals((prev) => [...prev, newMeal]);
    setShowScanner(false);
    setScanState("idle");
    setScanResult(null);
    setActiveTab("diary");
  };

  const removeFood = (id) => {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const addExercise = (exercise) => {
    setExercises((prev) => [...prev, exercise]);
  };

  const filteredFoods = MOCK_FOODS.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addFoodManual = (food) => {
    const newMeal = {
      id: Date.now(),
      food,
      mealType: selectedMealType,
      time: new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
    };
    setMeals((prev) => [...prev, newMeal]);
    setShowAddFood(false);
    setSearchQuery("");
  };

  // --- ONBOARDING ---
  if (!onboarded) {
    return <OnboardingScreen step={onboardStep} setStep={setOnboardStep} profile={profile} setProfile={setProfile} onComplete={() => setOnboarded(true)} />;
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: COLORS.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", position: "relative", overflowX: "hidden" }}>
      {/* SCANNER MODAL */}
      {showScanner && (
        <ScannerModal
          scanState={scanState}
          scanResult={scanResult}
          selectedMealType={selectedMealType}
          setSelectedMealType={setSelectedMealType}
          onScan={simulateScan}
          onAdd={addScannedFood}
          onClose={() => { setShowScanner(false); setScanState("idle"); setScanResult(null); }}
        />
      )}

      {/* ADD FOOD MODAL */}
      {showAddFood && (
        <AddFoodModal
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredFoods={filteredFoods}
          selectedMealType={selectedMealType}
          setSelectedMealType={setSelectedMealType}
          onAdd={addFoodManual}
          onClose={() => { setShowAddFood(false); setSearchQuery(""); }}
        />
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div style={{ paddingBottom: 80 }}>
        {activeTab === "home" && (
          <HomeScreen
            meals={meals}
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
            userGoal={userGoal}
            exerciseCalories={exerciseCalories}
            netCalories={netCalories}
            waterIntake={waterIntake}
            setWaterIntake={setWaterIntake}
            onScan={() => setShowScanner(true)}
            profile={profile}
          />
        )}
        {activeTab === "diary" && (
          <DiaryScreen
            meals={meals}
            totalCalories={totalCalories}
            totalProtein={totalProtein}
            totalCarbs={totalCarbs}
            totalFat={totalFat}
            userGoal={userGoal}
            onRemove={removeFood}
            onScan={() => setShowScanner(true)}
            onAddManual={() => setShowAddFood(true)}
          />
        )}
        {activeTab === "scan" && (
          <ScanQuickScreen onScan={() => setShowScanner(true)} />
        )}
        {activeTab === "progress" && (
          <ProgressScreen
            weekData={WEEK_DATA}
            totalCalories={totalCalories}
            userGoal={userGoal}
            weight={weight}
            exercises={exercises}
            onAddExercise={addExercise}
            fastingActive={fastingActive}
            fastingElapsed={fastingElapsed}
            fastingSchedule={fastingSchedule}
            setFastingSchedule={setFastingSchedule}
            onStartFasting={startFasting}
            onStopFasting={stopFasting}
            formatFastingTime={formatFastingTime}
          />
        )}
        {activeTab === "profile" && (
          <ProfileScreen profile={profile} setProfile={setProfile} userGoal={userGoal} />
        )}
      </div>

      {/* NAVEGACIÓN INFERIOR */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onScanPress={() => setShowScanner(true)} />
    </div>
  );
}

// =====================
// ONBOARDING
// =====================
function OnboardingScreen({ step, setStep, profile, setProfile, onComplete }) {
  const steps = [
    { title: "Bienvenido a CalDiet 🥗", subtitle: "Tu asistente de nutrición con IA", type: "welcome" },
    { title: "¿Cuál es tu objetivo?", type: "goal" },
    { title: "Tu información personal", type: "personal" },
    { title: "Nivel de actividad", type: "activity" },
    { title: "¡Todo listo! 🎉", type: "done" },
  ];

  const current = steps[step];

  const goals = [
    { key: "perder", label: "Perder peso", emoji: "⬇️" },
    { key: "mantener", label: "Mantener peso", emoji: "⚖️" },
    { key: "ganar", label: "Ganar músculo", emoji: "💪" },
  ];

  const activities = [
    { key: "sedentario", label: "Sedentario", desc: "Poco o nada de ejercicio" },
    { key: "ligero", label: "Ligero", desc: "1-3 días/semana" },
    { key: "moderado", label: "Moderado", desc: "3-5 días/semana" },
    { key: "activo", label: "Muy activo", desc: "6-7 días/semana" },
  ];

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "linear-gradient(160deg, #1a3c2e 0%, #2d6a4f 50%, #4CAF82 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'Inter', sans-serif" }}>
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, background: i <= step ? "#fff" : "rgba(255,255,255,0.3)", transition: "all 0.3s" }} />
        ))}
      </div>

      <div style={{ width: "100%", background: "rgba(255,255,255,0.95)", borderRadius: 24, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {current.type === "welcome" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🥗</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, margin: "0 0 8px" }}>CalDiet</h1>
            <p style={{ color: COLORS.textLight, fontSize: 16, marginBottom: 8 }}>Escáner de alimentos con IA</p>
            <p style={{ color: COLORS.textMuted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Toma fotos de tus comidas, consulta su información nutricional al instante y alcanza tus objetivos de salud.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {["📸 Escanea comidas con IA", "📊 Seguimiento nutricional", "⏳ Ayuno intermitente", "🏃 Control de ejercicio"].map((f) => (
                <div key={f} style={{ background: COLORS.primaryLight, borderRadius: 12, padding: "10px 16px", textAlign: "left", fontSize: 14, color: COLORS.primaryDark, fontWeight: 500 }}>
                  {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {current.type === "goal" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{current.title}</h2>
            <p style={{ color: COLORS.textLight, fontSize: 14, marginBottom: 20 }}>Personalizamos tu plan según tu objetivo</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {goals.map((g) => (
                <button key={g.key} onClick={() => setProfile({ ...profile, goal: g.key })}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, border: `2px solid ${profile.goal === g.key ? COLORS.primary : COLORS.border}`, background: profile.goal === g.key ? COLORS.primaryLight : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: profile.goal === g.key ? COLORS.primaryDark : COLORS.text }}>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {current.type === "personal" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{current.title}</h2>
            <p style={{ color: COLORS.textLight, fontSize: 14, marginBottom: 20 }}>Para calcular tus necesidades calóricas</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textLight, display: "block", marginBottom: 6 }}>Tu nombre</label>
                <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Ej: María García" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textLight, display: "block", marginBottom: 6 }}>Edad</label>
                  <input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder="25" style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textLight, display: "block", marginBottom: 6 }}>Altura (cm)</label>
                  <input type="number" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                    placeholder="165" style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center" }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: COLORS.textLight, display: "block", marginBottom: 6 }}>Peso (kg)</label>
                  <input type="number" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                    placeholder="65" style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", textAlign: "center" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {current.type === "activity" && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 6 }}>{current.title}</h2>
            <p style={{ color: COLORS.textLight, fontSize: 14, marginBottom: 20 }}>¿Cuánto ejercicio haces normalmente?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {activities.map((a) => (
                <button key={a.key} onClick={() => setProfile({ ...profile, activity: a.key })}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, border: `2px solid ${profile.activity === a.key ? COLORS.primary : COLORS.border}`, background: profile.activity === a.key ? COLORS.primaryLight : "#fff", cursor: "pointer", transition: "all 0.2s" }}>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: profile.activity === a.key ? COLORS.primaryDark : COLORS.text }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{a.desc}</div>
                  </div>
                  {profile.activity === a.key && <span style={{ fontSize: 20 }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {current.type === "done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, marginBottom: 8 }}>{current.title}</h2>
            <p style={{ color: COLORS.textLight, fontSize: 15, marginBottom: 6 }}>
              {profile.name ? `¡Hola ${profile.name}!` : "¡Tu plan está listo!"}
            </p>
            <p style={{ color: COLORS.textMuted, fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>
              Tu objetivo: <strong style={{ color: COLORS.primary }}>
                {profile.goal === "perder" ? "Perder peso" : profile.goal === "mantener" ? "Mantener peso" : "Ganar músculo"}
              </strong>
              <br />Plan personalizado de <strong>2,000 kcal/día</strong> calculado.
            </p>
            <div style={{ background: COLORS.primaryLight, borderRadius: 14, padding: 16, marginBottom: 20 }}>
              <p style={{ fontSize: 12, color: COLORS.textLight, margin: 0, lineHeight: 1.5 }}>
                ⚕️ <strong>Aviso médico:</strong> CalDiet no ofrece asesoramiento médico. Consulta con un profesional de salud antes de cambiar tu dieta.
              </p>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              style={{ flex: 1, padding: "14px", borderRadius: 14, border: `1.5px solid ${COLORS.border}`, background: "#fff", fontSize: 15, fontWeight: 600, color: COLORS.textLight, cursor: "pointer" }}>
              Atrás
            </button>
          )}
          <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}
            style={{ flex: 2, padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 15px rgba(76,175,130,0.4)" }}>
            {step === steps.length - 1 ? "¡Comenzar! 🚀" : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================
// HOME SCREEN
// =====================
function HomeScreen({ meals, totalCalories, totalProtein, totalCarbs, totalFat, userGoal, exerciseCalories, netCalories, waterIntake, setWaterIntake, onScan, profile }) {
  const remaining = userGoal - netCalories;
  const progress = Math.min((netCalories / userGoal) * 100, 100);
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });

  const macros = [
    { label: "Proteína", value: Math.round(totalProtein), goal: 120, color: "#5C6BC0", unit: "g" },
    { label: "Carbos", value: Math.round(totalCarbs), goal: 250, color: "#FF7043", unit: "g" },
    { label: "Grasas", value: Math.round(totalFat), goal: 65, color: "#F59E0B", unit: "g" },
  ];

  return (
    <div style={{ padding: "0 0 12px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(160deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`, padding: "52px 20px 24px", color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.8, textTransform: "capitalize" }}>{today}</p>
            <h2 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700 }}>
              Hola, {profile.name || "usuario"} 👋
            </h2>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            🏆
          </div>
        </div>

        {/* Anillo de calorías */}
        <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 20, padding: 20, backdropFilter: "blur(10px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <CalorieRing progress={progress} netCalories={netCalories} userGoal={userGoal} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{userGoal}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>🎯 Objetivo</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{exerciseCalories}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>🔥 Quemadas</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{totalCalories}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>🍽 Comidas</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: remaining < 0 ? "#FFB3B3" : "#B3FFDA" }}>
                    {remaining > 0 ? remaining : `+${Math.abs(remaining)}`}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{remaining >= 0 ? "⬇️ Restantes" : "⬆️ Exceso"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Macros */}
        <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginTop: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Macronutrientes de hoy</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {macros.map((m) => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{m.label}</span>
                  <span style={{ fontSize: 13, color: COLORS.textLight }}>{m.value}{m.unit} / {m.goal}{m.unit}</span>
                </div>
                <div style={{ height: 8, background: COLORS.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min((m.value / m.goal) * 100, 100)}%`, background: m.color, borderRadius: 4, transition: "width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón Escanear */}
        <button onClick={onScan}
          style={{ width: "100%", marginTop: 16, padding: "18px", borderRadius: 18, border: "none", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(76,175,130,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, letterSpacing: 0.3 }}>
          <span style={{ fontSize: 22 }}>📸</span>
          Escanear comida con IA
        </button>

        {/* Agua */}
        <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginTop: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>💧 Hidratación</h3>
            <span style={{ fontSize: 13, color: COLORS.textLight }}>{waterIntake} / 8 vasos</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <button key={i} onClick={() => setWaterIntake(i < waterIntake ? i : i + 1)}
                style={{ flex: 1, height: 32, borderRadius: 8, border: "none", background: i < waterIntake ? "#3B82F6" : COLORS.border, cursor: "pointer", transition: "all 0.2s", fontSize: 14 }}>
                {i < waterIntake ? "💧" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Últimas comidas */}
        <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginTop: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>🍽 Comidas de hoy</h3>
          {meals.length === 0 ? (
            <p style={{ color: COLORS.textMuted, textAlign: "center", padding: "20px 0", fontSize: 14 }}>
              Aún no has registrado comidas hoy
            </p>
          ) : (
            meals.slice(0, 3).map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 28 }}>{m.food.emoji || "🍽"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{m.food.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{m.mealType} • {m.time}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.secondary }}>{m.food.calories} kcal</div>
              </div>
            ))
          )}
        </div>

        {/* Tip del día */}
        <div style={{ background: "linear-gradient(135deg, #667eea22, #764ba222)", border: `1px solid #667eea33`, borderRadius: 18, padding: 16, marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#667eea", marginBottom: 6 }}>💡 CONSEJO DEL DÍA</div>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.text, lineHeight: 1.5 }}>
            Beber agua antes de las comidas puede ayudarte a reducir la ingesta calórica hasta un 13%. ¡Pruébalo hoy!
          </p>
          {/* TODO: Rotar tips dinámicos desde API o lista curada */}
        </div>
      </div>
    </div>
  );
}

// Componente anillo circular de calorías
function CalorieRing({ progress, netCalories, userGoal }) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#fff" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{netCalories}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>kcal netas</div>
      </div>
    </div>
  );
}

// =====================
// DIARY SCREEN
// =====================
function DiaryScreen({ meals, totalCalories, totalProtein, totalCarbs, totalFat, userGoal, onRemove, onScan, onAddManual }) {
  const mealGroups = MEAL_TYPES.map((type) => ({
    type,
    meals: meals.filter((m) => m.mealType === type),
    totalCal: meals.filter((m) => m.mealType === type).reduce((s, m) => s + m.food.calories, 0),
  }));

  const mealIcons = { Desayuno: "☀️", Almuerzo: "🌤", Cena: "🌙", Snack: "🍎" };

  return (
    <div style={{ padding: "52px 16px 12px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>📓 Diario</h2>
      <p style={{ color: COLORS.textLight, fontSize: 13, marginBottom: 16 }}>
        {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {/* Resumen */}
      <div style={{ background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, borderRadius: 18, padding: 16, marginBottom: 16, color: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, textAlign: "center" }}>
          {[
            { label: "Calorías", value: totalCalories, unit: "kcal" },
            { label: "Proteína", value: `${Math.round(totalProtein)}g`, unit: "" },
            { label: "Carbos", value: `${Math.round(totalCarbs)}g`, unit: "" },
            { label: "Grasas", value: `${Math.round(totalFat)}g`, unit: "" },
          ].map((item) => (
            <div key={item.label}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, height: 6, background: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min((totalCalories / userGoal) * 100, 100)}%`, background: "#fff", borderRadius: 3 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, opacity: 0.8 }}>{totalCalories} consumidas</span>
          <span style={{ fontSize: 11, opacity: 0.8 }}>Objetivo: {userGoal}</span>
        </div>
      </div>

      {/* Grupos de comidas */}
      {mealGroups.map((group) => (
        <div key={group.type} style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20 }}>{mealIcons[group.type]}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>{group.type}</span>
            </div>
            <span style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 600 }}>{group.totalCal} kcal</span>
          </div>

          {group.meals.length === 0 ? (
            <p style={{ color: COLORS.textMuted, fontSize: 13, margin: "0 0 10px", textAlign: "center", padding: "8px 0" }}>
              Sin registros
            </p>
          ) : (
            group.meals.map((meal) => (
              <div key={meal.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 24 }}>{meal.food.emoji || "🍽"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{meal.food.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{meal.food.portion} • {meal.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.secondary }}>{meal.food.calories}</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>kcal</div>
                </div>
                <button onClick={() => onRemove(meal.id)}
                  style={{ background: "#fee2e2", border: "none", borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: COLORS.danger, fontSize: 14 }}>
                  ✕
                </button>
              </div>
            ))
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={onScan}
              style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1.5px dashed ${COLORS.primary}`, background: COLORS.primaryLight, color: COLORS.primaryDark, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              📸 Escanear
            </button>
            <button onClick={onAddManual}
              style={{ flex: 1, padding: "10px", borderRadius: 12, border: `1.5px dashed ${COLORS.border}`, background: "#fff", color: COLORS.textLight, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              + Añadir
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================
// SCAN QUICK SCREEN
// =====================
function ScanQuickScreen({ onScan }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 340, aspectRatio: "1", borderRadius: 24, background: "#1a1a1a", border: "2px solid #333", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: "rgba(76,175,130,0.2)", border: `2px solid ${COLORS.primary}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
          📷
        </div>
        <p style={{ color: "#666", fontSize: 14, textAlign: "center", margin: 0 }}>
          Apunta la cámara a tu comida
        </p>
        {/* Esquinas de visor */}
        <div style={{ position: "absolute", top: "20%", left: "15%", width: 40, height: 40, borderTop: `3px solid ${COLORS.primary}`, borderLeft: `3px solid ${COLORS.primary}`, borderRadius: "4px 0 0 0" }} />
        <div style={{ position: "absolute", top: "20%", right: "15%", width: 40, height: 40, borderTop: `3px solid ${COLORS.primary}`, borderRight: `3px solid ${COLORS.primary}`, borderRadius: "0 4px 0 0" }} />
      </div>
      <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Escanear comida</h2>
      <p style={{ color: "#888", fontSize: 14, textAlign: "center", marginBottom: 28 }}>
        La IA identificará tus alimentos y calculará su información nutricional al instante
      </p>
      <button onClick={onScan}
        style={{ width: 80, height: 80, borderRadius: 40, border: `4px solid ${COLORS.primary}`, background: COLORS.primary, cursor: "pointer", fontSize: 32, boxShadow: `0 0 30px ${COLORS.primary}66` }}>
        📸
      </button>
      <p style={{ color: "#666", fontSize: 12, marginTop: 16 }}>Toca para escanear</p>
    </div>
  );
}

// =====================
// SCANNER MODAL
// =====================
function ScannerModal({ scanState, scanResult, selectedMealType, setSelectedMealType, onScan, onAdd, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#000", display: "flex", flexDirection: "column", maxWidth: 430, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 14, cursor: "pointer" }}>✕ Cerrar</button>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>Escanear comida</span>
        <div style={{ width: 70 }} />
      </div>

      {/* Cámara simulada */}
      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Fondo simulado de cámara */}
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          {scanState === "idle" && (
            <>
              <div style={{ width: 200, height: 200, border: `2px solid ${COLORS.primary}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
                <span style={{ fontSize: 48 }}>🥗</span>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0, textAlign: "center" }}>Apunta a tu comida</p>
              </div>
              {/* Esquinas del visor */}
              {[["0", "0", "borderTop", "borderLeft"], ["0", null, "borderTop", "borderRight"], [null, "0", "borderBottom", "borderLeft"], [null, null, "borderBottom", "borderRight"]].map(([top, left, b1, b2], i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: top !== null ? "25%" : "auto",
                  bottom: top === null ? "25%" : "auto",
                  left: left !== null ? "12%" : "auto",
                  right: left === null ? "12%" : "auto",
                  width: 28, height: 28,
                  [b1]: `3px solid ${COLORS.primary}`,
                  [b2]: `3px solid ${COLORS.primary}`,
                  borderRadius: i === 0 ? "4px 0 0 0" : i === 1 ? "0 4px 0 0" : i === 2 ? "0 0 0 4px" : "0 0 4px 0"
                }} />
              ))}
            </>
          )}

          {scanState === "scanning" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 40, border: `4px solid ${COLORS.primary}`, borderTopColor: "transparent", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 600 }}>Analizando con IA...</p>
              <p style={{ color: "#888", fontSize: 13 }}>Identificando alimentos</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {scanState === "result" && scanResult && (
            <div style={{ width: "100%", padding: "0 20px", boxSizing: "border-box" }}>
              {/* Resultado */}
              <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 20, padding: 20, backdropFilter: "blur(20px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <span style={{ fontSize: 40 }}>{scanResult.emoji}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{scanResult.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12, color: COLORS.success, fontWeight: 600 }}>IA: {scanResult.confidence}% confianza</span>
                    </div>
                  </div>
                </div>

                {/* Macros */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Calorías", value: scanResult.calories, unit: "kcal", color: COLORS.secondary },
                    { label: "Proteína", value: scanResult.protein, unit: "g", color: "#5C6BC0" },
                    { label: "Carbos", value: scanResult.carbs, unit: "g", color: "#FF7043" },
                    { label: "Grasas", value: scanResult.fat, unit: "g", color: "#F59E0B" },
                  ].map((m) => (
                    <div key={m.label} style={{ background: COLORS.bg, borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 9, color: COLORS.textMuted, fontWeight: 600 }}>{m.unit}</div>
                      <div style={{ fontSize: 9, color: COLORS.textLight }}>{m.label}</div>
                    </div>
                  ))}
                </div>

                {/* Tipo de comida */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textLight, display: "block", marginBottom: 8 }}>Añadir a:</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {MEAL_TYPES.map((t) => (
                      <button key={t} onClick={() => setSelectedMealType(t)}
                        style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `1.5px solid ${selectedMealType === t ? COLORS.primary : COLORS.border}`, background: selectedMealType === t ? COLORS.primaryLight : "#fff", fontSize: 10, fontWeight: 600, color: selectedMealType === t ? COLORS.primaryDark : COLORS.textLight, cursor: "pointer" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={onAdd}
                  style={{ width: "100%", padding: "14px", borderRadius: 14, border: "none", background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                  ✓ Añadir al diario
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón disparador */}
      {scanState === "idle" && (
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            {MEAL_TYPES.map((t) => (
              <button key={t} onClick={() => setSelectedMealType(t)}
                style={{ padding: "8px 12px", borderRadius: 20, border: `1.5px solid ${selectedMealType === t ? COLORS.primary : "#555"}`, background: selectedMealType === t ? COLORS.primary : "transparent", color: selectedMealType === t ? "#fff" : "#aaa", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={onScan}
            style={{ width: 72, height: 72, borderRadius: 36, border: `4px solid ${COLORS.primary}`, background: COLORS.primary, cursor: "pointer", fontSize: 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 30px ${COLORS.primary}66` }}>
            📸
          </button>
          <p style={{ color: "#888", fontSize: 12, margin: 0 }}>Toca para analizar</p>
        </div>
      )}
    </div>
  );
}

// =====================
// ADD FOOD MODAL
// =====================
function AddFoodModal({ searchQuery, setSearchQuery, filteredFoods, selectedMealType, setSelectedMealType, onAdd, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", justifyContent: "flex-end", maxWidth: 430, margin: "0 auto" }}>
      <div style={{ background: COLORS.card, borderRadius: "24px 24px 0 0", padding: "20px 20px 32px", maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: COLORS.text }}>Buscar alimento</h3>
          <button onClick={onClose} style={{ background: COLORS.bg, border: "none", borderRadius: 10, padding: "6px 12px", cursor: "pointer", fontSize: 14, color: COLORS.textLight }}>✕</button>
        </div>

        {/* Selector de tipo de comida */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {MEAL_TYPES.map((t) => (
            <button key={t} onClick={() => setSelectedMealType(t)}
              style={{ flex: 1, padding: "8px 4px", borderRadius: 10, border: `1.5px solid ${selectedMealType === t ? COLORS.primary : COLORS.border}`, background: selectedMealType === t ? COLORS.primaryLight : "#fff", fontSize: 10, fontWeight: 600, color: selectedMealType === t ? COLORS.primaryDark : COLORS.textLight, cursor: "pointer" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Buscador */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar alimento..." autoFocus
            style={{ width: "100%", padding: "12px 12px 12px 40px", borderRadius: 14, border: `1.5px solid ${COLORS.border}`, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: COLORS.bg }} />
        </div>

        {/* Lista de alimentos */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filteredFoods.map((food) => (
            <button key={food.id} onClick={() => onAdd(food)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`, background: "none", border: "none", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 28 }}>{food.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{food.name}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{food.portion} • P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.secondary }}>{food.calories} kcal</div>
            </button>
          ))}
          {filteredFoods.length === 0 && (
            <p style={{ textAlign: "center", color: COLORS.textMuted, padding: "24px 0", fontSize: 14 }}>
              No se encontraron alimentos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =====================
// PROGRESS SCREEN
// =====================
function ProgressScreen({ weekData, totalCalories, userGoal, weight, exercises, onAddExercise, fastingActive, fastingElapsed, fastingSchedule, setFastingSchedule, onStartFasting, onStopFasting, formatFastingTime }) {
  const [activeSection, setActiveSection] = useState("nutrition");
  const maxCal = Math.max(...weekData.map((d) => d.calories));

  const fastingGoalHours = parseInt(fastingSchedule.name.split(":")[0]);
  const fastingGoalSeconds = fastingGoalHours * 3600;
  const fastingProgress = Math.min((fastingElapsed / fastingGoalSeconds) * 100, 100);

  return (
    <div style={{ padding: "52px 16px 12px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, margin: "0 0 4px" }}>📈 Progreso</h2>
      <p style={{ color: COLORS.textLight, fontSize: 13, marginBottom: 16 }}>Tu evolución y estadísticas</p>

      {/* Pestañas */}
      <div style={{ display: "flex", background: COLORS.card, borderRadius: 14, padding: 4, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        {[
          { key: "nutrition", label: "Nutrición" },
          { key: "exercise", label: "Ejercicio" },
          { key: "fasting", label: "Ayuno" },
          { key: "weight", label: "Peso" },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveSection(tab.key)}
            style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: "none", background: activeSection === tab.key ? COLORS.primary : "transparent", color: activeSection === tab.key ? "#fff" : COLORS.textLight, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* NUTRICIÓN */}
      {activeSection === "nutrition" && (
        <div>
          {/* Gráfica semanal */}
          <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Calorías esta semana</h3>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: 120 }}>
              {weekData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 90, display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${(d.calories / maxCal) * 100}%`,
                      background: d.calories > d.goal
                        ? `linear-gradient(180deg, ${COLORS.secondary}, #ff9a6c)`
                        : `linear-gradient(180deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.5s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight }}>{d.day}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.primary }} />
                <span style={{ fontSize: 11, color: COLORS.textLight }}>Dentro del objetivo</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS.secondary }} />
                <span style={{ fontSize: 11, color: COLORS.textLight }}>Por encima</span>
              </div>
            </div>
          </div>

          {/* Resumen semanal */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Promedio diario", value: `${Math.round(weekData.reduce((s, d) => s + d.calories, 0) / 7)}`, unit: "kcal", icon: "🍽", color: COLORS.primary },
              { label: "Mejor día", value: `${Math.min(...weekData.map((d) => d.calories))}`, unit: "kcal", icon: "⭐", color: COLORS.success },
              { label: "Días en objetivo", value: `${weekData.filter((d) => d.calories <= d.goal).length}`, unit: "de 7", icon: "🎯", color: COLORS.accent },
              { label: "Hoy", value: `${totalCalories}`, unit: `/ ${userGoal}`, icon: "📅", color: COLORS.secondary },
            ].map((stat) => (
              <div key={stat.label} style={{ background: COLORS.card, borderRadius: 16, padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{stat.unit}</div>
                <div style={{ fontSize: 12, color: COLORS.textLight, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EJERCICIO */}
      {activeSection === "exercise" && (
        <div>
          <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Actividad de hoy</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 14 }}>
              {[
                { label: "Quemadas", value: exercises.reduce((s, e) => s + e.calories, 0), unit: "kcal", icon: "🔥", color: COLORS.secondary },
                { label: "Tiempo", value: exercises.reduce((s, e) => s + e.duration, 0), unit: "min", icon: "⏱", color: COLORS.accent },
                { label: "Actividades", value: exercises.length, unit: "total", icon: "🏃", color: COLORS.success },
              ].map((s) => (
                <div key={s.label} style={{ background: COLORS.bg, borderRadius: 14, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>{s.unit}</div>
                  <div style={{ fontSize: 10, color: COLORS.textLight }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 12px" }}>Registrar ejercicio</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {EXERCISES.map((ex) => (
              <button key={ex.name} onClick={() => onAddExercise(ex)}
                style={{ background: COLORS.card, borderRadius: 14, padding: "14px 12px", border: `1.5px solid ${COLORS.border}`, cursor: "pointer", textAlign: "left", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 24 }}>{ex.icon}</span>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{ex.duration} min • {ex.calories} kcal</div>
              </button>
            ))}
          </div>

          {exercises.length > 0 && (
            <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Historial de hoy</h3>
              {exercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <span style={{ fontSize: 24 }}>{ex.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{ex.duration} minutos</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.secondary }}>-{ex.calories} kcal</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AYUNO */}
      {activeSection === "fasting" && (
        <div>
          {/* Temporizador */}
          <div style={{ background: `linear-gradient(135deg, #1a1a2e, #16213e)`, borderRadius: 24, padding: 24, marginBottom: 16, textAlign: "center", color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 8 }}>
              {fastingActive ? "⏳ Ayuno en progreso" : "⏸ Ayuno pausado"}
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: 4, marginBottom: 8, color: fastingActive ? COLORS.primary : "#fff" }}>
              {formatFastingTime(fastingElapsed)}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 16 }}>
              Objetivo: {fastingSchedule.name} · {fastingSchedule.description}
            </div>

            {/* Anillo de progreso de ayuno */}
            <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 20px" }}>
              <svg width={120} height={120} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={60} cy={60} r={50} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={10} />
                <circle cx={60} cy={60} r={50} fill="none" stroke={COLORS.primary} strokeWidth={10}
                  strokeDasharray={314} strokeDashoffset={314 - (fastingProgress / 100) * 314} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{Math.round(fastingProgress)}%</div>
                <div style={{ fontSize: 10, color: "#888" }}>completado</div>
              </div>
            </div>

            <button onClick={fastingActive ? onStopFasting : onStartFasting}
              style={{ padding: "14px 40px", borderRadius: 50, border: "none", background: fastingActive ? `linear-gradient(135deg, ${COLORS.danger}, #ff6b6b)` : `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: fastingActive ? "0 4px 20px rgba(239,68,68,0.4)" : `0 4px 20px rgba(76,175,130,0.4)` }}>
              {fastingActive ? "⏹ Detener ayuno" : "▶ Iniciar ayuno"}
            </button>
          </div>

          {/* Selección de protocolo */}
          <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, margin: "0 0 12px" }}>Protocolo de ayuno</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {FASTING_SCHEDULES.map((s) => (
              <button key={s.name} onClick={() => !fastingActive && setFastingSchedule(s)}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderRadius: 14, border: `2px solid ${fastingSchedule.name === s.name ? COLORS.primary : COLORS.border}`, background: fastingSchedule.name === s.name ? COLORS.primaryLight : COLORS.card, cursor: fastingActive ? "not-allowed" : "pointer", opacity: fastingActive && fastingSchedule.name !== s.name ? 0.5 : 1 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: fastingSchedule.name === s.name ? COLORS.primaryDark : COLORS.text }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.description}</div>
                </div>
                {s.popular && <span style={{ background: COLORS.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20 }}>Popular</span>}
                {fastingSchedule.name === s.name && !s.popular && <span style={{ color: COLORS.primary, fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>

          <div style={{ background: "linear-gradient(135deg, #fff7e6, #fef3c7)", borderRadius: 16, padding: 14, marginTop: 14, border: "1px solid #fed7aa" }}>
            <p style={{ margin: 0, fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
              ⚠️ <strong>Aviso médico:</strong> El ayuno intermitente no es apropiado para todas las personas. Consulta con un médico antes de comenzar, especialmente si tienes condiciones de salud preexistentes.
            </p>
          </div>
        </div>
      )}

      {/* PESO */}
      {activeSection === "weight" && (
        <div>
          <div style={{ background: COLORS.card, borderRadius: 18, padding: 20, marginBottom: 16, textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 4 }}>Peso actual</div>
            <div style={{ fontSize: 52, fontWeight: 800, color: COLORS.primary }}>72.5</div>
            <div style={{ fontSize: 16, color: COLORS.textLight }}>kg</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>78.0</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>Inicial</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.success }}>-5.5 kg</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>Perdidos</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.primary }}>65.0</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>Objetivo</div>
              </div>
            </div>
          </div>

          {/* Gráfica de peso simulada */}
          <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Historial de peso</h3>
            <svg width="100%" height="100" viewBox="0 0 300 100" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Área rellena */}
              <path d="M0,50 C30,48 60,45 90,42 C120,39 150,40 180,38 C210,35 240,33 300,28 L300,100 L0,100 Z" fill="url(#weightGrad)" />
              {/* Línea */}
              <path d="M0,50 C30,48 60,45 90,42 C120,39 150,40 180,38 C210,35 240,33 300,28" fill="none" stroke={COLORS.primary} strokeWidth="2.5" strokeLinecap="round" />
              {/* Puntos */}
              {[[0, 50], [90, 42], [180, 38], [300, 28]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={4} fill={COLORS.primary} stroke="#fff" strokeWidth="2" />
              ))}
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["Ene", "Mar", "May", "Hoy"].map((m) => (
                <span key={m} style={{ fontSize: 11, color: COLORS.textMuted }}>{m}</span>
              ))}
            </div>
            {/* TODO: Conectar con datos reales de historial de peso del usuario */}
          </div>

          {/* IMC */}
          <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Índice de Masa Corporal</h3>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 36, fontWeight: 800, color: COLORS.success }}>22.4</span>
              <span style={{ fontSize: 16, color: COLORS.textLight, marginLeft: 6 }}>IMC</span>
              <div style={{ fontSize: 13, color: COLORS.success, fontWeight: 600, marginTop: 4 }}>Peso normal ✓</div>
            </div>
            <div style={{ position: "relative", height: 20, background: "linear-gradient(90deg, #3B82F6, #10B981, #F59E0B, #EF4444)", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -6, left: "45%", width: 3, height: 32, background: COLORS.text, borderRadius: 2 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              {["Bajo", "Normal", "Sobrepeso", "Obesidad"].map((l) => (
                <span key={l} style={{ fontSize: 9, color: COLORS.textMuted }}>{l}</span>
              ))}
            </div>
            {/* TODO: Calcular IMC real según datos del perfil del usuario */}
          </div>
        </div>
      )}
    </div>
  );
}

// =====================
// PROFILE SCREEN
// =====================
function ProfileScreen({ profile, setProfile, userGoal }) {
  const [editing, setEditing] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const stats = [
    { label: "Días activos", value: "14", icon: "📅" },
    { label: "Comidas registradas", value: "48", icon: "🍽" },
    { label: "Racha actual", value: "7 días", icon: "🔥" },
    { label: "Calorías ahorradas", value: "3,240", icon: "✨" },
  ];

  const goals = [
    { key: "perder", label: "Perder peso", emoji: "⬇️" },
    { key: "mantener", label: "Mantener peso", emoji: "⚖️" },
    { key: "ganar", label: "Ganar músculo", emoji: "💪" },
  ];

  return (
    <div style={{ padding: "52px 16px 12px" }}>
      {/* Header de perfil */}
      <div style={{ background: `linear-gradient(160deg, ${COLORS.primaryDark}, ${COLORS.primary})`, borderRadius: 24, padding: 24, marginBottom: 16, color: "#fff", textAlign: "center" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.25)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px" }}>
          {profile.name ? profile.name.charAt(0).toUpperCase() : "👤"}
        </div>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>
          {profile.name || "Tu perfil"}
        </h2>
        <p style={{ margin: 0, fontSize: 13, opacity: 0.85 }}>
          {goals.find(g => g.key === profile.goal)?.emoji} Objetivo: {goals.find(g => g.key === profile.goal)?.label || "No definido"}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
          {[
            { label: "Objetivo", value: `${userGoal} kcal` },
            { label: "Altura", value: profile.height ? `${profile.height} cm` : "—" },
            { label: "Peso", value: profile.weight ? `${profile.weight} kg` : "—" },
          ].map((item) => (
            <div key={item.label} style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "10px 8px" }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={{ background: COLORS.card, borderRadius: 16, padding: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{s.value}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Editar perfil */}
      <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>Datos personales</h3>
          <button onClick={() => { if (editing) { setProfile(localProfile); } setEditing(!editing); }}
            style={{ background: editing ? COLORS.primaryLight : COLORS.bg, border: "none", borderRadius: 10, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: editing ? COLORS.primaryDark : COLORS.textLight }}>
            {editing ? "✓ Guardar" : "✏️ Editar"}
          </button>
        </div>

        {[
          { label: "Nombre", field: "name", type: "text", placeholder: "Tu nombre" },
          { label: "Edad", field: "age", type: "number", placeholder: "años" },
          { label: "Altura (cm)", field: "height", type: "number", placeholder: "cm" },
          { label: "Peso actual (kg)", field: "weight", type: "number", placeholder: "kg" },
        ].map((item) => (
          <div key={item.field} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 13, color: COLORS.textLight, fontWeight: 500 }}>{item.label}</span>
            {editing ? (
              <input type={item.type} value={localProfile[item.field]} onChange={(e) => setLocalProfile({ ...localProfile, [item.field]: e.target.value })}
                placeholder={item.placeholder}
                style={{ border: `1.5px solid ${COLORS.primary}`, borderRadius: 8, padding: "6px 10px", fontSize: 13, outline: "none", width: 120, textAlign: "right", fontFamily: "inherit" }} />
            ) : (
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{profile[item.field] || "—"}</span>
            )}
          </div>
        ))}
      </div>

      {/* Objetivo */}
      <div style={{ background: COLORS.card, borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Objetivo de salud</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {goals.map((g) => (
            <button key={g.key} onClick={() => setProfile({ ...profile, goal: g.key })}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, border: `2px solid ${profile.goal === g.key ? COLORS.primary : COLORS.border}`, background: profile.goal === g.key ? COLORS.primaryLight : "#fff", cursor: "pointer" }}>
              <span style={{ fontSize: 20 }}>{g.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: profile.goal === g.key ? COLORS.primaryDark : COLORS.text }}>{g.label}</span>
              {profile.goal === g.key && <span style={{ marginLeft: "auto", color: COLORS.primary, fontSize: 16 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Menú de configuración */}
      <div style={{ background: COLORS.card, borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        {[
          { icon: "🔔", label: "Notificaciones", badge: null },
          { icon: "🎯", label: "Personalizar plan", badge: null },
          { icon: "📊", label: "Exportar datos", badge: null },
          { icon: "❓", label: "Ayuda y soporte", badge: null },
          { icon: "⚕️", label: "Aviso médico", badge: null },
          // TODO: Implementar navegación a pantallas de configuración
        ].map((item, i, arr) => (
          <button key={item.label}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "none", background: "#fff", borderBottom: i < arr.length - 1 ? `1px solid ${COLORS.border}` : "none", cursor: "pointer", textAlign: "left" }}>
            <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: COLORS.text }}>{item.label}</span>
            <span style={{ fontSize: 16, color: COLORS.textMuted }}>›</span>
          </button>
        ))}
      </div>

      {/* Aviso legal */}
      <div style={{ background: COLORS.primaryLight, borderRadius: 14, padding: 14, marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 11, color: COLORS.primaryDark, lineHeight: 1.6 }}>
          ⚕️ <strong>Aviso legal:</strong> CalDiet no ofrece asesoramiento médico. Todas las recomendaciones son solo para fines informativos. Antes de realizar cualquier cambio en tu dieta, consulta con un profesional de la salud.
        </p>
      </div>

      <p style={{ textAlign: "center", color: COLORS.textMuted, fontSize: 11, margin: 0 }}>
        CalDiet v1.0.0 · {/* TODO: número de versión dinámico */}
        <a href="https://landing.caldiet.app/privacy" style={{ color: COLORS.primary, textDecoration: "none" }}>Política de privacidad</a>
      </p>
    </div>
  );
}

// =====================
// BOTTOM NAV
// =====================
function BottomNav({ activeTab, setActiveTab, onScanPress }) {
  const tabs = [
    { key: "home", icon: "🏠", label: "Inicio" },
    { key: "diary", icon: "📓", label: "Diario" },
    { key: "scan", icon: null, label: "Escanear" },
    { key: "progress", icon: "📈", label: "Progreso" },
    { key: "profile", icon: "👤", label: "Perfil" },
  ];

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: COLORS.navBg, borderTop: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", paddingBottom: "env(safe-area-inset-bottom, 0px)", boxShadow: "0 -4px 20px rgba(0,0,0,0.08)", zIndex: 100 }}>
      {tabs.map((tab) => {
        if (!tab.icon) {
          // Botón central de escanear
          return (
            <button key={tab.key} onClick={onScanPress}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 0 8px", border: "none", background: "transparent", cursor: "pointer", position: "relative" }}>
              <div style={{ width: 52, height: 52, borderRadius: 26, background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 4px 16px rgba(76,175,130,0.5)`, marginTop: -16, border: "3px solid #fff" }}>
                📸
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.primary, marginTop: 4 }}>Escanear</span>
            </button>
          );
        }
        const isActive = activeTab === tab.key;
        return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 0 8px", border: "none", background: "transparent", cursor: "pointer", transition: "all 0.2s" }}>
            <span style={{ fontSize: 22, marginBottom: 2, filter: isActive ? "none" : "grayscale(100%) opacity(0.5)" }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: isActive ? COLORS.primary : COLORS.textMuted, transition: "color 0.2s" }}>{tab.label}</span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: 2, background: COLORS.primary, marginTop: 2 }} />}
          </button>
        );
      })}
    </div>
  );
}