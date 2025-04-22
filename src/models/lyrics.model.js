const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const lyricsUploadSchema = new mongoose.Schema({
    lyricName: {
        type: String,
        required: true,
    },
    lyricLanguage: {
        type: String,
    },
    lyricStyle: {
        type: String,
    },
    lyricMood: {
        type: String,
    },
    writeLyric: {
        type: String,
        required: true,
    },
    musicImage: {
        type: String,
    },
    tags: [
        {
            type: String,
        }
    ],
    description: {
        type: String,
    },
    createdBy: {
        type: String,
    },
    userName : {
        type: String,
    },
    tools: [
        {
            type: String,
        }
    ]
});

lyricsUploadSchema.plugin(toJSON);
lyricsUploadSchema.plugin(paginate);

const LyricsMusic = mongoose.model('LyricsMusic', lyricsUploadSchema);
module.exports = LyricsMusic;   
