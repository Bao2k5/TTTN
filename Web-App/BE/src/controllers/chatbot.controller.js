const { GoogleGenerativeAI } = require("@google/generative-ai");
const ollama = require("ollama").default;
const { SecurityLog: Security } = require("../models/security.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// Khoi tao Gemini (Du phong)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askChatbot = async (req, res) => {
    try {
        const { question, history } = req.body;
        const user = req.user; 

        if (!question) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi." });
        }

        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        // 1. Lay du lieu tu MongoDB (Context) de tro giup AI tra loi dung thuc te
        let localKnowledge = "";
        try {
            if (isAdmin) {
                const logs = await Security.find().sort({ timestamp: -1 }).limit(5);
                const orders = await Order.find().sort({ createdAt: -1 }).limit(3);
                localKnowledge = `\n[DU LIEU HE THONG - CHI ADMIN THAY]\nLogs an ninh: ${JSON.stringify(logs)}\nDon hang moi: ${JSON.stringify(orders)}`;
            } else {
                const products = await Product.find({ isActive: true }).limit(5).select('name price');
                localKnowledge = `\n[DANH SACH SAN PHAM CUA TIEM]: ${JSON.stringify(products)}`;
            }
        } catch (dbErr) {
            console.error("DB Context Error:", dbErr);
        }

        const systemInstruction = `Bạn là trợ lý ảo của cửa hàng TRANG SỨC BẠC "Smart Jewelry Vault".
[QUAY TRỌNG]: ĐÂY LÀ CỬA HÀNG TRANG SỨC BẠC, KHÔNG CÓ KIM CƯƠNG HAY VÀNG RÒ.
Hãy DỰA TRÊN DANH SÁCH thực tế dưới đây để tư vấn. Nếu sản phẩm khách hỏi KHÔNG CÓ trong danh sách thì báo là hiện chưa có hàng.
Ngôn ngữ: Tiếng Việt, thân thiện, ngắn gọn.
Dữ liệu thực tế từ hệ thống: ${localKnowledge || "Hiện kho chưa có sản phẩm nào được nhập."}`;

        console.log(`[DEBUG] Final AI Prompt: ${systemInstruction}`);

        // 2. CHAY THU VOI OLLAMA (LOCAL AI) - UU TIEN SO 1
        try {
            console.log("[AI] Dang thu ket noi Ollama (Local)...");
            
            // Format history cho Ollama
            const ollamaHistory = (history || []).map(msg => ({
                role: msg.role === 'bot' ? 'assistant' : 'user',
                content: msg.text
            }));

            const response = await ollama.chat({
                model: 'gemma3:4b', // Khop voi model ban vua tai
                messages: [
                    { role: 'system', content: systemInstruction },
                    ...ollamaHistory,
                    { role: 'user', content: question }
                ],
                stream: false
            });

            if (response && response.message) {
                console.log("[AI] Ollama tra loi thanh cong!");
                return res.json({ answer: response.message.content });
            }
        } catch (ollamaErr) {
            console.warn("[AI] Ollama chua san sang hoac loi, chuyen sang Gemini Fallback...");
        }

        // 3. NEU OLLAMA LOI -> CHAY VOI GEMINI (CLOUD AI) - DU PHONG
        console.log("[AI] Dang su dung Gemini 2.5 Flash...");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: { parts: [{ text: systemInstruction }] }
        });

        const geminiHistory = (history || []).map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(question);
        const responseText = result.response.text();
        
        res.json({ answer: responseText });

    } catch (error) {
        console.error("Chatbot Overall Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống chatbot.", error: error.message });
    }
};

