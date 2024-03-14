const { chromium } = require('playwright');
const readline = require('readline');

// Solicitar a palavra-chave ao usuário antes de qualquer código ser executado
const input = readline.createInterface({
 input: process.stdin,
 output: process.stdout
});

input.question('Digite a palavra-chave para a busca: ', async (keyword) => {
 const browser = await chromium.launch({ headless: false });
 const page = await browser.newPage();

 // Acessar 'amazon.com'
 await page.goto('https://www.amazon.com');

 // Clicar no botão 'deliver to'
 await page.click('#glow-ingress-block');

 // Inserir código zip = 11001
 await page.waitForTimeout(2000);
 await page.fill('input[class="GLUX_Full_Width a-declarative"]', '11001');

 // Clicar em done
 await page.click('#GLUXZipUpdate-announce');

 // Clicar em continue
 await page.waitForTimeout(3000);
 await page.locator('span.a-button-text#GLUXConfirmClose-announce').last().click({ force: true });
 await page.waitForTimeout(3000);

 // Realizar uma busca com a palavra-chave fornecida pelo usuário
 await page.fill('input[name="field-keywords"]', keyword);
 await page.click('span[class="nav-search-submit-text nav-sprite nav-progressive-attribute"]');
 await page.waitForTimeout(3000);

 // Encontrar o primeiro produto não patrocinado
 const nonSponsoredProduct = await page.locator('div[data-cy="title-recipe"]:not(:has(div[class="a-row a-spacing-micro"]))');

 // Obter o link do produto não patrocinado
 if (await nonSponsoredProduct.count() > 0) {
    const productLink = await nonSponsoredProduct.first().evaluate(el => el.querySelector('a[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]').href);
    // Navegar para o link do produto
    await page.goto(productLink);
 } else {
    console.log('Nenhum produto não patrocinado encontrado.');
 }
 await page.waitForTimeout(3000);

 // Fechar a interface de leitura de linha
 input.close();

 await browser.close();
});

 // Entrar no primeiro item e pegar as informações
 //const title = await firstNonSponsoredItem.evaluate('span.a-size-medium', el => el.textContent);
 //const aboutThisItem = await firstItem.evaluate('div.a-section.a-spacing-none', el => el.textContent);
 //const price = await firstItem.evaluate('span.a-price-whole', el => el.textContent);
 //const unitsSold = await firstItem.evaluate('span.a-size-base', el => el.textContent);
 //const rating = await firstItem.evaluate('span.a-icon-alt', el => el.textContent);

 // Mostrar as informações no terminal
 //console.log(`Title: ${title}`);
 //console.log(`About this item: ${aboutThisItem}`);  
 //console.log(`Price: ${price}`);
 //console.log(`Units sold: ${unitsSold}`);
 //console.log(`Rating: ${rating}`);
