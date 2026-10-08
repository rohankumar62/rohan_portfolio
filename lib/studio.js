export function initStudio(scope) {
const {listen,IntersectionObserver,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;
const host = document.getElementById('scene-host');
const placeholder = document.getElementById('scene-placeholder');
const status = document.getElementById('scene-status');
const buttons = [...document.querySelectorAll('[data-layer]')];
const rotateLeft = document.getElementById('rotate-left');
const rotateRight = document.getElementById('rotate-right');
const reset = document.getElementById('reset-scene');
const focusButton=document.getElementById('focus-screen');
const screenSelect=document.getElementById('screen-select');
const descriptions = {
  all: ['00 / FULL-STACK SYSTEM','One request. Every layer.','Follow the complete journey: a React interface sends a request to the Java API, application logic talks to the database, and the response returns to the user.',['React interface','Java API','Database']],
  frontend: ['01 / FRONTEND EXPERIENCE','Interfaces you can feel.','A desktop dashboard, a responsive mobile view, and a reusable component palette. This is the layer where layout, interaction, and visual feedback come together.',['React','Responsive UI','Components']],
  backend: ['02 / BACKEND ENGINE','Inside the application.','Requests enter the API gateway and move through validation, authentication, and Java services. The service layer applies business rules and returns a structured response.',['API gateway','Spring Boot','Request flow']],
  data: ['03 / DATABASE SYSTEM','Structure behind the story.','Explore related Users and Projects tables, a JSON document, and connected storage nodes. A conceptual view of relational data, document data, and replication.',['SQL relations','JSON documents','Replication']]
};
const sceneNames={all:'FULL-STACK SYSTEM',frontend:'FRONTEND EXPERIENCE',backend:'BACKEND ENGINE',data:'DATABASE SYSTEM'};
const sceneAlt={all:'A React monitor connected to a Java server and a database by animated request and response paths.',frontend:'A dashboard monitor, responsive smartphone and UI component panel.',backend:'An API gateway connected to Java service racks and a request pipeline display.',data:'Related Users and Projects tables, a JSON document, and a database cluster with replica nodes.'};
const sceneDetails = {
  all: {
    parts: [['React interface','The user clicks a button or submits a form. The browser sends an API request.'],['Java / Spring Boot API','The backend validates the input, applies business rules, and calls the data layer.'],['Database + response','The database reads or saves records. The API returns JSON and React updates the screen.']],
    heading:'A complete request, step by step',
    example:'USER ACTION → REACT UI\n    ↓ HTTP request\nSPRING BOOT → SERVICE → REPOSITORY\n    ↓ read / write\nDATABASE\n    ↑ JSON response → UI update'
  },
  frontend: {
    parts: [['Desktop dashboard','The large monitor represents React pages, navigation, cards, and visual feedback.'],['Responsive mobile view','The phone represents layouts that adapt to a smaller screen while keeping actions easy to use.'],['Reusable UI components','The side panel represents shared buttons, forms, and cards styled with Tailwind CSS or shadcn/ui.']],
    heading:'What the interface is made of',
    example:'React page\n├─ Navigation\n├─ Dashboard cards\n├─ Form + input validation\n└─ Loading, success & error states\n\nLayout: desktop grid → mobile stack'
  },
  backend: {
    parts: [['API gateway / endpoint','The entry point receives an HTTP request and routes it to the application.'],['Authentication + Java service','Authentication checks identity; validation checks inputs; the service applies business rules.'],['Repository + response','The repository accesses stored data, then the API returns a response with an appropriate HTTP status.']],
    heading:'Example API request flow',
    example:'POST /api/projects\n    ↓ authenticate + validate\nProjectController\n    ↓ ProjectService\n    ↓ ProjectRepository → database\n201 Created + JSON response'
  },
  data: {
    parts: [['Users ↔ Projects tables','A project can reference its owner through user_id. The relationship connects records across tables.'],['JSON document','A document stores related fields together, such as the project name, owner, and technology stack.'],['Storage cluster + replicas','The cylinders represent primary storage and copies of data. This is a conceptual model, not a live database.']],
    heading:'Readable data examples',
    example:'USERS:    id | name\n           1 | Rohan\nPROJECTS: id | user_id | name\n         101 |    1    | Portfolio\n\n{ "owner": "Rohan",\n  "stack": ["Java", "React"] }'
  }
};
function updateDetails(key){
  const detail=sceneDetails[key];
  document.getElementById('scene-detail-parts').replaceChildren(...detail.parts.map(([title,description],i)=>{
    const article=document.createElement('article');const number=document.createElement('span');number.className='detail-number';number.textContent=String(i+1).padStart(2,'0');
    const heading=document.createElement('h4');heading.textContent=title;const paragraph=document.createElement('p');paragraph.textContent=description;article.append(number,heading,paragraph);return article;
  }));
  document.getElementById('scene-example-title').textContent=detail.heading;
  document.getElementById('scene-example').textContent=detail.example;
}
updateDetails('all');
let selectModel = () => {};
buttons.forEach(button=>listen(button,'click',()=>{
  const key=button.dataset.layer;const [number,title,description,chips]=descriptions[key];
  buttons.forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
  document.getElementById('layer-number').textContent=number;
  document.getElementById('layer-title').textContent=title;
  document.getElementById('layer-description').textContent=description;
  document.getElementById('layer-chips').replaceChildren(...chips.map(label=>{const el=document.createElement('span');el.textContent=label;return el;}));
  document.getElementById('scene-name').textContent=sceneNames[key];
  document.querySelector('.playground').dataset.mode=key;
  host.setAttribute('aria-label',sceneAlt[key]);
  updateDetails(key);
  selectModel(key);
}));
[rotateLeft,rotateRight,reset].forEach(b=>b.disabled=true);
async function initializeScene(){
  try {
    const THREE = await import('three');
    const {createWorkstation,screenCameraPose} = await import('./scene-model.js');
    if(scope.disposed) return;
    const renderer = new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.5;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(2.5,3.2,9.2);camera.lookAt(0,.65,0);
    const model=createWorkstation();scene.add(model.root);
    scope.cleanup(() => {
      const textures=new Set(),materials=new Set(),geometries=new Set();
      model.root.traverse(object => {
        if(object.geometry) geometries.add(object.geometry);
        for(const material of (Array.isArray(object.material)?object.material:[object.material]).filter(Boolean)) {
          materials.add(material); Object.values(material).forEach(value=>{if(value?.isTexture)textures.add(value);});
        }
      });
      textures.forEach(x=>x.dispose());materials.forEach(x=>x.dispose());geometries.forEach(x=>x.dispose());
      renderer.dispose(); renderer.domElement.remove();host.querySelector('.scene-labels')?.remove();
    });
    scene.add(new THREE.HemisphereLight(0xcbeeff,0x182039,3));
    const keyLight=new THREE.DirectionalLight(0xc0efff,4);keyLight.position.set(2,5,3);scene.add(keyLight);
    const rim=new THREE.DirectionalLight(0x7b99ff,3);rim.position.set(-3,2,-3);scene.add(rim);
    const fill=new THREE.PointLight(0x81e8d5,12,15);fill.position.set(2,2,3);scene.add(fill);
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',sceneAlt.all+' Drag horizontally or use left and right arrow keys to rotate.');
    host.appendChild(canvas);
    const labelLayer=document.createElement('div');labelLayer.className='scene-labels';labelLayer.setAttribute('aria-hidden','true');host.appendChild(labelLayer);
    const captions=model.annotations.map(annotation=>{const el=document.createElement('span');el.className='scene-caption';el.textContent=annotation.text;labelLayer.appendChild(el);return {...annotation,el};});
    const worldPosition=new THREE.Vector3();
    function placeCaptions(){
      const w=host.clientWidth,h=host.clientHeight,placed=[];
      model.root.updateMatrixWorld(true);
      const visibleCaptions=[];
      for(const caption of captions){let visible=true;for(let node=caption.anchor;node;node=node.parent){if(!node.visible){visible=false;break;}}
        caption.el.hidden=!visible;if(!visible)continue;
        caption.anchor.getWorldPosition(worldPosition);worldPosition.project(camera);
        if(worldPosition.z < -1 || worldPosition.z > 1){caption.el.hidden=true;continue;}
        visibleCaptions.push({caption,x:(worldPosition.x*.5+.5)*w,y:(-.5*worldPosition.y+.5)*h});
      }
      visibleCaptions.sort((a,b)=>a.y-b.y);
      for(const {caption,x,y} of visibleCaptions){const cw=caption.el.offsetWidth,ch=caption.el.offsetHeight;
        const left=Math.max(8,Math.min(w-cw-8,x-cw/2));const initial=Math.max(12,Math.min(h-ch-12,y-ch-8));let top=initial;
        for(let step=0;step<24;step++){const direction=step%2?1:-1;const candidate=Math.max(12,Math.min(h-ch-12,initial+direction*Math.ceil(step/2)*(ch+8)));
          if(!placed.some(r=>left<r.x+r.w+7&&left+cw+7>r.x&&candidate<r.y+r.h+7&&candidate+ch+7>r.y)){top=candidate;break;}}
        caption.el.style.transform=`translate(${Math.round(left)}px,${Math.round(top)}px)`;placed.push({x:left,y:top,w:cw,h:ch});
      }
    }
    let running=window.portfolioMotion?.enabled ?? !matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible=true,frame=0,last=0,elapsed=0,yaw=-.12,dragging=false,lastX=0,focused=false,availableScreens=[];
    const isVisible=object=>{for(let n=object;n;n=n.parent)if(!n.visible)return false;return true;};
    function updateScreens(){availableScreens=model.screens.filter(screen=>isVisible(screen.face));screenSelect.replaceChildren(...availableScreens.map((screen,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=screen.title;return option;}));screenSelect.value='0';screenSelect.disabled=!availableScreens.length;focusButton.disabled=!availableScreens.length;}
    function overviewCamera(){camera.up.set(0,1,0);const distance=Math.max(10.4,7.95/(2*Math.tan(Math.PI/10)*camera.aspect));camera.position.set(1.6,2.8,9.2).normalize().multiplyScalar(distance).add(new THREE.Vector3(0,.7,0));camera.lookAt(0,.7,0);}
    function updateView(){
      focusButton.textContent=focused?'Return to model':'Focus screen';focusButton.setAttribute('aria-pressed',String(focused));host.dataset.view=focused?'screen':'model';
      labelLayer.hidden=focused;rotateLeft.disabled=focused;rotateRight.disabled=focused;
      if(!focused)overviewCamera();
      canvas.setAttribute('aria-label',focused?`Close-up of ${availableScreens[Number(screenSelect.value)]?.title||'screen'}. Use Return to model to see the complete scene.`:sceneAlt[model.selected]+' Drag to rotate; use Focus screen to read a display.');
      render();schedule();
    }
    function render(){model.root.rotation.y=focused?0:yaw+(running&&!dragging?Math.sin(elapsed*.18)*.06:0);model.update(elapsed,running&&!focused);
      if(focused&&availableScreens.length){const pose=screenCameraPose(availableScreens[Number(screenSelect.value)||0],camera.aspect,camera.fov);camera.position.copy(pose.position);camera.up.copy(pose.up);camera.lookAt(pose.target);}
      renderer.render(scene,camera);if(!focused)placeCaptions();}
    function tick(now){frame=0;const dt=last?Math.min((now-last)/1000,.05):0;last=now;elapsed+=dt;render();if(running&&visible&&!document.hidden&&!focused)frame=requestAnimationFrame(tick);}
    function schedule(){if(running&&visible&&!document.hidden&&!focused&&!frame){last=0;frame=requestAnimationFrame(tick);}else if(!running||!visible||document.hidden||focused){cancelAnimationFrame(frame);frame=0;render();}}
    function size(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!focused)overviewCamera();render();}
    new ResizeObserver(size).observe(host);size();placeholder.hidden=true;
    [rotateLeft,rotateRight,reset].forEach(b=>b.disabled=false);
    selectModel=layer=>{model.selectLayer(layer);yaw=-.12;focused=false;updateScreens();updateView();canvas.setAttribute('aria-label',sceneAlt[layer]+' Drag horizontally or use left and right arrow keys to rotate.');
      if(running&&canvas.animate)canvas.animate([{opacity:.25,transform:'scale(.96)'},{opacity:1,transform:'scale(1)'}],{duration:450,easing:'ease-out'});
      render();};
    selectModel(document.querySelector('[data-layer].active').dataset.layer);
    listen(focusButton,'click',()=>{focused=!focused;updateView();});
    listen(screenSelect,'change',()=>{focused=true;updateView();});
    const rotate=delta=>{if(focused)return;yaw+=delta;render();};
    listen(rotateLeft,'click',()=>rotate(-.35));listen(rotateRight,'click',()=>rotate(.35));
    listen(reset,'click',()=>{yaw=-.12;focused=false;updateView();});
    listen(canvas,'pointerdown',event=>{if(event.button!==0||focused)return;dragging=true;lastX=event.clientX;canvas.setPointerCapture(event.pointerId);canvas.classList.add('dragging');});
    listen(canvas,'pointermove',event=>{if(!dragging)return;rotate((event.clientX-lastX)*.008);lastX=event.clientX;});
    const release=()=>{dragging=false;canvas.classList.remove('dragging');};
    listen(canvas,'pointerup',release);listen(canvas,'pointercancel',release);listen(canvas,'lostpointercapture',release);
    listen(canvas,'keydown',event=>{if(!focused&&(event.key==='ArrowLeft'||event.key==='ArrowRight')){event.preventDefault();rotate(event.key==='ArrowLeft'?-.2:.2);}});
    listen(window,'portfolio-motion',event=>{running=event.detail.enabled;schedule();});
    listen(document,'visibilitychange',schedule);
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.05}).observe(host);
    listen(canvas,'webglcontextlost',event=>{event.preventDefault();running=false;schedule();canvas.hidden=true;labelLayer.hidden=true;placeholder.hidden=false;status.textContent='The 3D view is unavailable. You can still explore each layer below.';[rotateLeft,rotateRight,reset,focusButton,screenSelect].forEach(b=>b.disabled=true);});
    schedule();
  } catch(error){
    if(scope.disposed)return;
    status.textContent='The 3D view isn’t supported here. You can still explore each layer below.';
    placeholder.hidden=false;
    const canvas=host.querySelector('canvas');if(canvas)canvas.remove();host.querySelector('.scene-labels')?.remove();
    [rotateLeft,rotateRight,reset,focusButton,screenSelect].forEach(b=>b.disabled=true);
    console.warn('3D workstation could not start:',error);
  }
}
// Load the local Three.js bundle when the studio is approaching the viewport.
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();initializeScene();}},{rootMargin:'350px'});observer.observe(host);}else initializeScene();

}
