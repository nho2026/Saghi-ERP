import 'dotenv/config';
import mysql from 'mysql2/promise';
import {spawn} from 'node:child_process';
import {writeFile,unlink,open} from 'node:fs/promises';
import {once} from 'node:events';
const source='/home/nho/Downloads/dhf_db-2026-09-15_203749-dump.sql';
const folder='/home/nho/Downloads/nho-full-import-2026-09-15';
const staging='nho_import_20260915_203749';
const url=new URL(process.env.DATABASE_URL);
const cfg={host:url.hostname,port:Number(url.port||3306),user:decodeURIComponent(url.username),password:decodeURIComponent(url.password),database:url.pathname.slice(1)};
const defaults=`${folder}/.mysql-import.cnf`;
const quote=s=>'"'+String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,'\\n')+'"';
await writeFile(defaults,`[client]\nhost=${quote(cfg.host)}\nport=${cfg.port}\nuser=${quote(cfg.user)}\npassword=${quote(cfg.password)}\n`,{mode:0o600});
const c=await mysql.createConnection(cfg);
try{
 const [existing]=await c.query('SELECT COUNT(*) n FROM information_schema.TABLES WHERE TABLE_SCHEMA=?',[staging]);
 if(existing[0].n)throw Error('Staging already contains tables; inspect existing work before restarting');
 const handle=await open(`${folder}/target-before-import.sql`,'wx',0o600);
 const backup=spawn('mysqldump',[`--defaults-extra-file=${defaults}`,'--single-transaction','--routines','--triggers','--hex-blob','--no-tablespaces',cfg.database],{stdio:['ignore',handle.fd,'pipe']});
 let backupError='';backup.stderr.on('data',chunk=>backupError+=chunk);
 const [backupExit]=await once(backup,'close');await handle.close();
 if(backupExit)throw Error(`Backup failed: ${backupError}`);
 console.log('Target database backup complete.');
 await c.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',[staging]);
 const parser=spawn('python3',['scripts/full-import/stage-dump.py',source],{stdio:['ignore','pipe','pipe']});
 const importer=spawn('mysql',[`--defaults-extra-file=${defaults}`,'--binary-mode=1','--max-allowed-packet=256M',staging],{stdio:['pipe','ignore','pipe']});
 let errors='';parser.stderr.on('data',chunk=>errors+=chunk);importer.stderr.on('data',chunk=>errors+=chunk);
 const parserDone=once(parser,'close'),importDone=once(importer,'close');
 parser.stdout.pipe(importer.stdin);importer.stdin.on('error',()=>parser.kill());
 const started=Date.now();const timer=setInterval(()=>console.log(`Staging import running: ${Math.round((Date.now()-started)/1000)}s`),30000);
 const [[parserExit],[importExit]]=await Promise.all([parserDone,importDone]);clearInterval(timer);
 if(parserExit||importExit)throw Error(`Staging load failed: ${errors.slice(0,1200)}`);
 const [tables]=await c.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? ORDER BY TABLE_NAME',[staging]);
 const inventory=[];for(const {TABLE_NAME:table}of tables){const [count]=await c.query('SELECT COUNT(*) n FROM ??.??',[staging,table]);inventory.push({table,rows:count[0].n});}
 await writeFile(`${folder}/source-inventory.json`,JSON.stringify({source,staging,target:cfg.database,tables:inventory,createdAt:new Date().toISOString()},null,2),{mode:0o600});
 console.log(JSON.stringify({staging,tables:inventory.length,rows:inventory.reduce((n,t)=>n+t.rows,0),nonempty:inventory.filter(t=>t.rows).length},null,2));
}finally{await c.end();await unlink(defaults).catch(()=>{});}
