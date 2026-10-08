export function initTechColors(scope) {
const {listen,IntersectionObserver,ResizeObserver,MutationObserver,requestAnimationFrame,cancelAnimationFrame}=scope;

  // Lighter brand-inspired tints keep technology labels legible on dark surfaces.
  const colors={
    'Java':'#f6ad70','Java SE (JSE)':'#f6ad70','Java EE (JEE)':'#f6ad70','Java SE / EE':'#f6ad70','Java API':'#f6ad70',
    'Spring':'#9cdb71','Spring Boot':'#9cdb71','Hibernate ORM':'#dec58d','JDBC':'#f6ad70','REST APIs':'#8bdcf3','APIs':'#8bdcf3','JWT':'#eea8da',
    'React':'#61dafb','React interface':'#61dafb','JavaScript':'#f1e05a','TypeScript':'#7db9f0','HTML':'#ffa07c','CSS':'#bcadff','Tailwind CSS':'#6cdeef','shadcn/ui':'#e4e4e7','Bootstrap':'#c4a5ff','Vite':'#c8a4ff','Axios':'#bcadff',
    'SQL':'#8bc2ff','PL/SQL':'#ff9f96','MySQL':'#82c5ec','Oracle':'#ff9f96','MongoDB':'#8cdb9b','Git':'#ff9a83','GitHub':'#e4eaf1',
    'Maven':'#f3a3b7','Gradle':'#8bdecf','Postman':'#ffb18d','Jira':'#93baff','Apache Tomcat':'#efd986','IntelliJ IDEA':'#ffa0c6','Eclipse':'#c1b0f2','VS Code':'#80c9ff',
    'Microservices':'#94d9ca','Jenkins':'#f0a5a5','Docker':'#85c6ff','SonarQube':'#8fccf1','JUnit':'#9ce0bb','Mockito':'#a6e3a1','Datadog':'#c9aff2','Log4j':'#e8b893','SLF4J':'#c9d0de','ELK Stack':'#f1d67e','Chef':'#f9bf7d','Heroku':'#cab6f5','AWS Basics':'#ffcb8c',
    'Responsive UI':'#6cdeef','Components':'#61dafb','API gateway':'#8bc2ff','Request flow':'#b7caff','SQL relations':'#8bc2ff','JSON documents':'#8cdb9b','Replication':'#c4b5fd','Database':'#c4b5fd'
  };
  function apply(scope=document){scope.querySelectorAll('.chips span,.layer-chips span,.tech-strip strong,.repo-meta span').forEach(el=>{const name=el.textContent.trim();if(colors[name]){el.dataset.tech=name;el.style.setProperty('--tech-color',colors[name]);}});}
  apply();
  ['layer-chips','github-repos'].forEach(id=>{const el=document.getElementById(id);if(el)new MutationObserver(()=>apply(el.parentElement)).observe(el,{childList:true,subtree:true});});

}
