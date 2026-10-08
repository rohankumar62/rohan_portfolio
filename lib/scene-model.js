import * as THREE from 'three';

// Four original, separate dioramas: a system, interface lab, services, and data.
export function createWorkstation() {
  const root=new THREE.Group();
  const layers=Object.fromEntries(['all','frontend','backend','data'].map(k=>[k,new THREE.Group()]));
  const animations=[]; const materials=[]; const annotations=[]; const screens=[]; let selected='all';
  const colors={mint:0x83efdb,blue:0x83b6ff,purple:0xbba2ff};
  function mat(color,metalness=.4,emissive=0){const m=new THREE.MeshStandardMaterial({color,metalness,roughness:.3,emissive,emissiveIntensity:.65});materials.push(m);return m;}
  const metal=mat(0x405569,.82),dark=mat(0x0a1424,.4),base=mat(0x111e32,.75);
  const mint=mat(colors.mint,.3,colors.mint),blue=mat(colors.blue,.3,colors.blue),purple=mat(colors.purple,.3,colors.purple);
  function box(g,w,h,d,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o;}
  function cyl(g,r,h,m,x=0,y=0,z=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,48),m);o.position.set(x,y,z);g.add(o);return o;}
  function ring(g,r,y,m,x=0,z=0){const o=new THREE.Mesh(new THREE.TorusGeometry(r,.015,8,80),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);g.add(o);return o;}
  function texture(kind,title,aspect){
    if(typeof document==='undefined')return null;
    const c=document.createElement('canvas');c.width=kind==='phone'||kind==='components'?1000:1600;c.height=Math.round(c.width/aspect);
    const ctx=c.getContext('2d');if(!ctx)return null;const W=c.width,H=c.height;
    const ink='#f0f7ff',muted='#b6c9dd',mint='#99e9d9';
    ctx.fillStyle='#091421';ctx.fillRect(0,0,W,H);
    const text=(value,x,y,size=.055,color=ink)=>{ctx.fillStyle=color;ctx.font=`400 ${W*size}px Arial, sans-serif`;ctx.fillText(value,W*x,H*y);};
    const rect=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(W*x,H*y,W*w,H*h);};
    const line=(y)=>{rect(.065,y,.87,.0015,'#355067');};
    rect(0,0,1,.105,'#12283b');text(title.replaceAll(' / ',' · '),.055,.073,.034,'#b4dbe8');
    if(kind==='ui'){
      text('Hello, Rohan.',.065,.26,.088);text('Your project workspace',.065,.35,.041,muted);
      [['Projects','Build'],['Components','Reuse'],['Activity','Review']].forEach(([heading,detail],i)=>{const x=.065+i*.296;rect(x,.45,.275,.32,'#152e41');text(heading,x+.025,.545,.039,mint);text(detail,x+.025,.68,.063);});
      text('React',.065,.92,.041,mint);text('Responsive by design',.42,.92,.035,muted);
    }else if(kind==='phone'){
      text('Workspace',.075,.2,.105);text('Hello, Rohan.',.075,.27,.06,muted);
      ['Projects','Messages','Activity'].forEach((name,i)=>{const y=.35+i*.155;rect(.06,y,.88,.125,'#153247');text(name,.11,y+.077,.09);});text('React mobile',.075,.93,.058,mint);
    }else if(kind==='components'){
      text('UI components',.075,.23,.078);text('One visual language',.075,.3,.045,muted);
      rect(.075,.38,.85,.13,'#91ddcf');text('Primary button',.13,.463,.065,'#082a2d');
      rect(.075,.57,.85,.12,'#233a4e');text('Input field',.13,.645,.065);text('Cards · Forms · States',.075,.86,.045,muted);
    }else if(kind==='table'){
      text(title==='USERS'?'Users':'Projects',.065,.23,.085);line(.29);
      const xs=[.07,.24,.58];const headers=title==='USERS'?['ID','Name','Role']:['ID','User ID','Status'];
      headers.forEach((v,i)=>text(v,xs[i],.405,.05,mint));
      const rows=title==='USERS'?[['01','Rohan','Developer'],['02','Asha','User']]:[['101','01','Active'],['102','02','Pending']];
      rows.forEach((row,j)=>{line(.46+j*.2);row.forEach((v,i)=>text(v,xs[i],.6+j*.2,.049));});
      text(title==='USERS'?'Primary key: id':'Foreign key: user_id',.065,.94,.035,muted);
    }else if(kind==='json'){
      text('Project document',.06,.23,.073);
      ['{','  "owner": "Rohan",','  "stack": ["Java", "React"]','}'].forEach((v,i)=>text(v,.06,.42+i*.14,.046,i%2?ink:mint));
    }else{
      text('POST /api/projects',.06,.245,.067,mint);
      ['01  Authenticate','02  Validate input','03  Run Java service','04  Save to database'].forEach((v,i)=>text(v,.06,.4+i*.12,.047));
      line(.84);text('201 Created',.06,.94,.048,mint);
    }
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
  }
  function roundedShape(w,h,r){const shape=new THREE.Shape(),x=-w/2,y=-h/2;shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+h-r);shape.quadraticCurveTo(x+w,y+h,x+w-r,y+h);shape.lineTo(x+r,y+h);shape.quadraticCurveTo(x,y+h,x,y+h-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);return shape;}
  function panel(g,w,h,title,kind,x,y,z){
    const shell=new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(w+.13,h+.13,.07),{depth:.055,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:3,steps:1,curveSegments:8}),metal);
    shell.position.set(x,y,z-.035);g.add(shell);
    const t=texture(kind,title,w/h);const face=new THREE.Mesh(new THREE.PlaneGeometry(w,h),t?new THREE.MeshBasicMaterial({map:t,toneMapped:false}):dark);face.position.set(x,y,z+.062);g.add(face);
    box(g,w*.86,.012,.018,mint,x,y-h/2-.04,z+.06);
    const titles={'REACT / INTERFACE':'Dashboard','MOBILE':'Mobile interface','UI KIT':'UI components','API REQUEST':'API request','USERS':'Users table','PROJECTS':'Projects table','DOCUMENT / JSON':'JSON document'};
    screens.push({face,width:w,height:h,title:titles[title]||title});return face;
  }
  function label(g,text,x,y,z,color='#d9fff7',scale=1){
    // Screen-space HTML keeps every caption readable, independent of distance.
    const anchor=new THREE.Object3D();anchor.position.set(x,y,z);g.add(anchor);
    const names={"JAVA / API":"Java API","DATABASE":"Database","CLIENT":"React client","REACT COMPONENTS":"React workspace","RESPONSIVE":"Mobile","JAVA SERVICES":"Java services","AUTH / LOGIC":"Authentication","API GATEWAY":"API gateway","DATABASE CLUSTER":"Data cluster","REPLICA":"Replica"};
    if(text.includes("→")||text.includes("·")||text.includes("+"))return;
    annotations.push({anchor,text:names[text]||text,color});
  }
  function monitor(g,x,z,scale=1){const group=new THREE.Group();group.position.set(x,0,z);group.scale.setScalar(scale);g.add(group);box(group,.72,.07,.47,metal,0,-.19,0);box(group,.12,.48,.12,metal,0,.06,-.05);panel(group,2.8,1.65,'REACT / INTERFACE','ui',0,1.12,0);box(group,2.95,.023,.14,mint,0,.22,0);box(group,1.9,.06,.67,metal,0,-.13,.68);for(let i=0;i<3;i++)for(let j=0;j<10;j++)box(group,.13,.012,.12,dark,-.75+j*.165,-.092,.48+i*.17);return group;}
  function server(g,x,z,scale=1,labelText='SPRING BOOT'){const group=new THREE.Group();group.position.set(x,-.15,z);group.scale.setScalar(scale);g.add(group);box(group,1.13,2.02,.95,metal,0,.92,0);box(group,1.02,1.87,.03,dark,0,.92,.49);for(let i=0;i<5;i++){box(group,.88,.27,.045,base,0,.2+i*.35,.525);box(group,.045,.045,.02,i%2?mint:blue,-.32,.2+i*.35,.56);for(let j=0;j<5;j++)box(group,.045,.1,.02,metal,-.17+j*.09,.2+i*.35,.56);box(group,.82,.01,.015,blue,0,.345+i*.35,.56);}label(group,labelText,0,2.2,.1,'#9dc5ff',.8);return group;}
  function database(g,x,z,scale=1,name='DATA STORE'){const group=new THREE.Group();group.position.set(x,-.12,z);group.scale.setScalar(scale);g.add(group);for(let i=0;i<4;i++){cyl(group,.67,.29,metal,0,i*.37,0);ring(group,.671,i*.37+.12,purple);}cyl(group,.59,.018,dark,0,1.272,0);ring(group,.43,1.3,purple);label(group,name,0,1.75,0,'#cab5ff',.9);return group;}
  function route(g,points,color){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.35});g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.013,6,false),material));const packet=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),new THREE.MeshBasicMaterial({color}));g.add(packet);animations.push({owner:g,packet,curve});return curve;}
  function platform(g,color){cyl(g,3.65,.085,base,0,-.43,0);cyl(g,3.36,.065,metal,0,-.54,0);ring(g,3.17,-.25,mat(color,.25,color));ring(g,3.66,-.34,mat(color,.3,color));ring(g,3.45,-.33,metal);for(let i=0;i<32;i++){const a=i*Math.PI/16;const m=box(g,.028,.01,.12,metal,Math.sin(a)*3.54,-.32,Math.cos(a)*3.54);m.rotation.y=a;}}
  // Full stack: a single user journey flows from UI, through services, to storage.
  {const g=layers.all;platform(g,colors.mint);monitor(g,-1.65,.7,.77);server(g,.3,-.65,.8,'JAVA / API');database(g,2.15,.25,.78,'DATABASE');label(g,'CLIENT',-1.65,2.03,.7);label(g,'REQUEST → LOGIC → DATA',0,-.08,2.55,'#9fbcd6',1.1);route(g,[[-.65,.4,.7],[-.3,.25,.4],[.3,.4,-.1]],colors.mint);route(g,[[.75,.4,-.3],[1.3,.25,-.15],[1.85,.4,.3]],colors.purple);route(g,[[1.85,.08,.9],[.4,.05,1.75],[-1.4,.08,1.35]],colors.blue);}
  // Frontend: a real dashboard monitor, responsive phone, and component palette.
  {const g=layers.frontend;platform(g,colors.mint);monitor(g,-.4,.15,1.15);const phone=new THREE.Group();g.add(phone);phone.position.set(2.08,.7,.75);phone.rotation.y=-.27;box(phone,.84,1.64,.14,metal);panel(phone,.7,1.38,'MOBILE','phone',0,0,.05);box(phone,.21,.018,.02,mint,0,-.76,.13);const components=new THREE.Group();g.add(components);components.position.set(-2.6,.8,.15);components.rotation.y=.25;panel(components,1.13,1.55,'UI KIT','components',0,0,0);label(g,'REACT COMPONENTS',-.4,2.45,.3,'#9bedda');label(g,'RESPONSIVE',2.1,1.85,.7,'#9bedda',.65);route(g,[[.6,.1,.9],[1.4,.05,1.3],[2.1,.15,.85]],colors.mint);}
  // Backend: gateway, Java service racks, and an explicit request pipeline.
  {const g=layers.backend;platform(g,colors.blue);server(g,-1.5,-.4,1.02,'JAVA SERVICES');server(g,.15,-.9,.84,'AUTH / LOGIC');panel(g,1.92,1.47,'API REQUEST','api',1.8,.8,.3);const gateway=new THREE.Group();g.add(gateway);gateway.position.set(-.15,.1,1.9);box(gateway,2.55,.27,.55,metal);box(gateway,2.35,.018,.02,blue,0,.04,.285);label(gateway,'API GATEWAY',0,.44,.05,'#b7d2ff',.9);route(g,[[0,.15,1.7],[-1.4,.1,.95],[-1.5,.25,.15]],colors.blue);route(g,[[-.1,.15,1.7],[.2,.2,.75],[.15,.25,-.5]],colors.mint);route(g,[[.7,.45,-.65],[1.65,.3,-.4],[1.8,.4,.4]],colors.blue);label(g,'REQUEST · VALIDATE · RESPOND',0,2.63,-.25,'#a6caff',1.15);}
  // Database: relational tables, a document panel, and linked storage clusters.
  {const g=layers.data;platform(g,colors.purple);database(g,0,-.15,1.1,'DATABASE CLUSTER');panel(g,1.62,1.15,'USERS','table',-2,1,.6);panel(g,1.62,1.15,'PROJECTS','table',2,1,.6);panel(g,1.44,1.02,'DOCUMENT / JSON','json',0,.5,1.95);database(g,-1.55,-1.45,.43,'REPLICA');database(g,1.55,-1.45,.43,'REPLICA');route(g,[[-1.3,.7,.62],[-.9,.35,.4],[-.6,.5,0]],colors.purple);route(g,[[.6,.5,0],[.9,.35,.4],[1.3,.7,.62]],colors.purple);route(g,[[0,.4,1.9],[.35,.25,1],[0,.4,.5]],colors.mint);route(g,[[-1.5,.1,-1.4],[0,.06,-1],[1.5,.1,-1.4]],colors.blue);label(g,'RELATIONS + DOCUMENTS',0,2.47,-.25,'#d5c2ff',1.1);}
  for(const [key,g] of Object.entries(layers)){g.name=key;g.visible=key===selected;root.add(g);}
  function selectLayer(key){selected=key in layers?key:'all';for(const [k,g]of Object.entries(layers))g.visible=k===selected;}
  function update(time,animated){for(const [i,a]of animations.entries()){if(!a.owner.visible)continue;const t=animated?(time*.2+i*.24)%1:.42;a.packet.position.copy(a.curve.getPointAt(t));}}
  return {root,layers,selectLayer,update,materials,annotations,screens,get selected(){return selected;}};
}

// Frame the actual screen front-on while preserving its original aspect ratio.
export function screenCameraPose(screen,aspect,verticalFov=36){
  screen.face.updateWorldMatrix(true,false);
  const target=screen.face.getWorldPosition(new THREE.Vector3());
  const scale=screen.face.getWorldScale(new THREE.Vector3());
  const orientation=screen.face.getWorldQuaternion(new THREE.Quaternion());
  const normal=new THREE.Vector3(0,0,1).applyQuaternion(orientation);
  const up=new THREE.Vector3(0,1,0).applyQuaternion(orientation);
  const halfTan=Math.tan(THREE.MathUtils.degToRad(verticalFov)/2);
  const distance=Math.max(screen.height*scale.y/(2*halfTan),screen.width*scale.x/(2*halfTan*aspect))*1.12;
  return {target,position:target.clone().addScaledVector(normal,distance),up};
}
