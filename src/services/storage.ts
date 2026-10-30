/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  FarmPlot,
  CareLogItem,
  AdminMessage,
} from '../types/index.ts';
import {
  FertilizerSchedule,
  deriveTaskStatus,
  calculateReminderDate,
} from '../utils/fertilizer-rules.ts';

const STORAGE_KEYS = {
  USER: 'soil_time_user_profile_v1',
  ALL_FARMERS: 'soil_time_all_farmers_registry_v1',
  PLOTS: 'soil_time_farm_plots_v1',
  SCHEDULES: 'soil_time_fertilizer_schedules_v1',
  LOGS: 'soil_time_care_logs_v1',
  MESSAGES: 'soil_time_admin_messages_v1',
  NOTIFICATIONS: 'soil_time_notifications_v1',
  BOOKMARKS: 'soil_time_saved_articles_v1',
  DOWNLOADS: 'soil_time_downloaded_articles_v1',
  OWNER_AUTH: 'soil_time_owner_authenticated_v1',
};

function getTodayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const todayIso = getTodayIso();
const nextWeekIso = calculateReminderDate(todayIso, 7);
const pastWeekIso = calculateReminderDate(todayIso, -5);

// Seed Thai farmers across multiple regions (Surat Thani, Chiang Mai, Suphan Buri, Phetchabun, Chanthaburi)
export const SEED_FARMERS: UserProfile[] = [
  {
    user_id: 'farmer-th-01',
    display_name: 'น้าสมชาย มีสุข',
    age: 52,
    language: 'th',
    farming_types: ['สวนยางพารา', 'สวนผลไม้ (ทุเรียน)'],
    location: 'สุราษฎร์ธานี',
    soil_problems: ['ดินเปรี้ยว (กรดจัด)', 'ดินแข็ง ดาน ดินแน่น'],
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-04-10T10:30:00Z',
  },
  {
    user_id: 'farmer-th-02',
    display_name: 'ลุงประสิทธิ์ ศรีวิชัย',
    age: 58,
    language: 'th',
    farming_types: ['สวนผลไม้ (ส้มสายน้ำผึ้ง)', 'ผักสวนครัว / ผักอินทรีย์'],
    location: 'เชียงใหม่',
    soil_problems: ['ดินขาดความอุดมสมบูรณ์ / พืชไม่กินปุ๋ย'],
    created_at: '2026-02-01T09:15:00Z',
    updated_at: '2026-04-12T14:20:00Z',
  },
  {
    user_id: 'farmer-th-03',
    display_name: 'ป้าสมร ไชยวงค์',
    age: 55,
    language: 'th',
    farming_types: ['นาข้าว'],
    location: 'สุพรรณบุรี',
    soil_problems: ['ดินดานแน่น ขาดอินทรียวัตถุ', 'น้ำขัง / ระบายน้ำไม่ดี'],
    created_at: '2026-02-18T11:00:00Z',
    updated_at: '2026-04-15T16:45:00Z',
  },
  {
    user_id: 'farmer-th-04',
    display_name: 'น้าบุญมี แสนทวี',
    age: 49,
    language: 'th',
    farming_types: ['พืชไร่ (ข้าวโพด, มันสำปะหลัง)'],
    location: 'เพชรบูรณ์',
    soil_problems: ['ดินแข็ง ดาน ดินแน่น', 'ดินเสื่อมโทรม / ขาดอินทรียวัตถุ'],
    created_at: '2026-03-05T07:30:00Z',
    updated_at: '2026-04-18T09:00:00Z',
  },
  {
    user_id: 'farmer-th-05',
    display_name: 'พี่สุดา เกียรติเจริญ',
    age: 43,
    language: 'th',
    farming_types: ['สวนผลไม้ (ทุเรียนหมอนทอง, มังคุด)'],
    location: 'จันทบุรี',
    soil_problems: ['ดินเปรี้ยว (กรดจัด)', 'พืชโตช้า ใบเหลือง ชะงักงัน'],
    created_at: '2026-03-20T13:40:00Z',
    updated_at: '2026-04-20T11:15:00Z',
  },
];

