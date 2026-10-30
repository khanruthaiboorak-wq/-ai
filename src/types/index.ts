/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaskStatus, NotificationStatus } from '../utils/fertilizer-rules.ts';

export type Language = 'th' | 'en' | 'zh';
export type FontScale = 'normal' | 'large' | 'xlarge';

export interface UserProfile {
  user_id: string;
  display_name: string;
  age: number | string;
  language: Language;
  farming_types: string[];
  location: string;
  soil_problems: string[];
  font_scale?: FontScale;
  created_at: string;
  updated_at: string;
}

export interface SoilTestResult {
  ph: number;
  n_level: 'low' | 'medium' | 'high' | 'not_tested';
  p_level: 'low' | 'medium' | 'high' | 'not_tested';
  k_level: 'low' | 'medium' | 'high' | 'not_tested';
  organic_matter_percent?: number;
  test_date?: string;
  laboratory_name?: string;
}

export interface FarmPlot {
  plot_id: string;
  user_id: string;
  farmer_name?: string;
  farmer_location?: string;
  plot_name: string;
  crop_type: string;
  planting_date: string; // ISO 8601 YYYY-MM-DD
  soil_type: string; // e.g. 'ดินร่วน', 'ดินเหนียว', 'ดินทราย', 'ดินลูกรัง'
  area_rai: number;
  soil_test_results?: SoilTestResult;
  notes?: string;
  photo_url?: string;
}

export interface CareLogItem {
  log_id: string;
  plot_id: string;
  date: string;
  activity_type: 'fertilizer' | 'soil_amendment' | 'watering' | 'observation';
  title: string;
  details: string;
  observed_result?: string;
  photo_url?: string;
}

export interface NotificationItem {
  notification_id: string;
  user_id: string;
  schedule_id: string;
  title: string;
  message: string;
  scheduled_at: string;
  notification_status: NotificationStatus;
  channel: 'in_app' | 'browser_push' | 'system';
  read_at?: string | null;
  synced_at?: string;
}

export interface AdminMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  user_id?: string;
  user_name?: string;
  location?: string;
  message: string;
  timestamp: string;
  status: 'queued_offline' | 'sent' | 'delivered' | 'read' | 'replied';
  reply_to?: string;
}

export interface SoilArticle {
  id: string;
  category: string;
  title: string;
  read_time: string;
  excerpt: string;
  content: string[];
  key_points: string[];
  dos_and_donts?: { dos: string[]; donts: string[] };
  suitable_crops: string[];
  tags: string[];
  illustration_type: 'texture' | 'ph' | 'compost' | 'rubber' | 'test' | 'science';
}

export interface BioscienceCompound {
  id: string;
  name_th: string;
  name_en: string;
  formula: string;
  pubchem_cid: number;
  molecular_weight: string;
  smiles: string;
  category: 'mineral' | 'nitrogen' | 'phosphorus' | 'potassium' | 'organic_acid';
  agricultural_role: string;
  reaction_in_soil: string;
  benefits_to_crop: string;
  cautions: string;
}
