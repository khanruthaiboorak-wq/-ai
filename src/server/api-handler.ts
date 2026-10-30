/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export async function handleGeminiChat(body: {
  message: string;
  conversationHistory?: Array<{ sender: string; text: string }>;
  userProfile?: {
    display_name?: string;
    farming_types?: string[];
    soil_problems?: string[];
    location?: string;
    language?: string;
  };
}) {
  const { message, conversationHistory = [], userProfile = {} } = body;
  const ai = getGenAI();

  const lang = userProfile.language || 'th';
  const name = userProfile.display_name || 'เกษตรกร';
  const crops = (userProfile.farming_types || []).join(', ') || 'ทั่วไป';
  const problems = (userProfile.soil_problems || []).join(', ') || 'ไม่มีระบุ';
  const location = userProfile.location || 'ประเทศไทย';

  const systemPrompt = `คุณคือ "Soil Time AI" ผู้ช่วยผู้เชี่ยวชาญด้านดิน ปุ๋ย และการเกษตรสำหรับเกษตรกรไทย ภายใต้คำขวัญ "ดินดี เกษตรกรยิ้มได้"
บริบทของเกษตรกรที่สนทนาด้วย:
- ชื่อที่เกษตรกรต้องการให้เรียก: ${name}
- แปลงพืชที่ดูแล: ${crops}
- ปัญหาดินที่พบ: ${problems}
- พื้นที่เพาะปลูก: ${location}
- ภาษาที่ใช้ตอบ: ${lang === 'zh' ? 'ภาษาจีน (中文)' : lang === 'en' ? 'ภาษาอังกฤษ (English)' : 'ภาษาไทย (สุภาพ เป็นกันเอง อ่านง่าย สไตล์พี่น้องเกษตรกร)'}

แนวทางการตอบ:
1. ตอบด้วยภาษาที่เข้าใจง่าย สุภาพ เป็นกันเอง หลีกเลี่ยงศัพท์เทคนิคที่ยากเกินไป หากมีคำวิชาการให้อธิบายความหมายกำกับสั้นๆ
2. นำข้อมูลพืชและปัญหาดินที่ผู้ใช้ระบุมาปรับคำแนะนำให้ตรงจุดเสมอ
3. หากข้อมูลไม่เพียงพอ ให้ถามเพิ่มเติมอย่างสุภาพแทนการคาดเดา
4. ให้คำแนะนำที่ปฏิบัติได้จริง เช่น วิธีทำปุ๋ยหมักชีวภาพ การใช้โดโลไมท์แก้ดินเปรี้ยว การใส่ปุ๋ยรอบทรงพุ่ม และการลดต้นทุน
5. ไม่โฆษณาขายสินค้า และไม่กล่าวอ้างว่าผลผลิตจะเพิ่มขึ้น 100% อย่างเกินจริง`;

  if (!ai) {
    // Intelligent local fallback when API key is not configured or offline
    return generateFallbackAdvice(message, crops, problems, lang);
  }

  try {
    const formattedHistory = conversationHistory.slice(-6).map((item) => ({
      role: item.sender === 'user' ? 'user' : 'model',
      parts: [{ text: item.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: `สวัสดีครับคุณ ${name} Soil Time ยินดีช่วยดูแลดินและพืชครับ มีข้อสงสัยเรื่องใดสอบถามได้เลยครับ` }] },
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] },
      ],
    });

    return {
      text: response.text || 'ขออภัยครับ ขณะนี้ระบบกำลังประมวลผลคำตอบ โปรดลองใหม่อีกครั้ง',
      source: 'gemini-3.8-flash',
    };
  } catch (error: any) {
    console.error('Gemini API call failed, falling back to expert knowledge base:', error);
    return generateFallbackAdvice(message, crops, problems, lang);
  }
}

