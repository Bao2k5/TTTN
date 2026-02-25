const { GoogleGenerativeAI } = require("@google/generative-ai");
const Security = require("../models/security.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");

// Khoi tao Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.askChatbot = async (req, res) => {
    try {
        const { question } = req.body;
        const user = req.user; // Lay tu middleware auth (neu co)

        if (!question) {
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi." });
        }

        // 1. Lay du lieu ngu canh (Context)
        let context = "";
        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        if (isAdmin) {
            // Lay 10 logs an ninh gan nhat
            const logs = await Security.find().sort({ timestamp: -1 }).limit(10);
            context += "\nDỮ LIỆU AN NINH (Dành cho Admin):\n" + JSON.stringify(logs);

            // Lay thong tin don hang gan day
            const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
            context += "\nĐƠN HÀNG GẦN ĐÂY:\n" + JSON.stringify(orders);
        } else {
            // Lay danh sach san pham de tu van cho khach
            const products = await Product.find({ isActive: true }).limit(10).select('name price description');
            context += "\nDANH SÁCH SẢN PHẨM (Để tư vấn khách hàng):\n" + JSON.stringify(products);
        }

        // 2. Thiet lap System Prompt
        const systemPrompt = `
            Bạn là trợ lý ảo thông minh của hệ thống "Smart Jewelry Vault" (Tủ trang sức thông minh tích hợp AIoT).
            Vai trò của bạn: ${isAdmin ? 'Hỗ trợ Quản trị viên quản lý hệ thống và xem báo cáo.' : 'Nhân viên tư vấn khách hàng nhiệt tình.'}
            Ngôn ngữ: Tiếng Việt, thân thiện, chuyên nghiệp.
            Dưới đây là dữ liệu thực tế từ hệ thống để bạn tham khảo:
            ${context}
            
            Hãy trả lời câu hỏi sau của người dùng dựa trên dữ liệu trên. Nếu không biết, hãy nói thật thà nhưng khéo léo.
        `;

        // 3. Goi Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt + "\n\nCâu hỏi: " + question);
        const responseText = result.response.text();

        res.json({ answer: responseText });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống chatbot.", error: error.message });
    }
};
