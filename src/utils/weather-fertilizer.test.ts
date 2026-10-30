/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveLocationCoordinates,
  interpretWeatherCode,
  evaluateFertilizerWeather,
  generateFallbackWeatherData,
} from './weather-fertilizer.ts';

test('resolveLocationCoordinates resolves known provinces and free-form strings', () => {
  const surat = resolveLocationCoordinates('สวนปาล์ม สุราษฎร์ธานี');
  assert.equal(surat.nameTh, 'สุราษฎร์ธานี');
  assert.ok(Math.abs(surat.lat - 9.1382) < 0.1);

  const cm = resolveLocationCoordinates('Chiang Mai');
  assert.equal(cm.nameTh, 'เชียงใหม่');
  assert.ok(Math.abs(cm.lat - 18.7883) < 0.1);

  const empty = resolveLocationCoordinates('');
  assert.equal(empty.nameTh, 'กรุงเทพมหานคร');
});

test('interpretWeatherCode correctly classifies weather types', () => {
  const clear = interpretWeatherCode(0);
  assert.equal(clear.iconName, 'Sun');
  assert.equal(clear.th, 'ท้องฟ้าแจ่มใส');

  const rain = interpretWeatherCode(65);
  assert.equal(rain.iconName, 'CloudRain');
  assert.equal(rain.th, 'ฝนตกหนัก');

  const storm = interpretWeatherCode(95);
  assert.equal(storm.iconName, 'CloudLightning');
  assert.equal(storm.th, 'พายุฝนฟ้าคะนอง');
});

test('evaluateFertilizerWeather advises avoid when heavy rain or high rain probability', () => {
  const rainyDay = evaluateFertilizerWeather({
    temp: 28,
    humidity: 85,
    windSpeed: 12,
    precipitation: 5.0,
    rainProb: 80,
    weatherCode: 65,
  });

  assert.equal(rainyDay.suitability, 'avoid');
  assert.ok(rainyDay.statusBadgeTh.includes('ไม่ควรใส่ปุ๋ย'));
  assert.ok(rainyDay.soilFertilizerAdviceTh.includes('ชะลอ'));
  assert.ok(rainyDay.foliarFertilizerAdviceTh.includes('งดฉีดพ่น'));
});

test('evaluateFertilizerWeather advises caution for moderate rain or high wind', () => {
  const windyDay = evaluateFertilizerWeather({
    temp: 31,
    humidity: 60,
    windSpeed: 25,
    precipitation: 0,
    rainProb: 20,
    weatherCode: 2,
  });

  assert.equal(windyDay.suitability, 'caution');
  assert.ok(windyDay.statusBadgeTh.includes('ระมัดระวัง'));
  assert.ok(windyDay.foliarFertilizerAdviceTh.includes('ลมค่อนข้างแรง'));

  const moderateRainDay = evaluateFertilizerWeather({
    temp: 29,
    humidity: 75,
    windSpeed: 10,
    precipitation: 0.8,
    rainProb: 50,
    weatherCode: 61,
  });

  assert.equal(moderateRainDay.suitability, 'caution');
  assert.ok(moderateRainDay.soilFertilizerAdviceTh.includes('ฝังกลบ') || moderateRainDay.soilFertilizerAdviceTh.includes('พรวนกลบ'));
});

test('evaluateFertilizerWeather advises optimal when weather is clear and calm', () => {
  const goodDay = evaluateFertilizerWeather({
    temp: 29,
    humidity: 65,
    windSpeed: 8,
    precipitation: 0,
    rainProb: 10,
    weatherCode: 1,
  });

  assert.equal(goodDay.suitability, 'optimal');
  assert.ok(goodDay.statusBadgeTh.includes('เหมาะสมมาก'));
  assert.ok(goodDay.soilFertilizerAdviceTh.includes('เหมาะอย่างยิ่ง'));
});

test('generateFallbackWeatherData returns comprehensive 5-day dataset', () => {
  const fallback = generateFallbackWeatherData('สุราษฎร์ธานี', 9.1382, 99.3217);
  assert.equal(fallback.locationName, 'สุราษฎร์ธานี');
  assert.equal(fallback.isOfflineFallback, true);
  assert.equal(fallback.daily.length, 5);
  assert.ok(fallback.current.temperature > 0);
  assert.ok(fallback.advisory.headlineTh.length > 0);
});
