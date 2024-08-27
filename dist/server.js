"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const EmailService_1 = __importDefault(require("./src/services/EmailService"));
const EmailProvider_1 = require("./src/services/EmailProvider");
const app = (0, express_1.default)();
const emailService = new EmailService_1.default([new EmailProvider_1.MockEmailProvider1(), new EmailProvider_1.MockEmailProvider2()], 3);
// Middleware
app.use(body_parser_1.default.json());
// Route to send emails
app.post('/send-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { recipient, subject, body } = req.body;
    try {
        const result = yield emailService.sendEmail(recipient, subject, body);
        res.status(200).json({ message: 'Email sent successfully', result });
    }
    catch (error) {
        const msg = error.message;
        res.status(500).json({ message: 'Failed to send email', error: msg });
    }
}));
// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
