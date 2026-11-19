function uploadFile(file) {
  return file ? `/uploads/${file.filename}` : null;
}

module.exports = { uploadFile };
