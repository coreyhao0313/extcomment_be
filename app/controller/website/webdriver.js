const {Builder, By, Key, until} = require('selenium-webdriver'); //, By, Key, until
const firefox = require('selenium-webdriver/firefox');
// const fs = require('fs');
const sharp = require('sharp');

module.exports = {
    async getInfo(url, {windowSize, resize, elTimeout}){
        let options = new firefox.Options()
            .headless()
            .setAcceptInsecureCerts(true) 
            .windowSize(windowSize || {width: 1920, height: 1080});
        let driver = await new Builder()
            .forBrowser('firefox')
            .setFirefoxOptions(options)
            .build();

        try {
            await driver.get(url);
            await Promise.all([
                driver.wait(until.elementLocated(By.css('video')), elTimeout || 10000),
                driver.wait(until.elementLocated(By.css('img')), elTimeout || 10000)
            ])
            .catch(new Function);

            const imgBase64 = await driver.takeScreenshot();
            const title = await driver.getTitle();
            const content = await driver.findElement(By.css('meta[name="description"], meta[name="DESCRIPTION"]'))
                                        .getAttribute('content')
                                        .catch(new Function);
            const keywords = await driver.findElement(By.css('meta[name="keywords"], meta[name="KEYWORDS"]'))
                                        .getAttribute('content')
                                        .catch(new Function);

            const imgBuffer = Buffer.from(imgBase64, 'base64');
            const screenshotBuffer = resize === false 
                ? imgBuffer : await sharp(imgBuffer)
                    .resize(resize || 320)
                    .toBuffer();

            return {
                screenshot: screenshotBuffer.toString('base64'),
                title,
                content,
                keywords
            };
        } finally {
            await driver.quit();
        }
    }
};

// module.exports.getInfo('https://youtube.com', {resize: 480})
//     .then((result)=>{
//         console.log(result.title);
//         const writeStream = fs.createWriteStream(Date.now() + '.jpg');
//         writeStream.write(result.screenshot);
//         writeStream.end();
//     });