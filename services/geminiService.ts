import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import { Ad, RequestForQuotation, MarketAnalysis, NegotiationSession, PartnershipScore } from "../types";

// Initialize the Google AI client with the API key from environment variables.
// For Vite, environment variables must be prefixed with VITE_ to be exposed to the client.
const apiKey = import.meta.env.VITE_API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.error("VITE_API_KEY is not set in your .env file. AI features will be disabled.");
}

const model = 'gemini-2.5-flash';
const disabledError = "ميزة الذكاء الاصطناعي معطلة. يرجى التأكد من إضافة مفتاح API.";

export const generateAdFromKeywords = async (keywords: string): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const prompt = `أنت خبير تسويق إعلانات جملة في العراق. مهمتك هي كتابة وصف إعلان جذاب ومقنع باللغة العربية واللهجة العراقية الدارجة لجذب انتباه أصحاب المحلات والتجار.
    استخدم الكلمات التالية كنقطة انطلاق: "${keywords}"
    
    الرجاء إنشاء وصف إعلان احترافي يتضمن:
    1.  عنوان جذاب وواضح.
    2.  مقدمة قصيرة ومغرية.
    3.  تفاصيل المنتج (المواصفات، الجودة، بلد الصنع إن وجد).
    4.  الفوائد التي سيحصل عليها المشتري.
    5.  تأكيد على أن البيع بالجملة وتحديد أقل كمية للطلب إن أمكن.
    6.  دعوة لاتخاذ إجراء (مثل: "اتصل الآن"، "الكمية محدودة").
    
    افصل بين العنوان والوصف بـ "---".`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating ad content:", error);
    return "حدث خطأ أثناء محاولة إنشاء الإعلان. الرجاء المحاولة مرة أخرى.";
  }
};

export const parseSearchQuery = async (query: string): Promise<any> => {
  if (!ai) return { error: disabledError };
  try {
    const prompt = `حلل طلب البحث التالي من مستخدم عراقي يبحث في سوق جملة: "${query}".
    استخرج المعلومات التالية وأرجعها بصيغة JSON فقط بدون أي نص إضافي:
    -   "product": اسم المنتج أو الفئة المطلوبة.
    -   "location": اسم المحافظة العراقية إن وجدت.
    -   "attributes": أي صفات أو كلمات مفتاحية أخرى (مثل "جديد"، "رخيص"، "تركي").
    
    مثال: إذا كان الإدخال "اريد ملابس اطفال صيفية في بغداد"، يكون الإخراج:
    {
      "product": "ملابس اطفال",
      "location": "بغداد",
      "attributes": ["صيفية"]
    }`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            product: { type: Type.STRING },
            location: { type: Type.STRING },
            attributes: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
      },
    });

    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error parsing search query:", error);
    return { error: "حدث خطأ أثناء تحليل بحثك. الرجاء استخدام الفلاتر اليدوية." };
  }
};

export const searchByImage = async (imagePart: Part): Promise<any> => {
    if (!ai) return { error: disabledError };
    try {
        const textPart = {
            text: `أنت خبير في سوق الجملة العراقي. حلل صورة المنتج هذه. استجب فقط بكائن JSON قابل للتحليل يحتوي على "product" (اسم المنتج أو الفئة) و "attributes" (مجموعة من الكلمات المفتاحية ذات الصلة). لا تضف أي نص آخر أو تنسيق markdown. مثال: {"product": "تمر", "attributes": ["كراتين", "تغليف جيد"]}`
        };

        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        product: {
                            type: Type.STRING,
                            description: "اسم أو فئة المنتج المحدد في الصورة."
                        },
                        attributes: {
                            type: Type.ARRAY,
                            description: "قائمة بالكلمات المفتاحية أو الميزات ذات الصلة الملاحظة في الصورة.",
                            items: { type: Type.STRING }
                        },
                    },
                    required: ["product", "attributes"]
                },
            },
        });
        
        let jsonStr = response.text.trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error analyzing image:", error);
        return { error: "حدث خطأ أثناء تحليل الصورة. الرجاء المحاولة مرة أخرى." };
    }
};

