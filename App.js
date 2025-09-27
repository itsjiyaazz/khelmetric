import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// KhelMetric Prototype - React Native (Expo)
// Simplified: No DB, no camera. Simulated AI counters and offline banner.

const translations = {
  english: {
    appName: 'KhelMetric AI',
    tagline: 'Discover Your Athletic Potential',
    getStarted: 'Get Started',
    createProfile: 'Create Your Profile',
    tellAboutYourself: 'Tell us about yourself',
    name: 'Name',
    age: 'Age',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    location: 'Location',
    language: 'Preferred Language',
    continue: 'Continue',
    welcome: 'Welcome',
    ready: 'Ready to test your potential?',
    level: 'Level',
    tests: 'Tests',
    avg: 'Avg',
    fitnessTests: 'Fitness Tests',
    situpsTest: 'Sit-ups Test',
    verticalJumpTest: 'Vertical Jump Test',
    coreStrength: 'Core Strength Assessment',
    jumpPower: 'Jump Power Assessment',
    startTest: 'Start Test',
    testComplete: 'Test Complete!',
    results: 'Here are your results',
    continueTraining: 'Continue Training',
    offline: 'Offline Mode',
    dataStored: 'Prototype (no sync)',
    instructions: 'Instructions:',
    situpsInstructions: [
      'Lie flat on your back, knees bent',
      'Place hands behind your head',
      'Lift your torso towards your knees',
      'Keep your movements controlled',
      'Our AI will count and analyze your form (simulated)'
    ],
    jumpInstructions: [
      'Stand with feet shoulder-width apart',
      'Bend your knees and swing arms back',
      'Jump as high as possible',
      'Land softly on both feet',
      'AI will estimate jump height (simulated)'
    ],
    liveAnalysis: 'Live AI Analysis',
    repCount: 'Rep Count',
    formScore: 'Form Score',
    jumpHeight: 'Jump Height',
    powerScore: 'Power Score',
    positionReady: 'Position yourself and get ready...',
    startExercise: 'Start Exercise',
    exerciseProgress: 'Exercise in Progress - AI Analyzing',
    completeTest: 'Complete Test',
    experiencePoints: 'Experience Points Earned',
    performanceMetrics: 'Performance Metrics',
    situpsCompleted: 'Sit-ups Completed',
    jumpHeightCm: 'Jump Height (cm)',
    aiFeedback: 'AI Feedback'
  },
  hindi: {
    appName: 'खेलमेट्रिक AI',
    tagline: 'अपनी खेल क्षमता की खोज करें',
    getStarted: 'शुरू करें',
    createProfile: 'अपना प्रोफ़ाइल बनाएं',
    tellAboutYourself: 'अपने बारे में बताएं',
    name: 'नाम',
    age: 'उम्र',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    location: 'स्थान',
    language: 'पसंदीदा भाषा',
    continue: 'जारी रखें',
    welcome: 'स्वागत',
    ready: 'अपनी क्षमता का परीक्षण करने के लिए तैयार?',
    level: 'स्तर',
    tests: 'परीक्षण',
    avg: 'औसत',
    fitnessTests: 'फिटनेस टेस्ट',
    situpsTest: 'सिट-अप टेस्ट',
    verticalJumpTest: 'वर्टिकल जंप टेस्ट',
    coreStrength: 'कोर स्ट्रेंथ आकलन',
    jumpPower: 'जंप पावर आकलन',
    startTest: 'टेस्ट शुरू करें',
    testComplete: 'टेस्ट पूरा हुआ!',
    results: 'यहाँ आपके परिणाम हैं',
    continueTraining: 'प्रशिक्षण जारी रखें',
    offline: 'ऑफलाइन मोड',
    dataStored: 'प्रोटोटाइप (कोई सिंक नहीं)',
    instructions: 'निर्देश:',
    situpsInstructions: [
      'अपनी पीठ के बल लेटें, घुटने मोड़ें',
      'हाथों को सिर के पीछे रखें',
      'अपने धड़ को घुटनों की ओर उठाएं',
      'अपनी गतिविधियों को नियंत्रित रखें',
      'AI गिनती करेगा (सिम्युलेटेड)'
    ],
    jumpInstructions: [
      'पैरों को कंधे की चौड़ाई के बराबर खड़े रहें',
      'घुटनों को मोड़ें और हाथों को पीछे झुलाएं',
      'जितना हो सके उतना ऊंचा कूदें',
      'दोनों पैरों पर धीरे से उतरें',
      'AI ऊँचाई का अनुमान लगाएगा (सिम्युलेटेड)'
    ],
    liveAnalysis: 'लाइव AI विश्लेषण',
    repCount: 'दोहराव गिनती',
    formScore: 'फॉर्म स्कोर',
    jumpHeight: 'कूद की ऊँचाई',
    powerScore: 'पावर स्कोर',
    positionReady: 'अपनी स्थिति बनाएं और तैयार हो जाएँ...',
    startExercise: 'व्यायाम शुरू करें',
    exerciseProgress: 'व्यायाम चल रहा है - AI विश्लेषण कर रहा है',
    completeTest: 'टेस्ट पूरा करें',
    experiencePoints: 'अनुभव अंक',
    performanceMetrics: 'प्रदर्शन मेट्रिक्स',
    situpsCompleted: 'सिट-अप पूरे',
    jumpHeightCm: 'कूद की ऊँचाई (सेमी)',
    aiFeedback: 'AI फीडबैक'
  }
};

