export function initGithub(scope) {
const {listen,IntersectionObserver,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;

  const USER='rohankumar62', API=`https://api.github.com/users/${USER}`;
  const $=id=>document.getElementById(id);
  let current=null, expanded=false, busy=false;
  const date=value=>new Date(value).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const node=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);if(className)e.className=className;return e;};
  const repoLink=(name,text)=>{const a=node('a',text);a.href=`https://github.com/${name.split('/').map(encodeURIComponent).join('/')}`;a.target='_blank';a.rel='noopener noreferrer';return a;};
  function render(data,source){
    if(scope.disposed)return;
    current=data;
    const p=data.profile,repos=data.repos;
    const stats=[['Public repos',p.public_repos],['Stars received',repos.reduce((s,r)=>s+r.stargazers_count,0)],['Repository forks',repos.reduce((s,r)=>s+r.forks_count,0)],['Followers',p.followers],['Following',p.following],['Public gists',p.public_gists]];
    $('github-metrics').replaceChildren(...stats.map(([label,value])=>{const e=node('div',undefined,'github-metric');e.append(node('strong',value.toLocaleString()),node('span',label));return e;}));
    $('github-status').textContent=`${source} · ${date(data.fetchedAt)} · On GitHub since ${date(p.created_at)}`;
    const languageCounts={};repos.filter(r=>!r.fork&&r.language).forEach(r=>languageCounts[r.language]=(languageCounts[r.language]||0)+1);
    const total=Object.values(languageCounts).reduce((a,b)=>a+b,0);
    const colors=['#96e4dd','#87b6ff','#c1a9f1','#f0cd8c','#f29eb1','#91cbea'];const languageColors={Java:'#f6ad70',JavaScript:'#f1e05a',TypeScript:'#7db9f0',CSS:'#bcadff',HTML:'#ffa07c',Python:'#8fc8e8'};
    const languages=Object.entries(languageCounts).sort((a,b)=>b[1]-a[1]);
    $('github-languages').replaceChildren(...languages.map(([name,count],i)=>{const row=node('div',undefined,'language-row');const heading=node('div');heading.append(node('span',name),node('span',`${count} ${count===1?'repo':'repos'} · ${Math.round(count/total*100)}%`));const track=node('div',undefined,'language-track');const bar=node('span');bar.style.width=`${count/total*100}%`;bar.style.background=languageColors[name]||colors[i%colors.length];track.append(bar);row.append(heading,track);return row;}));
    if(!languages.length)$('github-languages').append(node('p','No language information is available.'));
    renderRepos();
    const events=Array.isArray(data.events)?data.events:null;
    const eventDate=data.eventsAt||data.fetchedAt;
    $('activity-caption').textContent=`30 days ending ${date(eventDate)} (UTC). Each square is one day.`;
    if(events){
      const end=new Date(eventDate);end.setUTCHours(0,0,0,0);const counts={};events.forEach(e=>{const key=e.created_at.slice(0,10);counts[key]=(counts[key]||0)+1;});
      const cells=[];for(let i=29;i>=0;i--){const day=new Date(end.getTime()-i*86400000),key=day.toISOString().slice(0,10),count=counts[key]||0;const cell=node('span',undefined,'activity-cell');cell.dataset.level=String(Math.min(count,4));cell.tabIndex=0;cell.title=`${date(key)}: ${count} public ${count===1?'event':'events'}`;cell.setAttribute('aria-label',cell.title);cells.push(cell);}$('github-calendar').replaceChildren(...cells);
      const labels={PushEvent:'Pushed code to',CreateEvent:'Created a branch, tag or repository in',PullRequestEvent:'Pull request activity in',IssuesEvent:'Issue activity in',IssueCommentEvent:'Commented in',WatchEvent:'Starred',ForkEvent:'Forked',DeleteEvent:'Deleted a branch or tag in',ReleaseEvent:'Release activity in'};
      $('github-events').replaceChildren(...events.slice(0,6).map(e=>{const li=node('li');const main=node('div');main.append(node('span',(labels[e.type]||'Public activity in')+' '),repoLink(e.repo.name,e.repo.name));li.append(main,node('time',date(e.created_at)));return li;}));
      if(!events.length)$('github-events').append(node('li','No recent public events were returned by GitHub.'));
    }else{$('github-calendar').replaceChildren(node('p','Activity data is currently unavailable.'));$('github-events').replaceChildren(node('li','Activity data is currently unavailable.'));}
  }
  function renderRepos(){
    const repos=[...current.repos].sort((a,b)=>new Date(b.pushed_at||b.updated_at)-new Date(a.pushed_at||a.updated_at));
    $('repo-count').textContent=`${repos.length} repositories in this snapshot`;
    $('github-repos').replaceChildren(...repos.slice(0,expanded?repos.length:6).map(r=>{const card=node('article',undefined,'repo-card');const top=node('div',undefined,'repo-top');const heading=node('h4');heading.append(repoLink(`${USER}/${r.name}`,r.name));top.append(heading,node('span',r.fork?'Fork':r.archived?'Archived':'Public','repo-badge'));card.append(top,node('p',r.description||'Explore the source code on GitHub.'));const meta=node('div',undefined,'repo-meta');meta.append(node('span',r.language||'Language not listed'),node('span',`★ ${r.stargazers_count} · Forks ${r.forks_count}`));card.append(meta,node('small',`Code updated ${date(r.pushed_at||r.updated_at)}`));return card;}));
    $('github-more').hidden=repos.length<=6;$('github-more').textContent=expanded?'Show fewer repositories':`Show all ${repos.length} repositories`;$('github-more').setAttribute('aria-expanded',String(expanded));
  }
  async function request(url){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),12000);try{const r=await fetch(url,{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.any([controller.signal,scope.signal])});if(!r.ok)throw Error(`GitHub ${r.status}`);return await r.json();}finally{clearTimeout(timer);}}
  async function fetchRepos(){let list=[];for(let page=1;page<=10;page++){const batch=await request(`${API}/repos?per_page=100&sort=updated&page=${page}`);if(!Array.isArray(batch))throw Error('Invalid repository response');list.push(...batch);if(batch.length<100)return list;}throw Error('Repository list incomplete');}
  async function refresh(){if(scope.disposed)return;if(busy)return;busy=true;$('github-refresh').disabled=true;$('github-refresh').textContent='Refreshing…';
    try{const [profile,repos,eventResult]=await Promise.all([request(API),fetchRepos(),request(`${API}/events/public?per_page=100`).then(value=>({value})).catch(()=>({value:null}))]);if(profile.login?.toLowerCase()!==USER||!Number.isInteger(profile.public_repos))throw Error('Unexpected profile');
      const now=new Date().toISOString();const data={profile,repos,events:eventResult.value??current?.events??null,eventsAt:eventResult.value?now:(current?.eventsAt||current?.fetchedAt),fetchedAt:now};render(data,'Updated from GitHub');
      if(!eventResult.value)$('github-status').textContent+=' · Recent activity could not refresh';
    }catch(error){if(scope.disposed)return;$('github-status').textContent=current?`GitHub is temporarily unavailable or rate-limited. Showing saved data from ${date(current.fetchedAt)}.`:'GitHub data could not load. Please open the profile or try Refresh stats.';
    }finally{if(scope.disposed)return;busy=false;$('github-refresh').disabled=false;$('github-refresh').textContent='Refresh stats';}
  }
  listen($('github-refresh'),'click',refresh);listen($('github-more'),'click',()=>{expanded=!expanded;renderRepos();});
  async function start(){try{const r=await fetch('/github-snapshot.json',{signal:scope.signal});if(!r.ok)throw Error('Snapshot unavailable');render(await r.json(),'Saved GitHub snapshot');}catch{}await refresh();}
  if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();start();}},{rootMargin:'250px'});observer.observe($('github'));}else start();

}
