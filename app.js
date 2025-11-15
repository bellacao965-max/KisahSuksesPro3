/* Enhanced app.js - Improved local AI, quotes, social links, YouTube search playable (paste or demo play) */
document.addEventListener('DOMContentLoaded', ()=>{

  // Demo video feed (click to play)
  const videosDemo = [
    {id:'dQw4w9WgXcQ',title:'Dari Tukang Jadi Pengusaha',desc:'Perjalanan usaha kecil menjadi besar',thumb:'assets/thumb1.png'},
    {id:'3JZ_D3ELwOQ',title:'Bangkit dari Kegagalan',desc:'Belajar dan bangkit lebih kuat',thumb:'assets/thumb2.png'},
    {id:'L_jWHffIx5E',title:'Sukses dari Hobi',desc:'Hobi jadi sumber penghasilan',thumb:'assets/thumb3.png'}
  ];

  const videosEl = document.getElementById('videos');
  if(videosEl){
    videosEl.innerHTML='';
    videosDemo.forEach(v=>{
      const el = document.createElement('div');
      el.className='video';
      el.innerHTML = '<div class="thumb"><img src="'+v.thumb+'" alt=""></div><div class="meta"><h4>'+v.title+'</h4><p>'+v.desc+'</p><div class="card-actions"><button data-id="'+v.id+'" class="play-card primary">Putar</button> <button data-id="'+v.id+'" class="copy-link">Salin Link</button></div></div>';
      videosEl.appendChild(el);
    });
    videosEl.querySelectorAll('.play-card').forEach(b=>b.addEventListener('click', e=>{
      const id = e.target.getAttribute('data-id'); playById(id);
    }));
    videosEl.querySelectorAll('.copy-link').forEach(b=>b.addEventListener('click', e=>{
      const id = e.target.getAttribute('data-id');
      const url = 'https://www.youtube.com/watch?v=' + id;
      navigator.clipboard && navigator.clipboard.writeText(url);
      alert('Link video disalin: ' + url);
    }));
  }

  // Improved quotes list (expanded)
  const quotes = [
    {who:'W. Churchill', text:'Kesuksesan bukan akhir, kegagalan bukan fatal: keberanian yang penting.'},
    {who:'Nelson Mandela', text:'It always seems impossible until it is done.'},
    {who:'B.J. Habibie', text:'Bermimpilah besar dan kerjakan langkah kecil setiap hari.'},
    {who:'Steve Jobs', text:'Stay hungry, stay foolish.'},
    {who:'Oprah Winfrey', text:'Turn your wounds into wisdom.'},
    {who:'Albert Einstein', text:'Life is like riding a bicycle. To keep your balance you must keep moving.'},
    {who:'Elon Musk', text:'When something is important enough, you do it even if the odds are not in your favor.'},
    {who:'Malala Yousafzai', text:'One child, one teacher, one book, one pen can change the world.'},
    {who:'Simon Sinek', text:'Start with why.'},
    {who:'YouTube Creator', text:'Consistency and storytelling beat perfection.'}
  ];
  let quoteIndex = 0;
  const quoteEl = document.getElementById('quoteText');
  const nextQuoteBtn = document.getElementById('nextQuote');
  function showQuote(){
    if(!quoteEl) return;
    const q = quotes[quoteIndex % quotes.length];
    quoteEl.innerHTML = '<strong>' + q.who + '</strong>: ' + q.text;
  }
  if(nextQuoteBtn) nextQuoteBtn.addEventListener('click', ()=>{ quoteIndex++; showQuote(); });
  showQuote();

  // Player functions
  const playerArea = document.getElementById('playerArea');
  const ytFrame = document.getElementById('ytFrame');
  const playBtn = document.getElementById('playBtn');
  const randomBtn = document.getElementById('randomBtn');
  const closePlayer = document.getElementById('closePlayer');

  function extractVideoId(input){
    if(!input) return null;
    const urlMatch = input.match(/[?&]v=([\w-]{11})/);
    if(urlMatch) return urlMatch[1];
    const shortMatch = input.match(/youtu\.be\/([\w-]{11})/);
    if(shortMatch) return shortMatch[1];
    if(input.length===11) return input;
    return null;
  }

  window.playById = function(id){
    ytFrame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1';
    playerArea.classList.remove('hidden');
    setTimeout(()=>{ ytFrame.focus(); }, 300);
  }

  if(playBtn){
    playBtn.addEventListener('click', ()=>{
      const v = (document.getElementById('videoUrl')||{}).value || '';
      const id = extractVideoId(v.trim());
      if(!id) return alert('Masukkan URL atau ID video YouTube yang valid (11 karakter).');
      playById(id);
    });
  }
  if(randomBtn){
    randomBtn.addEventListener('click', ()=>{
      const r = videosDemo[Math.floor(Math.random()*videosDemo.length)];
      playById(r.id);
    });
  }
  if(closePlayer) closePlayer.addEventListener('click', ()=>{ ytFrame.src=''; playerArea.classList.add('hidden'); });

  // YouTube search behaviour: open results in a new tab for reliability (YouTube blocks embedding results)
  const ytBtn = document.getElementById('ytBtn');
  const ytSearch = document.getElementById('ytSearch');
  if(ytBtn){
    ytBtn.addEventListener('click', ()=>{
      const q = (ytSearch||{}).value || '';
      if(!q) return alert('Masukkan kata kunci pencarian.');
      window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), '_blank');
    });
    if(ytSearch) ytSearch.addEventListener('keydown', (e)=>{ if(e.key==='Enter') ytBtn.click(); });
  }

  // Google mini: attempt embed, fallback to new tab if blocked
  const googleSearchBtn = document.getElementById('googleSearch');
  if(googleSearchBtn){
    googleSearchBtn.addEventListener('click', ()=>{
      const q = (document.getElementById('googleQuery')||{}).value || '';
      if(!q) return alert('Isikan query pencarian.');
      const result = document.getElementById('googleResult');
      const url = 'https://www.google.com/search?q=' + encodeURIComponent(q);
      result.innerHTML = '<iframe src="'+url+'" style="width:100%;height:480px;border:0;border-radius:8px"></iframe>';
    });
  }

  // Improved local AI: more templates, varied tone, longer outputs
  const aiSend = document.getElementById('aiSend');
  const aiClear = document.getElementById('aiClear');
  const aiInput = document.getElementById('aiInput');
  const aiResult = document.getElementById('aiResult');

  function formatAIResponse(out){
    let txt = '';
    txt += 'Pelajaran:\n' + out.lessons.join('\n') + '\n\n';
    txt += 'Langkah Praktis:\n' + out.actions.map(a=>'- '+a).join('\n') + '\n\n';
    txt += 'Motivasi:\n' + out.motivation + '\n\n';
    txt += 'Ringkasan:\n' + (out.summary || '');
    return txt;
  }

  if(aiSend){
    aiSend.addEventListener('click', async ()=>{
      const text = (aiInput||{}).value || '';
      if(!text || text.trim().length<6){ aiResult.textContent = 'Masukkan minimal 6 karakter.'; return; }
      aiResult.textContent = 'Memproses...';
      try{
        const res = await fetch('/api/ai', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prompt: text})});
        const j = await res.json();
        if(j.error) aiResult.textContent = 'Error: ' + j.error;
        else aiResult.textContent = j.text;
      }catch(e){
        // fallback to client-side local AI generator if server not available
        const out = clientSideAI(text);
        aiResult.textContent = formatAIResponse(out);
      }
    });
  }
  if(aiClear) aiClear.addEventListener('click', ()=>{ if(aiInput) aiInput.value=''; if(aiResult) aiResult.textContent=''; });

  function clientSideAI(text){
    const t = (text||'').trim();
    const sents = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    const kw = t.toLowerCase();
    const lessons = [];
    if(kw.includes('gagal')) lessons.push('Evaluasi apa yang tidak berjalan dan buat rencana perbaikan.');
    if(kw.includes('mulai')) lessons.push('Mulai dari langkah kecil lalu ukur perkembangan.');
    if(lessons.length===0 && sents.length) lessons.push(sents.slice(0,2).join(' '));
    const actions = [];
    if(kw.includes('mulai')) actions.push('Tentukan 1 tugas kecil yang bisa diselesaikan hari ini.');
    if(kw.includes('fokus')) actions.push('Matikan gangguan selama 30 menit untuk mencoba fokus.');
    while(actions.length<3) actions.push('Evaluasi dan ulangi setiap minggu.');
    const motivation = ['Konsistensi membentuk hasil.','Jangan takut mencoba, teruslah belajar.','Kemenangan yang bertahan lahir dari kerja keras.'][Math.floor(Math.random()*3)];
    const summary = (sents.slice(0,3).join(' ')).slice(0,300);
    return {lessons, actions, motivation, summary};
  }

});