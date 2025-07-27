"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDocToPdf = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const googleapis_1 = require("googleapis");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const fs = __importStar(require("fs"));
admin.initializeApp();
const auth = new googleapis_1.google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "../service-account.json"),
    scopes: ["https://www.googleapis.com/auth/drive"],
});
exports.convertDocToPdf = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;
    if (!filePath || !contentType)
        return;
    if (!filePath.startsWith("uploads/") || filePath.endsWith(".pdf"))
        return;
    const bucket = admin.storage().bucket(fileBucket);
    const tempLocalPath = path.join(os.tmpdir(), path.basename(filePath));
    await bucket.file(filePath).download({ destination: tempLocalPath });
    const authClient = await auth.getClient();
    const drive = googleapis_1.google.drive({ version: "v3", auth: authClient });
    const uploadRes = await drive.files.create({
        requestBody: {
            name: path.basename(filePath),
            mimeType: contentType,
        },
        media: {
            mimeType: contentType,
            body: fs.createReadStream(tempLocalPath),
        },
        fields: "id",
    });
    const fileId = uploadRes.data.id;
    if (!fileId)
        throw new Error("Failed to upload file to Google Drive");
    const pdfPath = tempLocalPath.replace(/\.(docx|doc)$/i, ".pdf");
    const dest = fs.createWriteStream(pdfPath);
    await drive.files.export({ fileId, mimeType: "application/pdf" }, { responseType: "stream" }).then((res) => new Promise((resolve, reject) => {
        res.data.pipe(dest);
        dest.on("finish", resolve);
        dest.on("error", reject);
    }));
    const newStoragePath = filePath.replace("uploads/", "converted/").replace(/\.(docx|doc)$/i, ".pdf");
    await bucket.upload(pdfPath, {
        destination: newStoragePath,
        metadata: { contentType: "application/pdf" },
    });
    await drive.files.delete({ fileId });
    fs.unlinkSync(tempLocalPath);
    fs.unlinkSync(pdfPath);
    await bucket.file(filePath).delete();
    console.log(`✅ Converted and uploaded: ${newStoragePath}`);
});
//# sourceMappingURL=index.js.map