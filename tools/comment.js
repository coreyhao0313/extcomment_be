const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
const readlineRuestion = (comment)=> new Promise((resolve, reject)=>{
    readline.question(comment, resolve);
});

const model = require('../app/models');

setTimeout(stepByStepCommand, 3000);

async function stepByStepCommand() {

    const dbComment = await model.comment.createComment({
        account: await readlineRuestion('輸入建立者(uid)\n'),
        tid: await readlineRuestion('輸入回覆對象(tid)\n') || null,
        kind: await readlineRuestion('類型(kind) 預設normal\n') || 'normal',
        content: await readlineRuestion('輸入內容(content) 預設-\n') || '-'
    });

    console.log('>>ok');
    console.log(dbComment);
    process.exit(0);

}