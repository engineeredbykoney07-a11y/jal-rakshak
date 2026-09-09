import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "nav": {
        "home": "Home",
        "dashboard": "Live Dashboard",
        "how_it_works": "How It Works",
        "about": "About"
      },
      "home": {
        "tagline": "AI-Driven Flash Flood Prediction",
        "subtitle": "Protecting hilly regions with multi-channel, multi-lingual early warnings calibrated by confidence.",
        "cta": "View Live Dashboard",
        "live_status": "System Online"
      },
      "dashboard": {
        "title": "Live Status",
        "your_location": "Your Location",
        "subscribe_title": "Get SMS/Voice Alerts",
        "phone_placeholder": "Phone Number",
        "consent": "I consent to receive automated SMS and voice calls for emergency alerts.",
        "subscribe_btn": "Subscribe",
        "success": "Subscribed successfully!",
        "error": "Subscription failed. Please check consent and phone number.",
        "distance": "km away",
        "score": "Risk Score",
        "confidence": "Confidence",
        "advisory_resident": "Resident Alert",
        "advisory_officer": "Officer Info",
        "advisory_worker": "Worker Task",
        "advisory_volunteer": "Volunteer Task"
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "home": "होम",
        "dashboard": "लाइव डैशबोर्ड",
        "how_it_works": "यह कैसे काम करता है",
        "about": "हमारे बारे में"
      },
      "home": {
        "tagline": "AI-आधारित फ्लैश फ्लड भविष्यवाणी",
        "subtitle": "पहाड़ी क्षेत्रों की सुरक्षा के लिए बहुभाषी, मल्टी-चैनल प्रारंभिक चेतावनी प्रणाली।",
        "cta": "लाइव डैशबोर्ड देखें",
        "live_status": "सिस्टम ऑनलाइन"
      },
      "dashboard": {
        "title": "लाइव स्थिति",
        "your_location": "आपका स्थान",
        "subscribe_title": "SMS/वॉयस अलर्ट प्राप्त करें",
        "phone_placeholder": "फ़ोन नंबर",
        "consent": "मैं आपातकालीन अलर्ट के लिए स्वचालित SMS और वॉयस कॉल प्राप्त करने की सहमति देता/देती हूँ।",
        "subscribe_btn": "सदस्यता लें",
        "success": "सफलतापूर्वक सदस्यता ली गई!",
        "error": "सदस्यता विफल। कृपया सहमति और फ़ोन नंबर जांचें।",
        "distance": "किमी दूर",
        "score": "जोखिम स्कोर",
        "confidence": "विश्वास",
        "advisory_resident": "निवासी अलर्ट",
        "advisory_officer": "अधिकारी जानकारी",
        "advisory_worker": "कार्यकर्ता कार्य",
        "advisory_volunteer": "स्वयंसेवक कार्य"
      }
    }
  },
  te: {
    translation: {
      "nav": {
        "home": "హోమ్",
        "dashboard": "లైవ్ డాష్‌బోర్డ్",
        "how_it_works": "ఇది ఎలా పనిచేస్తుంది",
        "about": "మా గురించి"
      },
      "home": {
        "tagline": "AI ఆధారిత ఫ్లాష్ ఫ్లడ్ అంచనా",
        "subtitle": "బహుభాషా, బహుళ-ఛానల్ ముందస్తు హెచ్చరికలతో కొండ ప్రాంతాలను రక్షించడం.",
        "cta": "లైవ్ డాష్‌బోర్డ్‌ను వీక్షించండి",
        "live_status": "సిస్టమ్ ఆన్‌లైన్"
      },
      "dashboard": {
        "title": "లైవ్ స్థితి",
        "your_location": "మీ స్థానం",
        "subscribe_title": "SMS/వాయిస్ అలర్ట్‌లు పొందండి",
        "phone_placeholder": "ఫోన్ నంబర్",
        "consent": "అత్యవసర హెచ్చరికల కోసం ఆటోమేటెడ్ SMS మరియు వాయిస్ కాల్‌లను స్వీకరించడానికి నేను అంగీకరిస్తున్నాను.",
        "subscribe_btn": "సబ్‌స్క్రైబ్ చేయండి",
        "success": "విజయవంతంగా సబ్‌స్క్రైబ్ చేయబడింది!",
        "error": "సబ్‌స్క్రిప్షన్ విఫలమైంది. దయచేసి సమ్మతి మరియు నంబర్‌ను తనిఖీ చేయండి.",
        "distance": "కిమీ దూరంలో",
        "score": "రిస్క్ స్కోర్",
        "confidence": "నమ్మకం",
        "advisory_resident": "నివాసి హెచ్చరిక",
        "advisory_officer": "అధికారి సమాచారం",
        "advisory_worker": "కార్మికుని పని",
        "advisory_volunteer": "వాలంటీర్ పని"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
