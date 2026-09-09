import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        dashboard: "Live Dashboard",
        how_it_works: "How It Works"
      },
      home: {
        live_status: "System Active • Realtime Ingestion",
        tagline_prefix: "AI-Powered",
        tagline_highlight: "Early Flash Flood",
        tagline_suffix: "Defense",
        subtitle: "Protecting vulnerable mountainous terrain with multi-source sensor streams, high-resolution ERA5 rainfall modeling, and multi-lingual alerts.",
        cta_dashboard: "View Live Dashboard",
        cta_pipeline: "How It Works",
        core_title: "System Performance Core",
        core_badge: "Calibrated",
        metric_speed_val: "< 30s",
        metric_speed_lbl: "Alert Dispatch Latency",
        metric_era5_val: "ERA5",
        metric_era5_lbl: "Atmospheric Model",
        metric_roles_val: "4 Roles",
        metric_roles_lbl: "Tiered Stakeholder Action",
        metric_channels_val: "IVR / SMS",
        metric_channels_lbl: "Offline Voice Dissemination"
      },
      dashboard: {
        title: "Live Command Status",
        subtitle: "Real-time telemetry and regional alert triggers",
        your_location: "Your Current Location",
        live_feed: "Live Data Feed",
        connecting: "Connecting to Core...",
        subscribe_title: "Emergency Alert Broadcast",
        subscribe_desc: "Subscribe connected terminals to receive automated SMS and regional alerts.",
        consent: "I consent to receive automated SMS and emergency broadcast voice calls.",
        subscribe_btn: "Subscribe for Alerts",
        success: "Terminal subscribed successfully!",
        error: "Subscription failed. Please confirm consent.",
        ndma_feed: "NDMA / Official Cross-Feed",
        no_alerts: "No active government escalations reported for this sector.",
        sensor_readings: "Active Telemetry Stations",
        score: "Risk Score",
        confidence: "Confidence"
      },
      how_it_works: {
        title: "Operational Pipeline",
        subtitle: "End-to-end flow from telemetry acquisition to emergency alert broadcast.",
        step_prefix: "Stage 0",
        steps: [
          { title: "Sensing Layer", desc: "Ultrasonic sensors stream real-time water levels and culvert blockages continuously." },
          { title: "Atmospheric Ingestion", desc: "Live meteorological data fused with ERA5 precipitation reanalysis via MQTT brokers." },
          { title: "Confidence Scoring", desc: "Predictive algorithm calculates weighted risk scores calibrated against terrain slopes." },
          { title: "Threshold Tiering", desc: "Deterministic classification into Normal, Watch, Warning, and Evacuate protocols." },
          { title: "Multilingual GenAI", desc: "Role-customized advisories dynamically translated for local residents and responders." },
          { title: "Omnichannel Push", desc: "Immediate broadcast over IVR voice dialers, SMS gateways, and live command maps." }
        ]
      }
    }
  },
  hi: {
    translation: {
      nav: {
        home: "होम",
        dashboard: "लाइव डैशबोर्ड",
        how_it_works: "यह कैसे काम करता है"
      },
      home: {
        live_status: "सिस्टम सक्रिय • रियल-टाइम डेटा",
        tagline_prefix: "एआई-संचालित",
        tagline_highlight: "फ्लैश फ्लड प्रारंभिक",
        tagline_suffix: "सुरक्षा प्रणाली",
        subtitle: "सेंसर डेटा, उच्च-रिज़ॉल्यूशन ERA5 वर्षा मॉडलिंग और बहुभाषी अलर्ट के साथ पहाड़ी क्षेत्रों की सुरक्षा।",
        cta_dashboard: "लाइव डैशबोर्ड देखें",
        cta_pipeline: "कार्यप्रणाली समझें",
        core_title: "सिस्टम प्रदर्शन स्थिति",
        core_badge: "कैलिब्रेटेड",
        metric_speed_val: "< 30 से.",
        metric_speed_lbl: "अलर्ट जारी करने का समय",
        metric_era5_val: "ERA5",
        metric_era5_lbl: "वायुमंडलीय मॉडल",
        metric_roles_val: "4 भूमिकाएं",
        metric_roles_lbl: "विशिष्ट कार्रवाई योजना",
        metric_channels_val: "IVR / SMS",
        metric_channels_lbl: "ऑफ़लाइन वॉयस प्रसारण"
      },
      dashboard: {
        title: "लाइव कमांड स्थिति",
        subtitle: "वास्तविक समय टेलीमेट्री और क्षेत्रीय आपातकालीन अलर्ट",
        your_location: "आपका वर्तमान स्थान",
        live_feed: "लाइव डेटा कनेक्टेड",
        connecting: "सिस्टम से जुड़ रहा है...",
        subscribe_title: "आपातकालीन अलर्ट प्रसारण",
        subscribe_desc: "स्वचालित एसएमएस और क्षेत्रीय अलर्ट प्राप्त करने के लिए अपना डिवाइस पंजीकृत करें।",
        consent: "मैं आपातकालीन एसएमएस और वॉयस कॉल अलर्ट प्राप्त करने की सहमति देता/देती हूँ।",
        subscribe_btn: "अलर्ट के लिए सब्सक्राइब करें",
        success: "सफलतापूर्वक सब्सक्राइब किया गया!",
        error: "सब्सक्रिप्शन विफल। कृपया सहमति बॉक्स चेक करें।",
        ndma_feed: "NDMA / आधिकारिक अलर्ट फ़ीड",
        no_alerts: "इस क्षेत्र के लिए कोई आधिकारिक चेतावनी जारी नहीं की गई है।",
        sensor_readings: "सक्रिय टेलीमेट्री स्टेशन",
        score: "जोखिम स्कोर",
        confidence: "सटीकता"
      },
      how_it_works: {
        title: "सिस्टम कार्यप्रणाली",
        subtitle: "सेंसर डेटा संग्रहण से लेकर आपातकालीन प्रसारण तक की प्रक्रिया।",
        step_prefix: "चरण 0",
        steps: [
          { title: "सेंसिंग स्तर", desc: "अल्ट्रासोनिक सेंसर लगातार जल स्तर और रुकावटों की रिपोर्ट करते हैं।" },
          { title: "वायुमंडलीय डेटा संकलन", desc: "MQTT के माध्यम से ERA5 वर्षा डेटा को लाइव सेंसर के साथ जोड़ा जाता है।" },
          { title: "जोखिम मूल्यांकन", desc: "पहाड़ी ढलानों के आधार पर एल्गोरिदम जोखिम स्कोर और विश्वसनीयता निर्धारित करता है।" },
          { title: "चेतावनी स्तर वर्गीकरण", desc: "डेटा को सामान्य, निगरानी, चेतावनी और खाली करने के स्तरों में विभाजित किया जाता है।" },
          { title: "बहुभाषी एआई सलाह", desc: "अधिकारियों और नागरिकों के लिए उनकी स्थानीय भाषा में विशेष सलाह तैयार होती है।" },
          { title: "त्वरित अलर्ट डिलीवरी", desc: "आईवीआर वॉयस कॉल, एसएमएस और लाइव मैप के माध्यम से तुरंत अलर्ट भेजा जाता है।" }
        ]
      }
    }
  },
  te: {
    translation: {
      nav: {
        home: "హోమ్",
        dashboard: "లైవ్ డాష్‌బోర్డ్",
        how_it_works: "ఇది ఎలా పనిచేస్తుంది"
      },
      home: {
        live_status: "సిస్టమ్ క్రియాశీలం • రియల్-టైమ్ డేటా",
        tagline_prefix: "AI-ఆధారిత",
        tagline_highlight: "ఆకస్మిక వరద ముందస్తు",
        tagline_suffix: "రక్షణ వ్యవస్థ",
        subtitle: "సెన్సార్ డేటా, అధిక-రిజల్యూషన్ ERA5 వర్షపాత మోడలింగ్ మరియు బహుభాషా హెచ్చరికలతో కొండ ప్రాంతాల రక్షణ.",
        cta_dashboard: "లైవ్ డాష్‌బోర్డ్ చూడండి",
        cta_pipeline: "సిస్టమ్ విధానం",
        core_title: "సిస్టమ్ పనితీరు",
        core_badge: "కాలిబ్రేట్ చేయబడింది",
        metric_speed_val: "< 30 సె.",
        metric_speed_lbl: "హెచ్చరిక జారీ సమయం",
        metric_era5_val: "ERA5",
        metric_era5_lbl: "వాతావరణ మోడల్",
        metric_roles_val: "4 పాత్రలు",
        metric_roles_lbl: "నిర్దిష్ట కార్యాచరణ",
        metric_channels_val: "IVR / SMS",
        metric_channels_lbl: "ఆఫ్‌లైన్ వాయిస్ ప్రసారం"
      },
      dashboard: {
        title: "లైవ్ కమాండ్ స్థితి",
        subtitle: "రియల్-టైమ్ టెలిమెట్రీ మరియు ప్రాంతీయ హెచ్చరికలు",
        your_location: "మీ ప్రస్తుత స్థానం",
        live_feed: "లైవ్ డేటా అనుసంధానించబడింది",
        connecting: "సిస్టమ్‌కి కనెక్ట్ అవుతోంది...",
        subscribe_title: "అత్యవసర హెచ్చరికల నమోదు",
        subscribe_desc: "ఆటోమేటెడ్ SMS మరియు ప్రాంతీయ హెచ్చరికలను స్వీకరించడానికి మీ పరికరాన్ని నమోదు చేయండి.",
        consent: "అత్యవసర SMS మరియు వాయిస్ కాల్స్ అందుకోవడానికి నేను అంగీకరిస్తున్నాను.",
        subscribe_btn: "హెచ్చరికల కోసం నమోదు చేయండి",
        success: "విజయవంతంగా నమోదు చేయబడింది!",
        error: "నమోదు విఫలమైంది. దయచేసి అంగీకారాన్ని తనిఖీ చేయండి.",
        ndma_feed: "NDMA / అధికారిక అలర్ట్ ఫీడ్",
        no_alerts: "ఈ ప్రాంతానికి ఎటువంటి అధికారిక హెచ్చరికలు లేవు.",
        sensor_readings: "క్రియాశీల టెలిమెట్రీ స్టేషన్లు",
        score: "ప్రమాద స్కోరు",
        confidence: "ఖచ్చితత్వం"
      },
      how_it_works: {
        title: "కార్యాచరణ విధానం",
        subtitle: "సెన్సార్ సేకరణ నుండి అత్యవసర హెచ్చరిక ప్రసారం వరకు సమగ్ర ప్రక్రియ.",
        step_prefix: "దశ 0",
        steps: [
          { title: "సెన్సింగ్ వ్యవస్థ", desc: "అల్ట్రాసోనిక్ సెన్సార్లు నీటి మట్టం మరియు ప్రవాహ అడ్డంకులను నిరంతరం నివేదిస్తాయి." },
          { title: "వాతావరణ సమాచార సేకరణ", desc: "ERA5 వర్షపాత డేటాను MQTT ద్వారా సెన్సార్ సమాచారంతో అనుసంధానిస్తారు." },
          { title: "ప్రమాద తీవ్రత అంచనా", desc: "భౌగోళిక వాలుల ఆధారంగా అల్గారిథమ్ రిస్క్ స్కోర్‌ను గణిస్తుంది." },
          { title: "హెచ్చరిక వర్గీకరణ", desc: "డేటాను సాధారణ, పర్యవేక్షణ, హెచ్చరిక మరియు తరలింపు దశలుగా వర్గీకరిస్తారు." },
          { title: "బహుభాషా AI సలహా", desc: "అధికారులు మరియు పౌరుల కోసం వారి స్థానిక భాషలో మార్గదర్శకాలు సిద్ధమవుతాయి." },
          { title: "తక్షణ ప్రసారం", desc: "IVR వాయిస్ కాల్స్, SMS మరియు లైవ్ మ్యాప్ ద్వారా క్షణాల్లో సమాచారం చేరుతుంది." }
        ]
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;