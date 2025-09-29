import 'intl-pluralrules';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import { getLanguage } from './storage';

const resources = {
  en: {
    translation: {
      appName: 'KhelMetric',
      selectLanguage: 'Select your language',
      english: 'English',
      hindi: 'Hindi',
      kannada: 'Kannada',
      continue: 'Continue',
      email: 'Email',
      password: 'Password',
      signup: 'Signup',
      login: 'Login',
      skipLogin: 'Skip Login',
      homeTitle: 'Dashboard',
      situpTest: 'Sit-up Test',
      jumpTest: 'Jump Test',
      myResults: 'My Results',
      finishTest: 'Finish Test',
      invalidAttempt: 'Invalid Attempt',
      incompleteAttempt: 'Incomplete Attempt',
      youDidXSitups: 'You did {{count}} sit-ups',
      goHome: 'Go Home',
      noResults: 'No results yet',
      leaderboard: 'Leaderboard',
    }
  },
  hi: {
    translation: {
      appName: 'खेलमेट्रिक',
      selectLanguage: 'भाषा चुनें',
      english: 'English',
      hindi: 'हिन्दी',
      kannada: 'कन्नड़',
      continue: 'जारी रखें',
      email: 'ईमेल',
      password: 'पासवर्ड',
      signup: 'साइनअप',
      login: 'लॉगिन',
      skipLogin: 'लॉगिन छोड़ें',
      homeTitle: 'डैशबोर्ड',
      situpTest: 'सिट-अप टेस्ट',
      jumpTest: 'जम्प टेस्ट',
      myResults: 'मेरे परिणाम',
      finishTest: 'टेस्ट समाप्त करें',
      invalidAttempt: 'अमान्य प्रयास',
      incompleteAttempt: 'अधूरा प्रयास',
      youDidXSitups: 'आपने {{count}} सिट-अप किए',
      goHome: 'होम जाएँ',
      noResults: 'अभी कोई परिणाम नहीं',
      leaderboard: 'लीडरबोर्ड',
    }
  },
  kn: {
    translation: {
      appName: 'KhelMetric',
      selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
      english: 'English',
      hindi: 'हिन्दी',
      kannada: 'ಕನ್ನಡ',
      continue: 'ಮುಂದುವರಿಸಿ',
      email: 'ಇಮೇಲ್',
      password: 'ಪಾಸ್ವರ್ಡ್',
      signup: 'ಸೈನ್ ಅಪ್',
      login: 'ಲಾಗಿನ್',
      skipLogin: 'ಲಾಗಿನ್ ಬಿಟ್ಟುಬಿಡಿ',
      homeTitle: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      situpTest: 'ಸಿಟ್-ಅಪ್ ಪರೀಕ್ಷೆ',
      jumpTest: 'ಜಿಗಿತ ಪರೀಕ್ಷೆ',
      myResults: 'ನನ್ನ ಫಲಿತಾಂಶಗಳು',
      finishTest: 'ಪರೀಕ್ಷೆ ಮುಗಿಸಿ',
      invalidAttempt: 'ಅಮಾನ್ಯ ಪ್ರಯತ್ನ',
      incompleteAttempt: 'ಅಪೂರ್ಣ ಪ್ರಯತ್ನ',
      youDidXSitups: 'ನೀವು {{count}} ಸಿಟ್-ಅಪ್‌ಗಳನ್ನು ಮಾಡಿದ್ದೀರಿ',
      goHome: 'ಹೋಮ್‌ಗೆ ಹೋಗಿ',
      noResults: 'ಇನ್ನೂ ಫಲಿತಾಂಶಗಳಿಲ್ಲ',
      leaderboard: 'ಲೀಡರ್‌ಬೋರ್ಡ್',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: { escapeValue: false },
  });

// Try to set language from storage or device
(async () => {
  const stored = await getLanguage();
  if (stored) {
    i18n.changeLanguage(stored);
  } else if (Localization.locale?.startsWith('hi')) {
    i18n.changeLanguage('hi');
  } else if (Localization.locale?.startsWith('kn')) {
    i18n.changeLanguage('kn');
  }
})();

export default i18n;


