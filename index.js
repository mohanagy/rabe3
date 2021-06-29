const puppeteer = require("puppeteer");
const ObjectsToCsv = require("objects-to-csv");
const { Worker, isMainThread, parentPort } = require("worker_threads");

const fs = require("fs");
(async () => {
  try {
    if (isMainThread) {
      const browser = await puppeteer.launch({
        headless: true,
        timeout: 9999999,
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
    }
    const result = [];
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
        let active = await page.$(
          'button[data-form="CreateBeneficiaryReceipt"]'
        );

        if (active) {
          let parent = await page.$$(
            'json-report-value[data-name="ActivatedQuantity"]>span>table>tbody>tr'
          );
          const array = await Promise.all(
            parent.map(async (element) => {
              return await element.$$eval("td", (x) =>
                x.map((n) => n.innerText)
              );
            })
          );
          const object = {
            id,
            status: "Passed - Active",
            Rebar: 0,
            Cement: 0,
          };
          object[array[0][1]] = array[0][2];
          if (array[1]) {
            object[array[1][1]] = array[1][2];
          }
          result.push(object);
        } else {
          result.push({
            id,
            status: "Passed - Not Active",
            Cement: 0,
            Rebar: 0,
          });
        }
      } else {
        result.push({
          id,
          status: "Failed",
          Cement: 0,
          Rebar: 0,
        });
      }
    }
    const csv = new ObjectsToCsv(result);

    // Save to file:
    await csv.toDisk("./result.csv");

    await browser.close();
  } catch (error) {
    console.log({
      error,
    });
  }
})();