const levels = [
  { level: 1, name: 'Rookie', minXP: 0, badge: '🥉', color: '#CD7F32' },
  { level: 2, name: 'Athlete', minXP: 1000, badge: '🥈', color: '#C0C0C0' },
  { level: 3, name: 'Champion', minXP: 5000, badge: '🥇', color: '#FFD700' },
  { level: 4, name: 'Elite', minXP: 15000, badge: '🏆', color: '#FF6B35' }
];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [currentTest, setCurrentTest] = useState('situps');
  const [isOnline] = useState(true); // Prototype banner only
  const [userXP, setUserXP] = useState(1200);
  const [userName, setUserName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  const [isRecording, setIsRecording] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [formScore, setFormScore] = useState(0);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [isExercising, setIsExercising] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const t = useMemo(() => translations[selectedLanguage] || translations.english, [selectedLanguage]);
  const currentLevelInfo = useMemo(() => levels.filter(l => userXP >= l.minXP).slice(-1)[0], [userXP]);

  useEffect(() => {
    if (isRecording && isExercising && currentScreen === 'recording') {
      const interval = setInterval(() => {
        setRepCount(prev => prev + 1);
        setFormScore(prev => {
          const randomVariation = (Math.random() - 0.5) * 10;
          const baseScore = 85;
          const next = Math.max(75, Math.min(95, (prev || baseScore) + randomVariation));
          return next;
        });
      }, 1200);
      return () => clearInterval(interval);
    }
  }, [isRecording, isExercising, currentScreen]);

  const simulateTest = () => {
    setIsRecording(true);
    setRepCount(0);
    setFormScore(0);
    setTestResults(null);
    setIsExercising(false);
    setExerciseStarted(false);
    setCurrentScreen('recording');
  };

  const completeTest = () => {
    setIsRecording(false);
    let results;
    if (currentTest === 'situps') {
      const finalReps = Math.max(repCount, 5);
      const finalForm = Math.max(formScore, 75);
      const earnedXP = finalReps * 10 + (finalForm > 80 ? 100 : 50);
      results = {
        xpEarned: Math.round(earnedXP),
        situps: finalReps,
        formScore: Math.round(finalForm),
        feedback: [
          `Great job completing ${finalReps} sit-ups!`,
          finalForm > 85 ? 'Excellent form throughout!' : 'Good form - try to maintain consistency',
          'Your core strength is developing well'
        ]
      };
    } else {
      const jumpHeight = Math.round(Math.max(formScore * 0.6, 25));
      const powerScore = Math.max(formScore, 75);
      const earnedXP = jumpHeight * 5 + (powerScore > 80 ? 150 : 75);
      results = {
        xpEarned: Math.round(earnedXP),
        jumpHeight,
        powerScore: Math.round(powerScore),
        feedback: [
          `Impressive ${jumpHeight}cm vertical jump!`,
          powerScore > 85 ? 'Explosive power - excellent technique!' : 'Good power generation',
          'Your leg strength and coordination are strong'
        ]
      };
    }
    setUserXP(prev => prev + results.xpEarned);
    setTestResults(results);
    setCurrentScreen('results');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0b1021' }}>
      {currentScreen === 'welcome' && (
        <WelcomeScreen t={t} onStart={() => setCurrentScreen('profile')} />
      )}
      {currentScreen === 'profile' && (
        <ProfileScreen
          t={t}
          selectedLanguage={selectedLanguage}
          onChangeLanguage={setSelectedLanguage}
          onSubmit={({ name }) => {
            setUserName(name);
            setCurrentScreen('dashboard');
          }}
        />
      )}
      {currentScreen === 'dashboard' && (
        <DashboardScreen
          t={t}
          userName={userName}
          currentLevelInfo={currentLevelInfo}
          onOpenSitups={() => {
            setCurrentTest('situps');
            setCurrentScreen('test-intro');
          }}
          onOpenJump={() => {
            setCurrentTest('verticaljump');
            setCurrentScreen('test-intro');
          }}
          onOpenSAI={() => setCurrentScreen('sai-dashboard')}
        />
      )}
      {currentScreen === 'test-intro' && (
        <TestIntroScreen
          t={t}
          currentTest={currentTest}
          onBack={() => setCurrentScreen('dashboard')}
          onStart={simulateTest}
        />
      )}
      {currentScreen === 'recording' && (
        <RecordingScreen
          t={t}
          currentTest={currentTest}
          repCount={repCount}
          formScore={formScore}
          isRecording={isRecording}
          exerciseStarted={exerciseStarted}
          onStartExercise={() => {
            if (!exerciseStarted) {
              setExerciseStarted(true);
              setIsExercising(true);
              setTimeout(() => setIsExercising(false), 8000);
            }
          }}
          onComplete={completeTest}
        />
      )}
      {currentScreen === 'results' && (
        <ResultsScreen t={t} results={testResults} onContinue={() => setCurrentScreen('dashboard')} />
      )}
      {currentScreen === 'sai-dashboard' && (
        <SAIDashboardScreen onBack={() => setCurrentScreen('dashboard')} />
      )}
    </SafeAreaView>
  );
}

