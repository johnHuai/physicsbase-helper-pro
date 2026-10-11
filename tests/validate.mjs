import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const get = p => fs.readFileSync(path.join(root,p),'utf8');
const manifest = JSON.parse(get('plugin.json'));
const compatibility = JSON.parse(get('.codex-plugin/plugin.json'));
const modes = JSON.parse(get('skills/physicsbase-helper/references/modes.json'));
const intro = get('skills/physicsbase-helper/SKILL.md');
const route = get('skills/physicsbase-helper/references/mode-routing.md');
const verify = get('skills/physicsbase-helper/references/physical-validation.md');
const catalog = get('skills/physicsbase-helper/references/physics-catalog.md');
const readme = get('README.md');

assert.equal(manifest.name,'physicsbase-helper-pro');
assert.match(manifest.version,/^\d+\.\d+\.\d+$/);
assert.equal(compatibility.name,manifest.name);
assert.equal(compatibility.version,manifest.version);
assert.deepEqual(compatibility.interface,manifest.extensions['com.openai'].interface);
assert.equal(modes.version,manifest.version);
assert.equal(modes.count,24);
assert.equal(modes.modes.length,24);
assert.equal(new Set(modes.modes.map(m=>m.slug)).size,24);
assert.deepEqual(Object.keys(modes.groups),['A','B','C','D','E','F']);
assert.equal(manifest.extensions['com.openai'].interface.shortDescription.length <= 30,true);
assert.equal(manifest.extensions['com.openai'].interface.defaultPrompt.length <= 3,true);
for (const [i,m] of modes.modes.entries()) {
  assert.equal(m.id,i+1);
  assert.ok(m.category && m.outcomes.length && /^[a-z0-9-]+$/.test(m.slug));
  const content=get(m.skill);
  assert.ok(content.startsWith(`---\nname: ${m.slug}\n`),m.slug);
  for (const key of ['适用与边界','工作流程','验证','推荐交付','协作','失败处理','典型任务']) assert.ok(content.includes(key),`${m.slug}: ${key}`);
  assert.ok(content.length>400,`${m.slug}: thin workflow`);
}
for (const key of ['V1','V2','V3','V4','未解决的验证缺口']) assert.ok(verify.includes(key));
for (const key of ['显式','连续追问','恢复自动匹配','混合']) assert.ok(route.includes(key));
for (const key of ['基础与经典物理','量子与微观物理','时空、引力与宇宙','凝聚态与复杂系统','高级理论与统一框架','计算、实验与交叉物理']) assert.ok(catalog.includes(key));
for (const key of ['24 种模式','MathBaseHelper-Pro','数值模拟','科学证据']) assert.ok(readme.includes(key));
assert.ok(intro.includes('自动匹配') && intro.includes('显式指定'));
assert.ok(fs.existsSync(path.join(root,manifest.extensions['com.openai'].interface.logo)));

// Negative cases: a skill must not claim built-in execution or unverified evidence.
const all = [intro,verify,route,...modes.modes.map(m=>get(m.skill))].join('\n');
for (const phrase of ['已经内置 GPU','自动联网监控','无需核查来源','数值验证等于证明']) assert.ok(!all.includes(phrase));

console.log(JSON.stringify({status:'passed',version:manifest.version,skills:modes.modes.length,groups:6,checks:['manifest','skills','routing','catalog','verification','negative-claims']},null,2));
