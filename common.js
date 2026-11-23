const G={kt:'Kinh tế – Kinh doanh – Tài chính',cn:'Kỹ thuật – Công nghệ',yd:'Khoa học tự nhiên – Y dược',xh:'Khoa học xã hội – Ngôn ngữ – Truyền thông',nt:'Nghệ thuật – Thiết kế',sp:'Sư phạm',kh:'Khác'};
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fd=s=>s.deadline.split('-').reverse().join('/');
const dl=s=>{const d=Math.ceil((new Date(s.deadline+'T23:59:59')-Date.now())/864e5);return d<0?['Đã hết hạn','x']:[`Còn ${d} ngày`,d<=14?'u':'']};
const yr=s=>'Năm '+s.years.map(y=>y>4?'5+':y).join(', ');
const ROWS=[['Đơn vị tài trợ',s=>esc(s.sponsor)],['Giá trị học bổng',s=>esc(s.value)],['Số suất',s=>s.slots],['Hạn nộp',s=>fd(s)],['GPA tối thiểu (thang 4)',s=>s.minGpa||'Không yêu cầu'],['Ngành',s=>s.fields.map(f=>G[f]).join('; ')],['Năm học',yr],['Bài luận',s=>s.essay?'Có':'Không'],['Phỏng vấn',s=>s.interview?'Có':'Không'],['Hồ sơ cần chuẩn bị',s=>esc(s.docs).replace(/\n/g,'<br>')]];