export async function handleSoilImageAnalysis(body: {
  imageBase64: string;
  mimeType?: string;
  description?: string;
  cropType?: string;
}) {
  const { imageBase64, mimeType = 'image/jpeg', description = '', cropType = '' } = body;
  const ai = getGenAI();

  const disclaimer = `\n\n⚠️ ข้อสังเกตเบื้องต้น: ภาพถ่ายเพียงอย่างเดียวไม่สามารถยืนยันค่าความเป็นกรด-ด่าง (pH), ปริมาณธาตุอาหาร N-P-K หรือผลตรวจดินได้อย่างแม่นยำ แนะนำส่งตัวอย่างดินตรวจทางห้องปฏิบัติการกับสถานีพัฒนาที่ดินเพื่อผลตรวจที่สมบูรณ์ที่สุด`;

  if (!ai) {
    return {
      analysis: `จากการสังเกตภาพเบื้องต้น${cropType ? ` ในแปลง ${cropType}` : ''}:
1. ลักษณะหน้าดิน: สังเกตเห็นโครงสร้างเนื้อดินและการกระจายตัวของอินทรียวัตถุเบื้องต้น
2. ข้อแนะนำการดูแล: ควรพรวนดินเบาๆ เพิ่มปุ๋ยคอกหรือปุ๋ยหมักชีวภาพ พด.1 เพื่อปรับโครงสร้างดินให้อุ้มน้ำและระบายอากาศได้ดีขึ้น
3. การสังเกตใบพืช: หากใบมีสีเขียวสม่ำเสมอแสดงว่าการดูดซึมอาหารยังปกติ หากปลายใบเหลืองอาจเกิดจากความชื้นมากเกินหรือขาดไนโตรเจน` + disclaimer,
      source: 'local_expert_heuristics',
      disclaimer,
    };
  }

  try {
    const prompt = `คุณคือผู้เชี่ยวชาญการเกษตร Soil Time กรุณาวิเคราะห์ภาพถ่ายดินหรือใบพืชนี้อย่างละเอียดและเป็นประโยชน์ต่อเกษตรกร:
คำอธิบายเพิ่มเติมจากเกษตรกร: "${description}"
พืชที่ปลูก: "${cropType}"

กรุณาให้ข้อมูลตามโครงสร้างนี้:
1. สิ่งที่สังเกตเห็นจากภาพ (ลักษณะดิน สีดิน สภาพความชื้น หรือสภาพใบพืช)
2. ปัญหาหรือความเสี่ยงที่อาจเกิดขึ้น (เช่น ดินแน่นทึบ ขาดอินทรียวัตถุ น้ำขัง หรืออาการขาดธาตุอาหาร)
3. วิธีแก้ไขและแนวทางปรับปรุงดินเบื้องต้นที่ทำได้จริงและประหยัดต้นทุน
ตอบด้วยภาษาไทยที่สุภาพ เข้าใจง่าย และให้กำลังใจเกษตรกร`;

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
    });

    return {
      analysis: (response.text || '') + disclaimer,
      source: 'gemini-3.8-flash',
      disclaimer,
    };
  } catch (err: any) {
    console.error('Image analysis error:', err);
    return {
      analysis: `จากการสังเกตภาพเบื้องต้น${cropType ? ` ในแปลง ${cropType}` : ''}:
- สังเกตเห็นลักษณะหน้าดิน ควรระวังการอัดแน่นของเม็ดดิน
- แนะนำให้เพิ่มการคลุมดินด้วยเศษใบไม้หรือฟางข้าวเพื่อรักษาความชื้นและสร้างบ้านให้จุลินทรีย์ดิน` + disclaimer,
      source: 'local_fallback',
      disclaimer,
    };
  }
}

