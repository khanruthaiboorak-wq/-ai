/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WeatherCondition {
  temperature: number;
  apparentTemperature?: number;
  relativeHumidity: number;
  precipitation: number;
  precipitationProbability: number;
  windSpeed: number;
  weatherCode: number;
  weatherDescriptionTh: string;
  weatherDescriptionEn: string;
  weatherIconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudLightning' | 'CloudDrizzle' | 'Wind';
  time: string;
}

export interface DailyForecast {
  date: string;
  dayLabelTh: string;
  dayLabelEn: string;
  tempMax: number;
  tempMin: number;
  precipitationProbabilityMax: number;
  precipitationSum: number;
  weatherCode: number;
  weatherDescriptionTh: string;
  weatherIconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudLightning' | 'CloudDrizzle' | 'Wind';
  suitability: 'optimal' | 'caution' | 'avoid';
  recommendationTh: string;
  recommendationEn: string;
}

export interface FertilizerWeatherAdvice {
  suitability: 'optimal' | 'caution' | 'avoid';
  statusBadgeTh: string;
  statusBadgeEn: string;
  headlineTh: string;
  headlineEn: string;
  soilFertilizerAdviceTh: string;
  soilFertilizerAdviceEn: string;
  foliarFertilizerAdviceTh: string;
  foliarFertilizerAdviceEn: string;
  bestTimeOfDayTh: string;
  bestTimeOfDayEn: string;
  riskFactorsTh: string[];
  riskFactorsEn: string[];
  actionRecommendationTh: string;
  actionRecommendationEn: string;
}

export interface WeatherData {
  locationName: string;
  isGps: boolean;
  latitude: number;
  longitude: number;
  current: WeatherCondition;
  daily: DailyForecast[];
  advisory: FertilizerWeatherAdvice;
  lastUpdated: string;
  isOfflineFallback?: boolean;
}

