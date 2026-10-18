import 'dotenv/config';
import mysql from 'mysql2/promise';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';

// One-time replacement from the reviewed SQL export, staged as JSON.
const folder='/home/nho/Downloads/nho-products-import-2026-09-15';
const apply=process.argv.includes('--apply');
const { products, categories, companies }=JSON.parse(await readFile(`${folder}/source-products.json`,'utf8'));
if(products.length!==1555)throw Error('Unexpected source product count');
const u=new URL(process.env.DATABASE_URL);
const c=await mysql.createConnection({host:u.hostname,port:Number(u.port||3306),user:decodeURIComponent(u.username),password:decodeURIComponent(u.password),database:u.pathname.slice(1),dateStrings:true});
const report={applied:apply,sourceCount:products.length,priceCurrency:'USD',codeChanges:[],invalidBarcodes:[],imagesUnavailable:products.filter(p=>p.image&&p.image!=='no-image.png').length};
try {
 const codeCounts=new Map();
 for(const p of products){const code=p.code?.trim().toLowerCase();if(code)codeCounts.set(code,(codeCounts.get(code)||0)+1);}
 const codes=new Set(products.filter(p=>p.code?.trim()&&codeCounts.get(p.code.trim().toLowerCase())===1).map(p=>p.code.trim().toLowerCase()));
 const prepared=products.map(p=>{
  let sku=p.code?.trim();
  if(!sku||codeCounts.get(sku.toLowerCase())>1){const base=sku||'IMPORT';const hash=createHash('sha256').update(p.barcode).digest('hex').slice(0,12);sku=`${base.slice(0,170)}-${hash}`;let n=1;while(codes.has(sku.toLowerCase()))sku=`${base.slice(0,165)}-${hash}-${n++}`;codes.add(sku.toLowerCase());report.codeChanges.push({barcode:p.barcode,original:p.code,sku});}
  const barcode=[...p.barcode].length>191?null:p.barcode;
  if(!barcode)report.invalidBarcodes.push({name:p.name,original:p.barcode});
  const category=categories.find(x=>x.categoryId===p.categoryId);const company=companies.find(x=>x.productionCompanyId===p.productionCompanyId);
  if(!category||!company)throw Error(`Missing directory for ${p.name}`);
  return {p,sku,barcode,category,company,id:randomUUID()};
 });
 await c.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');await c.beginTransaction();
 const [old]=await c.query('SELECT * FROM inventory_InventoryProduct FOR UPDATE');report.removedProducts=old.length;
 const [tables]=await c.query('SHOW TABLES');const backup={database:u.pathname.slice(1),createdAt:new Date().toISOString(),tables:{}};
 for(const row of tables){const table=Object.values(row)[0];backup.tables[table]=(await c.query('SELECT * FROM ??',[table]))[0];}
 if(apply)await writeFile(`${folder}/database-immediately-before-import.json`,JSON.stringify(backup,null,2),{mode:0o600});
 const categoryMap=new Map();const [existingCategories]=await c.query('SELECT * FROM inventory_ProductCategory');
 for(const {category} of prepared){if(categoryMap.has(category.categoryId))continue;const existing=existingCategories.find(x=>x.name.toLowerCase()===category.name.toLowerCase());const id=existing?.id||randomUUID();categoryMap.set(category.categoryId,id);if(apply&&!existing){await c.query('INSERT INTO inventory_ProductCategory (id,name,status,createdAt,updatedAt) VALUES (?,?,\'active\',?,?)',[id,category.name,category.createdAt,category.updatedAt]);existingCategories.push({id,name:category.name});}}
 if(apply){
  report.removedMovements=(await c.query('DELETE FROM inventory_InventoryMovement'))[0].affectedRows;
  report.removedSaleItems=(await c.query('DELETE FROM pos_PosSaleItem'))[0].affectedRows;
  // Remove the now-empty sale headers, preserving unrelated sales.
  report.removedEmptySales=(await c.query('DELETE s FROM pos_PosSale s LEFT JOIN pos_PosSaleItem i ON i.saleId=s.id WHERE i.id IS NULL'))[0].affectedRows;
  await c.query('DELETE FROM inventory_InventoryProduct');
  const [warehouses]=await c.query("SELECT id FROM inventory_InventoryWarehouse WHERE status='active'");
  for(const {p,sku,barcode,category,company,id} of prepared){
   await c.query('INSERT INTO inventory_InventoryProduct (id,sku,barcode,name,categoryId,unit,costPrice,sellingPrice,status,createdAt,updatedAt,isSpecial,size,boxPrice,specialProfitRate,specialPrice,productType,productionCompany) VALUES (?,?,?,?,?,\'item\',?,?,\'active\',?,?,1,?,?,?,?,?,?)',[id,sku,barcode,p.name,categoryMap.get(category.categoryId),p.boxPriceUSD,p.specialPriceUSD,p.createdAt,p.updatedAt,p.size,p.boxPriceUSD,p.boxPriceUSD>0?(p.specialPriceUSD-p.boxPriceUSD)/p.boxPriceUSD*100:0,p.specialPriceUSD,p.productType,company.name]);
   for(const w of warehouses)await c.query('INSERT INTO inventory_InventoryStock (id,productId,warehouseId,quantity,reorderLevel,anesthesiaMinimum,scrubNurseMinimum,perfusionMinimum,cardiologyMinimum) VALUES (?,?,?,0,?,?,?,?,?)',[randomUUID(),id,w.id,Math.max(0,p.threshold),Math.max(0,p.anesthesiaMinimum),Math.max(0,p.scrubNurseMinimum),Math.max(0,p.perfusionMinimum),Math.max(0,p.cardiologyMinimum)]);
  }
  const [actual]=await c.query('SELECT id,sku,barcode,name,size,costPrice,sellingPrice,specialPrice,productionCompany FROM inventory_InventoryProduct');
  if(actual.length!==prepared.length)throw Error('Imported count mismatch');
  for(const expected of prepared){const row=actual.find(x=>x.id===expected.id);if(!row||row.sku!==expected.sku||row.barcode!==expected.barcode||row.name!==expected.p.name||row.size!==expected.p.size||row.costPrice!==expected.p.boxPriceUSD||row.sellingPrice!==expected.p.specialPriceUSD||row.specialPrice!==expected.p.specialPriceUSD||row.productionCompany!==expected.company.name)throw Error(`Verification failed: ${expected.p.name}`);}
  if(actual.some(x=>old.some(o=>o.id===x.id)))throw Error('An old product remains');
  report.importedProducts=actual.length;report.stockRows=(await c.query('SELECT COUNT(*) n FROM inventory_InventoryStock'))[0][0].n;
  await writeFile(`${folder}/import-report.json`,JSON.stringify(report,null,2),{mode:0o600});
  await c.commit();
 }else await c.rollback();
 console.log(JSON.stringify({...report,codeChanges:report.codeChanges.length,invalidBarcodes:report.invalidBarcodes.length},null,2));
}catch(error){await c.rollback();throw error;}finally{await c.end();}
