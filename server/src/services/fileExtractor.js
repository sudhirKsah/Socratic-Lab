/**
 * fileExtractor.js
 *
 * Extracts plain text from uploaded PDF and DOCX files.
 * Returns { text, wordCount, error }.
 */

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const MAX_WORDS = 5000; // cap extracted content to avoid context overflow

/**
 * Extract text from a buffer, dispatching by mime type.
 *
 * @param {Buffer} buffer
 * @param {string} mimeType - 'application/pdf' | 'application/vnd.openxmlformats...'
 * @param {string} originalName - used for fallback mime detection
 * @returns {Promise<{ text: string, wordCount: number }>}
 */
async function extractText(buffer, mimeType, originalName) {
  const ext = (originalName || '').split('.').pop().toLowerCase();

  try {
    let text = '';

    if (mimeType === 'application/pdf' || ext === 'pdf') {
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === 'docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      throw new Error(`Unsupported file type: ${mimeType || ext}`);
    }

    // Clean up excessive whitespace
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Truncate if too long
    if (wordCount > MAX_WORDS) {
      text = words.slice(0, MAX_WORDS).join(' ') + '\n\n[Content truncated at 5,000 words]';
    }

    return { text, wordCount: Math.min(wordCount, MAX_WORDS) };
  } catch (err) {
    throw new Error(`File extraction failed: ${err.message}`);
  }
}

/**
 * Count words in a string.
 */
function countWords(text) {
  return (text || '').split(/\s+/).filter(Boolean).length;
}

module.exports = { extractText, countWords };