// 77 Thai Provinces Coordinates with Thai and English keys
export const THAI_PROVINCES: Record<string, { lat: number; lon: number; th: string; en: string }> = {
  // Bangkok & Central
  'กรุงเทพมหานคร': { lat: 13.7563, lon: 100.5018, th: 'กรุงเทพมหานคร', en: 'Bangkok' },
  'กรุงเทพ': { lat: 13.7563, lon: 100.5018, th: 'กรุงเทพมหานคร', en: 'Bangkok' },
  'นนทบุรี': { lat: 13.8621, lon: 100.5138, th: 'นนทบุรี', en: 'Nonthaburi' },
  'ปทุมธานี': { lat: 14.0208, lon: 100.5250, th: 'ปทุมธานี', en: 'Pathum Thani' },
  'พระนครศรีอยุธยา': { lat: 14.3532, lon: 100.5684, th: 'พระนครศรีอยุธยา', en: 'Ayutthaya' },
  'อยุธยา': { lat: 14.3532, lon: 100.5684, th: 'พระนครศรีอยุธยา', en: 'Ayutthaya' },
  'อ่างทอง': { lat: 14.5896, lon: 100.4550, th: 'อ่างทอง', en: 'Ang Thong' },
  'ลพบุรี': { lat: 14.7995, lon: 100.6534, th: 'ลพบุรี', en: 'Lopburi' },
  'สิงห์บุรี': { lat: 14.8879, lon: 100.4044, th: 'สิงห์บุรี', en: 'Sing Buri' },
  'ชัยนาท': { lat: 15.1852, lon: 100.1251, th: 'ชัยนาท', en: 'Chai Nat' },
  'สระบุรี': { lat: 14.5289, lon: 100.9101, th: 'สระบุรี', en: 'Saraburi' },
  'นครนายก': { lat: 14.2069, lon: 101.2131, th: 'นครนายก', en: 'Nakhon Nayok' },
  'สมุทรปราการ': { lat: 13.5991, lon: 100.5968, th: 'สมุทรปราการ', en: 'Samut Prakan' },
  'สมุทรสาคร': { lat: 13.5475, lon: 100.2744, th: 'สมุทรสาคร', en: 'Samut Sakhon' },
  'สมุทรสงคราม': { lat: 13.4098, lon: 100.0023, th: 'สมุทรสงคราม', en: 'Samut Songkhram' },
  'สุพรรณบุรี': { lat: 14.4745, lon: 100.1177, th: 'สุพรรณบุรี', en: 'Suphan Buri' },
  'นครปฐม': { lat: 13.8196, lon: 100.0622, th: 'นครปฐม', en: 'Nakhon Pathom' },

  // Eastern
  'ชลบุรี': { lat: 13.3611, lon: 100.9847, th: 'ชลบุรี', en: 'Chon Buri' },
  'ระยอง': { lat: 12.6815, lon: 101.2816, th: 'ระยอง', en: 'Rayong' },
  'จันทบุรี': { lat: 12.6114, lon: 102.1039, th: 'จันทบุรี', en: 'Chanthaburi' },
  'ตราด': { lat: 12.2428, lon: 102.5175, th: 'ตราด', en: 'Trat' },
  'ฉะเชิงเทรา': { lat: 13.6904, lon: 101.0779, th: 'ฉะเชิงเทรา', en: 'Chachoengsao' },
  'ปราจีนบุรี': { lat: 14.0510, lon: 101.3734, th: 'ปราจีนบุรี', en: 'Prachin Buri' },
  'สระแก้ว': { lat: 13.8140, lon: 102.0585, th: 'สระแก้ว', en: 'Sa Kaeo' },

  // Northern
  'เชียงใหม่': { lat: 18.7883, lon: 98.9853, th: 'เชียงใหม่', en: 'Chiang Mai' },
  'เชียงราย': { lat: 19.9072, lon: 99.8325, th: 'เชียงราย', en: 'Chiang Rai' },
  'ลำปาง': { lat: 18.2888, lon: 99.4928, th: 'ลำปาง', en: 'Lampang' },
  'ลำพูน': { lat: 18.5745, lon: 99.0087, th: 'ลำพูน', en: 'Lamphun' },
  'แม่ฮ่องสอน': { lat: 19.3021, lon: 97.9654, th: 'แม่ฮ่องสอน', en: 'Mae Hong Son' },
  'น่าน': { lat: 18.7838, lon: 100.7782, th: 'น่าน', en: 'Nan' },
  'พะเยา': { lat: 19.1664, lon: 99.9022, th: 'พะเยา', en: 'Phayao' },
  'แพร่': { lat: 18.1446, lon: 100.1413, th: 'แพร่', en: 'Phrae' },
  'อุตรดิตถ์': { lat: 17.6201, lon: 100.0993, th: 'อุตรดิตถ์', en: 'Uttaradit' },
  'ตาก': { lat: 16.8840, lon: 99.1259, th: 'ตาก', en: 'Tak' },
  'สุโขทัย': { lat: 17.0056, lon: 99.8264, th: 'สุโขทัย', en: 'Sukhothai' },
  'พิษณุโลก': { lat: 16.8211, lon: 100.2659, th: 'พิษณุโลก', en: 'Phitsanulok' },
  'พิจิตร': { lat: 16.4428, lon: 100.3488, th: 'พิจิตร', en: 'Phichit' },
  'กำแพงเพชร': { lat: 16.4828, lon: 99.5227, th: 'กำแพงเพชร', en: 'Kamphaeng Phet' },
  'เพชรบูรณ์': { lat: 16.4190, lon: 101.1567, th: 'เพชรบูรณ์', en: 'Phetchabun' },
  'นครสวรรค์': { lat: 15.6987, lon: 100.1199, th: 'นครสวรรค์', en: 'Nakhon Sawan' },
  'อุทัยธานี': { lat: 15.3837, lon: 100.0247, th: 'อุทัยธานี', en: 'Uthai Thani' },

  // Northeastern (Isan)
  'นครราชสีมา': { lat: 14.9799, lon: 102.0978, th: 'นครราชสีมา', en: 'Nakhon Ratchasima' },
  'โคราช': { lat: 14.9799, lon: 102.0978, th: 'นครราชสีมา', en: 'Nakhon Ratchasima' },
  'ขอนแก่น': { lat: 16.4419, lon: 102.8360, th: 'ขอนแก่น', en: 'Khon Kaen' },
  'อุดรธานี': { lat: 17.4138, lon: 102.7872, th: 'อุดรธานี', en: 'Udon Thani' },
  'อุบลราชธานี': { lat: 15.2448, lon: 104.8473, th: 'อุบลราชธานี', en: 'Ubon Ratchathani' },
  'บุรีรัมย์': { lat: 14.9930, lon: 103.1029, th: 'บุรีรัมย์', en: 'Buri Ram' },
  'สุรินทร์': { lat: 14.8818, lon: 103.4936, th: 'สุรินทร์', en: 'Surin' },
  'ศรีสะเกษ': { lat: 15.1186, lon: 104.3220, th: 'ศรีสะเกษ', en: 'Si Sa Ket' },
  'ร้อยเอ็ด': { lat: 16.0538, lon: 103.6520, th: 'ร้อยเอ็ด', en: 'Roi Et' },
  'มหาสารคาม': { lat: 16.1853, lon: 103.3007, th: 'มหาสารคาม', en: 'Maha Sarakham' },
  'ชัยภูมิ': { lat: 15.8105, lon: 102.0288, th: 'ชัยภูมิ', en: 'Chaiyaphum' },
  'เลย': { lat: 17.4860, lon: 101.7223, th: 'เลย', en: 'Loei' },
  'หนองคาย': { lat: 17.8783, lon: 102.7420, th: 'หนองคาย', en: 'Nong Khai' },
  'หนองบัวลำภู': { lat: 17.2034, lon: 102.4407, th: 'หนองบัวลำภู', en: 'Nong Bua Lam Phu' },
  'บึงกาฬ': { lat: 18.3633, lon: 103.6547, th: 'บึงกาฬ', en: 'Bueng Kan' },
  'สกลนคร': { lat: 17.1612, lon: 104.1486, th: 'สกลนคร', en: 'Sakon Nakhon' },
  'นครพนม': { lat: 17.4069, lon: 104.7816, th: 'นครพนม', en: 'Nakhon Phanom' },
  'มุกดาหาร': { lat: 16.5436, lon: 104.7235, th: 'มุกดาหาร', en: 'Mukdahan' },
  'ยโสธร': { lat: 15.7926, lon: 104.1451, th: 'ยโสธร', en: 'Yasothon' },
  'อำนาจเจริญ': { lat: 15.8601, lon: 104.6258, th: 'อำนาจเจริญ', en: 'Amnat Charoen' },
  'กาฬสินธุ์': { lat: 16.4322, lon: 103.5065, th: 'กาฬสินธุ์', en: 'Kalasin' },

  // Western
  'กาญจนบุรี': { lat: 14.0228, lon: 99.5328, th: 'กาญจนบุรี', en: 'Kanchanaburi' },
  'ราชบุรี': { lat: 13.5283, lon: 99.8134, th: 'ราชบุรี', en: 'Ratchaburi' },
  'เพชรบุรี': { lat: 13.1114, lon: 99.9391, th: 'เพชรบุรี', en: 'Phetchaburi' },
  'ประจวบคีรีขันธ์': { lat: 11.8124, lon: 99.7972, th: 'ประจวบคีรีขันธ์', en: 'Prachuap Khiri Khan' },

  // Southern
  'สุราษฎร์ธานี': { lat: 9.1382, lon: 99.3217, th: 'สุราษฎร์ธานี', en: 'Surat Thani' },
  'นครศรีธรรมราช': { lat: 8.4304, lon: 99.9631, th: 'นครศรีธรรมราช', en: 'Nakhon Si Thammarat' },
  'สงขลา': { lat: 7.1756, lon: 100.6143, th: 'สงขลา', en: 'Songkhla' },
  'หาดใหญ่': { lat: 7.0084, lon: 100.4767, th: 'หาดใหญ่ (สงขลา)', en: 'Hat Yai' },
  'ภูเก็ต': { lat: 7.8804, lon: 98.3923, th: 'ภูเก็ต', en: 'Phuket' },
  'กระบี่': { lat: 8.0863, lon: 98.9063, th: 'กระบี่', en: 'Krabi' },
  'พังงา': { lat: 8.4501, lon: 98.5255, th: 'พังงา', en: 'Phang Nga' },
  'ตรัง': { lat: 7.5563, lon: 99.6114, th: 'ตรัง', en: 'Trang' },
  'พัทลุง': { lat: 7.6166, lon: 100.0740, th: 'พัทลุง', en: 'Phatthalung' },
  'ชุมพร': { lat: 10.4930, lon: 99.1800, th: 'ชุมพร', en: 'Chumphon' },
  'ระนอง': { lat: 9.9658, lon: 98.6348, th: 'ระนอง', en: 'Ranong' },
  'สตูล': { lat: 6.6238, lon: 100.0674, th: 'สตูล', en: 'Satun' },
  'ปัตตานี': { lat: 6.8675, lon: 101.2501, th: 'ปัตตานี', en: 'Pattani' },
  'ยะลา': { lat: 6.5411, lon: 101.2804, th: 'ยะลา', en: 'Yala' },
  'นราธิวาส': { lat: 6.4255, lon: 101.8253, th: 'นราธิวาส', en: 'Narathiwat' },
};