export const SEED_PLOTS: FarmPlot[] = [
  {
    plot_id: 'plot-rubber-01',
    user_id: 'farmer-th-01',
    farmer_name: 'น้าสมชาย มีสุข',
    farmer_location: 'สุราษฎร์ธานี',
    plot_name: 'แปลงยางพาราควนหิน',
    crop_type: 'สวนยางพารา',
    planting_date: '2019-05-15',
    soil_type: 'ดินร่วนปนทราย (ลูกรัง)',
    area_rai: 8,
    soil_test_results: {
      ph: 4.8,
      n_level: 'medium',
      p_level: 'low',
      k_level: 'medium',
      organic_matter_percent: 1.6,
      test_date: '2026-03-10',
      laboratory_name: 'สถานีพัฒนาที่ดินสุราษฎร์ธานี',
    },
    notes: 'หน้าดินค่อนข้างแน่นช่วงท้ายแถว มีปัญหาน้ำไหลชะหน้าดินช่วงฝนชุก',
  },
  {
    plot_id: 'plot-durian-02',
    user_id: 'farmer-th-01',
    farmer_name: 'น้าสมชาย มีสุข',
    farmer_location: 'สุราษฎร์ธานี',
    plot_name: 'สวนทุเรียนหมอนทองเนินงาม',
    crop_type: 'สวนผลไม้',
    planting_date: '2022-06-20',
    soil_type: 'ดินร่วนเหนียวภูเขา',
    area_rai: 4.5,
    soil_test_results: {
      ph: 5.8,
      n_level: 'medium',
      p_level: 'medium',
      k_level: 'high',
      organic_matter_percent: 2.8,
      test_date: '2026-02-18',
      laboratory_name: 'ศูนย์วิจัยพืชสวนสุราษฎร์ธานี',
    },
    notes: 'ยกโคกสูง 80 ซม. คลุมโคนด้วยเศษหญ้าแห้งสม่ำเสมอ รากฝอยแตกดี',
  },
  {
    plot_id: 'plot-rice-03',
    user_id: 'farmer-th-03',
    farmer_name: 'ป้าสมร ไชยวงค์',
    farmer_location: 'สุพรรณบุรี',
    plot_name: 'แปลงนาข้าว กข43 ทุ่งดอนเจดีย์',
    crop_type: 'นาข้าว',
    planting_date: '2025-11-20',
    soil_type: 'ดินเหนียวลุ่มน้ำ',
    area_rai: 15,
    soil_test_results: {
      ph: 6.0,
      n_level: 'medium',
      p_level: 'medium',
      k_level: 'medium',
      organic_matter_percent: 2.1,
      test_date: '2026-01-25',
      laboratory_name: 'ศูนย์เมล็ดพันธุ์ข้าวสุพรรณบุรี',
    },
    notes: 'ไถกลบตอซังข้าวและฉีดพ่นน้ำหมัก พด.2 ก่อนทำเทือก 15 วัน',
  },
  {
    plot_id: 'plot-corn-04',
    user_id: 'farmer-th-04',
    farmer_name: 'น้าบุญมี แสนทวี',
    farmer_location: 'เพชรบูรณ์',
    plot_name: 'ไร่ข้าวโพดหวานหุบเขาเพชร',
    crop_type: 'พืชไร่',
    planting_date: '2026-02-10',
    soil_type: 'ดินร่วนเหนียวปนลูกรัง',
    area_rai: 12,
    soil_test_results: {
      ph: 5.7,
      n_level: 'low',
      p_level: 'medium',
      k_level: 'high',
      organic_matter_percent: 1.4,
      test_date: '2026-02-05',
      laboratory_name: 'สำนักงานพัฒนาที่ดินเขต 8',
    },
    notes: 'ดินแน่นดานช่วงหน้าแล้ง เตรียมหว่านปุ๋ยพืชสดปอเทืองหลังเก็บเกี่ยว',
  },
  {
    plot_id: 'plot-orange-05',
    user_id: 'farmer-th-02',
    farmer_name: 'ลุงประสิทธิ์ ศรีวิชัย',
    farmer_location: 'เชียงใหม่',
    plot_name: 'สวนส้มสายน้ำผึ้งดอยสะเก็ด',
    crop_type: 'สวนผลไม้',
    planting_date: '2021-08-15',
    soil_type: 'ดินร่วนซุยที่ราบสูง',
    area_rai: 6,
    soil_test_results: {
      ph: 6.4,
      n_level: 'high',
      p_level: 'medium',
      k_level: 'medium',
      organic_matter_percent: 3.2,
      test_date: '2026-03-01',
      laboratory_name: 'คณะเกษตรศาสตร์ มหาวิทยาลัยเชียงใหม่',
    },
    notes: 'ใช้ปุ๋ยหมักมูลวัวนมผสมน้ำหมักชีวภาพ พด.1 ควบคุมความชื้นด้วยสปริงเกลอร์',
  },
  {
    plot_id: 'plot-durian-06',
    user_id: 'farmer-th-05',
    farmer_name: 'พี่สุดา เกียรติเจริญ',
    farmer_location: 'จันทบุรี',
    plot_name: 'สวนทุเรียนหมอนทองเขาคิชฌกูฏ',
    crop_type: 'สวนผลไม้',
    planting_date: '2020-04-12',
    soil_type: 'ดินร่วนปนทรายชายเขา',
    area_rai: 9,
    soil_test_results: {
      ph: 5.2,
      n_level: 'medium',
      p_level: 'low',
      k_level: 'high',
      organic_matter_percent: 2.3,
      test_date: '2026-03-15',
      laboratory_name: 'ศูนย์ส่งเสริมและพัฒนาอาชีพการเกษตรจันทบุรี',
    },
    notes: 'มีฝนตกชุกต่อเนื่อง ต้องระวังไฟท็อปธอราและปรับลดกรดดินด้วยโดโลไมท์',
  },
];

