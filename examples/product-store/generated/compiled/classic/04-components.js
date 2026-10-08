// Lesson 4: components are functions React calls for you.
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { log } from '../../log';
import { products, formatUSD } from '../../data/products';

// #region price
function Price({
  cents
}) {
  log('  Price runs');
  return React.createElement("p", {
    className: "price"
  }, formatUSD(cents));
}
// #endregion

// #region card
function ProductCard({
  product
}) {
  let views = 0; // a plain local: starts at 0 on every call
  views++;
  log(`  ProductCard runs (views = ${views})`);
  return React.createElement("article", {
    className: "product-card"
  }, React.createElement("h2", null, product.name), React.createElement(Price, {
    cents: product.priceCents
  }));
}
// #endregion

const tick = () => new Promise(r => setTimeout(r, 30));
export async function mount(root, scenario) {
  const product = products[0];
  const reactRoot = createRoot(root);
  if (scenario === 'called') {
    // #region called
    log('1. building elements');
    const element = React.createElement("div", null, Price({
      cents: product.priceCents
    }));
    log('2. elements built, calling render()');
    reactRoot.render(element);
    // #endregion
    await tick();
    log('3. on screen');
    return;
  }
  if (scenario === 'element') {
    // #region element
    log('1. building elements');
    const element = React.createElement("div", null, createElement(Price, {
      cents: product.priceCents
    }));
    log('2. elements built, calling render()');
    reactRoot.render(element);
    // #endregion
    await tick();
    log('3. on screen');
    return;
  }

  // default: render the card three times
  for (const n of [1, 2, 3]) {
    log(`render #${n}`);
    reactRoot.render(React.createElement(ProductCard, {
      product: product
    }));
    await tick();
  }
}
