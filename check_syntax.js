const fs=require('fs');
const html=fs.readFileSync('paper_plane_game.html','utf8');
const m=html.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
if(m){
  const code=m[1];
  try{new Function(code);console.log('OK')}catch(e){console.log('ERROR:',e.message);console.log(e.stack)}
}else{console.log('No script found')}