export const POPULAR_PROVINCES = [
  'สุราษฎร์ธานี',
  'เชียงใหม่',
  'นครราชสีมา',
  'ขอนแก่น',
  'กรุงเทพมหานคร',
  'สงขลา',
  'จันทบุรี',
  'นครศรีธรรมราช',
  'อุบลราชธานี',
  'กาญจนบุรี',
];

/**
 * Resolves a free-text location string to a matching Thai province and coordinates.
 */
export function resolveLocationCoordinates(locationStr?: string): { nameTh: string; nameEn: string; lat: number; lon: number } {
  if (!locationStr || !locationStr.trim()) {
    // Default to Bangkok
    return { nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok', lat: 13.7563, lon: 100.5018 };
  }

  const clean = locationStr.trim().toLowerCase();

  // 1. Direct match in THAI_PROVINCES
  for (const [key, val] of Object.entries(THAI_PROVINCES)) {
    if (clean.includes(key.toLowerCase()) || clean.includes(val.en.toLowerCase())) {
      return { nameTh: val.th, nameEn: val.en, lat: val.lat, lon: val.lon };
    }
  }

  // 2. Partial word match
  for (const [key, val] of Object.entries(THAI_PROVINCES)) {
    if (key.includes(clean) || val.en.toLowerCase().includes(clean)) {
      return { nameTh: val.th, nameEn: val.en, lat: val.lat, lon: val.lon };
    }
  }

  // Fallback to Bangkok
  return { nameTh: 'กรุงเทพมหานคร', nameEn: 'Bangkok', lat: 13.7563, lon: 100.5018 };
}

/**
 * Maps WMO Weather Code to icon and localized description
 */
export function interpretWeatherCode(code: number): {
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudRain' | 'CloudLightning' | 'CloudDrizzle' | 'Wind';
  th: string;
  en: string;
} {
  switch (code) {
    case 0:
      return { iconName: 'Sun', th: 'ท้องฟ้าแจ่มใส', en: 'Clear sky' };
    case 1:
      return { iconName: 'Sun', th: 'ท้องฟ้าโปร่งเกือบทั้งหมด', en: 'Mainly clear' };
    case 2:
      return { iconName: 'CloudSun', th: 'มีเมฆเป็นบางส่วน', en: 'Partly cloudy' };
    case 3:
      return { iconName: 'Cloud', th: 'ท้องฟ้ามีเมฆมาก', en: 'Overcast' };
    case 45:
    case 48:
      return { iconName: 'Cloud', th: 'มีหมอกหนา', en: 'Foggy' };
    case 51:
    case 53:
    case 55:
      return { iconName: 'CloudDrizzle', th: 'ฝนละอองปรอยๆ', en: 'Drizzle' };
    case 61:
      return { iconName: 'CloudRain', th: 'ฝนตกเล็กน้อย', en: 'Slight rain' };
    case 63:
      return { iconName: 'CloudRain', th: 'ฝนตกปานกลาง', en: 'Moderate rain' };
    case 65:
      return { iconName: 'CloudRain', th: 'ฝนตกหนัก', en: 'Heavy rain' };
    case 80:
    case 81:
    case 82:
      return { iconName: 'CloudRain', th: 'ฝนซู่กระจายตัว', en: 'Rain showers' };
    case 95:
      return { iconName: 'CloudLightning', th: 'พายุฝนฟ้าคะนอง', en: 'Thunderstorm' };
    case 96:
    case 99:
      return { iconName: 'CloudLightning', th: 'พายุฟ้าคะนองรุนแรง', en: 'Severe thunderstorm' };
    default:
      return { iconName: 'CloudSun', th: 'เมฆบางส่วน', en: 'Partly cloudy' };
  }
}

/**
 * Agricultural Fertilizer Advisory Logic
 * Evaluates current and forecast conditions for soil application and foliar spraying
 */
export function evaluateFertilizerWeather(
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    rainProb: number;
    weatherCode: number;
  }
): FertilizerWeatherAdvice {
  const riskFactorsTh: string[] = [];
  const riskFactorsEn: string[] = [];

  let suitability: 'optimal' | 'caution' | 'avoid' = 'optimal';

  // 1. Rain Risk (Critical factor for leaching & runoff)
  const isHeavyRainOrStorm = [65, 82, 95, 96, 99].includes(current.weatherCode) || current.precipitation > 2.0;
  const isModerateRain = [61, 63, 80, 81].includes(current.weatherCode) || current.precipitation > 0.5;

  if (isHeavyRainOrStorm || current.rainProb >= 65) {
    suitability = 'avoid';
    riskFactorsTh.push(`โอกาสเกิดฝนตกหนัก ${current.rainProb}% เสี่ยงชะล้างปุ๋ยสูญเปล่า`);
    riskFactorsEn.push(`High rain probability (${current.rainProb}%): heavy runoff & fertilizer leaching risk`);
  } else if (isModerateRain || (current.rainProb >= 35 && current.rainProb < 65)) {
    suitability = 'caution';
    riskFactorsTh.push(`โอกาสเกิดฝน ${current.rainProb}% อาจมีฝนโปรยปราย`);
    riskFactorsEn.push(`Moderate rain probability (${current.rainProb}%): caution with bare surface broadcast`);
  }

  // 2. Wind Risk (Critical factor for foliar spray)
  if (current.windSpeed > 22) {
    if (suitability === 'optimal') suitability = 'caution';
    riskFactorsTh.push(`ความเร็วลม ${Math.round(current.windSpeed)} กม./ชม. (ลมแรง ละอองปุ๋ยทางใบปลิวกระจาย)`);
    riskFactorsEn.push(`Wind speed ${Math.round(current.windSpeed)} km/h: spray drift will reduce foliar efficiency`);
  }

  // 3. Temperature & Heat Risk (Stomata closure & urea volatilization)
  if (current.temp >= 36) {
    if (suitability === 'optimal') suitability = 'caution';
    riskFactorsTh.push(`อากาศร้อนจัด (${Math.round(current.temp)}°C) ปากใบพืชปิด และปุ๋ยยูเรียอาจระเหยเป็นก๊าซ`);
    riskFactorsEn.push(`Extreme heat (${Math.round(current.temp)}°C): plant stomata close, high ammonia volatilization`);
  }

  // 4. Low Humidity / Dry Soil Risk
  if (current.humidity < 40 && current.rainProb < 20) {
    riskFactorsTh.push(`ความชื้นสัมพัทธ์ต่ำ (${current.humidity}%) ดินอาจแห้งเกินไป ต้องรดน้ำตามทันทีหลังใส่`);
    riskFactorsEn.push(`Low humidity (${current.humidity}%): dry soil requires immediate watering after fertilizer`);
  }

  // Construct recommendations based on derived suitability
  if (suitability === 'avoid') {
    return {
      suitability: 'avoid',
      statusBadgeTh: '⛔ ไม่ควรใส่ปุ๋ยวันนี้',
      statusBadgeEn: '⛔ Avoid Applying Fertilizer Today',
      headlineTh: 'สภาพอากาศเสี่ยงปุ๋ยชะล้างสูง (ฝนตก/พายุฟ้าคะนอง)',
      headlineEn: 'High Leaching Risk (Heavy Rain or Thunderstorms Expected)',
      soilFertilizerAdviceTh: 'ชะลอการหว่านปุ๋ยเม็ดทางดินทุกชนิด น้ำฝนจะชะล้างธาตุอาหารไหลทิ้งลงแหล่งน้ำหรือซึมลึกเกินรากดูดซึม',
      soilFertilizerAdviceEn: 'Hold off granular fertilizer applications. Heavy runoff will wash away nutrients before root uptake.',
      foliarFertilizerAdviceTh: 'งดฉีดพ่นปุ๋ยทางใบและฮอร์โมนโดยเด็ดขาด ละอองปุ๋ยจะถูกน้ำฝนชะล้างออกหมดสิ้นเปลืองต้นทุน',
      foliarFertilizerAdviceEn: 'Strictly avoid foliar spray and bio-extracts. Rain will rinse the solution off foliage immediately.',
      bestTimeOfDayTh: 'แนะนำรอให้ฝนทิ้งช่วง 1-2 วันก่อนเริ่มใส่ปุ๋ย',
      bestTimeOfDayEn: 'Recommend waiting 1-2 days until clear weather resumes',
      riskFactorsTh: riskFactorsTh.length > 0 ? riskFactorsTh : ['เสี่ยงฝนชะล้างหน้าดิน'],
      riskFactorsEn: riskFactorsEn.length > 0 ? riskFactorsEn : ['Soil runoff and leaching danger'],
      actionRecommendationTh: 'กดเลื่อนรอบปฏิทินใส่ปุ๋ยออกไป 1-2 วันเพื่อรอสภาพอากาศแห้งตัวพอเหมาะ',
      actionRecommendationEn: 'Postpone scheduled fertilizer tasks by 1-2 days in the calendar.',
    };
  }

  if (suitability === 'caution') {
    return {
      suitability: 'caution',
      statusBadgeTh: '⚠️ ใส่ได้ด้วยความระมัดระวัง',
      statusBadgeEn: '⚠️ Apply with Precaution',
      headlineTh: 'สภาพอากาศมีข้อจำกัดบางประการ (มีโอกาสฝนหรือลมแรง/แดดจัด)',
      headlineEn: 'Moderate Conditions (Scattered Showers, Wind, or Midday Heat)',
      soilFertilizerAdviceTh: 'หากจำเป็นต้องใส่ปุ๋ยเม็ด ให้ขุดหลุมฝังกลบหรือพรวนกลบดิน ห้ามหว่านบนผิวดินเปลือยเพื่อป้องกันฝนชะ',
      soilFertilizerAdviceEn: 'Incorporate or bury granules into soil around the canopy drip line; avoid bare topsoil broadcasting.',
      foliarFertilizerAdviceTh: current.windSpeed > 20
        ? 'ลมค่อนข้างแรง ไม่ควรฉีดพ่นปุ๋ยทางใบช่วงนี้ ละอองจะปลิวสูญเสีย'
        : 'ฉีดพ่นได้เฉพาะช่วงเช้าตรู่ (06:00 - 08:30 น.) หลีกเลี่ยงแดดเที่ยงวัน',
      foliarFertilizerAdviceEn: current.windSpeed > 20
        ? 'Gusty winds: avoid foliar spraying to prevent spray drift.'
        : 'Foliar spray only during early morning (6:00 - 8:30 AM); avoid harsh midday heat.',
      bestTimeOfDayTh: 'ช่วงเช้าตรู่ 06:00 - 08:30 น. (แดดอ่อน ลมสงบ)',
      bestTimeOfDayEn: 'Early morning 6:00 - 8:30 AM (mild sun, calm winds)',
      riskFactorsTh: riskFactorsTh.length > 0 ? riskFactorsTh : ['สภาพอากาศแปรปรวนปานกลาง'],
      riskFactorsEn: riskFactorsEn.length > 0 ? riskFactorsEn : ['Moderate weather fluctuations'],
      actionRecommendationTh: 'ตรวจสอบความชื้นในดิน หากดินแห้งมากควรรดน้ำก่อนใส่ปุ๋ย และกลบดินทุกครั้ง',
      actionRecommendationEn: 'Check soil moisture; ensure watering and proper soil covering after application.',
    };
  }

  // Optimal
  return {
    suitability: 'optimal',
    statusBadgeTh: '✅ สภาพอากาศเหมาะสมมาก',
    statusBadgeEn: '✅ Optimal Weather for Fertilizer',
    headlineTh: 'สภาพอากาศเอื้ออำนวย ดินพร้อม พืชเปิดปากใบดูดซึมธาตุอาหารได้เต็มที่',
    headlineEn: 'Excellent Weather Conditions for Nutrient Uptake',
    soilFertilizerAdviceTh: 'เหมาะอย่างยิ่งสำหรับการใส่ปุ๋ยเคมี ปุ๋ยหมัก หรือปุ๋ยคอกรอบทรงพุ่ม ดินชื้นพอดีปุ๋ยจะละลายเข้าสู่รากสม่ำเสมอ',
    soilFertilizerAdviceEn: 'Prime window for granular, organic, or compost application around the canopy drip line.',
    foliarFertilizerAdviceTh: 'เหมาะสำหรับฉีดพ่นปุ๋ยทางใบ ฮอร์โมนไข่ หรือน้ำหมักชีวภาพ ละอองกระจายตัวเกาะใบได้ดีเยี่ยม',
    foliarFertilizerAdviceEn: 'Ideal for foliar nutrients and bio-extracts. Leaves absorb solutions efficiently without drift or runoff.',
    bestTimeOfDayTh: 'เช้าตรู่ 06:00 - 09:00 น. หรือ ช่วงเย็น 16:30 - 18:00 น.',
    bestTimeOfDayEn: 'Early morning 6:00 - 9:00 AM or late afternoon 4:30 - 6:00 PM',
    riskFactorsTh: ['ไม่มีความเสี่ยงสำคัญ ดินและความชื้นเหมาะสม'],
    riskFactorsEn: ['No major weather hazards detected; ideal condition'],
    actionRecommendationTh: 'วันนี้เหมาะสำหรับดำเนินงานตามรอบปฏิทินใส่ปุ๋ยที่ถึงกำหนดได้ทันที',
    actionRecommendationEn: 'Proceed with pending fertilizer schedules today for maximum efficiency.',
  };
}