export const generateAdOptimizationAdvice = async (ad: Ad): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const prompt = `أنت خبير تسويق إعلانات جملة في العراق. مهمتك هي تحليل الإعلان التالي وتقديم نصائح قابلة للتنفيذ لتحسينه وزيادة جاذبيته للمشترين.
    
    بيانات الإعلان:
    - العنوان: "${ad.title}"
    - الوصف: "${ad.description}"
    - السعر: "${ad.price}"
    - عدد الصور: ${ad.images.length}
    - عدد المشاهدات: ${ad.views}
    - عدد مرات الحفظ: ${ad.saves}

    قدم نصائحك باللهجة العراقية الدارجة على شكل نقاط واضحة وموجزة. ركز على:
    1.  **تحسين العنوان:** هل هو جذاب وواضح؟ هل يمكن إضافة كلمات مفتاحية أفضل؟
    2.  **تحسين الوصف:** هل هو مقنع؟ هل ينقصه تفاصيل مهمة (مثل بلد الصنع، الماركة، أقل كمية)؟
    3.  **تحليل السعر:** هل السعر مذكور بوضوح؟ (لا تقم بتحليل مدى تنافسية السعر، فقط وضوحه).
    4.  **نصيحة عامة:** بناءً على البيانات، قدم نصيحة إضافية لزيادة التفاعل مع الإعلان.

    اجعل ردك إيجابياً ومساعداً.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model,
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating ad optimization advice:", error);
    return "حدث خطأ أثناء محاولة تحليل الإعلان. الرجاء المحاولة مرة أخرى.";
  }
};

export const generatePricingAdvice = async (productName: string, myPrice: number, competitorPrices: number[]): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const prompt = `أنت مستشار أعمال خبير في السوق العراقي.
    أنا تاجر أبيع منتج "${productName}" بسعر ${myPrice.toLocaleString('ar-IQ')} دينار.
    أسعار المنافسين لنفس المنتج هي: ${competitorPrices.map(p => p.toLocaleString('ar-IQ')).join('، ')} دينار.
    
    قدم لي نصيحة استراتيجية موجزة باللهجة العراقية حول تسعيري. هل هو مناسب؟ هل يجب أن أغيره؟ ولماذا؟
    اجعل النصيحة قصيرة ومركزة وقابلة للتنفيذ.`;

    const response: GenerateContentResponse = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating pricing advice:", error);
    return "حدث خطأ أثناء تحليل الأسعار.";
  }
};

export const generateDemandAdvice = async (hotspots: { province: string, count: number }[]): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const hotspotsText = hotspots.map(h => `${h.province} (${h.count} طلبات)`).join('، ');
    const prompt = `أنت محلل بيانات سوق خبير بالسوق العراقي.
    بناءً على بيانات الطلبات الأخيرة، هذه هي المحافظات الأكثر طلباً حالياً: ${hotspotsText}.
    
    قدم لي نصيحة استراتيجية موجزة باللهجة العراقية حول كيفية الاستفادة من هذه المعلومات. أين يجب أن أركز جهودي في التوزيع والتسويق؟
    اجعل النصيحة قصيرة ومركزة وقابلة للتنفيذ.`;

    const response: GenerateContentResponse = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating demand advice:", error);
    return "حدث خطأ أثناء تحليل الطلب.";
  }
};

export const generateOpportunityAdvice = async (opportunities: { productName: string, demand: number, supply: number }[]): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const opportunitiesText = opportunities.map(o => `${o.productName} (الطلب: ${o.demand}، العرض: ${o.supply})`).join('؛ ');
    const prompt = `أنت خبير استراتيجي في اكتشاف فرص السوق العراقي.
    لقد حللت بيانات العرض والطلب، وهذه هي أبرز الفجوات في السوق حالياً: ${opportunitiesText}.
    
    قدم لي نصيحة استراتيجية موجزة باللهجة العراقية حول هذه الفرص. أي منتج يجب أن أفكر في إضافته لمخزوني ولماذا؟
    اجعل النصيحة قصيرة ومركزة وقابلة للتنفيذ.`;

    const response: GenerateContentResponse = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating opportunity advice:", error);
    return "حدث خطأ أثناء تحليل الفرص.";
  }
};

export const generateMarketBriefing = async (
  topRfqs: RequestForQuotation[], 
  recentAds: Ad[],
  hotspots: { province: string, count: number }[]
  ): Promise<string> => {
  if (!ai) return disabledError;
  try {
    const topRfqsText = topRfqs.map(r => `${r.product_name} في ${r.province}`).join('، ');
    const recentAdsText = recentAds.map(a => `${a.title} في ${a.province}`).join('، ');
    const hotspotsText = hotspots.map(h => `${h.province} (${h.count} طلبات)`).join('، ');
    const date = new Date().toLocaleDateString('ar-IQ');

    const prompt = `أنت محلل سوق وخبير استراتيجي للسوق العراقي.
    مهمتك هي كتابة "موجز يومي للسوق" موجز ومفيد لتجار الجملة. استخدم اللهجة العراقية المهنية والواضحة.
    التاريخ: ${date}

    استخدم البيانات التالية لكتابة التقرير:
    - **أبرز الطلبات (RFQ) الجديدة:** ${topRfqsText}
    - **أبرز الإعلانات الجديدة:** ${recentAdsText}
    - **المحافظات الأكثر طلباً:** ${hotspotsText}

    يجب أن يتضمن الموجز النقاط التالية باستخدام تنسيق Markdown:
    1.  **عنوان جذاب مع التاريخ.** (مثال: **موجز سوق العراق الذكي - تاريخ اليوم**)
    2.  **أبرز الاتجاهات (Trends):** حلل البيانات لتحديد ما هو "ساخن" الآن. ما هي المنتجات التي يكثر عليها الطلب؟ ما هي المناطق النشطة؟
    3.  **فرصة اليوم (Opportunity of the Day):** بناءً على الفجوة بين العرض والطلب، اقترح فرصة واحدة واضحة يمكن للتاجر استغلالها اليوم.
    4.  **نصيحة اليوم (Tip of the Day):** قدم نصيحة عملية واحدة بناءً على التحليل (مثال: التركيز على منتج معين، استهداف محافظة معينة).

    اجعل الموجز قصيراً وسهل القراءة.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating market briefing:", error);
    return "حدث خطأ أثناء توليد الموجز اليومي للسوق. الرجاء المحاولة مرة أخرى.";
  }
};

