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
            return res.status(400).json({ message: "Vui lòng nhập câu hỏi." });
        }

        const isAdmin = user && (user.role === 'admin' || user.role === 'staff');

        // 1. Thiet lap System Prompt
        const systemPrompt = `Bạn là trợ lý ảo thông minh của hệ thống "Smart Jewelry Vault".
Vai trò của bạn: ${isAdmin ? 'Hỗ trợ Quản trị viên quản lý hệ thống và xem báo cáo.' : 'Nhân viên tư vấn khách hàng nhiệt tình.'}
Ngôn ngữ: Tiếng Việt, thân thiện, chuyên nghiệp.
[QUAN TRỌNG]: Khi người dùng hỏi về danh sách sản phẩm, giá tiền, mô tả OR lịch sử báo động an ninh OR đơn hàng, BẠN PHẢI GỌI FUNCTION (TOOLS) TƯƠNG ỨNG ĐỂ TÌM KIẾM DỮ LIỆU THỰC TẾ. KHÔNG ĐƯỢC TỰ BỊA RA THÔNG TIN!
Chỉ trả lời ngắn gọn, dùng markdown để format (bold, list, emoji) cho đẹp mắt.`;

        // 2. Thiet lap Tools (Function Calling)
        const tools = [{
            functionDeclarations: [
                {
                    name: "searchJewelryProducts",
                    description: "Tìm kiếm danh sách sản phẩm trang sức có trong hệ thống khi khách hàng yêu cầu tư vấn hoặc hỏi giá.",
                    parameters: {
                        type: "OBJECT",
                        properties: {
                            keyword: {
                                type: "STRING",
                                description: "Từ khóa tra cứu (vd: dây chuyền, nhẫn, kim cương). Để trống lấy danh sách tổng hợp."
                            }
                        }
                    }
                }
            ]
        }];

        // Cap quyen truy cap tool dac quyen cho Admin
        if (isAdmin) {
            tools[0].functionDeclarations.push({
                name: "getRecentOrders",
                description: "Lấy danh sách các đơn hàng mới nhất trên hệ thống.",
                parameters: {
                    type: "OBJECT", 
                    properties: { 
                        limit: { type: "INTEGER", description: "Số lượng lấy (mặc định 5)" } 
                    }
                }
            });
            tools[0].functionDeclarations.push({
                name: "getSecurityLogs",
                description: "Lấy lịch sử cảnh báo an ninh từ các thiết bị IoT và Camera Edge AI.",
                parameters: {
                    type: "OBJECT", 
                    properties: { 
                        limit: { type: "INTEGER", description: "Số lượng lấy (mặc định 10)" } 
                    }
                }
            });
        }

        // 3. Chuyen doi history tu client sang format Gemini
        const geminiHistory = (history || []).map(msg => ({
            role: msg.role === 'bot' ? 'model' : (msg.role || 'user'),
            parts: [{ text: msg.text }]
        }));

        // 4. Khoi tao Model Gemini voi Tool Calling
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: tools
        });

        // 5. Thuc thi
        const chat = model.startChat({ history: geminiHistory });
        let result = await chat.sendMessage(question);
        
        // --- XU LY KHI GEMINI YEU CAU GOI HAM (FUNCTION CALL) ---
        const functionCalls = result.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const name = call.name;
            const args = call.args;
            
            console.log(`[Gemini Tool Called] Function: ${name}, Args:`, args);
            let apiResponse = {};
            
            // Thuc thi cac ham tuong ung
            if (name === "searchJewelryProducts") {
                const query = args.keyword ? { name: { $regex: args.keyword, $options: 'i' } } : {};
                const products = await Product.find({...query, isActive: true}).limit(5).select('name price description');
                apiResponse = { data: products };
            } 
            else if (isAdmin && name === "getRecentOrders") {
                const limit = args.limit || 5;
                const orders = await Order.find().sort({ createdAt: -1 }).limit(limit).populate('user', 'name');
                apiResponse = { data: orders };
            } 
            else if (isAdmin && name === "getSecurityLogs") {
                const limit = args.limit || 10;
                const logs = await Security.find().sort({ timestamp: -1 }).limit(limit);
                apiResponse = { data: logs };
            }

            // Ghi nhan ket qua tra ve cho Gemini
            result = await chat.sendMessage([{
                functionResponse: {
                    name: name,
                    response: apiResponse
                }
            }]);
        }

        const responseText = result.response.text();
        res.json({ answer: responseText });

    } catch (error) {
        console.error("Chatbot Error:", error);
        res.status(500).json({ message: "Lỗi hệ thống chatbot.", error: error.message });
    }
};
