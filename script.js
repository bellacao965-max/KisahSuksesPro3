
function searchYT(){
    let q = document.getElementById('ytSearch').value;
    if(!q) return alert("Masukkan kata kunci!");
    window.open("https://www.youtube.com/results?search_query=" + encodeURIComponent(q), "_blank");
}

function playYT(){
    let url = document.getElementById('ytPlay').value;
    if(!url) return alert("Tempel URL atau ID video!");
    let id = url.includes("youtube") ? url.split("v=")[1] : url;
    document.getElementById('ytFrame').src = "https://www.youtube.com/embed/" + id;
}

function askAI(){
    let t = document.getElementById('aiInput').value;
    if(!t) return;
    let out = document.getElementById('aiOutput');
    let replies = [
        "Ini pendapat AI: " + t,
        "Menurutku, " + t,
        "Dari sudut pandang logika, " + t
    ];
    out.innerHTML = replies[Math.floor(Math.random()*replies.length)];
}