export const generateRfqOffer = async (
  rfq: RequestForQuotation, 
  sellerAds: Ad[]
): Promise<{ suggestedPrice: number; offerText: string }> => {
  if (!ai) return { suggestedPrice: 0, offerText: disabledError };
  try {
    const relevantAdsText = sellerAds
        .filter(ad => ad.category === rfq.category)
        .map(ad => `- ${ad.title} بسعر ${ad.price}`)
        .join('\n');

    const prompt = `أنت خبير مبيعات ومفاوضات في سوق الجملة العراقي.
    مهمتك هي مساعدة تاجر على كتابة عرض سعر احترافي ومقنع لطلب (RFQ) من مشترٍ.

    **تفاصيل طلب المشتري:**
    - المنتج: ${rfq.product_name}
    - الكمية: ${rfq.quantity}
    - الفئة: ${rfq.category}
    - المحافظة: ${rfq.province}
    - تفاصيل إضافية من المشتري: ${rfq.details}

    **منتجات التاجر ذات الصلة (إن وجدت):**
    ${relevantAdsText || "لا توجد إعلانات مطابقة حالياً لدى التاجر."}

    **المهمة:**
    اكتب عرض سعر باللهجة العراقية المهنية. يجب أن يكون العرض جذاباً ومقنعاً.
    قم بإرجاع الرد بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
    {
      "suggestedPrice": 12345,
      "offerText": "نص العرض هنا..."
    }

    **إرشادات لنص العرض (offerText):**
    1.  ابدأ بتحية ودودة.
    2.  اذكر أن المنتج المطلوب متوفر لديكم بجودة عالية.
    3.  اذكر السعر بوضوح (استخدم السعر المقترح).
    4.  اذكر أي ميزات إضافية مثل (توصيل مجاني، جودة ممتازة، صناعة معروفة) إذا كانت مناسبة.
    5.  اختتم بدعوة للمناقشة أو تأكيد الطلب.

    **إرشادات للسعر المقترح (suggestedPrice):**
    - قدّر سعراً تنافسياً ومعقولاً للوحدة بناءً على تفاصيل الطلب. إذا كان لديك سعر من إعلانات التاجر، استخدمه كنقطة بداية.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestedPrice: { type: Type.NUMBER },
                    offerText: { type: Type.STRING }
                },
                required: ["suggestedPrice", "offerText"]
            }
        }
    });
    
    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error generating RFQ offer:", error);
    return {
      suggestedPrice: 0,
      offerText: "حدث خطأ أثناء إنشاء العرض الذكي. يرجى كتابة العرض يدوياً."
    };
  }
};

export const generateMarketAnalysis = async (marketData: {
  topRfqs: RequestForQuotation[], 
  recentAds: Ad[],
  hotspots: { province: string, count: number }[]
}): Promise<MarketAnalysis> => {
  if (!ai) throw new Error(disabledError);
  try {
    const prompt = `أنت محلل بيانات وخبير استراتيجي في سوق الجملة العراقي.
    حلل البيانات التالية وقدم تقريراً استخباراتياً موجزاً.

    **البيانات:**
    - أبرز 5 طلبات (RFQs): ${marketData.topRfqs.map(r => r.product_name).join(', ')}
    - أبرز 5 إعلانات جديدة: ${marketData.recentAds.map(a => a.title).join(', ')}
    - المحافظات الأكثر طلباً: ${marketData.hotspots.map(h => `${h.province} (${h.count})`).join(', ')}

    **المهمة:**
    أرجعِ الرد بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
    {
        "priceIndex": "نص موجز عن اتجاهات الأسعار...",
        "emergingOpportunities": "نص موجز عن الفرص الناشئة...",
        "competitorAnalysis": "نص موجز عن تحليل المنافسين..."
    }

    **إرشادات لكل قسم:**
    - **priceIndex:** بناءً على أنواع الإعلانات الجديدة، هل هناك مؤشر على ارتفاع أو انخفاض أسعار فئات معينة؟
    - **emergingOpportunities:** بالنظر إلى الطلبات (RFQs) مقابل الإعلانات الجديدة، ما هي الفجوات في السوق؟ ما هي المنتجات التي عليها طلب ولكن عرضها قليل؟
    - **competitorAnalysis:** بناءً على الإعلانات الجديدة، هل هناك مؤشرات على زيادة المنافسة في قطاعات معينة؟
    
    اجعل كل نص موجزاً وواضحاً ومكتوباً باللهجة العراقية المهنية على شكل نقاط.`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    priceIndex: { type: Type.STRING },
                    emergingOpportunities: { type: Type.STRING },
                    competitorAnalysis: { type: Type.STRING },
                },
                required: ["priceIndex", "emergingOpportunities", "competitorAnalysis"]
            }
        }
    });

    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error generating market analysis:", error);
    throw new Error("فشل في إنشاء تحليل السوق.");
  }
};

export const estimateLogistics = async (
  origin: string,
  destination: string,
  category: string
): Promise<{ cost: string; time: string }> => {
  if (!ai) return { cost: "غير متوفر", time: "غير متوفر" };
  try {
    const prompt = `أنت خبير لوجستي في العراق. قدّر تكلفة الشحن والمدة الزمنية لنقل بضائع بالجملة من فئة "${category}" من محافظة "${origin}" إلى محافظة "${destination}".
    
    قدّم تقديرك على شكل نطاق سعري.
    
    استجب فقط بكائن JSON قابل للتحليل. لا تضف أي نص آخر أو تنسيق markdown.
    
    مثال للإخراج:
    {
      "cost": "25,000 - 35,000 دينار عراقي",
      "time": "1 - 2 أيام"
    }`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                cost: { type: Type.STRING },
                time: { type: Type.STRING }
            },
            required: ["cost", "time"]
        }
      }
    });

    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error estimating logistics:", error);
    return {
      cost: "غير متوفر",
      time: "غير متوفر"
    };
  }
};

export const generateDealMemoFromChat = async (
  chatHistory: string
): Promise<{ product: string; quantity: string; price: string; terms: string }> => {
  if (!ai) throw new Error(disabledError);
  try {
    const prompt = `أنت مساعد ذكي متخصص في تحليل محادثات الصفقات التجارية في العراق.
    حلل سجل المحادثة التالي بين بائع ومشترٍ واستخرج تفاصيل الاتفاق النهائي.
    
    سجل المحادثة:
    ---
    ${chatHistory}
    ---
    
    المهمة:
    أرجعِ الرد بصيغة JSON فقط بدون أي نص إضافي، بالشكل التالي:
    {
      "product": "اسم المنتج المتفق عليه",
      "quantity": "الكمية المتفق عليها",
      "price": "السعر النهائي المتفق عليه",
      "terms": "أي شروط إضافية تم ذكرها (مثل التوصيل، الدفع)"
    }
    
    إذا كانت أي من المعلومات غير واضحة، استخدم "غير محدد". كن دقيقاً وموجزاً.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                product: { type: Type.STRING },
                quantity: { type: Type.STRING },
                price: { type: Type.STRING },
                terms: { type: Type.STRING }
            },
            required: ["product", "quantity", "price", "terms"]
        }
      }
    });

    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating deal memo:", error);
    throw new Error("فشل في تحليل المحادثة لإنشاء مذكرة الاتفاق.");
  }
};