/**
 * Generates reliable offline fallback weather data for Thailand
 */
export function generateFallbackWeatherData(locationName: string, lat: number, lon: number): WeatherData {
  const currentCondition: WeatherCondition = {
    temperature: 30,
    apparentTemperature: 33,
    relativeHumidity: 68,
    precipitation: 0,
    precipitationProbability: 15,
    windSpeed: 10,
    weatherCode: 2,
    weatherDescriptionTh: 'มีเมฆเป็นบางส่วน สภาพอากาศปกติ',
    weatherDescriptionEn: 'Partly cloudy, normal tropical condition',
    weatherIconName: 'CloudSun',
    time: new Date().toISOString(),
  };

  const advisory = evaluateFertilizerWeather({
    temp: currentCondition.temperature,
    humidity: currentCondition.relativeHumidity,
    windSpeed: currentCondition.windSpeed,
    precipitation: currentCondition.precipitation,
    rainProb: currentCondition.precipitationProbability,
    weatherCode: currentCondition.weatherCode,
  });

  const dayNamesTh = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  const daily: DailyForecast[] = [0, 1, 2, 3, 4].map((offset) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offset);
    const dayIndex = d.getDay();
    const dateStr = d.toISOString().split('T')[0];

    const rainProb = offset === 1 ? 40 : offset === 3 ? 60 : 15;
    const code = rainProb > 50 ? 61 : rainProb > 30 ? 2 : 1;
    const inter = interpretWeatherCode(code);
    const suit: 'optimal' | 'caution' | 'avoid' = rainProb >= 60 ? 'avoid' : rainProb >= 35 ? 'caution' : 'optimal';

    return {
      date: dateStr,
      dayLabelTh: offset === 0 ? 'วันนี้' : offset === 1 ? 'พรุ่งนี้' : `วัน${dayNamesTh[dayIndex]}`,
      dayLabelEn: offset === 0 ? 'Today' : offset === 1 ? 'Tomorrow' : dayNamesEn[dayIndex],
      tempMax: 32 + (offset % 2),
      tempMin: 24,
      precipitationProbabilityMax: rainProb,
      precipitationSum: rainProb > 50 ? 6.5 : 0,
      weatherCode: code,
      weatherDescriptionTh: inter.th,
      weatherIconName: inter.iconName,
      suitability: suit,
      recommendationTh:
        suit === 'optimal'
          ? 'เหมาะใส่ปุ๋ย'
          : suit === 'caution'
          ? 'ระวังฝน กลบดิน'
          : 'เลี่ยงใส่ปุ๋ย',
      recommendationEn:
        suit === 'optimal' ? 'Optimal' : suit === 'caution' ? 'Caution' : 'Avoid',
    };
  });

  return {
    locationName,
    isGps: false,
    latitude: lat,
    longitude: lon,
    current: currentCondition,
    daily,
    advisory,
    lastUpdated: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    isOfflineFallback: true,
  };
}

