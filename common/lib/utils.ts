import fs from 'node:fs';

function base64_encode(file: string) {
	const bitmap = fs.readFileSync(file);

	return new Buffer(bitmap).toString('base64');
}

export { base64_encode };