export const SEED_SCHEDULES: FertilizerSchedule[] = [
  {
    schedule_id: 'sched-due-today',
    user_id: 'farmer-th-01',
    farmer_name: 'น้าสมชาย มีสุข',
    plot_id: 'plot-durian-02',
    plot_name: 'สวนทุเรียนหมอนทองเนินงาม',
    fertilizer_name: 'ปุ๋ยหมักชีวภาพ พด.1 + โดโลไมท์',
    application_date: todayIso,
    quantity: 50,
    unit: 'กก.',
    reminder_at: todayIso,
    status: 'due',
    notification_status: 'delivered',
    notes: 'หว่านรอบแนวทรงพุ่มห่างโคนต้น 1 เมตร พรวนกลบเบาๆ และรดน้ำตาม',
  },
  {
    schedule_id: 'sched-future-rubber',
    user_id: 'farmer-th-01',
    farmer_name: 'น้าสมชาย มีสุข',
    plot_id: 'plot-rubber-01',
    plot_name: 'แปลงยางพาราควนหิน',
    fertilizer_name: 'สูตรบำรุงต้นและน้ำยาง 29-5-18',
    application_date: nextWeekIso,
    quantity: 120,
    unit: 'กก.',
    reminder_at: calculateReminderDate(nextWeekIso, -2),
    status: 'scheduled',
    notification_status: 'pending',
    notes: 'ตรวจความชื้นดินก่อนหว่าน หากมีฝนตกชุกให้รอจนน้ำไม่ขังผิวดิน',
  },
  {
    schedule_id: 'sched-rice-overdue',
    user_id: 'farmer-th-03',
    farmer_name: 'ป้าสมร ไชยวงค์',
    plot_id: 'plot-rice-03',
    plot_name: 'แปลงนาข้าว กข43 ทุ่งดอนเจดีย์',
    fertilizer_name: 'ปุ๋ยเคมีแต่งหน้าสูตร 46-0-0 (ยูเรีย)',
    application_date: pastWeekIso,
    quantity: 75,
    unit: 'กก.',
    reminder_at: pastWeekIso,
    status: 'overdue',
    notification_status: 'sent',
    notes: 'หว่านช่วงข้าวแตกกอ ระบายน้ำเหลือ 5 ซม. ก่อนหว่าน',
  },
  {
    schedule_id: 'sched-corn-due',
    user_id: 'farmer-th-04',
    farmer_name: 'น้าบุญมี แสนทวี',
    plot_id: 'plot-corn-04',
    plot_name: 'ไร่ข้าวโพดหวานหุบเขาเพชร',
    fertilizer_name: 'สูตร 16-16-16 รองก้นร่อง',
    application_date: todayIso,
    quantity: 100,
    unit: 'กก.',
    reminder_at: todayIso,
    status: 'due',
    notification_status: 'delivered',
    notes: 'ใส่ปุ๋ยข้างร่องต้นข้าวโพดอายุ 20 วัน แล้วพูนดินกลบโคน',
  },
  {
    schedule_id: 'sched-orange-scheduled',
    user_id: 'farmer-th-02',
    farmer_name: 'ลุงประสิทธิ์ ศรีวิชัย',
    plot_id: 'plot-orange-05',
    plot_name: 'สวนส้มสายน้ำผึ้งดอยสะเก็ด',
    fertilizer_name: 'ปุ๋ยหมักปลาชีวภาพเข้มข้น พด.2',
    application_date: calculateReminderDate(todayIso, 5),
    quantity: 30,
    unit: 'ลิตร',
    reminder_at: calculateReminderDate(todayIso, 3),
    status: 'scheduled',
    notification_status: 'pending',
    notes: 'เจือจางน้ำ 1:500 ฉีดพ่นทางดินและทรงพุ่มช่วงเช้าตรู่',
  },
  {
    schedule_id: 'sched-completed-sample',
    user_id: 'farmer-th-01',
    farmer_name: 'น้าสมชาย มีสุข',
    plot_id: 'plot-rubber-01',
    plot_name: 'แปลงยางพาราควนหิน',
    fertilizer_name: 'โดโลไมท์ปรับสภาพกรดด่าง',
    application_date: calculateReminderDate(todayIso, -20),
    quantity: 200,
    unit: 'กก.',
    reminder_at: calculateReminderDate(todayIso, -22),
    completed_at: `${calculateReminderDate(todayIso, -20)}T08:30:00Z`,
    status: 'completed',
    notification_status: 'read',
    notes: 'หว่านปรับดินสำเร็จตามแผน รอใส่ปุ๋ยเคมีรอบถัดไป',
  },
];