function WelcomeScreen({ t, onStart }) {
  return (
    <LinearGradient colors={['#3b1d8f', '#0b1021']} style={{ flex: 1 }}>
      <View style={styles.centerWrap}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <LinearGradient colors={['#FF7A1A', '#FF3D71']} style={styles.bigBadge}>
            <MaterialIcons name="sports-handball" size={40} color="#fff" />
          </LinearGradient>
          <Text style={styles.titleText}>{t.appName}</Text>
          <Text style={styles.subtitleText}>{t.tagline}</Text>
        </View>

        <View style={styles.featureGrid}>
          <FeaturePill icon={<Ionicons name="flash" size={20} color="#fff" />} text="Real-time AI (sim)" />
          <FeaturePill icon={<Ionicons name="server" size={20} color="#fff" />} text="Offline Prototype" />
          <FeaturePill icon={<Ionicons name="language" size={20} color="#fff" />} text="Multi-language" />
          <FeaturePill icon={<Ionicons name="trophy" size={20} color="#fff" />} text="Gamification" />
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
          <Text style={styles.primaryBtnText}>{t.getStarted}</Text>
          <Ionicons name="arrow-forward" color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

function ProfileScreen({ t, selectedLanguage, onChangeLanguage, onSubmit }) {
  const [formData, setFormData] = useState({ name: '', age: '', gender: 'male', location: '' });
  const canSubmit = formData.name && formData.age && formData.location;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.createProfile}</Text>
        <Text style={styles.cardSub}>{t.tellAboutYourself}</Text>

        <LabeledInput label={t.name} placeholder="Rajesh Kumar" value={formData.name} onChangeText={(v) => setFormData({ ...formData, name: v })} />

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <LabeledInput label={t.age} placeholder="16" keyboardType="number-pad" value={formData.age} onChangeText={(v) => setFormData({ ...formData, age: v })} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{t.gender}</Text>
            <View style={styles.segmentWrap}>
              <SegmentButton text={t.male} selected={formData.gender === 'male'} onPress={() => setFormData({ ...formData, gender: 'male' })} />
              <SegmentButton text={t.female} selected={formData.gender === 'female'} onPress={() => setFormData({ ...formData, gender: 'female' })} />
            </View>
          </View>
        </View>

        <LabeledInput label={t.location} placeholder="Jharkhand, India" value={formData.location} onChangeText={(v) => setFormData({ ...formData, location: v })} />

        <Text style={styles.label}>{t.language}</Text>
        <View style={styles.segmentWrap}>
          <SegmentButton text="English" selected={selectedLanguage === 'english'} onPress={() => onChangeLanguage('english')} />
          <SegmentButton text="हिंदी" selected={selectedLanguage === 'hindi'} onPress={() => onChangeLanguage('hindi')} />
        </View>

        <TouchableOpacity disabled={!canSubmit} style={[styles.primaryBtn, { opacity: canSubmit ? 1 : 0.6 }]} onPress={() => onSubmit(formData)}>
          <Text style={styles.primaryBtnText}>{t.continue}</Text>
          <Ionicons name="arrow-forward" color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function DashboardScreen({ t, userName, currentLevelInfo, onOpenSitups, onOpenJump, onOpenSAI }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F3F4F6' }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.greetText}>{t.welcome}, {userName || 'Athlete'}!</Text>
            <Text style={styles.mutedText}>{t.ready}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 22 }}>{currentLevelInfo?.badge}</Text>
            <Text style={{ fontWeight: '700', color: currentLevelInfo?.color }}>{currentLevelInfo?.name}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <SmallStat icon={<Ionicons name="trending-up" size={18} color="#2563EB" />} text={`${t.level} ${currentLevelInfo?.level}`} bg="#EFF6FF" color="#2563EB" />
          <SmallStat icon={<Ionicons name="medal" size={18} color="#16A34A" />} text={`2 ${t.tests}`} bg="#ECFDF5" color="#16A34A" />
          <SmallStat icon={<Ionicons name="star" size={18} color="#7C3AED" />} text={`87% ${t.avg}`} bg="#F5F3FF" color="#7C3AED" />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.fitnessTests}</Text>

        <TestListItem gradient={["#FF7A1A", "#FF3D71"]} icon={<MaterialIcons name="fitness-center" size={20} color="#fff" />} title={t.situpsTest} subtitle={t.coreStrength} onPress={onOpenSitups} />
        <TestListItem gradient={["#3B82F6", "#8B5CF6"]} icon={<Ionicons name="analytics" size={20} color="#fff" />} title={t.verticalJumpTest} subtitle={t.jumpPower} onPress={onOpenJump} />
        <TestListItem gradient={["#8B5CF6", "#6366F1"]} icon={<Ionicons name="people" size={20} color="#fff" />} title="SAI Dashboard" subtitle="Official results portal" onPress={onOpenSAI} />
      </View>
    </ScrollView>
  );
}

