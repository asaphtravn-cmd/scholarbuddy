// Máy chủ không cần cài thư viện: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const PORT=process.env.PORT||3000,PASS=process.env.ADMIN_PASSWORD||'admin123';
const DB=path.join(__dirname,'data','scholarships.json'),PUB=path.join(__dirname,'public');
const read=()=>JSON.parse(fs.readFileSync(DB,'utf8')),write=d=>fs.writeFileSync(DB,JSON.stringify(d,null,2));
const RV=path.join(__dirname,'data','reviews.json'),rr=()=>{try{return JSON.parse(fs.readFileSync(RV,'utf8'))}catch{return[]}},rw=d=>fs.writeFileSync(RV,JSON.stringify(d,null,2)),hits={};
const VW=path.join(__dirname,'data','views.json'),vr=()=>{try{return JSON.parse(fs.readFileSync(VW,'utf8'))}catch{return{}}},seen={};
const T={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif'};
const UP=path.join(__dirname,'data','uploads');fs.mkdirSync(UP,{recursive:true});
http.createServer((req,res)=>{
 const send=(c,o)=>{res.writeHead(c,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(o))};
 const p=new URL(req.url,'http://x').pathname,m=req.method;
 if(p.startsWith('/api/')){
  const id=p.split('/')[3];
  if(m==='GET'&&p==='/api/scholarships')return send(200,read());
  if(p==='/api/reviews'&&m==='GET')return send(200,rr().filter(r=>r.status==='approved').map(({id,sid,name,text,rating,date})=>({id,sid,name,text,rating,date})));
  if(p==='/api/reviews'&&m==='POST'){let b='';req.on('data',c=>{b+=c;if(b.length>5000)req.destroy()}).on('end',()=>{try{
   const x=JSON.parse(b),name=String(x.name||'').trim().slice(0,40),text=String(x.text||'').trim().slice(0,1000),rating=Math.round(+x.rating),now=Date.now();
   const ip=(req.headers['x-forwarded-for']||'').split(',')[0]||req.socket.remoteAddress,h=hits[ip]=(hits[ip]||[]).filter(t=>now-t<36e5);
   if(!name||text.length<5||!(rating>=1&&rating<=5)||!read().some(s=>s.id===x.sid))return send(400,{error:'Vui lòng nhập tên, chọn số sao và viết nội dung ít nhất 5 ký tự'});
   if(h.length>=5)return send(429,{error:'Bạn gửi quá nhanh, vui lòng thử lại sau'});
   h.push(now);const d=rr();d.push({id:now.toString(36),sid:x.sid,name,text,rating,date:new Date().toISOString().slice(0,10),status:'pending'});rw(d);send(200,{ok:true});
  }catch(e){send(400,{error:'Dữ liệu không hợp lệ'})}});return}
  if(p==='/api/views'&&m==='GET')return send(200,vr());
  if(p.startsWith('/api/views/')&&m==='POST'){const ip=(req.headers['x-forwarded-for']||'').split(',')[0]||req.socket.remoteAddress,k=ip+'|'+id,now=Date.now();
   if(!read().some(s=>s.id===id))return send(404,{error:'Không tìm thấy học bổng'});
   {const v=vr();v[id]=(v[id]||0)+1;fs.writeFileSync(VW,JSON.stringify(v))}
   return send(200,{ok:true})}
  if(req.headers['x-admin-key']!==PASS)return send(401,{error:'Sai mật khẩu quản trị'});
  if(p==='/api/check')return send(200,{ok:true});
  if(p==='/api/upload'&&m==='POST'){const ch=[];let n=0;req.on('data',c=>{n+=c.length;if(n>4e6)req.destroy();else ch.push(c)}).on('end',()=>{const buf=Buffer.concat(ch),ext=({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'})[req.headers['content-type']];if(!ext||!buf.length)return send(400,{error:'Chỉ nhận ảnh JPG, PNG, WebP hoặc GIF (tối đa 4MB)'});const name=Date.now().toString(36)+Math.random().toString(36).slice(2,6)+ext;fs.writeFileSync(path.join(UP,name),buf);send(200,{url:'/uploads/'+name})});return}
  if(p.startsWith('/api/reviews/')){const d=rr();
   if(p==='/api/reviews/all'&&m==='GET')return send(200,d);
   const i=d.findIndex(r=>r.id===id);if(i<0)return send(404,{error:'Không tìm thấy đánh giá'});
   if(m==='PUT')d[i].status='approved';else if(m==='DELETE')d.splice(i,1);else return send(405,{error:'Method'});
   rw(d);return send(200,{ok:true})}
  let b='';req.on('data',c=>b+=c).on('end',()=>{try{
   const d=read(),x=b?JSON.parse(b):{},i=d.findIndex(s=>s.id===id);
   if(m==='POST'){x.id=Date.now().toString(36);d.push(x)}
   else if(m==='PUT'&&i>=0)d[i]={...x,id};
   else if(m==='DELETE'&&i>=0)d.splice(i,1);
   else return send(404,{error:'Không tìm thấy học bổng'});
   write(d);send(200,{ok:true});
  }catch(e){send(400,{error:'Dữ liệu không hợp lệ'})}});return}
 if(p.startsWith('/uploads/')){const u=path.join(UP,path.basename(p));return fs.readFile(u,(e,b)=>{if(e)return send(404,{error:'Không có ảnh này'});res.writeHead(200,{'Content-Type':T[path.extname(u)]||'application/octet-stream','Cache-Control':'public, max-age=86400'});res.end(b)})}
 const f=path.join(PUB,path.normalize(p==='/'?'/index.html':p==='/admin'?'/admin.html':p));
 if(!f.startsWith(PUB))return send(403,{error:'Cấm'});
 fs.readFile(f,(e,b)=>{if(e)return send(404,{error:'Không có trang này'});res.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});res.end(b)});
}).listen(PORT,()=>console.log(`Người dùng: http://localhost:${PORT}\nQuản trị:  http://localhost:${PORT}/admin  (mật khẩu: ${PASS})`));
