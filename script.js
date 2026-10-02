const nav=document.getElementById('nav'),progress=document.getElementById('progress');
window.addEventListener('scroll',()=>{const y=window.scrollY;nav.classList.toggle('scrolled',y>40);const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h>0?y/h*100:0)+'%'},{passive:true});
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
document.getElementById('tripForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget),dest=d.get('destination')||'your destination';document.getElementById('formNote').textContent=`Perfect — we'll shape a custom ${dest} journey for ${d.get('travellers')||1} traveller(s). Connect with us on WhatsApp or call the travel desk to continue.`;document.getElementById('formNote').style.color='#e8793f';});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth'})}}));
