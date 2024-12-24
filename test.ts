import yt from "yt-converter";
const data = await yt.Audio({
   url:"https://www.youtube.com/watch?v=rZ7ZhZCTmKw",
   onDownloading: (d) => console.log(d),
})
console.log(data.message, data.pathfile)