export const analyzeProductVideoForQuality = async (videoPart: Part): Promise<{ verified: boolean; reason: string }> => {
  // Mock implementation since actual video processing isn't feasible here.
  // In a real scenario, this would use a multimodal model to analyze video frames.
  console.log("Simulating AI video analysis for quality verification...");
  await new Promise(res => setTimeout(res, 2500)); // Simulate processing time
  
  // For demo purposes, we'll almost always return a positive result.
  const isSuccess = Math.random() > 0.1; // 90% chance of success

  if (isSuccess) {
    return {
      verified: true,
      reason: "تم التحقق من جودة المنتج ومطابقته للوصف بناءً على تحليل الفيديو."
    };
  } else {
    return {
      verified: false,
      reason: "لم يتم التحقق. قد يكون الفيديو غير واضح أو أن المنتج لا يطابق الوصف."
    };
  }
};

export const generateNegotiationCounterOffer = async (
  session: NegotiationSession,
  ad: Ad,
  buyerOffer: number
): Promise<{ responseText: string; counterOffer?: number; accept: boolean }> => {
  if (!ai) throw new Error(disabledError);
  try {
    const prompt = `أنت وكيل تفاوض ذكي تمثل بائعاً في سوق جملة عراقي.
    
    **تفاصيل المنتج:**
    - المنتج: "${ad.title}"
    - السعر المعلن: "${ad.price}"

    **سجل التفاوض حتى الآن:**
    ${session.history.map(m => `${m.sender === 'bot' ? 'أنا (وكيل المشتري)' : 'البائع'}: ${m.text}`).join('\n')}

    **عرض المشتري الأخير:** ${buyerOffer.toLocaleString()} دينار عراقي
    
    **مهمتك:**
    صياغة رد ذكي ومقنع باللهجة العراقية على عرض المشتري.
    - إذا كان العرض جيداً، اقبله.
    - إذا كان العرض منخفضاً جداً، قدم عرضاً مضاداً معقولاً.
    - إذا كان العرض سخيفاً، ارفضه بلباقة.
    
    **أرجع الرد بصيغة JSON فقط:**
    {
      "responseText": "نص الرد الذي سيظهر للبائع.",
      "counterOffer": 12345, // رقم العرض المضاد إن وجد، اتركه null إذا لا يوجد.
      "accept": true // أو false
    }`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    responseText: { type: Type.STRING },
                    counterOffer: { type: Type.NUMBER },
                    accept: { type: Type.BOOLEAN }
                },
                required: ["responseText", "accept"]
            }
        }
    });

    let jsonStr = response.text.trim();
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("Error generating negotiation response:", error);
    throw new Error("فشل في توليد رد التفاوض.");
  }
};

export const generatePartnershipAnalysis = async (score: number, dealCount: number): Promise<string> => {
    if (!ai) return disabledError;
    try {
        const prompt = `أنت مستشار أعمال متخصص في العلاقات التجارية B2B في العراق.
        بناءً على البيانات التالية، اكتب تحليلاً موجزاً ومقنعاً باللهجة العراقية حول قوة الشراكة بين مستخدمين.

        - **مؤشر الشراكة:** ${score}/100
        - **عدد الصفقات المكتملة:** ${dealCount}

        **المهمة:**
        اكتب نصاً قصيراً (لا يتجاوز سطرين) يوضح قوة هذه العلاقة.
        - إذا كان المؤشر مرتفعاً، أشد بقوة الشراكة وموثوقيتها.
        - إذا كان متوسطاً، اذكر أنهما في بداية بناء علاقة جيدة.
        - إذا كان منخفضاً، اذكر أن العلاقة لا تزال جديدة.

        اجعل النص إيجابياً وموجزاً.`;

        const response: GenerateContentResponse = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error generating partnership analysis:", error);
        return "تحليل غير متوفر حالياً.";
    }
};