export const SEED_CARE_LOGS: CareLogItem[] = [
  {
    log_id: 'log-01',
    plot_id: 'plot-durian-02',
    date: calculateReminderDate(todayIso, -15),
    activity_type: 'soil_amendment',
    title: 'ใส่ปุ๋ยคอกหมักรอบโคนทุเรียน',
    details: 'ใส่ปุ๋ยคอกหมักต้นละ 5 กก. รดน้ำหมักจุลินทรีย์หน่อกล้วยเข้มข้น',
    observed_result: 'รากฝอยเริ่มแทงขาว ยอดอ่อนแตกสม่ำเสมอ ใบเขียวเป็นมัน',
  },
  {
    log_id: 'log-02',
    plot_id: 'plot-rubber-01',
    date: calculateReminderDate(todayIso, -20),
    activity_type: 'fertilizer',
    title: 'หว่านโดโลไมท์ลดกรด 200 กก.',
    details: 'หว่านทั่วแปลงยางพาราในวันที่ดินชื้น เพื่อกระตุ้นค่า pH',
    observed_result: 'ดินอ่อนตัวลง ไม่เกาะเป็นแผ่นดานแข็ง',
  },
];

export const SEED_ADMIN_MESSAGES: AdminMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'system',
    message: 'ยินดีต้อนรับสู่ศูนย์บริการเกษตรกร Soil Time สามารถส่งข้อความปรึกษาเรื่องดินและปุ๋ยกับเจ้าหน้าที่ได้ตลอด 24 ชม. เจ้าหน้าที่จะตอบกลับในเวลาทำการ (จ.-ศ. 08:30 - 17:00 น.)',
    timestamp: new Date().toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-farmer-01',
    sender: 'user',
    user_id: 'farmer-th-01',
    user_name: 'น้าสมชาย มีสุข',
    location: 'สุราษฎร์ธานี',
    message: 'สวัสดีครับ อยากทราบว่าสวนยางพาราภาคใต้ถ้าดินเป็นกรดมาก pH 4.8 ควรใส่โดโลไมท์ช่วงไหนของปีดีครับ?',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'replied',
  },
  {
    id: 'msg-farmer-01-reply',
    sender: 'admin',
    message: 'สวัสดีครับคุณสมชาย แนะนำให้หว่านโดโลไมท์ช่วงต้นฤดูฝน (พ.ค. - มิ.ย.) ขณะที่ดินมีความชื้นสม่ำเสมอ หว่านอัตรา 150-200 กก./ไร่ และเว้นระยะห่างก่อนใส่ปุ๋ยเคมีอย่างน้อย 15 วันครับ',
    timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
    status: 'read',
    reply_to: 'msg-farmer-01',
  },
  {
    id: 'msg-farmer-02',
    sender: 'user',
    user_id: 'farmer-th-03',
    user_name: 'ป้าสมร ไชยวงค์',
    location: 'สุพรรณบุรี',
    message: 'แปลงนาข้าวมีปัญหาน้ำขังระบายยาก ดินกลิ่นเหม็นเปรี้ยว ข้าวต้นแคระแกร็น ต้องแก้ยังไงคะ?',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'delivered',
  },
  {
    id: 'msg-farmer-03',
    sender: 'user',
    user_id: 'farmer-th-05',
    user_name: 'พี่สุดา เกียรติเจริญ',
    location: 'จันทบุรี',
    message: 'ทุเรียนอายุ 4 ปี ใบเริ่มมีขอบเหลืองไหม้และร่วง ไม่แน่ใจว่าขาดโพแทสเซียมหรือดินเค็ม ช่วยดูให้หน่อยค่ะ',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'sent',
  },
];

