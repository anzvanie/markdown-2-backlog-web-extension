const assert=require('node:assert/strict');require('../src/converter.js');
const {convert,convertDetailed,preview}=globalThis.BacklogConverter;
const cases=[
 ['# Title\n## Sub\n### Third','* Title\n** Sub\n*** Third'],
 ['**Bold** and *italic* and ~~strike~~',"''Bold'' and '''italic''' and %%strike%%"],
 ['[Backlog](https://nulab.com)', '[[Backlog>https://nulab.com]]'],
 ['- first\n  - second\n    - third','- first\n-- second\n--- third'],
 ['1. one\n   1. sub\n2. two','+ one\n++ sub\n+ two'],
 ['- [ ] open\n  - [x] done','- [ ] open\n-- [x] done'],
 ['```js\nconst x=1;\n```','{code}\nconst x=1;\n{/code}'],
 ['| A | B |\n|---|---|\n| x | y |','|A|B|h\n|x|y|'],
 ['> quoted','> quoted'],
 ['![Alt](https://example.com/p.png)','[[Alt>https://example.com/p.png]]'],
 ['A\n===','* A'],
 ['A\n---','** A']
];for(const [src,expected] of cases)assert.equal(convert(src),expected,src);
assert.ok(convertDetailed('#### H4').warnings.length);
assert.ok(convertDetailed('![Alt](https://example.com/p.png)').warnings.length);
assert.ok(preview('|A|B|h\n|x|y|').includes('<table>'));
assert.ok(preview('-- [x] task').includes('checkbox'));
assert.ok(!preview('<img src=x onerror=alert(1)>').includes('<img'));
console.log('PASS:',cases.length+5,'converter/preview assertions');