function TestIntroScreen({ t, currentTest, onBack, onStart }) {
  const config = currentTest === 'situps'
    ? { title: t.situpsTest, description: t.coreStrength, gradient: ['#FF7A1A', '#FF3D71'], icon: <FontAwesome5 name="dumbbell" size={28} color="#fff" />, instructions: t.situpsInstructions }
    : { title: t.verticalJumpTest, description: t.jumpPower, gradient: ['#3B82F6', '#8B5CF6'], icon: <Ionicons name="arrow-up" size={28} color="#fff" />, instructions: t.jumpInstructions };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFF7ED' }} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity onPress={onBack} style={{ marginBottom: 12 }}>
        <Text style={{ color: '#374151' }}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <LinearGradient colors={config.gradient} style={styles.roundBadge}>{config.icon}</LinearGradient>
        <Text style={styles.cardTitle}>{config.title}</Text>
        <Text style={styles.cardSub}>{config.description}</Text>

        <View style={[styles.infoBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <Text style={styles.infoTitle}>{t.instructions}</Text>
          {config.instructions.map((instruction, idx) => (
            <Text key={idx} style={styles.infoText}>• {instruction}</Text>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={onStart}>
          <Text style={styles.primaryBtnText}>{t.startTest}</Text>
          <Ionicons name="play" color="#fff" size={18} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function RecordingScreen({ t, currentTest, repCount, formScore, isRecording, exerciseStarted, onStartExercise, onComplete }) {
  const metricPrimaryLabel = currentTest === 'situps' ? t.repCount : t.jumpHeight;
  const metricPrimaryValue = currentTest === 'situps' ? `${repCount}` : `${Math.round(formScore * 0.6)} cm`;
  const secondaryLabel = currentTest === 'situps' ? t.formScore : t.powerScore;

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>{t.liveAnalysis}</Text>
        <View style={styles.videoMock}>
          <Text style={{ fontSize: 42 }}>🤖</Text>
          <Text style={{ position: 'absolute', right: 8, bottom: 6, color: '#34D399', fontWeight: '700', fontSize: 12 }}>ACTIVE</Text>
        </View>

        {isRecording && (
          <View style={styles.hud}>
            <Text style={styles.hudText}>{metricPrimaryLabel}: <Text style={{ color: '#34D399', fontWeight: '700' }}>{metricPrimaryValue}</Text></Text>
            <Text style={styles.hudText}>{secondaryLabel}: <Text style={{ color: '#34D399', fontWeight: '700' }}>{Math.round(formScore)}%</Text></Text>
          </View>
        )}

        <View style={styles.banner}>
          <Text style={{ color: '#fff' }}>
            {!exerciseStarted ? t.positionReady : 'Analysis complete! Great performance!'}
          </Text>
        </View>
      </View>

      <View style={{ padding: 16, backgroundColor: '#111827' }}>
        <TouchableOpacity style={[styles.ctaBtn, { backgroundColor: exerciseStarted ? '#059669' : '#2563EB' }]} onPress={onStartExercise} disabled={exerciseStarted}>
          <Text style={styles.ctaText}>{exerciseStarted ? `✅ ${t.exerciseProgress}` : `🎬 ${t.startExercise}`}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.ctaBtn, { marginTop: 8, backgroundColor: '#374151' }]} onPress={onComplete}>
          <Text style={styles.ctaText}>{t.completeTest}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ResultsScreen({ t, results, onContinue }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ECFDF5' }} contentContainerStyle={{ padding: 16 }}>
      <View style={[styles.card, { alignItems: 'center' }]}>
        <Text style={{ fontSize: 48, marginBottom: 8 }}>🏆</Text>
        <Text style={styles.cardTitle}>{t.testComplete}</Text>
        <Text style={styles.cardSub}>{t.results}</Text>
      </View>

      <LinearGradient colors={["#FF7A1A", "#FF3D71"]} style={styles.xpBanner}>
        <Text style={styles.xpText}>+{results?.xpEarned || 0} XP</Text>
        <Text style={{ color: 'rgba(255,255,255,0.9)' }}>{t.experiencePoints}</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.performanceMetrics}</Text>
        <View style={styles.metricsGrid}>
          <MetricBox title={t.situpsCompleted} value={results?.situps ?? 0} color="#3B82F6" />
          <MetricBox title={t.formScore} value={`${results?.formScore ?? 0}%`} color="#10B981" />
        </View>
        <View style={{ marginTop: 8 }}>
          <Text style={styles.cardSub}>{t.aiFeedback}</Text>
          {(results?.feedback || []).map((f, i) => (
            <Text key={i} style={styles.infoText}>• {f}</Text>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.primaryBtn, { marginTop: 8 }]} onPress={onContinue}>
        <Text style={styles.primaryBtnText}>{t.continueTraining}</Text>
        <Ionicons name="arrow-forward" color="#fff" size={18} />
      </TouchableOpacity>
    </ScrollView>
  );
}

function SAIDashboardScreen({ onBack }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F1F5F9' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <TouchableOpacity onPress={onBack}>
          <Text style={{ color: '#374151' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>SAI Talent Dashboard</Text>
        <Text style={{ color: '#6B7280', fontSize: 12 }}>Official Portal</Text>
      </View>

      <View style={styles.metricsRow}>
        <BigStat icon={<Ionicons name="people" size={28} color="#2563EB" />} value="2,847" label="Athletes Assessed" color="#2563EB" />
        <BigStat icon={<Ionicons name="star" size={28} color="#16A34A" />} value="142" label="Top Performers" color="#16A34A" />
        <BigStat icon={<Ionicons name="medal" size={28} color="#F59E0B" />} value="28" label="States Covered" color="#F59E0B" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent High-Potential Athletes</Text>
        {[
          { name: 'Rajesh Kumar', detail: 'Jharkhand • Basketball', score: '92%' },
          { name: 'Priya Sharma', detail: 'Rajasthan • Athletics', score: '89%' },
          { name: 'Arjun Patel', detail: 'Gujarat • Volleyball', score: '87%' }
        ].map((a, i) => (
          <View key={i} style={styles.listItem}>
            <View>
              <Text style={styles.listTitle}>{a.name}</Text>
              <Text style={styles.listSub}>{a.detail}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.listTitle, { color: '#16A34A' }]}>{a.score}</Text>
              <Text style={styles.listSub}>Talent Score</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Regional Talent Distribution</Text>
        <View style={styles.regionGrid}>
          {[
            { state: 'Maharashtra', count: '423', top: 'Cricket' },
            { state: 'Karnataka', count: '387', top: 'Athletics' },
            { state: 'Punjab', count: '312', top: 'Wrestling' },
            { state: 'Kerala', count: '298', top: 'Football' }
          ].map((r, i) => (
            <View key={i} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#2563EB' }}>{r.count}</Text>
              <Text style={{ fontWeight: '700', color: '#111827' }}>{r.state}</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>Top: {r.top}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// Reusable components
function FeaturePill({ icon, text }) {
  return (
    <View style={styles.featurePill}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput {...props} style={styles.input} placeholderTextColor="#9CA3AF" />
    </View>
  );
}

function SegmentButton({ text, selected, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.segmentBtn, selected && styles.segmentBtnActive]}>
      <Text style={[styles.segmentText, selected && styles.segmentTextActive]}>{text}</Text>
    </TouchableOpacity>
  );
}

function SmallStat({ icon, text, bg, color }) {
  return (
    <View style={[styles.smallStat, { backgroundColor: bg }]}>
      {icon}
      <Text style={{ color, fontWeight: '700', marginTop: 4, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

function TestListItem({ gradient, icon, title, subtitle, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.listRow}>
      <LinearGradient colors={gradient} style={styles.listIcon}>{icon}</LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={styles.listTitle}>{title}</Text>
        <Text style={styles.listSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

function MetricBox({ title, value, color }) {
  return (
    <View style={styles.metricBox}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{title}</Text>
    </View>
  );
}

function BigStat({ icon, value, label, color }) {
  return (
    <View style={styles.bigStat}>
      <View style={[styles.bigStatIcon, { backgroundColor: `${color}1A` }]}>{icon}</View>
      <Text style={[styles.bigStatValue, { color }]}>{value}</Text>
      <Text style={styles.bigStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  bigBadge: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  titleText: { fontSize: 32, fontWeight: '800', color: '#fff', marginTop: 8 },
  subtitleText: { fontSize: 16, color: '#BFDBFE', marginTop: 6 },
  featureGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  featurePill: { width: '48%', marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.08)', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center' },
  featureIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 8 },
  featureText: { color: '#E5E7EB', fontWeight: '600' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F97316', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 28, marginTop: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '800', marginRight: 6 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  cardSub: { color: '#6B7280', marginTop: 4 },
  label: { fontWeight: '700', color: '#374151', marginBottom: 6 },
  input: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, color: '#111827' },
  segmentWrap: { flexDirection: 'row', gap: 8 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center' },
  segmentBtnActive: { backgroundColor: '#DBEAFE' },
  segmentText: { color: '#6B7280', fontWeight: '700' },
  segmentTextActive: { color: '#1D4ED8' },
  greetText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  mutedText: { color: '#6B7280' },
  statsGrid: { marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' },
  smallStat: { width: '32%', borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  listIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  listTitle: { fontWeight: '700', color: '#111827' },
  listSub: { color: '#6B7280', fontSize: 12 },
  roundBadge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 12 },
  infoBox: { borderWidth: 1, borderRadius: 12, padding: 12, marginTop: 12 },
  infoTitle: { fontWeight: '800', color: '#1E3A8A', marginBottom: 6 },
  infoText: { color: '#1E3A8A', marginTop: 2 },
  videoMock: { width: 220, height: 140, backgroundColor: '#1E3A8A', borderRadius: 12, borderWidth: 2, borderColor: '#10B981', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  hud: { position: 'absolute', top: 12, left: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 8 },
  hudText: { color: '#fff', marginBottom: 2 },
  banner: { position: 'absolute', bottom: 64, left: 16, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 10, alignItems: 'center' },
  ctaBtn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '800' },
  xpBanner: { borderRadius: 24, padding: 16, alignItems: 'center', marginBottom: 12 },
  xpText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  metricsGrid: { flexDirection: 'row', gap: 12 },
  metricBox: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  metricValue: { fontSize: 22, fontWeight: '800' },
  metricLabel: { color: '#6B7280', marginTop: 4 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  bigStat: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', marginHorizontal: 4 },
  bigStatIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  bigStatValue: { fontSize: 18, fontWeight: '800' },
  bigStatLabel: { color: '#6B7280', fontSize: 12 }
});