/**
 * Fetches real weather from Open-Meteo API with timeout and fallback
 */
export async function fetchWeatherForecast(
  lat: number,
  lon: number,
  locationName: string,
  isGps: boolean = false
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(
    4
  )}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=Asia%2FBangkok`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Weather API returned status ${res.status}`);
    }

    const data = await res.json();

    const currentWmo = interpretWeatherCode(data.current?.weather_code ?? 0);
    const rainProbToday = data.daily?.precipitation_probability_max?.[0] ?? 10;

    const current: WeatherCondition = {
      temperature: Math.round(data.current?.temperature_2m ?? 30),
      relativeHumidity: Math.round(data.current?.relative_humidity_2m ?? 65),
      precipitation: data.current?.precipitation ?? 0,
      precipitationProbability: rainProbToday,
      windSpeed: Math.round(data.current?.wind_speed_10m ?? 8),
      weatherCode: data.current?.weather_code ?? 0,
      weatherDescriptionTh: currentWmo.th,
      weatherDescriptionEn: currentWmo.en,
      weatherIconName: currentWmo.iconName,
      time: data.current?.time || new Date().toISOString(),
    };

    const advisory = evaluateFertilizerWeather({
      temp: current.temperature,
      humidity: current.relativeHumidity,
      windSpeed: current.windSpeed,
      precipitation: current.precipitation,
      rainProb: current.precipitationProbability,
      weatherCode: current.weatherCode,
    });

    const dayNamesTh = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dates: string[] = data.daily?.time || [];
    const daily: DailyForecast[] = dates.slice(0, 5).map((dateStr, idx) => {
      const d = new Date(dateStr);
      const dayIndex = d.getDay();
      const code = data.daily?.weather_code?.[idx] ?? 0;
      const rainProb = data.daily?.precipitation_probability_max?.[idx] ?? 0;
      const rainSum = data.daily?.precipitation_sum?.[idx] ?? 0;
      const inter = interpretWeatherCode(code);

      let suit: 'optimal' | 'caution' | 'avoid' = 'optimal';
      if (rainProb >= 60 || [65, 82, 95, 96, 99].includes(code) || rainSum > 10) {
        suit = 'avoid';
      } else if (rainProb >= 35 || [61, 63, 80, 81].includes(code)) {
        suit = 'caution';
      }

      return {
        date: dateStr,
        dayLabelTh: idx === 0 ? 'วันนี้' : idx === 1 ? 'พรุ่งนี้' : `วัน${dayNamesTh[dayIndex]}`,
        dayLabelEn: idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dayNamesEn[dayIndex],
        tempMax: Math.round(data.daily?.temperature_2m_max?.[idx] ?? 32),
        tempMin: Math.round(data.daily?.temperature_2m_min?.[idx] ?? 24),
        precipitationProbabilityMax: rainProb,
        precipitationSum: rainSum,
        weatherCode: code,
        weatherDescriptionTh: inter.th,
        weatherIconName: inter.iconName,
        suitability: suit,
        recommendationTh:
          suit === 'optimal'
            ? 'เหมาะใส่ปุ๋ย'
            : suit === 'caution'
            ? 'ระวังฝน กลบดิน'
            : 'เลี่ยงใส่ปุ๋ย',
        recommendationEn:
          suit === 'optimal' ? 'Optimal' : suit === 'caution' ? 'Caution' : 'Avoid',
      };
    });

    return {
      locationName,
      isGps,
      latitude: lat,
      longitude: lon,
      current,
      daily,
      advisory,
      lastUpdated: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isOfflineFallback: false,
    };
  } catch (_err) {
    // Graceful fallback on network failure or offline mode
    return generateFallbackWeatherData(locationName, lat, lon);
  }
}
