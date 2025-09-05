import * as fs from 'fs';
import * as path from 'path';

export function isFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).replace('.', '').toLowerCase();
}

export function readFileAsString(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

export function writeFile(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf8');
}
