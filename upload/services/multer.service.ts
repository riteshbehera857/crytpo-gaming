import multer from 'multer';
import path from 'path';
import { ResponseCodes } from '../../common/config/responseCodes';
import { Response } from '../../common/config/response';

// Define the allowed file types and maximum file size
const allowedFileTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
const maxFileSize = 100 * 1024 * 200; // 5 MB

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../uploads/')); // Uploads folder path
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
	},
});

// Define the file filter function
const fileFilter = (req: any, file: any, cb: any) => {
	console.log('---------------------------------------', { SIZE: file });

	if (!allowedFileTypes.includes(file.mimetype)) {
		cb(
			new Response(
				ResponseCodes.INVALID_FILE_FORMAT_ERROR.code,
				ResponseCodes.INVALID_FILE_FORMAT_ERROR.message,
			),
		);
	} else if (file.size > maxFileSize) {
		cb(new Error('File size exceeds the limit (10 KB)'));
	} else {
		cb(null, true);
	}
};

// Create the Multer middleware with file storage and filtering
const upload = multer({
	storage: storage,
	limits: {
		// limits file size to 5 MB
		fileSize: 100 * 1024 * 200,
	},
	fileFilter: fileFilter,
});

export { upload };
