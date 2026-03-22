const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SecurityLog: Security } = require("../models/security.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// Khoi tao Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askChatbot = async (req, res) => {
    try {
        const { question, history } = req.body;
        const user = req.user; // Lay tu middleware auth (neu co)

        if (!question) {
            return res.status(400).json({ message: "Vui l├▓ng nhß║¡p c├óu hß╗Åi." });
        }

        // 1. Lay du lieu ngu canh (Context)
        let context = "";
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        if (isAdmin) {
            // Lay 10 logs an ninh gan nhat
            const logs = await Security.find().sort({ timestamp: -1 }).limit(10);
            context += "\nDß╗« LIß╗åU AN NINH (D├ánh cho Admin):\n" + JSON.stringify(logs);

            // Lay thong tin don hang gan day
            const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
            context += "\n─É╞áN H├ÇNG Gß║ªN ─É├éY:\n" + JSON.stringify(orders);
        } else {
            // Lay danh sach san pham de tu van cho khach
            const products = await Product.find({ isActive: true }).limit(10).select('name price description');
            context += "\nDANH S├üCH Sß║óN PHß║¿M (─Éß╗â t╞░ vß║Ñn kh├ích h├áng):\n" + JSON.stringify(products);
        }

        // 2. Thiet lap System Prompt
        const systemPrompt = `
            Bß║ín l├á trß╗ú l├╜ ß║úo th├┤ng minh cß╗ºa hß╗ç thß╗æng "Smart Jewelry Vault" (Tß╗º trang sß╗⌐c th├┤ng minh t├¡ch hß╗úp AIoT).
            Vai tr├▓ cß╗ºa bß║ín: ${isAdmin ? 'Hß╗ù trß╗ú Quß║ún trß╗ï vi├¬n quß║ún l├╜ hß╗ç thß╗æng v├á xem b├ío c├ío.' : 'Nh├ón vi├¬n t╞░ vß║Ñn kh├ích h├áng nhiß╗çt t├¼nh.'}
            Ng├┤n ngß╗»: Tiß║┐ng Viß╗çt, th├ón thiß╗çn, chuy├¬n nghiß╗çp.
            D╞░ß╗¢i ─æ├óy l├á dß╗» liß╗çu thß╗▒c tß║┐ tß╗½ hß╗ç thß╗æng ─æß╗â bß║ín tham khß║úo:
            ${context}
            
            H├úy trß║ú lß╗¥i c├óu hß╗Åi cß╗ºa ng╞░ß╗¥i d├╣ng dß╗▒a tr├¬n dß╗» liß╗çu tr├¬n. Nß║┐u kh├┤ng biß║┐t, h├úy n├│i thß║¡t th├á nh╞░ng kh├⌐o l├⌐o.
            Trß║ú lß╗¥i ngß║»n gß╗ìn, d├╣ng markdown ─æß╗â format (bold, list, emoji) cho dß╗à ─æß╗ìc.
        `;

        // 3. Chuyen doi history tu client sang format Gemini
        // Client gui: [{ role: "user"|"model", text: "..." }]
        // Gemini can: [{ role: "user"|"model", parts: [{ text: "..." }] }]
        const geminiHistory = (history || []).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        // 4. Goi Gemini API voi multi-turn conversation
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: geminiHistory
        });

        const result = await chat.sendMessage(question);
        const responseText = result.response.text();

        res.json({ answer: responseText });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ message: "Lß╗ùi hß╗ç thß╗æng chatbot.", error: error.message });
    }
};
