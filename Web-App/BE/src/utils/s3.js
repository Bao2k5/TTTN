const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const path = require("path");

// Khởi tạo S3 Client
// Lưu ý: Chỉ khởi tạo khi có đủ biến môi trường
let s3Client = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_REGION) {
    s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
    });
}

/**
 * Upload file lên AWS S3
 * @param {Buffer} fileBuffer - Nội dung file dưới dạng buffer
 * @param {String} fileName - Tên file gốc
 * @param {String} folder - Thư mục trên S3 (vd: 'products')
 * @returns {Promise<{url: string, public_id: string}>}
 */
const uploadToS3 = async (fileBuffer, fileName, folder = "uploads") => {
    if (!s3Client) throw new Error("AWS Credentials not configured");

    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
    
    // Sử dụng @aws-sdk/lib-storage để upload stream an toàn
    const upload = new Upload({
        client: s3Client,
        params: {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: "image/jpeg", // Cần detect mime type dynamic nếu có thể
            // ACL: 'public-read' // Tùy config bucket, thường set public policy trên bucket tốt hơn set từng file
        },
    });

    await upload.done();

    // Trả về format giống Cloudinary để Controller không phải sửa nhiều
    // URL format: https://<bucket>.s3.<region>.amazonaws.com/<key>
    const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    
    return {
        url: url,
        public_id: uniqueFileName // Với S3, Key chính là Public ID
    };
};

/**
 * Xóa file trên S3
 * @param {String} key - Key của file trên S3 (VD: products/image-123.jpg)
 */
const deleteFromS3 = async (key) => {
    if (!s3Client) throw new Error("AWS Credentials not configured");

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
};

module.exports = { uploadToS3, deleteFromS3 };