function generateFallbackAdvice(message: string, crops: string, problems: string, lang: string): { text: string; source: string } {
  const lower = message.toLowerCase();

  if (lower.includes('ดินแข็ง') || lower.includes('ดินดาน') || lower.includes('ร่วน') || lower.includes('hard')) {
    return {
      text: `สำหรับปัญหาดินแข็งหรือดินดานในแปลง (${crops}):\n\n1. เพิ่มอินทรียวัตถุ: ใส่ปุ๋ยหมักชีวภาพหรือปุ๋ยคอกหมักอัตรา 500-1,000 กก./ไร่ อินทรียวัตถุจะทำหน้าที่เป็นกาวชีวภาพช่วยคลายเม็ดดินที่แน่นทึบ\n2. ปลูกพืชตระกูลถั่วคลุมดิน: เช่น ถั่วพร้า ปอเทือง หรือซีรูเลียม รากของพืชเหล่านี้จะชอนไชระเบิดชั้นดินดานตามธรรมชาติ\n3. ห้ามไถพรวนตอนดินเปียกแฉะเด็ดขาด เพราะจะทำให้ดินยิ่งแน่นตัวเหมือนดินเหนียวปั้นหม้อครับ`,
      source: 'local_expert_knowledge',
    };
  }

  if (lower.includes('เปรี้ยว') || lower.includes('กรด') || lower.includes('ph') || lower.includes('acid')) {
    return {
      text: `คำแนะนำการแก้ปัญหาดินเปรี้ยวจัด (ดินกรด):\n\n1. ตรวจวัดค่า pH ดิน ค่าที่เหมาะกับพืชส่วนใหญ่คือ 5.5 - 6.5\n2. หาก pH ต่ำกว่า 5.0 พืชจะดูดฟอสฟอรัสไม่ได้ ให้ใช้ "โดโลไมท์" หรือ "ปูนมาร์ล" หว่านอัตรา 150-250 กก./ไร่\n3. ข้อควรระวังสำคัญ: หว่านโดโลไมท์ทิ้งไว้ในดินที่มีความชื้นอย่างน้อย 10-15 วัน แล้วจึงค่อยใส่ปุ๋ยเคมี ห้ามใส่พร้อมกับปุ๋ยยูเรียวันเดียวกัน เพราะจะเกิดปฏิกิริยาระเหยสูญเสียไนโตรเจนครับ`,
      source: 'local_expert_knowledge',
    };
  }

  if (lower.includes('ปุ๋ยหมัก') || lower.includes('ปุ๋ยอัดเม็ด') || lower.includes('ลดต้นทุน') || lower.includes('compost')) {
    return {
      text: `สูตรทำปุ๋ยหมักชีวภาพลดต้นทุน 40%:\n\n1. วัตถุดิบ: ซากพืช/ใบไม้แห้ง 3 ส่วน + มูลสัตว์ (ขี้วัว/ขี้ไก่) 1 ส่วน + สารเร่งซุปเปอร์ พด.1\n2. วิธีหมัก: คลุกเคล้า รดน้ำให้ความชื้นประมาณ 60% (กำติดมือเป็นก้อนแต่ไม่มีน้ำหยด) กองสูง 1-1.2 เมตร\n3. กลับกองทุก 7-10 วัน ประมาณ 30-45 วัน ปุ๋ยจะเย็นสนิท มีกลิ่นหอมของผืนป่า นำไปใช้ได้ทันที หรือนำไปเข้าเครื่องอัดเม็ดเพื่อเก็บไว้ใช้ได้นานครับ`,
      source: 'local_expert_knowledge',
    };
  }

  if (lower.includes('ใส่ปุ๋ยเมื่อไร') || lower.includes('เวลา') || lower.includes('ช่วงไหน') || lower.includes('timing')) {
    return {
      text: `หลักการเลือกเวลาใส่ปุ๋ยที่พืชกินได้คุ้มค่าที่สุด:\n\n1. ใส่ช่วงดินมีความชื้นสม่ำเสมอ เช่น ต้นฤดูฝน (พ.ค.-มิ.ย.) และปลายฤดูฝน (ก.ย.-ต.ค.)\n2. ห้ามใส่ในวันที่ฝนตกหนักน้ำหลาก เพราะปุ๋ยจะถูกชะล้างลงแหล่งน้ำ\n3. ห้ามใส่บนดินแห้งแล้งจัดกลางแดดจ้า เพราะปุ๋ยเคมีจะระเหยเป็นก๊าซสูญเปล่า\n4. หว่านตามแนวทรงพุ่มด้านนอก ซึ่งเป็นจุดที่มีรากฝอยดูดซึมอาหารหนาแน่นที่สุดครับ`,
      source: 'local_expert_knowledge',
    };
  }

  return {
    text: `สวัสดีครับ Soil Time ยินดีให้คำแนะนำสำหรับการดูแลแปลง ${crops}:\n\nสำหรับการปรับปรุงดินอย่างยั่งยืน แนะนำ 3 เสาหลัก:\n1. เติมอินทรียวัตถุสม่ำเสมอ เพื่อฟื้นฟูโครงสร้างดินและเป็นอาหารให้จุลินทรีย์\n2. ตรวจสอบค่า pH ดินให้อยู่ระหว่าง 5.5-6.5 เพื่อให้พืชดูดกินปุ๋ยได้ครบทุกธาตุ\n3. วางแผนใส่ปุ๋ยตามรอบในปฏิทินของแอป และตรวจสอบความชื้นดินก่อนใส่ทุกครั้งครับ\n\nหากมีข้อสงสัยเฉพาะเจาะจงเรื่องโรคพืช สูตรปุ๋ย หรือส่งภาพใบพืชมาให้วิเคราะห์ได้เลยครับ!`,
    source: 'local_expert_knowledge',
  };
}