export class StorageService {
  /**
   * Current farmer profile
   */
  static getUserProfile(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static saveUserProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));
      // Automatically register or update this farmer in the system registry
      this.registerOrUpdateFarmer(profile);
    } catch (e) {
      console.warn('Failed to save user profile to localStorage', e);
    }
  }

  /**
   * System registry of all farmers (Accessible exclusively by Owner)
   */
  static getAllFarmers(): UserProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALL_FARMERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ALL_FARMERS, JSON.stringify(SEED_FARMERS));
        return SEED_FARMERS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_FARMERS;
    }
  }

  static registerOrUpdateFarmer(farmer: UserProfile): void {
    try {
      const all = this.getAllFarmers();
      const existingIdx = all.findIndex((f) => f.user_id === farmer.user_id);
      let updated: UserProfile[];
      if (existingIdx >= 0) {
        updated = all.map((f) => (f.user_id === farmer.user_id ? { ...f, ...farmer, updated_at: new Date().toISOString() } : f));
      } else {
        updated = [farmer, ...all];
      }
      localStorage.setItem(STORAGE_KEYS.ALL_FARMERS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to register farmer in all_farmers registry', e);
    }
  }

  /**
   * Plots management
   * When userId is given, filters for that user. If not given, returns for the current user.
   */
  static getPlots(userId?: string): FarmPlot[] {
    const allPlots = this.getAllPlots();
    if (userId) {
      return allPlots.filter((p) => p.user_id === userId);
    }
    const current = this.getUserProfile();
    if (current?.user_id) {
      const userPlots = allPlots.filter((p) => p.user_id === current.user_id);
      if (userPlots.length > 0) return userPlots;
      // If new farmer has no plots yet, return empty array for them
      return [];
    }
    return allPlots;
  }

  /**
   * Exclusive Owner Access: Get all farm plots across all farmers in Thailand
   */
  static getAllPlots(): FarmPlot[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLOTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.PLOTS, JSON.stringify(SEED_PLOTS));
        return SEED_PLOTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_PLOTS;
    }
  }

  static savePlots(plots: FarmPlot[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PLOTS, JSON.stringify(plots));
    } catch (e) {
      console.warn('Failed to save plots', e);
    }
  }

  static addPlot(plot: FarmPlot): FarmPlot[] {
    const all = this.getAllPlots();
    const updated = [plot, ...all.filter((p) => p.plot_id !== plot.plot_id)];
    this.savePlots(updated);
    return updated;
  }

  static updatePlot(plot: FarmPlot): FarmPlot[] {
    const all = this.getAllPlots();
    const updated = all.map((p) => (p.plot_id === plot.plot_id ? plot : p));
    this.savePlots(updated);
    return updated;
  }

  static deletePlot(plotId: string): FarmPlot[] {
    const all = this.getAllPlots();
    const updated = all.filter((p) => p.plot_id !== plotId);
    this.savePlots(updated);
    return updated;
  }

  /**
   * Schedules management
   */
  static getSchedules(userId?: string): FertilizerSchedule[] {
    const all = this.getAllSchedules();
    if (userId) {
      return all.filter((s) => s.user_id === userId);
    }
    const current = this.getUserProfile();
    if (current?.user_id) {
      const userScheds = all.filter((s) => s.user_id === current.user_id);
      if (userScheds.length > 0) return userScheds;
      return [];
    }
    return all;
  }

  /**
   * Exclusive Owner Access: Get all fertilizer schedules across all farmers in Thailand
   */
  static getAllSchedules(): FertilizerSchedule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      const raw: FertilizerSchedule[] = data ? JSON.parse(data) : SEED_SCHEDULES;
      const today = getTodayIso();
      const updated = raw.map((item) => {
        const dynamicStatus = deriveTaskStatus(item, today);
        return {
          ...item,
          status: dynamicStatus,
        };
      });
      return updated;
    } catch {
      return SEED_SCHEDULES;
    }
  }

  static saveSchedules(schedules: FertilizerSchedule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (e) {
      console.warn('Failed to save schedules', e);
    }
  }

  static addSchedule(schedule: FertilizerSchedule): FertilizerSchedule[] {
    const list = this.getAllSchedules();
    const updated = [schedule, ...list.filter((s) => s.schedule_id !== schedule.schedule_id)];
    this.saveSchedules(updated);
    return updated;
  }

  static updateSchedule(schedule: FertilizerSchedule): FertilizerSchedule[] {
    const list = this.getAllSchedules();
    const updated = list.map((s) => (s.schedule_id === schedule.schedule_id ? schedule : s));
    this.saveSchedules(updated);
    return updated;
  }

  static deleteSchedule(scheduleId: string): FertilizerSchedule[] {
    const list = this.getAllSchedules();
    const updated = list.filter((s) => s.schedule_id !== scheduleId);
    this.saveSchedules(updated);
    return updated;
  }

  /**
   * Care logs
   */
  static getCareLogs(plotId?: string): CareLogItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      const logs: CareLogItem[] = data ? JSON.parse(data) : SEED_CARE_LOGS;
      if (plotId) return logs.filter((l) => l.plot_id === plotId);
      return logs;
    } catch {
      return SEED_CARE_LOGS;
    }
  }

  static addCareLog(log: CareLogItem): CareLogItem[] {
    const logs = this.getCareLogs();
    const updated = [log, ...logs];
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save care logs', e);
    }
    return updated;
  }

  /**
   * Admin & Inquiry Messages
   */
  static getAdminMessages(userId?: string): AdminMessage[] {
    const all = this.getAllAdminMessages();
    if (!userId) {
      const current = this.getUserProfile();
      if (!current?.user_id) return all;
      userId = current.user_id;
    }
    // Return system messages or messages for this user
    return all.filter((m) => m.sender === 'system' || !m.user_id || m.user_id === userId);
  }

  /**
   * Exclusive Owner Access: Get all messages from all farmers in Thailand
   */
  static getAllAdminMessages(): AdminMessage[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(SEED_ADMIN_MESSAGES));
        return SEED_ADMIN_MESSAGES;
      }
      return JSON.parse(data);
    } catch {
      return SEED_ADMIN_MESSAGES;
    }
  }

  static saveAdminMessages(messages: AdminMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save admin messages', e);
    }
  }

  static addAdminMessage(msg: AdminMessage): AdminMessage[] {
    const msgs = this.getAllAdminMessages();
    const updated = [...msgs, msg];
    this.saveAdminMessages(updated);
    return updated;
  }

  /**
   * Owner action: reply directly to a farmer's inquiry
   */
  static replyAsOwner(targetMessageId: string, replyText: string): AdminMessage[] {
    const msgs = this.getAllAdminMessages();
    const replyMessage: AdminMessage = {
      id: `owner-reply-${Date.now()}`,
      sender: 'admin',
      message: replyText.trim(),
      timestamp: new Date().toISOString(),
      status: 'delivered',
      reply_to: targetMessageId,
    };

    // Update target message status to 'replied'
    const updated = msgs.map((m) => {
      if (m.id === targetMessageId) {
        return {
          ...m,
          status: 'replied' as const,
        };
      }
      return m;
    });

    const finalMessages = [...updated, replyMessage];
    this.saveAdminMessages(finalMessages);
    return finalMessages;
  }

  /**
   * Owner authentication & verification
   * Verified by Owner Passcode (e.g., LINE ID ktpp0602 or 15920)
   */
  static verifyOwnerPasscode(code: string): boolean {
    const clean = code.trim().toLowerCase();
    return clean === 'ktpp0602' || clean === '15920' || clean === 'admin';
  }

  static isOwnerActive(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.OWNER_AUTH) === 'true';
    } catch {
      return false;
    }
  }

  static setOwnerActive(active: boolean): void {
    try {
      if (active) {
        sessionStorage.setItem(STORAGE_KEYS.OWNER_AUTH, 'true');
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.OWNER_AUTH);
      }
    } catch (e) {
      console.warn('Failed to set owner active state', e);
    }
  }

  /**
   * Owner data export: Entire system dataset in JSON
   */
  static exportSystemData(): string {
    const data = {
      app: 'Soil Time',
      export_date: new Date().toISOString(),
      note: 'Exclusive Owner Export: All Thai Farmers, Plots, and Fertilizer Schedules',
      farmers: this.getAllFarmers(),
      plots: this.getAllPlots(),
      schedules: this.getAllSchedules(),
      messages: this.getAllAdminMessages(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Bookmarks & Downloads
   */
  static getBookmarkedArticles(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : ['art-problem-acid', 'art-science-microbiome'];
    } catch {
      return [];
    }
  }

  static toggleBookmarkArticle(articleId: string): string[] {
    const list = this.getBookmarkedArticles();
    const next = list.includes(articleId)
      ? list.filter((id) => id !== articleId)
      : [...list, articleId];
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next));
    return next;
  }

  static getDownloadedArticles(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOWNLOADS);
      return data ? JSON.parse(data) : ['art-basics-1', 'art-problem-acid', 'art-compost-bio', 'art-sampling-guide'];
    } catch {
      return [];
    }
  }

  static toggleDownloadedArticle(articleId: string): string[] {
    const list = this.getDownloadedArticles();
    const next = list.includes(articleId)
      ? list.filter((id) => id !== articleId)
      : [...list, articleId];
    localStorage.setItem(STORAGE_KEYS.DOWNLOADS, JSON.stringify(next));
    return next;
  }

  static isArticleDownloaded(articleId: string): boolean {
    return this.getDownloadedArticles().includes(articleId);
  }

  static syncOfflineQueue(): { syncedCount: number; message: string } {
    const messages = this.getAllAdminMessages();
    let synced = 0;
    const updated = messages.map((m) => {
      if (m.status === 'queued_offline') {
        synced++;
        return {
          ...m,
          status: 'sent' as const,
        };
      }
      return m;
    });
    this.saveAdminMessages(updated);
    return {
      syncedCount: synced,
      message: synced > 0 ? `ซิงก์ข้อมูลสำเร็จ ${synced} รายการ` : 'ข้อมูลทั้งหมดเป็นปัจจุบันแล้ว',
    };
  }
}
