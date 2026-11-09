const navToggle=document.querySelector('.nav-toggle');
const primaryNav=document.querySelector('.primary-nav');
if(navToggle&&primaryNav){
  const closeSubmenus=()=>primaryNav.querySelectorAll('.nav-item-has-children').forEach(item=>{
    item.classList.remove('is-open');
    const toggle=item.querySelector('.submenu-toggle');
    if(toggle) toggle.setAttribute('aria-expanded','false');
  });
  navToggle.addEventListener('click',()=>{
    const open=navToggle.getAttribute('aria-expanded')==='true';
    navToggle.setAttribute('aria-expanded',String(!open));
    primaryNav.classList.toggle('is-open',!open);
    if(open) closeSubmenus();
    const label=navToggle.querySelector('.nav-toggle-label');
    if(label) label.textContent=open?'Menu':'Close';
  });
  primaryNav.querySelectorAll('.submenu-toggle').forEach(toggle=>toggle.addEventListener('click',()=>{
    const item=toggle.closest('.nav-item-has-children');
    const open=toggle.getAttribute('aria-expanded')==='true';
    closeSubmenus();
    if(!open){
      item.classList.add('is-open');
      toggle.setAttribute('aria-expanded','true');
    }
  }));
  primaryNav.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
    navToggle.setAttribute('aria-expanded','false');
    primaryNav.classList.remove('is-open');
    closeSubmenus();
  }));
  document.addEventListener('click',(event)=>{
    if(!primaryNav.contains(event.target)&&event.target!==navToggle) closeSubmenus();
  });
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape') closeSubmenus();
  });
}
document.querySelectorAll('[data-current-year]').forEach(node=>{node.textContent=String(new Date().getFullYear());});

const homeHero=document.querySelector('.home-hero');
if(homeHero){
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reducedMotion&&'IntersectionObserver' in window){
    homeHero.classList.add('is-motion-ready');
    const heroObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const visible=entry.intersectionRatio>=.35;
        const wasVisible=homeHero.classList.contains('is-visible');
        homeHero.classList.toggle('is-visible',visible);
        homeHero.classList.toggle('is-exiting',wasVisible&&!visible);
        if(visible) homeHero.classList.remove('is-exiting');
      });
    },{threshold:[0,.35],rootMargin:'0px 0px -5% 0px'});
    const heroCopy=homeHero.querySelector('.hero-copy');
    const copyObserver=heroCopy?new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const visible=entry.intersectionRatio>=.2;
        const wasVisible=homeHero.classList.contains('is-copy-visible');
        homeHero.classList.toggle('is-copy-visible',visible);
        homeHero.classList.toggle('is-copy-exiting',wasVisible&&!visible);
        if(visible) homeHero.classList.remove('is-copy-exiting');
      });
    },{threshold:[0,.2],rootMargin:'0px 0px -8% 0px'}):null;
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      heroObserver.observe(homeHero);
      if(heroCopy&&copyObserver) copyObserver.observe(heroCopy);
    }));
  }else{
    homeHero.classList.add('is-visible','is-copy-visible');
  }
}

const filterBar=document.querySelector('[data-filter-bar]');
if(filterBar){
  const search=filterBar.querySelector('[data-article-search]');
  const radios=[...filterBar.querySelectorAll('input[type="radio"]')];
  const cards=[...document.querySelectorAll('[data-article]')];
  const empty=document.querySelector('[data-empty-state]');
  const update=()=>{
    const query=(search?.value||'').trim().toLowerCase();
    const topic=radios.find(item=>item.checked)?.value||'All';
    let shown=0;
    cards.forEach(card=>{
      const text=card.dataset.search||'';
      const category=card.dataset.category||'';
      const topicMatch=topic==='All'||category.includes(topic);
      const searchMatch=!query||text.includes(query);
      card.hidden=!(topicMatch&&searchMatch);
      if(!card.hidden) shown+=1;
    });
    if(empty) empty.hidden=shown!==0;
  };
  search?.addEventListener('input',update);
  radios.forEach(item=>item.addEventListener('change',update));
}
const copyButton=document.querySelector('[data-copy-link]');
if(copyButton){
  copyButton.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(window.location.href);
      copyButton.textContent='Link copied';
      window.setTimeout(()=>{copyButton.textContent='Copy link';},1800);
    }catch{copyButton.textContent='Copy unavailable';}
  });
}
document.querySelectorAll('[data-social-share]').forEach(link=>{
  const pageUrl=encodeURIComponent(window.location.href);
  const pageTitle=encodeURIComponent(document.title);
  const destinations={
    linkedin:`https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
    facebook:`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
    x:`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`
  };
  link.href=destinations[link.dataset.socialShare]||'#';
});

const progress=document.querySelector('[data-reading-progress]');
if(progress){
  const updateProgress=()=>{
    const max=document.documentElement.scrollHeight-window.innerHeight;
    progress.style.width=`${max>0?Math.min(100,(window.scrollY/max)*100):0}%`;
  };
  addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();
}
const form=document.querySelector('[data-contact-form]');
if(form){
  const params=new URLSearchParams(window.location.search);
  const topic=params.get('topic');
  if(topic){
    const select=form.querySelector('select[name="category"]');
    const match=[...select.options].find(option=>option.textContent.toLowerCase().includes(topic.toLowerCase()));
    if(match) select.value=match.value;
  }
  const fields=[...form.querySelectorAll('[required]')];
  const validateField=(field)=>{
    const message=field.type==='email'&&!field.validity.valid?'Please enter a valid email address.':!field.validity.valid?'This field is required or incomplete.':'';
    const error=form.querySelector(`[data-error-for="${field.name}"]`);
    if(error) error.textContent=message;
    field.setAttribute('aria-invalid',String(Boolean(message)));
    return !message;
  };
  fields.forEach(field=>field.addEventListener('blur',()=>validateField(field)));
  form.addEventListener('submit',event=>{
    const valid=fields.map(validateField).every(Boolean);
    if(!valid||!form.action){
      event.preventDefault();
      fields.find(field=>field.getAttribute('aria-invalid')==='true')?.focus();
    }
  });
}

