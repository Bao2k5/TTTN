const { GoogleGenerativeAI } = require("@google/generative-ai");
const ollama = require("ollama").default;
const { SecurityLog: Security, SystemState } = require("../models/security.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const TempLog = require("../models/tempLog.model");

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
                // Lay thong tin he thong cho Admin
                const [logs, orders, latestTemp, systemStatus] = await Promise.all([
                    Security.find().sort({ timestamp: -1 }).limit(3),
                    Order.find().sort({ createdAt: -1 }).limit(3),
                    TempLog.findOne().sort({ timestamp: -1 }),
                    SystemState.findOne({ key: 'system-status' }) // Lay trang thai khoa/alarm
                ]);

                localKnowledge = `
[QUYỀN HẠN]: NGƯỜI DÙNG LÀ ADMIN/QUẢN TRỊ VIÊN. BẠN CÓ QUYỀN TRẢ LỜI CÁC THÔNG TIN HỆ THỐNG.
[DỮ LIỆU CẢM BIẾN]: 
- Nhiệt độ hiện tại: ${latestTemp ? latestTemp.temperature + "°C" : "N/A"}
- Độ ẩm hiện tại: ${latestTemp ? latestTemp.humidity + "%" : "N/A"}
- Cập nhật lúc: ${latestTemp ? latestTemp.timestamp : "N/A"}
[TRẠNG THÁI HỆ THỐNG]: ${JSON.stringify(systemStatus || {})}
[LOGS AN NINH]: ${JSON.stringify(logs)}
[ĐƠN HÀNG MỚI]: ${JSON.stringify(orders)}
`;
            } else {
                // Lay thong tin san pham cho Khach hang
                const products = await Product.find({ isActive: true }).limit(5).select('name price description');
                localKnowledge = `\n[DANH SÁCH SẢN PHẨM CỦA TIỆM]: ${JSON.stringify(products)}`;
            }
        } catch (dbErr) {
            console.error("DB Context Error:", dbErr);
        }

        const systemInstruction = `Bạn là trợ lý ảo của cửa hàng TRANG SỨC BẠC "Smart Jewelry Vault".
${isAdmin ? 'Người dùng hiện tại là ADMIN. Bạn hãy hỗ trợ họ kiểm tra nhiệt độ, trạng thái an ninh và quản lý cửa hàng.' : 'Người dùng hiện tại là KHÁCH HÀNG. Bạn chỉ tư vấn về trang sức bạc.'}
[QUY TRỌNG]: ĐÂY LÀ CỬA HÀNG TRANG SỨC BẠC, KHÔNG CÓ KIM CƯƠNG HAY VÀNG RÒ.
Ngôn ngữ: Tiếng Việt, thân thiện, ngắn gọn, chuyên nghiệp.
Dữ liệu thực tế từ hệ thống: ${localKnowledge}`;

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

