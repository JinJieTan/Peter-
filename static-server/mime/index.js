const path = require('path')
const mineType = {
    "css": "text/css;charset=utf-8",
    "gif": "image/gif",
    "html": "text/html;charset=utf-8",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascrip;charset=utf-8",
    "json": "application/json;charset=utf-8",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain;charset=utf-8",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml",
}
module.exports = function (absolutePath) {
    const ext = path.extname(absolutePath).split('.').pop()
    return mineType[ext]
}