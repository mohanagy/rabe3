const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto("https://vendor.gramms.org/", {
      waitUntil: "networkidle2",
    });

    await page.waitFor("input[name=UserName]");

    await page.type("input[name=UserName]", "Dlock.steel.co@gmail.com");
    await page.type("input[name=Password]", "Zxcv123456?");
    await page.$eval('button[type="submit"]', (form) => form.click());

    await page.waitForNavigation();
    await page.screenshot({ path: "step1.png", fullPage: true });
    await page.goto("https://vendor.gramms.org/", {
      waitUntil: "networkidle2",
    });
    await page.screenshot({ path: "step2.png", fullPage: true });

    const file = await fs.readFileSync("./ids.txt", {
      encoding: "utf8",
      flag: "r",
    });
    const ids = file.split("\n").filter((value) => value);
    const result = {};
    for await (const id of ids) {
      await page.goto(
        "https://vendor.gramms.org/#/form/SearchForBeneficiary?BeneficiaryId=" +
          id,
        {
          waitUntil: "networkidle2",
        }
      );
      await page.waitFor(500);
      await page.waitFor("div[class='loader ng-hide']");
      await page.waitFor(500);

      let Inventory = await page.$(
        'span[translate-default="OriginalQuantity"]'
      );
      if (Inventory) {
        result[id] = "Passed";
        let active = await page.$(
          'button[data-form="CreateBeneficiaryReceipt"]'
        );

        if (active) result[id] = result[id] + " - Active";
        else result[id] = result[id] + " - not Active";
      } else {
        result[id] = "Failed";
      }
    }
    await fs.writeFileSync("./result.json", JSON.stringify(result));
    // Specified beneficiary has no active projects in the system. For questions please contact MoCA.
    // await page.screenshot({ path: "step4.png" });
    // await page.waitFor('input[ng-model="c.input.manager.Value"]');
    // await page.screenshot({ path: "step3.png" });
    // await page.type('input[ng-model="c.input.manager.Value"]', 900178369);
    // await page.$eval('button[type="submit"]', (form) => form.click());

    //   await page.waitForSelector('#mw-content-text');

    //   await page.$eval('input[name=search]', el => el.value = 'Adenosine triphosphate');

    await browser.close();
  } catch (error) {
    await browser.close();
    console.log({
      error,
    });
  }
})();
